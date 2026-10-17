"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import instance from "@/lib/instance";
import { IKartuPersediaanResponse } from "@/types/transaksi";
import { formatRupiah } from "@/lib/rupiah-foramatted";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ArrowLeft, Printer, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";

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

export default function KartuPersediaanPdfView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tanggalCetak, setTanggalCetak] = useState("");

  const barangId = searchParams.get("barangId") ?? "";
  const bulanParam = searchParams.get("bulan");
  const tahunParam = searchParams.get("tahun");

  const now = new Date();
  const bulan = bulanParam ? Number(bulanParam) : now.getMonth() + 1;
  const tahun = tahunParam ? Number(tahunParam) : now.getFullYear();
  const periodeLabel = `${BULAN_NAMA[bulan - 1]} ${tahun}`;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTanggalCetak(format(new Date(), "dd MMMM yyyy", { locale: idLocale }));
  }, []);

  const { data: response, isLoading } = useQuery<IKartuPersediaanResponse>({
    queryKey: ["kartu-persediaan", barangId, bulan, tahun],
    queryFn: async () => {
      const res = await instance.get("/mutasi/kartu-persediaan", {
        params: {
          barangId,
          bulan: String(bulan),
          tahun: String(tahun),
        },
      });
      return res?.data;
    },
    enabled: Boolean(barangId),
  });

  const kartuData = response?.data;
  const barang = kartuData?.barang;
  const transaksi = kartuData?.transaksi ?? [];
  const saldoAwal = kartuData?.saldoAwal ?? 0;
  const totalMasuk = kartuData?.totalMasuk ?? 0;
  const totalKeluar = kartuData?.totalKeluar ?? 0;
  const saldoAkhir = kartuData?.saldoAkhir ?? 0;
  const validasi = kartuData?.validasi;

  const totalMasukRp = transaksi
    .filter((t) => t.tipe === "MASUK")
    .reduce((acc, t) => acc + (t.total || t.jumlah * t.hargaSatuan), 0);

  const totalKeluarRp = transaksi
    .filter((t) => t.tipe === "KELUAR")
    .reduce((acc, t) => acc + (t.total || t.jumlah * t.hargaSatuan), 0);

  const formatTanggalSingkat = (tgl: string | Date) => {
    try {
      const d = new Date(tgl);
      return Number.isNaN(d.getTime()) ? "—" : format(d, "dd/MM/yyyy");
    } catch {
      return "—";
    }
  };

  const namaFile = `Kartu Persediaan - ${barang?.namaBarang ?? "Barang"} - ${periodeLabel}`;

  useEffect(() => {
    const prevTitle = document.title;
    document.title = namaFile;
    return () => {
      document.title = prevTitle;
    };
  }, [namaFile]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <>
      {/* TOOLBAR — Tidak ikut tercetak */}
      <div className="print:hidden sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border shadow-sm">
        <div className="max-w-[1100px] mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push("/mutasi");
              }
            }}
            className="gap-2 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Mutasi
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Pratinjau Kartu Persediaan Barang
            </span>
            <Button
              size="sm"
              onClick={handlePrint}
              disabled={isLoading || !barang}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-0 cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              Cetak / Unduh PDF
            </Button>
          </div>
        </div>
      </div>

      {/* ====================================================
          LOADING / ERROR STATE
      ==================================================== */}
      {isLoading && (
        <div className="print:hidden flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground">
          <Spinner className="h-8 w-8 text-primary" />
          <span className="text-sm">Memuat data kartu persediaan barang...</span>
        </div>
      )}

      {!isLoading && !barang && (
        <div className="print:hidden flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground">
          <AlertTriangle className="h-8 w-8 text-amber-500" />
          <span className="text-sm">Data barang tidak ditemukan atau belum dipilih.</span>
          <Button variant="outline" size="sm" onClick={() => router.push("/mutasi")}>
            Pilih Barang di Halaman Mutasi
          </Button>
        </div>
      )}

      {/* DOKUMEN PDF — Area yang akan dicetak */}
      {!isLoading && barang && (
        <div
          id="pdf-wrapper"
          className="bg-muted/50 print:bg-white py-8 print:py-0 overflow-x-auto"
        >
          <div
            id="pdf-document"
            className="
              flex flex-col
              bg-white text-black
              mx-auto
              w-[210mm] min-h-[297mm]
              px-[10mm] py-[8mm]
              shadow-md border border-gray-200
              print:w-full print:p-0
              print:shadow-none print:border-0
              font-[Arial,Helvetica,sans-serif]
            "
          >
            {/* KOP SURAT RESMI SEKOLAH */}
            <div className="flex items-center gap-3 mb-1">
              {/* Logo Pemprov Jabar */}
              <div className="shrink-0">
                <Image
                  src="/logo_gemah_ripah.webp"
                  alt="Logo Gemah Ripah"
                  width={70}
                  height={74}
                  priority
                  style={{ height: "auto" }}
                  className="rounded-lg"
                />
              </div>

              {/* Teks Kop */}
              <div className="flex-1 text-center leading-tight">
                <p className="text-[15px] font-bold tracking-wide">
                  PEMERINTAH DAERAH PROVINSI JAWA BARAT
                </p>
                <p className="text-[15px] font-bold tracking-wide">
                  DINAS PENDIDIKAN
                </p>
                <p className="text-[15px] font-bold tracking-wide">
                  CABANG DINAS PENDIDIKAN WILAYAH IV
                </p>
                <p className="text-[18px] font-bold tracking-wide uppercase">
                  SEKOLAH MENENGAH ATAS NEGERI 1 MAJALAYA
                </p>
                <div className="mt-2">
                  <p className="text-[10px] font-normal">
                    Perum Citra Kebun Mas Desa Bengle Kecamatan Majalaya
                    Kabupaten Karawang 41355
                  </p>
                  <p className="text-[10px] font-normal">
                    Web: https://sman1majalayakrw.sch.id E-mail:
                    smansatumajalaya.karawang@gmail.com
                  </p>
                  <p className="text-[10px] font-normal">
                    No.Telepon : ( 0267 ) 8402699
                  </p>
                </div>
              </div>

              {/* Kanan — spacer penyeimbang logo kiri */}
              <div className="shrink-0 w-[70px]"></div>
            </div>

            {/* Garis KOP */}
            <div className="border-t border-black mt-2 mb-5" />

            {/* JUDUL & SUB-INFO */}
            <div className="text-center mb-4">
              <h1 className="text-[14px] font-bold uppercase tracking-widest">
                KARTU PERSEDIAAN BARANG HABIS PAKAI
              </h1>
              <div className="mt-1.5 text-[11px] flex justify-center gap-8">
                <span>
                  <span className="font-semibold">Periode:</span> {periodeLabel}
                </span>
                <span>
                  <span className="font-semibold">Tanggal Cetak:</span>{" "}
                  {tanggalCetak || "—"}
                </span>
              </div>
            </div>

            {/* TABEL IDENTITAS BARANG (Di Atas Tabel Mutasi) */}
            <div className="mb-4 break-inside-avoid">
              <div className="border border-black bg-gray-50 text-[9px]">
                <div className="bg-gray-800 text-white font-bold py-1 px-2 uppercase text-[8.5px] border-b border-black">
                  Identitas Barang
                </div>
                <div className="grid grid-cols-2 divide-x divide-black">
                  {/* Kolom Kiri */}
                  <div className="p-2 space-y-1">
                    <div className="flex">
                      <span className="w-28 text-gray-600 font-normal">Nama Barang</span>
                      <span className="font-bold text-black">: {barang.namaBarang}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-gray-600 font-normal">Satuan Barang</span>
                      <span className="font-semibold text-black">: {barang.satuan}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-gray-600 font-normal">Sumber Dana</span>
                      <span className="font-semibold text-black">
                        : {barang.sumber?.trim() || "—"}
                      </span>
                    </div>
                  </div>

                  {/* Kolom Kanan */}
                  <div className="p-2 space-y-1">
                    <div className="flex">
                      <span className="w-28 text-gray-600 font-normal">Kode Rekening</span>
                      <span className="font-mono text-[8.5px] text-black">
                        : {barang.kodeRekening}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-gray-600 font-normal">Kategori</span>
                      <span className="font-semibold text-black">: {barang.kategori}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-gray-600 font-normal">Merek</span>
                      <span className="font-semibold text-black">
                        : {barang.merk?.trim() || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TABEL MUTASI & TRANSAKSI KRONOLOGIS */}
            <div className="mb-4">
              <table
                className="w-full border-collapse text-[7.5px]"
                style={{ tableLayout: "fixed" }}
              >
                <colgroup>
                  <col style={{ width: "3%" }} />
                  <col style={{ width: "7.5%" }} />
                  {/* Masuk */}
                  <col style={{ width: "5%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "9%" }} />
                  {/* Keluar */}
                  <col style={{ width: "5%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "9%" }} />
                  {/* Sisa Saldo Barang Tersedia */}
                  <col style={{ width: "5%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "9%" }} />
                  {/* Oleh */}
                  <col style={{ width: "11%" }} />
                  {/* Keperluan */}
                  <col style={{ width: "12.5%" }} />
                </colgroup>

                <thead>
                  <tr className="bg-gray-800 text-white font-bold text-center">
                    <th
                      rowSpan={2}
                      className="border border-black py-1.5 px-0.5 uppercase text-center"
                      style={{ fontSize: 7.5 }}
                    >
                      No
                    </th>
                    <th
                      rowSpan={2}
                      className="border border-black py-1.5 px-0.5 uppercase text-center"
                      style={{ fontSize: 7.5 }}
                    >
                      Tanggal
                    </th>
                    <th
                      colSpan={3}
                      className="border border-black py-1.5 px-0.5 uppercase text-center"
                      style={{ fontSize: 7.5 }}
                    >
                      Masuk
                    </th>
                    <th
                      colSpan={3}
                      className="border border-black py-1.5 px-0.5 uppercase text-center"
                      style={{ fontSize: 7.5 }}
                    >
                      Keluar
                    </th>
                    <th
                      colSpan={3}
                      className="border border-black py-1.5 px-0.5 uppercase text-center"
                      style={{ fontSize: 7.5 }}
                    >
                      Sisa Saldo Barang Tersedia
                    </th>
                    <th
                      rowSpan={2}
                      className="border border-black py-1.5 px-0.5 uppercase text-center"
                      style={{ fontSize: 7.5 }}
                    >
                      Oleh
                    </th>
                    <th
                      rowSpan={2}
                      className="border border-black py-1.5 px-0.5 uppercase text-center"
                      style={{ fontSize: 7.5 }}
                    >
                      Keperluan
                    </th>
                  </tr>
                  <tr className="bg-gray-800 text-white font-bold text-center">
                    {/* Subkolom Masuk */}
                    <th
                      className="border border-black py-1 px-0.5 uppercase text-center"
                      style={{ fontSize: 7 }}
                    >
                      Jumlah
                    </th>
                    <th
                      className="border border-black py-1 px-0.5 uppercase text-center"
                      style={{ fontSize: 7 }}
                    >
                      Harga Satuan
                    </th>
                    <th
                      className="border border-black py-1 px-0.5 uppercase text-center"
                      style={{ fontSize: 7 }}
                    >
                      Total (Rp)
                    </th>

                    {/* Subkolom Keluar */}
                    <th
                      className="border border-black py-1 px-0.5 uppercase text-center"
                      style={{ fontSize: 7 }}
                    >
                      Jumlah
                    </th>
                    <th
                      className="border border-black py-1 px-0.5 uppercase text-center"
                      style={{ fontSize: 7 }}
                    >
                      Harga Satuan
                    </th>
                    <th
                      className="border border-black py-1 px-0.5 uppercase text-center"
                      style={{ fontSize: 7 }}
                    >
                      Total (Rp)
                    </th>

                    {/* Subkolom Sisa Saldo Barang Tersedia */}
                    <th
                      className="border border-black py-1 px-0.5 uppercase text-center"
                      style={{ fontSize: 7 }}
                    >
                      Jumlah
                    </th>
                    <th
                      className="border border-black py-1 px-0.5 uppercase text-center"
                      style={{ fontSize: 7 }}
                    >
                      Harga Satuan
                    </th>
                    <th
                      className="border border-black py-1 px-0.5 uppercase text-center"
                      style={{ fontSize: 7 }}
                    >
                      Total (Rp)
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {/* Baris Saldo Awal */}
                  <tr className="bg-gray-100 font-medium">
                    <td className="border border-black text-center py-1.5 px-0.5 text-gray-500">
                      —
                    </td>
                    <td className="border border-black text-center py-1.5 px-0.5 font-mono text-[7.5px]">
                      01/{String(bulan).padStart(2, "0")}/{tahun}
                    </td>
                    {/* Masuk (Jumlah, Harga Satuan, Total) */}
                    <td className="border border-black py-1.5 px-0.5 text-center text-gray-400">
                      —
                    </td>
                    <td className="border border-black py-1.5 px-0.5 text-center text-gray-400">
                      —
                    </td>
                    <td className="border border-black py-1.5 px-0.5 text-center text-gray-400">
                      —
                    </td>
                    {/* Keluar (Jumlah, Harga Satuan, Total) */}
                    <td className="border border-black py-1.5 px-0.5 text-center text-gray-400">
                      —
                    </td>
                    <td className="border border-black py-1.5 px-0.5 text-center text-gray-400">
                      —
                    </td>
                    <td className="border border-black py-1.5 px-0.5 text-center text-gray-400">
                      —
                    </td>
                    {/* Sisa Saldo Barang Tersedia (Jumlah, Harga Satuan, Total) */}
                    <td
                      className={`border border-black py-1.5 px-0.5 text-right font-bold tabular-nums ${
                        saldoAwal < 0 ? "text-red-600" : "text-black"
                      }`}
                    >
                      {saldoAwal.toLocaleString("id-ID")}
                    </td>
                    <td className="border border-black py-1.5 px-0.5 text-right tabular-nums text-[6.5px]">
                      {formatRupiah(barang.harga)}
                    </td>
                    <td
                      className={`border border-black py-1.5 px-0.5 text-right font-bold tabular-nums text-[6.5px] ${
                        saldoAwal < 0 ? "text-red-600" : "text-black"
                      }`}
                    >
                      {formatRupiah(saldoAwal * barang.harga)}
                    </td>
                    {/* Oleh */}
                    <td className="border border-black py-1.5 px-0.5 text-center text-gray-400">
                      —
                    </td>
                    {/* Keperluan */}
                    <td className="border border-black py-1.5 px-1 text-left italic text-[7px] text-gray-700">
                      Saldo Awal Periode
                    </td>
                  </tr>

                  {/* Riwayat Transaksi Kronologis */}
                  {transaksi.length === 0 ? (
                    <tr>
                      <td
                        colSpan={13}
                        className="border border-black text-center py-6 text-gray-500 italic text-[9px]"
                      >
                        — Tidak ada transaksi mutasi barang pada periode {periodeLabel} —
                      </td>
                    </tr>
                  ) : (
                    transaksi.map((item, idx) => {
                      const isMasuk = item.tipe === "MASUK";
                      const isKeluar = item.tipe === "KELUAR";
                      const itemHarga = item.hargaSatuan || barang.harga;
                      const itemTotal = item.total || item.jumlah * itemHarga;
                      const sisaTotalRp = item.saldoBerjalan * itemHarga;

                      return (
                        <tr
                          key={item.id}
                          className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="border border-black text-center py-1.5 px-0.5">
                            {idx + 1}
                          </td>
                          <td className="border border-black text-center py-1.5 px-0.5 whitespace-nowrap font-mono text-[7.5px]">
                            {formatTanggalSingkat(item.tanggal)}
                          </td>
                          {/* Masuk: Jumlah, Harga Satuan, Total */}
                          <td className="border border-black py-1.5 px-0.5 text-right tabular-nums">
                            {isMasuk ? (
                              <span className="font-semibold text-emerald-700">
                                {item.jumlah.toLocaleString("id-ID")}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="border border-black py-1.5 px-0.5 text-right tabular-nums text-[6.5px]">
                            {isMasuk ? (
                              formatRupiah(itemHarga)
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="border border-black py-1.5 px-0.5 text-right tabular-nums font-medium text-[6.5px]">
                            {isMasuk ? (
                              <span className="text-emerald-700">
                                {formatRupiah(itemTotal)}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          {/* Keluar: Jumlah, Harga Satuan, Total */}
                          <td className="border border-black py-1.5 px-0.5 text-right tabular-nums">
                            {isKeluar ? (
                              <span className="font-semibold text-rose-700">
                                {item.jumlah.toLocaleString("id-ID")}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="border border-black py-1.5 px-0.5 text-right tabular-nums text-[6.5px]">
                            {isKeluar ? (
                              formatRupiah(itemHarga)
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="border border-black py-1.5 px-0.5 text-right tabular-nums font-medium text-[6.5px]">
                            {isKeluar ? (
                              <span className="text-rose-700">
                                {formatRupiah(itemTotal)}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          {/* Sisa Saldo Barang Tersedia: Jumlah, Harga Satuan, Total */}
                          <td
                            className={`border border-black py-1.5 px-0.5 text-right font-bold tabular-nums ${
                              item.saldoBerjalan < 0
                                ? "text-red-600"
                                : "text-black"
                            }`}
                          >
                            {item.saldoBerjalan.toLocaleString("id-ID")}
                          </td>
                          <td className="border border-black py-1.5 px-0.5 text-right tabular-nums text-[6.5px]">
                            {formatRupiah(itemHarga)}
                          </td>
                          <td
                            className={`border border-black py-1.5 px-0.5 text-right font-bold tabular-nums text-[6.5px] ${
                              item.saldoBerjalan < 0
                                ? "text-red-600"
                                : "text-black"
                            }`}
                          >
                            {formatRupiah(sisaTotalRp)}
                          </td>
                          {/* Oleh */}
                          <td className="border border-black py-1.5 px-1 text-left break-words text-[7px]">
                            {item.pihakTerkait?.trim() || (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          {/* Keperluan */}
                          <td className="border border-black py-1.5 px-1 text-left break-words text-[7px]">
                            {item.keterangan?.trim() || (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}

                  {/* Baris Total Mutasi & Saldo Akhir */}
                  <tr className="bg-gray-200 font-bold">
                    <td
                      colSpan={2}
                      className="border border-black py-2 px-1 uppercase text-center text-[7.5px]"
                    >
                      TOTAL MUTASI &amp; SALDO AKHIR
                    </td>
                    {/* Total Masuk */}
                    <td className="border border-black py-2 px-0.5 text-right tabular-nums text-emerald-800">
                      {totalMasuk > 0
                        ? totalMasuk.toLocaleString("id-ID")
                        : "0"}
                    </td>
                    <td className="border border-black py-2 px-0.5 text-center text-gray-400">
                      —
                    </td>
                    <td className="border border-black py-2 px-0.5 text-right tabular-nums text-emerald-800 text-[6.5px]">
                      {totalMasukRp > 0 ? formatRupiah(totalMasukRp) : "Rp 0"}
                    </td>
                    {/* Total Keluar */}
                    <td className="border border-black py-2 px-0.5 text-right tabular-nums text-rose-800">
                      {totalKeluar > 0
                        ? totalKeluar.toLocaleString("id-ID")
                        : "0"}
                    </td>
                    <td className="border border-black py-2 px-0.5 text-center text-gray-400">
                      —
                    </td>
                    <td className="border border-black py-2 px-0.5 text-right tabular-nums text-rose-800 text-[6.5px]">
                      {totalKeluarRp > 0 ? formatRupiah(totalKeluarRp) : "Rp 0"}
                    </td>
                    {/* Saldo Akhir */}
                    <td
                      className={`border border-black py-2 px-0.5 text-right tabular-nums font-bold ${
                        saldoAkhir < 0 ? "text-red-700" : "text-black"
                      }`}
                    >
                      {saldoAkhir.toLocaleString("id-ID")}
                    </td>
                    <td className="border border-black py-2 px-0.5 text-right tabular-nums font-bold text-[6.5px]">
                      {formatRupiah(barang.harga)}
                    </td>
                    <td
                      className={`border border-black py-2 px-0.5 text-right tabular-nums font-bold text-[6.5px] ${
                        saldoAkhir < 0 ? "text-red-700" : "text-black"
                      }`}
                    >
                      {formatRupiah(saldoAkhir * barang.harga)}
                    </td>
                    {/* Oleh */}
                    <td className="border border-black py-2 px-0.5 text-center text-gray-400">
                      —
                    </td>
                    {/* Keperluan */}
                    <td className="border border-black py-2 px-0.5 text-center text-gray-400">
                      —
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/*
              PERINGATAN & TRANSPARANSI AUDIT (Jika ada)
             */}
            {validasi && (!validasi.isConsistent || validasi.warnings.length > 0) && (
              <div className="mb-4 border border-amber-300 bg-amber-50/60 p-2 text-[8px] text-amber-900 rounded-none break-inside-avoid">
                <div className="flex items-center gap-1 font-bold text-[8.5px] mb-0.5">
                  <Info className="h-3 w-3 shrink-0" />
                  <span>Catatan Transparansi Integritas Data:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5">
                  {validasi.warnings.map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}

            {/*
              BLOK TANDA TANGAN
            */}
            <div
              className="mt-auto pt-6 flex justify-between break-inside-avoid"
              style={{ pageBreakInside: "avoid" }}
            >
              {/* Kiri — Kepala Sekolah */}
              <div className="text-center text-[10.5px] w-[150px]">
                <p>Mengetahui,</p>
                <div className="h-[60px]" />
                <p className="font-bold">Kepala Sekolah</p>
                <p>(.....................................)</p>
              </div>

              {/* Kanan — Staf Tata Usaha */}
              <div className="text-center text-[10.5px] w-[150px]">
                <p>
                  Majalaya,{" "}
                  {tanggalCetak ||
                    format(new Date(), "dd MMMM yyyy", { locale: idLocale })}
                </p>
                <p>Dibuat oleh,</p>
                <div className="h-[48px]" />
                <p className="font-bold">Staf Tata Usaha</p>
                <p>(.....................................)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/*
          PRINT STYLES — inlined via style tag
      */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 1.2cm;
          }

          html,
          body {
            display: block !important;
            height: auto !important;
            min-height: auto !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print\\:hidden {
            display: none !important;
          }

          #pdf-wrapper {
            padding: 0 !important;
            background: white !important;
            overflow: visible !important;
          }

          #pdf-document {
            margin: 0 auto !important;
            padding: 0 !important;
            border: 0 !important;
            box-shadow: none !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: 268mm !important;
          }

          #pdf-document thead {
            display: table-header-group;
          }

          #pdf-document tr {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </>
  );
}

