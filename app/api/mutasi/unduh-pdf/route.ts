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

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const bulanParam = searchParams.get("bulan");
    const tahunParam = searchParams.get("tahun");
    const bulan = bulanParam ? Number(bulanParam) : currentMonth;
    const tahun = tahunParam ? Number(tahunParam) : currentYear;

    // IDs filter (comma-separated barang IDs)
    const idsParam = searchParams.get("ids");
    const ids = idsParam
      ? idsParam
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      : [];

    const search = searchParams.get("search")?.trim() ?? "";
    const rekeningId = searchParams.get("rekeningId")?.trim();
    const kategoriId = searchParams.get("kategoriId")?.trim();

    // Rentang waktu periode
    const startDate = new Date(tahun, bulan - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(tahun, bulan, 0, 23, 59, 59, 999);

    const where = {
      ...(ids.length > 0 && { id: { in: ids } }),
      ...(search && {
        namaBarang: {
          contains: search,
          mode: "insensitive" as const,
        },
      }),
      ...(rekeningId && { rekeningId }),
      ...(kategoriId && { kategoriId }),
    };

    const barangList = await prisma.barang.findMany({
      where,
      orderBy: [
        { rekening: { kodeRekening: "asc" } },
        { namaBarang: "asc" },
        { id: "asc" },
      ],
      select: {
        id: true,
        namaBarang: true,
        harga: true,
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
    });

    if (barangList.length === 0) {
      return NextResponse.json(
        {
          status: 200,
          message: "Berhasil mengambil data mutasi PDF",
          data: {
            items: [],
            summary: {
              totalSaldoAwalRp: 0,
              totalSaldoAkhirRp: 0,
            },
          },
          period: { bulan, tahun },
        },
        { status: 200 },
      );
    }

    const barangIds = barangList.map((b) => b.id);

    // Ambil semua data transaksi yang diperlukan secara paralel
    const [
      masukSebelum,
      keluarSebelum,
      masukPeriode,
      keluarPeriode,
      masukPeriodeHarga,
      keluarPeriodeHarga,
    ] = await Promise.all([
      // Saldo awal: transaksi masuk sebelum periode
      prisma.transaksiMasuk.groupBy({
        by: ["barangId"],
        where: {
          barangId: { in: barangIds },
          createdAt: { lt: startDate },
        },
        _sum: { jumlah: true },
      }),
      // Saldo awal: transaksi keluar sebelum periode
      prisma.transaksiKeluar.groupBy({
        by: ["barangId"],
        where: {
          barangId: { in: barangIds },
          createdAt: { lt: startDate },
        },
        _sum: { jumlah: true },
      }),
      // Qty masuk selama periode
      prisma.transaksiMasuk.groupBy({
        by: ["barangId"],
        where: {
          barangId: { in: barangIds },
          createdAt: { gte: startDate, lte: endDate },
        },
        _sum: { jumlah: true },
      }),
      // Qty keluar selama periode
      prisma.transaksiKeluar.groupBy({
        by: ["barangId"],
        where: {
          barangId: { in: barangIds },
          createdAt: { gte: startDate, lte: endDate },
        },
        _sum: { jumlah: true },
      }),
      // Harga satuan masuk periode (ambil avg untuk kalkulasi saldo awal Rp)
      prisma.transaksiMasuk.groupBy({
        by: ["barangId"],
        where: {
          barangId: { in: barangIds },
          createdAt: { gte: startDate, lte: endDate },
        },
        _avg: { hargaSatuan: true },
      }),
      // Harga keluar periode (ambil avg untuk kalkulasi saldo akhir Rp)
      prisma.transaksiKeluar.groupBy({
        by: ["barangId"],
        where: {
          barangId: { in: barangIds },
          createdAt: { gte: startDate, lte: endDate },
        },
        _avg: { harga: true },
      }),
    ]);

    // Build maps untuk efisiensi lookup
    const masukSebelumMap = new Map<string, number>();
    const keluarSebelumMap = new Map<string, number>();
    const masukPeriodeMap = new Map<string, number>();
    const keluarPeriodeMap = new Map<string, number>();
    const hargaMasukMap = new Map<string, number>();
    const hargaKeluarMap = new Map<string, number>();

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
    masukPeriodeHarga.forEach((item) => {
      hargaMasukMap.set(item.barangId, Math.round(item._avg.hargaSatuan ?? 0));
    });
    keluarPeriodeHarga.forEach((item) => {
      hargaKeluarMap.set(item.barangId, Math.round(item._avg.harga ?? 0));
    });

    // Bangun daftar item mutasi PDF
    const items = barangList.map((barang) => {
      const masukPrev = masukSebelumMap.get(barang.id) ?? 0;
      const keluarPrev = keluarSebelumMap.get(barang.id) ?? 0;
      const saldoAwal = Math.max(0, masukPrev - keluarPrev);

      const masuk = masukPeriodeMap.get(barang.id) ?? 0;
      const keluar = keluarPeriodeMap.get(barang.id) ?? 0;
      const saldoAkhir = saldoAwal + masuk - keluar;

      // Harga fallback: harga master barang jika tidak ada transaksi di periode ini
      const hargaMasuk =
        hargaMasukMap.get(barang.id) ?? barang.harga;
      const hargaKeluar =
        hargaKeluarMap.get(barang.id) ?? barang.harga;

      const saldoAwalRp = saldoAwal * hargaMasuk;
      const saldoAkhirRp = Math.max(0, saldoAkhir) * hargaKeluar;

      return {
        id: barang.id,
        namaBarang: barang.namaBarang,
        kategori: barang.kategori.kategori,
        kodeRekening: barang.rekening.kodeRekening,
        satuan: barang.satuan.satuan,
        saldoAwal,
        saldoAwalRp,
        masuk,
        keluar,
        saldoAkhir,
        saldoAkhirRp,
      };
    });

    // Hitung total nilai
    const totalSaldoAwalRp = items.reduce(
      (acc, item) => acc + item.saldoAwalRp,
      0,
    );
    const totalSaldoAkhirRp = items.reduce(
      (acc, item) => acc + item.saldoAkhirRp,
      0,
    );

    return NextResponse.json(
      {
        status: 200,
        message: "Berhasil mengambil data mutasi PDF",
        data: {
          items,
          summary: {
            totalSaldoAwalRp,
            totalSaldoAkhirRp,
          },
        },
        period: { bulan, tahun },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error GET /api/mutasi/unduh-pdf:", error);
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
