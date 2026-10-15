import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

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

    const barangId = searchParams.get("barangId")?.trim();
    if (!barangId) {
      return NextResponse.json(
        {
          status: 400,
          code: "BAD_REQUEST",
          message: "Parameter barangId wajib disertakan.",
          data: null,
        },
        { status: 400 },
      );
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const bulanParam = searchParams.get("bulan");
    const tahunParam = searchParams.get("tahun");

    const bulan = bulanParam ? Number(bulanParam) : currentMonth;
    const tahun = tahunParam ? Number(tahunParam) : currentYear;

    if (isNaN(bulan) || bulan < 1 || bulan > 12) {
      return NextResponse.json(
        {
          status: 400,
          code: "INVALID_PERIOD",
          message: "Bulan harus berupa angka antara 1 dan 12.",
          data: null,
        },
        { status: 400 },
      );
    }

    if (isNaN(tahun) || tahun < 2000 || tahun > 2100) {
      return NextResponse.json(
        {
          status: 400,
          code: "INVALID_PERIOD",
          message: "Tahun tidak valid.",
          data: null,
        },
        { status: 400 },
      );
    }

    // Ambil data detail barang
    const barang = await prisma.barang.findUnique({
      where: { id: barangId },
      include: {
        rekening: { select: { kodeRekening: true } },
        kategori: { select: { kategori: true } },
        satuan: { select: { satuan: true } },
      },
    });

    if (!barang) {
      return NextResponse.json(
        {
          status: 404,
          code: "BARANG_NOT_FOUND",
          message: "Data barang tidak ditemukan.",
          data: null,
        },
        { status: 404 },
      );
    }

    // Rentang periode bulan terpilih
    const startDate = new Date(tahun, bulan - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(tahun, bulan, 0, 23, 59, 59, 999);

    // Query mutasi dan transaksi paralel
    const [
      sumSemuaMasuk,
      sumSemuaKeluar,
      sumMasukSebelum,
      sumKeluarSebelum,
      transaksiMasukPeriode,
      transaksiKeluarPeriode,
    ] = await Promise.all([
      // Seluruh transaksi masuk sepanjang masa
      prisma.transaksiMasuk.aggregate({
        where: { barangId },
        _sum: { jumlah: true },
      }),
      // Seluruh transaksi keluar sepanjang masa
      prisma.transaksiKeluar.aggregate({
        where: { barangId },
        _sum: { jumlah: true },
      }),
      // Transaksi masuk sebelum awal bulan ini
      prisma.transaksiMasuk.aggregate({
        where: { barangId, createdAt: { lt: startDate } },
        _sum: { jumlah: true },
      }),
      // Transaksi keluar sebelum awal bulan ini
      prisma.transaksiKeluar.aggregate({
        where: { barangId, createdAt: { lt: startDate } },
        _sum: { jumlah: true },
      }),
      // Transaksi masuk pada periode bulan ini
      prisma.transaksiMasuk.findMany({
        where: { barangId, createdAt: { gte: startDate, lte: endDate } },
        orderBy: { createdAt: "asc" },
      }),
      // Transaksi keluar pada periode bulan ini
      prisma.transaksiKeluar.findMany({
        where: { barangId, createdAt: { gte: startDate, lte: endDate } },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const totalSemuaMasuk = sumSemuaMasuk._sum.jumlah ?? 0;
    const totalSemuaKeluar = sumSemuaKeluar._sum.jumlah ?? 0;

    // Stok dasar inisial (stok saat registrasi tanpa transaksi masuk terpisah)
    // Formula matematis invarian: Barang.stok - (TotalMasuk - TotalKeluar)
    const stokDasarInisial = barang.stok - totalSemuaMasuk + totalSemuaKeluar;

    const masukSebelum = sumMasukSebelum._sum.jumlah ?? 0;
    const keluarSebelum = sumKeluarSebelum._sum.jumlah ?? 0;

    // Saldo awal riil (tanpa Math.max - menampilkan angka sebenarnya)
    const saldoAwal = stokDasarInisial + masukSebelum - keluarSebelum;

    // Gabungkan transaksi dan urutkan secara kronologis
    const items = [
      ...transaksiMasukPeriode.map((t) => ({
        id: t.id,
        createdAt: t.createdAt,
        tipe: "MASUK" as const,
        jumlah: t.jumlah,
        hargaSatuan: t.hargaSatuan,
        total: t.total,
        pihakTerkait: t.oleh ?? null,
        keterangan: t.sumber ?? null,
      })),
      ...transaksiKeluarPeriode.map((t) => ({
        id: t.id,
        createdAt: t.createdAt,
        tipe: "KELUAR" as const,
        jumlah: t.jumlah,
        hargaSatuan: t.harga,
        total: t.total,
        pihakTerkait: t.kepada ?? null,
        keterangan: t.tujuan ?? null,
      })),
    ].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      if (timeA !== timeB) return timeA - timeB;
      // Jika tanggal sama, dahulukan MASUK sebelum KELUAR
      if (a.tipe !== b.tipe) return a.tipe === "MASUK" ? -1 : 1;
      return a.id.localeCompare(b.id);
    });

    let runningBalance = saldoAwal;
    let hasDeficit = saldoAwal < 0;

    const transaksi = items.map((item) => {
      if (item.tipe === "MASUK") {
        runningBalance += item.jumlah;
      } else {
        runningBalance -= item.jumlah;
      }

      if (runningBalance < 0) {
        hasDeficit = true;
      }

      return {
        id: item.id,
        tanggal: item.createdAt.toISOString(),
        tipe: item.tipe,
        jumlah: item.jumlah,
        hargaSatuan: item.hargaSatuan,
        total: item.total,
        pihakTerkait: item.pihakTerkait,
        keterangan: item.keterangan,
        saldoBerjalan: runningBalance,
      };
    });

    const totalMasuk = transaksiMasukPeriode.reduce(
      (acc, t) => acc + t.jumlah,
      0,
    );
    const totalKeluar = transaksiKeluarPeriode.reduce(
      (acc, t) => acc + t.jumlah,
      0,
    );
    const saldoAkhir = runningBalance;
    if (saldoAkhir < 0) hasDeficit = true;

    // Evaluasi transparansi & integritas data
    const warnings: string[] = [];
    const discrepancyDiff =
      barang.stok - (totalSemuaMasuk - totalSemuaKeluar);

    if (hasDeficit) {
      warnings.push(
        "Terdapat saldo defisit/negatif pada periode ini. Terjadi pengeluaran barang sebelum pencatatan penerimaan dilakukan.",
      );
    }
    if (discrepancyDiff !== 0) {
      if (discrepancyDiff > 0) {
        warnings.push(
          `Terdapat ${discrepancyDiff} unit stok pada data barang yang tidak berasal dari transaksi masuk (stok awal pendaftaran barang).`,
        );
      } else {
        warnings.push(
          `Terdapat selisih ${Math.abs(discrepancyDiff)} unit antara stok sistem master dengan akumulasi mutasi transaksi.`,
        );
      }
    }

    const labelPeriode = `${BULAN_NAMA[bulan - 1]} ${tahun}`;

    return NextResponse.json(
      {
        status: 200,
        message: "Berhasil mengambil data kartu persediaan barang",
        data: {
          barang: {
            id: barang.id,
            namaBarang: barang.namaBarang,
            merk: barang.merk,
            harga: barang.harga,
            satuan: barang.satuan.satuan,
            kodeRekening: barang.rekening.kodeRekening,
            kategori: barang.kategori.kategori,
            sumber: barang.sumber,
            stokSistem: barang.stok,
          },
          period: {
            bulan,
            tahun,
            label: labelPeriode,
          },
          saldoAwal,
          totalMasuk,
          totalKeluar,
          saldoAkhir,
          transaksi,
          validasi: {
            isConsistent: !hasDeficit && discrepancyDiff === 0,
            hasDeficit,
            discrepancyDiff,
            warnings,
          },
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error GET /api/mutasi/kartu-persediaan:", error);
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

