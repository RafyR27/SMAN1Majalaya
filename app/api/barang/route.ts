import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import * as z from "zod";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        {
          status: 401,
          code: "UNAUTHORIZED",
          message: "Unauthorized",
          data: null,
        },
        { status: 401 },
      );
    }

    const role = session.user.role;

    if (role !== "admin") {
      return NextResponse.json(
        {
          status: 403,
          code: "FORBIDDEN",
          message: "Akses ditolak.",
          data: null,
        },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);

    const all = searchParams.get("all") === "true";
    const pageIndex = Number(searchParams.get("pageIndex") ?? 0);
    const pageSize = Number(searchParams.get("pageSize") ?? 10);

    const search = searchParams.get("search")?.trim() ?? "";
    const rekeningId = searchParams.get("rekeningId")?.trim();
    const kategoriId = searchParams.get("kategoriId")?.trim();
    const startDate = searchParams.get("startDate")?.trim();
    const endDate = searchParams.get("endDate")?.trim();

    if (all) {
      const barangList = await prisma.barang.findMany({
        orderBy: { namaBarang: "asc" },
        select: {
          id: true,
          namaBarang: true,
          merk: true,
          harga: true,
          stok: true,
          sumber: true,
          rekening: { select: { id: true, kodeRekening: true } },
          kategori: { select: { id: true, kategori: true } },
          satuan: { select: { id: true, satuan: true } },
        },
      });
      return NextResponse.json(
        {
          status: 200,
          message: "Berhasil mengambil semua data barang",
          data: barangList,
        },
        { status: 200 },
      );
    }

    const where = {
      ...(search && {
        OR: [
          {
            namaBarang: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            merk: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            sumber: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      }),
      ...(rekeningId && { rekeningId }),
      ...(kategoriId && { kategoriId }),
      ...((startDate || endDate) && {
        tanggal: {
          ...(startDate && {
            gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
          }),
          ...(endDate && {
            lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
          }),
        },
      }),
    };

    const [barangList, rekeningList, kategoriList, satuanList, totalBarang] =
      await prisma.$transaction([
        prisma.barang.findMany({
          where,

          skip: pageIndex * pageSize,
          take: pageSize,

          orderBy: [
            {
              rekening: {
                kodeRekening: "asc"
              },
            },
          ],

          select: {
            id: true,
            namaBarang: true,
            merk: true,
            harga: true,
            sumber: true,
            stok: true,
            tanggal: true,
            rekeningId: true,
            kategoriId: true,
            satuanId: true,
            createdAt: true,
            updatedAt: true,
            rekening: {
              select: {
                id: true,
                kodeRekening: true,
              },
            },

            kategori: {
              select: {
                id: true,
                kategori: true,
              },
            },

            satuan: {
              select: {
                id: true,
                satuan: true,
              },
            },
          },
        }),

        prisma.rekening.findMany(),
        prisma.kategori.findMany(),
        prisma.satuan.findMany(),

        prisma.barang.count({
          where,
        }),
      ]);

    return NextResponse.json(
      {
        status: 200,
        code: "SUCCESS_GET_BARANG",
        message: "Berhasil mengambil data barang",
        data: {
          barangList,
          kategoriList,
          satuanList,
          rekeningList,
        },
        pagination: {
          pageIndex,
          pageSize,
          totalBarang,
          totalPages: Math.ceil(totalBarang / pageSize),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        status: 500,
        code: "INTERNAL_SERVER_ERROR",
        message: "Terjadi kesalahan pada server",
        data: null,
      },
      { status: 500 },
    );
  }
}

const barangAddSchema = z.object({
  namaBarang: z.string().trim().min(3),
  rekeningId: z.string().min(1),
  kategoriId: z.string().min(1),
  satuanId: z.string().min(1),
  merk: z.string().trim().optional(),
  sumber: z.string().trim().optional(),
  harga: z.number().min(0),
  tanggal: z.coerce.date(),
});

const barangBulkAddSchema = z.object({
  items: z.array(barangAddSchema).min(1, "Minimal harus ada satu barang"),
});

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        {
          status: 401,
          code: "UNAUTHORIZED",
          message: "Unauthorized",
          data: null,
        },
        { status: 401 },
      );
    }
    const roleIdentifier = session.user.role;

    if (roleIdentifier !== "admin") {
      return NextResponse.json(
        {
          status: 403,
          code: "FORBIDDEN",
          message: "Akses ditolak.",
          data: null,
        },
        { status: 403 },
      );
    }

    const body = await req.json();
    const validated = barangBulkAddSchema.safeParse(body.payload);

    if (!validated.success) {
      return NextResponse.json(
        {
          status: 400,
          code: "INVALID_DATA",
          message: "Data tidak sesuai",
          errors: validated.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { items } = validated.data;

    const dataBarang = [];

    for (const item of items) {
          const [barang, rekening, kategori, satuan] = await Promise.all([
            prisma.barang.findFirst({
              where: {
                namaBarang: item.namaBarang,
                rekening: {
                  id: item.rekeningId,
                },
                kategori: {
                  id: item.kategoriId,
                },
              },

              select: {
                namaBarang: true,
                kategori: true,
                rekening: true,
              },
            }),
            prisma.rekening.findFirst({
              where: {
                id: item.rekeningId,
              },
            }),
            prisma.kategori.findFirst({
              where: {
                id: item.kategoriId,
              },
            }),
            prisma.satuan.findFirst({
              where: {
                id: item.satuanId,
              },
            }),
          ]);
    
          if (barang) {
            return NextResponse.json(
              {
                status: 400,
                code: "BARANG_IS_EXIST",
                message: `${barang.namaBarang} sudah ada pada kode rekening "${barang.rekening.kodeRekening}" dan kategori "${barang.kategori.kategori}"`,
                data: null,
              },
              { status: 400 },
            );
          }
    
          if (!rekening) {
            return NextResponse.json(
              {
                status: 400,
                code: "REKENING_NOT_FOUND",
                message: "Kode rekening tidak ditemukan",
                data: null,
              },
              { status: 400 },
            );
          }
    
          if (!kategori) {
            return NextResponse.json(
              {
                status: 400,
                code: "KATEGORI_NOT_FOUND",
                message: "Kategori tidak ditemukan",
                data: null,
              },
              { status: 400 },
            );
          }
    
          if (!satuan) {
            return NextResponse.json(
              {
                status: 400,
                code: "SATUAN_NOT_FOUND",
                message: "Satuan tidak ditemukan",
                data: null,
              },
              { status: 400 },
            );
          }
    
          dataBarang.push({
            namaBarang: item.namaBarang,
            rekeningId: rekening.id,
            kategoriId: kategori.id,
            satuanId: satuan.id,
            merk: item.merk,
            sumber: item.sumber,
            harga: item.harga,
            tanggal: item.tanggal,
          });
        }

    const barang = await prisma.barang.createMany({
      data: items.map((item) => ({
        namaBarang: item.namaBarang,
        rekeningId: item.rekeningId,
        kategoriId: item.kategoriId,
        satuanId: item.satuanId,
        merk: item.merk,
        sumber: item.sumber,
        harga: item.harga,
        tanggal: item.tanggal,
      })),
    });

    return NextResponse.json(
      {
        status: 201,
        code: "SUCCESS_CREATE_BARANG",
        message: "Berhasil membuat data barang",
        data: barang,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        status: 500,
        code: "INTERNAL_SERVER_ERROR",
        message: "Terjadi kesalahan pada server",
        data: null,
      },
      { status: 500 },
    );
  }
}

const barangEditSchema = z.object({
  id: z.string().min(1, "ID barang wajib diisi"),
  namaBarang: z.string().trim().min(3),
  rekeningId: z.string().min(1),
  kategoriId: z.string().min(1),
  satuanId: z.string().min(1),
  merk: z.string().trim().optional(),
  sumber: z.string().trim().optional(),
  harga: z.number().min(0),
  tanggal: z.coerce.date(),
});

export async function PUT(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        {
          status: 401,
          code: "UNAUTHORIZED",
          message: "Unauthorized",
          data: null,
        },
        { status: 401 },
      );
    }

    const roleIdentifier = session.user.role;

    if (roleIdentifier !== "admin") {
      return NextResponse.json(
        {
          status: 403,
          code: "FORBIDDEN",
          message: "Akses ditolak.",
          data: null,
        },
        { status: 403 },
      );
    }

    const body = await req.json();
    const validated = barangEditSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          status: 400,
          code: "INVALID_DATA",
          message: "Data tidak sesuai",
          errors: validated.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const {
      id,
      namaBarang,
      rekeningId,
      kategoriId,
      satuanId,
      merk,
      sumber,
      harga,
      tanggal,
    } = validated.data;

    const barang = await prisma.barang.update({
      where: { id },
      data: {
        namaBarang,
        rekeningId,
        kategoriId,
        satuanId,
        merk,
        sumber,
        harga,
        tanggal,
      },
    });

    return NextResponse.json(
      {
        status: 200,
        code: "SUCCESS_UPDATE_BARANG",
        message: "Berhasil mengubah data barang",
        data: barang,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        status: 500,
        code: "INTERNAL_SERVER_ERROR",
        message: "Terjadi kesalahan pada server",
        data: null,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        {
          status: 401,
          code: "UNAUTHORIZED",
          message: "Unauthorized",
          data: null,
        },
        { status: 401 },
      );
    }

    const role = session.user.role;

    if (role !== "admin") {
      return NextResponse.json(
        {
          status: 403,
          code: "FORBIDDEN",
          message: "Akses ditolak.",
          data: null,
        },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");

    if (!idParam) {
      return NextResponse.json(
        {
          status: 400,
          code: "BAD_REQUEST",
          message: "ID barang wajib disertakan.",
          data: null,
        },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { namaBarang } = body;

    const existBarang = await prisma.barang.findFirst({
      where: {
        id: idParam,
        namaBarang: namaBarang,
      },
      select: {
        id: true,
        namaBarang: true,
        _count: {
          select: {
            transaksiMasuk: true,
            transaksiKeluar: true,
          },
        },
      },
    });

    if (!existBarang) {
      return NextResponse.json(
        {
          status: 404,
          code: "BARANG_NOT_FOUND",
          message: "Barang tidak ditemukan atau nama barang tidak sesuai.",
          data: null,
        },
        { status: 404 },
      );
    }

    if (
      existBarang._count.transaksiMasuk > 0 ||
      existBarang._count.transaksiKeluar > 0
    ) {
      return NextResponse.json(
        {
          status: 400,
          code: "BARANG_HAS_TRANSACTIONS",
          message:
            "Barang tidak dapat dihapus karena memiliki riwayat transaksi.",
          data: null,
        },
        { status: 400 },
      );
    }

    await prisma.barang.delete({
      where: { id: idParam },
    });

    return NextResponse.json(
      {
        status: 200,
        code: "SUCCESS_DELETE_BARANG",
        message: "Berhasil menghapus data barang",
        data: null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        status: 500,
        code: "INTERNAL_SERVER_ERROR",
        message: "Terjadi kesalahan pada server",
        data: null,
      },
      { status: 500 },
    );
  }
}
