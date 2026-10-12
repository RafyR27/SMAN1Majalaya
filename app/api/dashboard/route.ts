import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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

    const { searchParams } = new URL(req.url);

    // Parsing threshold dengan aman (integer non-negatif)
    const thresholdParam = searchParams.get("lowStockThreshold");
    let threshold = 5;
    if (thresholdParam !== null && thresholdParam.trim() !== "") {
      const parsed = parseInt(thresholdParam, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        threshold = parsed;
      }
    }

    // Parsing page dengan aman (integer >= 1)
    const lowStockPageParam = searchParams.get("lowStockPage");
    let lowStockPage = 1;
    if (lowStockPageParam !== null && lowStockPageParam.trim() !== "") {
      const parsed = parseInt(lowStockPageParam, 10);
      if (!isNaN(parsed) && parsed >= 1) {
        lowStockPage = parsed;
      }
    }

    const lowStockPageSize = 5;

    // Mengambil seluruh data statistik dan aktivitas dalam satu transaksi atomic
    const [
      totalItems,
      stockSumResult,
      stockInResult,
      stockOutResult,
      totalLowStock,
      lowStockItems,
      rawRecentMasuk,
      rawRecentKeluar,
    ] = await prisma.$transaction([
      // 1. Total Jenis Barang
      prisma.barang.count(),

      // 2. Total Stok Keseluruhan
      prisma.barang.aggregate({
        _sum: { stok: true },
      }),

      // 3. Akumulasi Barang Masuk
      prisma.transaksiMasuk.aggregate({
        _sum: { jumlah: true },
      }),

      // 4. Akumulasi Barang Keluar
      prisma.transaksiKeluar.aggregate({
        _sum: { jumlah: true },
      }),

      // 5. Total barang stok rendah
      prisma.barang.count({
        where: { stok: { lte: threshold } },
      }),

      // 6. Data barang stok rendah (dengan deterministic tie-breaker sorting)
      prisma.barang.findMany({
        where: { stok: { lte: threshold } },
        skip: (lowStockPage - 1) * lowStockPageSize,
        take: lowStockPageSize,
        orderBy: [{ stok: "asc" }, { id: "asc" }],
        select: {
          id: true,
          namaBarang: true,
          stok: true,
          satuan: { select: { satuan: true } },
          kategori: { select: { kategori: true } },
        },
      }),

      // 7. Transaksi masuk terakhir
      prisma.transaksiMasuk.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          jumlah: true,
          createdAt: true,
          barang: {
            select: {
              namaBarang: true,
              satuan: { select: { satuan: true } },
            },
          },
        },
      }),

      // 8. Transaksi keluar terakhir
      prisma.transaksiKeluar.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          jumlah: true,
          createdAt: true,
          barang: {
            select: {
              namaBarang: true,
              satuan: { select: { satuan: true } },
            },
          },
        },
      }),
    ]);

    // Format & gabungkan aktivitas transaksi secara aman (dengan defensive fallback)
    const recentActivities = [
      ...rawRecentMasuk.map((m) => ({
        id: m.id,
        type: "masuk" as const,
        namaBarang: m.barang?.namaBarang ?? "Barang Tidak Dikenal",
        satuan: m.barang?.satuan?.satuan ?? "",
        jumlah: m.jumlah,
        keterangan: null,
        createdAt: m.createdAt,
      })),
      ...rawRecentKeluar.map((k) => ({
        id: k.id,
        type: "keluar" as const,
        namaBarang: k.barang?.namaBarang ?? "Barang Tidak Dikenal",
        satuan: k.barang?.satuan?.satuan ?? "",
        jumlah: k.jumlah,
        createdAt: k.createdAt,
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);

    const totalPages = Math.ceil((totalLowStock ?? 0) / lowStockPageSize) || 1;

    return NextResponse.json(
      {
        status: 200,
        message: "Berhasil mengambil data statistik dashboard",
        data: {
          totalItems: totalItems ?? 0,
          totalStock: stockSumResult._sum.stok ?? 0,
          stockIn: stockInResult._sum.jumlah ?? 0,
          stockOut: stockOutResult._sum.jumlah ?? 0,
          lowStockItems: lowStockItems ?? [],
          lowStockPagination: {
            page: lowStockPage,
            pageSize: lowStockPageSize,
            totalItems: totalLowStock ?? 0,
            totalPages,
          },
          recentActivities,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[GET_DASHBOARD_ERROR]", error);
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