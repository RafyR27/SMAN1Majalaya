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

    const pageIndex = Number(searchParams.get("pageIndex") ?? 0);
    const pageSize = Number(searchParams.get("pageSize") ?? 10);

    const search = searchParams.get("search")?.trim() ?? "";
    const kategoriId = searchParams.get("kategoriId")?.trim();
    const startDate = searchParams.get("startDate")?.trim();
    const endDate = searchParams.get("endDate")?.trim();

    const searchWhere = search
      ? {
          OR: [
            {
              barang: {
                namaBarang: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            },
          ],
        }
      : {};

    const where = {
      ...searchWhere,
      ...(kategoriId && {
        barang: {
          kategoriId,
        },
      }),
      ...((startDate || endDate) && {
        createdAt: {
          ...(startDate && {
            gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
          }),
          ...(endDate && {
            lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
          }),
        },
      }),
    };

    const [transaksiList, totalTransaksi] = await prisma.$transaction([
      prisma.transaksiMasuk.findMany({
        where,
        skip: pageIndex * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          barang: {
            select: {
              id: true,
              namaBarang: true,
              merk: true,
              rekening: { select: { kodeRekening: true } },
              kategori: { select: { kategori: true } },
              satuan: { select: { satuan: true } },
            },
          },
        },
      }),
      prisma.transaksiMasuk.count({ where }),
    ]);

    return NextResponse.json({
      status: 200,
      message: "Berhasil mengambil data transaksi masuk.",
      data: transaksiList,
      pagination: {
        totalTransaksiMasuk: totalTransaksi,
        pageIndex,
        pageSize,
        totalPages: Math.ceil(totalTransaksi / pageSize),
      },
    });
  } catch (error) {
    console.error("[TRANSAKSI_MASUK_GET]", error);
    return NextResponse.json(
      {
        status: 500,
        code: "INTERNAL_SERVER_ERROR",
        message: "Terjadi kesalahan pada server.",
        data: null,
      },
      { status: 500 },
    );
  }
}

const transaksiMasukItemSchema = z.object({
  barangId: z.string().min(1, "Barang wajib dipilih"),
  volume: z.number().int().min(1, "Volume minimal 1"),
  tanggal: z.coerce.date(),
});

const transaksiMasukBulkSchema = z.object({
  items: z
    .array(transaksiMasukItemSchema)
    .min(1, "Minimal 1 item")
    .max(5, "Maksimal 5 item"),
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

    if (session.user.role !== "admin") {
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
    const validated = transaksiMasukBulkSchema.safeParse(body.payload);

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

    // Fetch all referenced barang in one query
    const barangIds = [...new Set(items.map((i) => i.barangId))];
    const barangList = await prisma.barang.findMany({
      where: { id: { in: barangIds } },
      select: { id: true, harga: true, stok: true, sumber: true, merk: true },
    });

    const barangMap = new Map(barangList.map((b) => [b.id, b]));

    // Validate all barang exist
    for (const item of items) {
      if (!barangMap.has(item.barangId)) {
        return NextResponse.json(
          {
            status: 404,
            code: "BARANG_NOT_FOUND",
            message: `Barang dengan ID ${item.barangId} tidak ditemukan`,
            data: null,
          },
          { status: 404 },
        );
      }
    }

    // Execute all operations in a single transaction
    await prisma.$transaction([
      ...items.map((item) => {
        const barang = barangMap.get(item.barangId)!;
        const hargaSatuan = barang.harga;
        const total = hargaSatuan * item.volume;

        return prisma.transaksiMasuk.create({
          data: {
            barangId: item.barangId,
            jumlah: item.volume,
            hargaSatuan,
            total,
            sumber: barang.sumber ?? null,
            merk: barang.merk ?? null,
            createdAt: item.tanggal,
          },
        });
      }),
      ...items.map((item) =>
        prisma.barang.update({
          where: { id: item.barangId },
          data: { stok: { increment: item.volume } },
        }),
      ),
    ]);

    return NextResponse.json(
      {
        status: 201,
        code: "SUCCESS_CREATE_TRANSAKSI_MASUK",
        message: `Berhasil mencatat ${items.length} transaksi masuk`,
        data: null,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[TRANSAKSI_MASUK_POST]", error);
    return NextResponse.json(
      {
        status: 500,
        code: "INTERNAL_SERVER_ERROR",
        message: "Terjadi kesalahan pada server.",
        data: null,
      },
      { status: 500 },
    );
  }
}

const transaksiMasukEditSchema = z.object({
  id: z.string().min(1, "ID transaksi wajib diisi"),
  volume: z.number().int().min(1, "Volume minimal 1"),
  tanggal: z.coerce.date(),
});

export async function PUT(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { status: 401, code: "UNAUTHORIZED", message: "Unauthorized", data: null },
        { status: 401 },
      );
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { status: 403, code: "FORBIDDEN", message: "Akses ditolak.", data: null },
        { status: 403 },
      );
    }

    const body = await req.json();
    const validated = transaksiMasukEditSchema.safeParse(body);

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

    const { id, volume: newVolume, tanggal } = validated.data;

    // Fetch transaksi masuk beserta barang terkait
    const transaksi = await prisma.transaksiMasuk.findUnique({
      where: { id },
      select: {
        id: true,
        jumlah: true,
        barangId: true,
        hargaSatuan: true,
        barang: { select: { id: true, harga: true, stok: true } },
      },
    });

    if (!transaksi) {
      return NextResponse.json(
        { status: 404, code: "TRANSAKSI_NOT_FOUND", message: "Transaksi tidak ditemukan.", data: null },
        { status: 404 },
      );
    }

    const oldVolume = transaksi.jumlah;
    const diff = newVolume - oldVolume; // positif = tambah stok, negatif = kurang stok
    const stokSetelahEdit = transaksi.barang.stok + diff;

    if (stokSetelahEdit < 0) {
      return NextResponse.json(
        {
          status: 400,
          code: "INSUFFICIENT_STOCK",
          message: `Tidak dapat mengurangi volume. Stok barang saat ini hanya ${transaksi.barang.stok}, pengurangan volume akan menyebabkan stok menjadi negatif.`,
          data: null,
        },
        { status: 400 },
      );
    }

    const hargaSatuan = transaksi.barang.harga;
    const newTotal = hargaSatuan * newVolume;

    await prisma.$transaction([
      prisma.transaksiMasuk.update({
        where: { id },
        data: {
          jumlah: newVolume,
          total: newTotal,
          createdAt: tanggal,
        },
      }),
      prisma.barang.update({
        where: { id: transaksi.barangId },
        data: { stok: { increment: diff } },
      }),
    ]);

    return NextResponse.json(
      {
        status: 200,
        code: "SUCCESS_UPDATE_TRANSAKSI_MASUK",
        message: "Berhasil mengubah transaksi masuk",
        data: null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[TRANSAKSI_MASUK_PUT]", error);
    return NextResponse.json(
      { status: 500, code: "INTERNAL_SERVER_ERROR", message: "Terjadi kesalahan pada server.", data: null },
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
        { status: 401, code: "UNAUTHORIZED", message: "Unauthorized", data: null },
        { status: 401 },
      );
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { status: 403, code: "FORBIDDEN", message: "Akses ditolak.", data: null },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");

    if (!idParam) {
      return NextResponse.json(
        { status: 400, code: "BAD_REQUEST", message: "ID transaksi wajib disertakan.", data: null },
        { status: 400 },
      );
    }

    // Fetch transaksi masuk beserta barang terkait
    const transaksi = await prisma.transaksiMasuk.findUnique({
      where: { id: idParam },
      select: {
        id: true,
        jumlah: true,
        barangId: true,
        barang: { select: { id: true, stok: true, namaBarang: true } },
      },
    });

    if (!transaksi) {
      return NextResponse.json(
        { status: 404, code: "TRANSAKSI_NOT_FOUND", message: "Transaksi tidak ditemukan.", data: null },
        { status: 404 },
      );
    }

    // Validasi: stok tidak boleh negatif setelah dihapus
    if (transaksi.barang.stok < transaksi.jumlah) {
      return NextResponse.json(
        {
          status: 400,
          code: "INSUFFICIENT_STOCK",
          message: `Transaksi tidak dapat dihapus. Stok "${transaksi.barang.namaBarang}" saat ini hanya ${transaksi.barang.stok}, menghapus transaksi ini akan menyebabkan stok menjadi negatif.`,
          data: null,
        },
        { status: 400 },
      );
    }

    await prisma.$transaction([
      prisma.transaksiMasuk.delete({ where: { id: idParam } }),
      prisma.barang.update({
        where: { id: transaksi.barangId },
        data: { stok: { decrement: transaksi.jumlah } },
      }),
    ]);

    return NextResponse.json(
      {
        status: 200,
        code: "SUCCESS_DELETE_TRANSAKSI_MASUK",
        message: "Berhasil menghapus transaksi masuk",
        data: null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[TRANSAKSI_MASUK_DELETE]", error);
    return NextResponse.json(
      { status: 500, code: "INTERNAL_SERVER_ERROR", message: "Terjadi kesalahan pada server.", data: null },
      { status: 500 },
    );
  }
}
