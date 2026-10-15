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
            {
              kepada: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              tujuan: {
                contains: search,
                mode: "insensitive" as const,
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
      prisma.transaksiKeluar.findMany({
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
      prisma.transaksiKeluar.count({ where }),
    ]);

    return NextResponse.json({
      status: 200,
      message: "Berhasil mengambil data transaksi keluar.",
      data: transaksiList,
      pagination: {
        totalTransaksiKeluar: totalTransaksi,
        pageIndex,
        pageSize,
        totalPages: Math.ceil(totalTransaksi / pageSize),
      },
    });
  } catch (error) {
    console.error("[TRANSAKSI_KELUAR_GET]", error);
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

const transaksiKeluarSchema = z.object({
  barangId: z.string().min(1, "Barang wajib dipilih"),
  volume: z.number().int().min(1, "Volume minimal 1"),
  tanggal: z.coerce.date(),
  kepada: z.string().trim().nullable().optional(),
  tujuan: z.string().trim().nullable().optional(),
});

const transaksiKeluarPayloadSchema = z.object({
  item: transaksiKeluarSchema,
});

export async function POST(req: Request) {
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
    const validated = transaksiKeluarPayloadSchema.safeParse(body.payload);

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

    const { item } = validated.data;

    // Fetch barang
    const barang = await prisma.barang.findUnique({
      where: { id: item.barangId },
      select: { id: true, harga: true, stok: true },
    });

    if (!barang) {
      return NextResponse.json(
        {
          status: 404,
          code: "BARANG_NOT_FOUND",
          message: "Barang tidak ditemukan",
          data: null,
        },
        { status: 404 },
      );
    }

    if (barang.stok < item.volume) {
      return NextResponse.json(
        {
          status: 400,
          code: "STOK_TIDAK_CUKUP",
          message: `Stok tidak mencukupi. Stok saat ini: ${barang.stok}`,
          data: null,
        },
        { status: 400 },
      );
    }

    const harga = barang.harga;
    const total = harga * item.volume;

    await prisma.$transaction([
      prisma.transaksiKeluar.create({
        data: {
          barangId: item.barangId,
          jumlah: item.volume,
          harga,
          total,
          kepada: item.kepada || null,
          tujuan: item.tujuan || null,
          createdAt: item.tanggal,
        },
      }),
      prisma.barang.update({
        where: { id: item.barangId },
        data: { stok: { decrement: item.volume } },
      }),
    ]);

    return NextResponse.json(
      {
        status: 201,
        code: "SUCCESS_CREATE_TRANSAKSI_KELUAR",
        message: "Berhasil mencatat transaksi keluar",
        data: null,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[TRANSAKSI_KELUAR_POST]", error);
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

const transaksiKeluarEditSchema = z.object({
  id: z.string().min(1, "ID transaksi wajib diisi"),
  volume: z.number().int().min(1, "Volume minimal 1"),
  tanggal: z.coerce.date(),
  kepada: z.string().trim().nullable().optional(),
  tujuan: z.string().trim().nullable().optional(),
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
    const validated = transaksiKeluarEditSchema.safeParse(body);

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

    const { id, volume: newVolume, tanggal, kepada, tujuan } = validated.data;

    const transaksi = await prisma.transaksiKeluar.findUnique({
      where: { id },
      select: {
        id: true,
        jumlah: true,
        barangId: true,
        harga: true,
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
    const diff = newVolume - oldVolume;
    const stokSetelahEdit = transaksi.barang.stok - diff;

    if (stokSetelahEdit < 0) {
      return NextResponse.json(
        {
          status: 400,
          code: "INSUFFICIENT_STOCK",
          message: `Tidak dapat menambah volume. Stok barang saat ini hanya ${transaksi.barang.stok}, penambahan volume akan menyebabkan stok menjadi negatif.`,
          data: null,
        },
        { status: 400 },
      );
    }

    const harga = transaksi.barang.harga;
    const newTotal = harga * newVolume;

    await prisma.$transaction([
      prisma.transaksiKeluar.update({
        where: { id },
        data: {
          jumlah: newVolume,
          total: newTotal,
          kepada: kepada !== undefined ? (kepada || null) : undefined,
          tujuan: tujuan !== undefined ? (tujuan || null) : undefined,
          createdAt: tanggal,
        },
      }),
      prisma.barang.update({
        where: { id: transaksi.barangId },
        data: { stok: { decrement: diff } },
      }),
    ]);

    return NextResponse.json(
      {
        status: 200,
        code: "SUCCESS_UPDATE_TRANSAKSI_KELUAR",
        message: "Berhasil mengubah transaksi keluar",
        data: null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[TRANSAKSI_KELUAR_PUT]", error);
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

    const transaksi = await prisma.transaksiKeluar.findUnique({
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

    await prisma.$transaction([
      prisma.transaksiKeluar.delete({ where: { id: idParam } }),
      prisma.barang.update({
        where: { id: transaksi.barangId },
        data: { stok: { increment: transaksi.jumlah } },
      }),
    ]);

    return NextResponse.json(
      {
        status: 200,
        code: "SUCCESS_DELETE_TRANSAKSI_KELUAR",
        message: "Berhasil menghapus transaksi keluar",
        data: null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[TRANSAKSI_KELUAR_DELETE]", error);
    return NextResponse.json(
      { status: 500, code: "INTERNAL_SERVER_ERROR", message: "Terjadi kesalahan pada server.", data: null },
      { status: 500 },
    );
  }
}
