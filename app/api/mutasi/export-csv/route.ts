import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { MutasiCsvItem } from "@/types/mutasi";

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

    // Rentang waktu bulan yang dipilih
    const startDate = new Date(tahun, bulan - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(tahun, bulan, 0, 23, 59, 59, 999);
    const lastDay = new Date(tahun, bulan, 0).getDate();

    const BULAN_NAMA = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    const namaBulan = BULAN_NAMA[bulan - 1] ?? "Bulan";
    const saldoAwalLabel = `1 ${namaBulan} ${tahun}`;
    const saldoAkhirLabel = `${lastDay} ${namaBulan} ${tahun}`;
    const periodeLabel = `${namaBulan} ${tahun}`;
    const namaFile = `Laporan-Mutasi-${namaBulan}-${tahun}`;

    // Ambil SEMUA barang tanpa paginasi, tanpa filter kategori / rekening / selection
    const barangList = await prisma.barang.findMany({
      orderBy: [
        { rekening: { kodeRekening: "asc" } },
        { namaBarang: "asc" },
        { id: "asc" },
      ],
      select: {
        id: true,
        namaBarang: true,
        merk: true,
        sumber: true,
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
          message: "Berhasil mengambil data export CSV",
          data: {
            items: [],
            meta: {
              saldoAwalLabel,
              saldoAkhirLabel,
              periodeLabel,
              namaFile,
            },
          },
          period: { bulan, tahun },
        },
        { status: 200 },
      );
    }

    const barangIds = barangList.map((b) => b.id);

    // Ambil seluruh data transaksi yang diperlukan secara paralel
    const [
      masukSebelum,
      keluarSebelum,
      masukPeriode,
      keluarPeriode,
      masukPeriodeHarga,
      keluarPeriodeHarga,
    ] = await Promise.all([
      // 1. Qty masuk sebelum periode (untuk saldo awal)
      prisma.transaksiMasuk.groupBy({
        by: ["barangId"],
        where: {
          barangId: { in: barangIds },
          createdAt: { lt: startDate },
        },
        _sum: { jumlah: true },
      }),
      // 2. Qty keluar sebelum periode (untuk saldo awal)
      prisma.transaksiKeluar.groupBy({
        by: ["barangId"],
        where: {
          barangId: { in: barangIds },
          createdAt: { lt: startDate },
        },
        _sum: { jumlah: true },
      }),
      // 3. Masuk selama periode (penambahan)
      prisma.transaksiMasuk.groupBy({
        by: ["barangId"],
        where: {
          barangId: { in: barangIds },
          createdAt: { gte: startDate, lte: endDate },
        },
        _sum: { jumlah: true, total: true },
      }),
      // 4. Keluar selama periode (pengurangan)
      prisma.transaksiKeluar.groupBy({
        by: ["barangId"],
        where: {
          barangId: { in: barangIds },
          createdAt: { gte: startDate, lte: endDate },
        },
        _sum: { jumlah: true, total: true },
      }),
      // 5. Avg harga masuk periode
      prisma.transaksiMasuk.groupBy({
        by: ["barangId"],
        where: {
          barangId: { in: barangIds },
          createdAt: { gte: startDate, lte: endDate },
        },
        _avg: { hargaSatuan: true },
      }),
      // 6. Avg harga keluar periode
      prisma.transaksiKeluar.groupBy({
        by: ["barangId"],
        where: {
          barangId: { in: barangIds },
          createdAt: { gte: startDate, lte: endDate },
        },
        _avg: { harga: true },
      }),
    ]);

    // Lookup maps untuk efisiensi
    const masukSebelumMap = new Map<string, number>();
    const keluarSebelumMap = new Map<string, number>();
    const masukPeriodeQtyMap = new Map<string, number>();
    const masukPeriodeTotalMap = new Map<string, number>();
    const keluarPeriodeQtyMap = new Map<string, number>();
    const keluarPeriodeTotalMap = new Map<string, number>();
    const hargaMasukMap = new Map<string, number>();
    const hargaKeluarMap = new Map<string, number>();

    masukSebelum.forEach((item) => {
      masukSebelumMap.set(item.barangId, item._sum.jumlah ?? 0);
    });
    keluarSebelum.forEach((item) => {
      keluarSebelumMap.set(item.barangId, item._sum.jumlah ?? 0);
    });
    masukPeriode.forEach((item) => {
      masukPeriodeQtyMap.set(item.barangId, item._sum.jumlah ?? 0);
      masukPeriodeTotalMap.set(item.barangId, item._sum.total ?? 0);
    });
    keluarPeriode.forEach((item) => {
      keluarPeriodeQtyMap.set(item.barangId, item._sum.jumlah ?? 0);
      keluarPeriodeTotalMap.set(item.barangId, item._sum.total ?? 0);
    });
    masukPeriodeHarga.forEach((item) => {
      hargaMasukMap.set(item.barangId, Math.round(item._avg.hargaSatuan ?? 0));
    });
    keluarPeriodeHarga.forEach((item) => {
      hargaKeluarMap.set(item.barangId, Math.round(item._avg.harga ?? 0));
    });

    const items: MutasiCsvItem[] = barangList.map((barang) => {
      const masukPrev = masukSebelumMap.get(barang.id) ?? 0;
      const keluarPrev = keluarSebelumMap.get(barang.id) ?? 0;
      const saldoAwalVolume = Math.max(0, masukPrev - keluarPrev);

      const hargaMaster = barang.harga;
      const hargaMasukAvg = hargaMasukMap.get(barang.id);
      const hargaKeluarAvg = hargaKeluarMap.get(barang.id);

      // Saldo Awal
      const saldoAwalHargaSatuan = hargaMasukAvg ?? hargaMaster;
      const saldoAwalJumlah = saldoAwalVolume * saldoAwalHargaSatuan;

      // Penambahan (Masuk)
      const penambahanVolume = masukPeriodeQtyMap.get(barang.id) ?? 0;
      const penambahanHargaSatuan =
        hargaMasukAvg ?? hargaMaster;
      const penambahanJumlah =
        penambahanVolume > 0
          ? (masukPeriodeTotalMap.get(barang.id) ??
            penambahanVolume * penambahanHargaSatuan)
          : 0;

      // Pengurangan (Keluar)
      const penguranganVolume = keluarPeriodeQtyMap.get(barang.id) ?? 0;
      const penguranganHargaSatuan =
        hargaKeluarAvg ?? hargaMaster;
      const penguranganJumlah =
        penguranganVolume > 0
          ? (keluarPeriodeTotalMap.get(barang.id) ??
            penguranganVolume * penguranganHargaSatuan)
          : 0;

      // Saldo Akhir
      const saldoAkhirVolume =
        saldoAwalVolume + penambahanVolume - penguranganVolume;
      const saldoAkhirHargaSatuan = hargaKeluarAvg ?? hargaMaster;
      const saldoAkhirJumlah =
        Math.max(0, saldoAkhirVolume) * saldoAkhirHargaSatuan;

      return {
        id: barang.id,
        kodeRekening: barang.rekening.kodeRekening,
        namaBarang: barang.namaBarang,
        kategori: barang.kategori.kategori,
        merk: barang.merk?.trim() || "-",
        sumber: barang.sumber?.trim() || "-",
        satuan: barang.satuan.satuan,
        // Saldo Awal
        saldoAwalVolume,
        saldoAwalSatuan: barang.satuan.satuan,
        saldoAwalHargaSatuan,
        saldoAwalJumlah,
        // Penambahan
        penambahanVolume,
        penambahanSatuan: barang.satuan.satuan,
        penambahanHargaSatuan,
        penambahanJumlah,
        // Pengurangan
        penguranganVolume,
        penguranganSatuan: barang.satuan.satuan,
        penguranganHargaSatuan,
        penguranganJumlah,
        // Saldo Akhir
        saldoAkhirVolume,
        saldoAkhirSatuan: barang.satuan.satuan,
        saldoAkhirHargaSatuan,
        saldoAkhirJumlah,
      };
    });

    return NextResponse.json(
      {
        status: 200,
        message: "Berhasil mengambil data export CSV",
        data: {
          items,
          meta: {
            saldoAwalLabel,
            saldoAkhirLabel,
            periodeLabel,
            namaFile,
          },
        },
        period: {
          bulan,
          tahun,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error GET /api/mutasi/export-csv:", error);
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
