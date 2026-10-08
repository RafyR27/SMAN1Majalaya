import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

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

    const pageIndex = Math.max(0, Number(searchParams.get("pageIndex") ?? 0));
    const pageSize = Math.max(1, Number(searchParams.get("pageSize") ?? 10));

    const search = searchParams.get("search")?.trim() ?? "";
    const rekeningId = searchParams.get("rekeningId")?.trim();
    const kategoriId = searchParams.get("kategoriId")?.trim();

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const bulanParam = searchParams.get("bulan");
    const tahunParam = searchParams.get("tahun");

    const bulan = bulanParam ? Number(bulanParam) : currentMonth;
    const tahun = tahunParam ? Number(tahunParam) : currentYear;

    // Hitung awal dan akhir bulan yang dipilih
    const startDate = new Date(tahun, bulan - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(tahun, bulan, 0, 23, 59, 59, 999);

    const where = {
      ...(search && {
        namaBarang: {
          contains: search,
          mode: "insensitive" as const,
        },
      }),
      ...(rekeningId && { rekeningId }),
      ...(kategoriId && { kategoriId }),
    };

    const [barangList, totalBarang, rekeningList, kategoriList] =
      await prisma.$transaction([
        prisma.barang.findMany({
          where,
          skip: pageIndex * pageSize,
          take: pageSize,
          orderBy: {
            rekening: {
              kodeRekening: "asc",
            },
          },
          select: {
            id: true,
            namaBarang: true,
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
        prisma.barang.count({ where }),
        prisma.rekening.findMany({
          orderBy: { kodeRekening: "asc" },
          select: {
            id: true,
            kodeRekening: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.kategori.findMany({
          orderBy: { kategori: "asc" },
          select: {
            id: true,
            kategori: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
      ]);

    const barangIds = barangList.map((b) => b.id);

    const masukSebelumMap = new Map<string, number>();
    const keluarSebelumMap = new Map<string, number>();
    const masukPeriodeMap = new Map<string, number>();
    const keluarPeriodeMap = new Map<string, number>();

    if (barangIds.length > 0) {
      const [masukSebelum, keluarSebelum, masukPeriode, keluarPeriode] =
        await Promise.all([
          // Transaksi Masuk sebelum periode (untuk saldo awal)
          prisma.transaksiMasuk.groupBy({
            by: ["barangId"],
            where: {
              barangId: { in: barangIds },
              createdAt: { lt: startDate },
            },
            _sum: { jumlah: true },
          }),
          // Transaksi Keluar sebelum periode (untuk saldo awal)
          prisma.transaksiKeluar.groupBy({
            by: ["barangId"],
            where: {
              barangId: { in: barangIds },
              createdAt: { lt: startDate },
            },
            _sum: { jumlah: true },
          }),
          // Transaksi Masuk selama periode
          prisma.transaksiMasuk.groupBy({
            by: ["barangId"],
            where: {
              barangId: { in: barangIds },
              createdAt: { gte: startDate, lte: endDate },
            },
            _sum: { jumlah: true },
          }),
          // Transaksi Keluar selama periode
          prisma.transaksiKeluar.groupBy({
            by: ["barangId"],
            where: {
              barangId: { in: barangIds },
              createdAt: { gte: startDate, lte: endDate },
            },
            _sum: { jumlah: true },
          }),
        ]);

      masukSebelum.forEach((item) => {
        masukSebelumMap.set(item.barangId, item._sum.jumlah ?? 0);
      });
      keluarSebelum.forEach((item) => {
        keluarSebelumMap.set(item.barangId, item._sum.jumlah ?? 0);
      });
      masukPeriode.forEach((item) => {
        masukPeriodeMap.set(item.barangId, item._sum.jumlah ?? 0);
      });
      keluarPeriode.forEach((item) => {
        keluarPeriodeMap.set(item.barangId, item._sum.jumlah ?? 0);
      });
    }

    const mutasiList = barangList.map((barang) => {
      const masukPrev = masukSebelumMap.get(barang.id) ?? 0;
      const keluarPrev = keluarSebelumMap.get(barang.id) ?? 0;
      const saldoAwal = Math.max(0, masukPrev - keluarPrev);

      const masuk = masukPeriodeMap.get(barang.id) ?? 0;
      const keluar = keluarPeriodeMap.get(barang.id) ?? 0;
      const saldoAkhir = saldoAwal + masuk - keluar;

      return {
        id: barang.id,
        namaBarang: barang.namaBarang,
        kategori: barang.kategori.kategori,
        kodeRekening: barang.rekening.kodeRekening,
        satuan: barang.satuan.satuan,
        saldoAwal,
        masuk,
        keluar,
        saldoAkhir,
      };
    });

    return NextResponse.json(
      {
        status: 200,
        message: "Berhasil mengambil data mutasi barang",
        data: {
          mutasiList,
          rekeningList,
          kategoriList,
        },
        pagination: {
          pageIndex,
          pageSize,
          totalItems: totalBarang,
          totalPages: Math.ceil(totalBarang / pageSize),
        },
        period: {
          bulan,
          tahun,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error GET /api/mutasi:", error);
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
