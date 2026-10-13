"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import instance from "@/lib/instance";
import { IKartuPersediaanResponse } from "@/types/transaksi";
import { formatDate } from "@/lib/date-formatted";
import { formatRupiah } from "@/lib/rupiah-foramatted";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ArrowLeft, Printer, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

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

  const namaFile = `Kartu Persediaan - ${barang?.namaBarang ?? "Barang"} - ${periodeLabel}`;

  useEffect(() => {
    const prevTitle = document.title;
    document.title = namaFile;
    return () => {
      document.title = prevTitle;
    };
  }, [namaFile]);

  const handlePrint = () => {
    document.title = namaFile;
    window.print();
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

      {/* ====================================================
          DOKUMEN PDF — Area yang akan dicetak
      ==================================================== */}
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
              px-[12mm] py-[10mm]
              shadow-md border border-gray-200
              print:w-full print:p-0
              print:shadow-none print:border-0
              font-[Arial,Helvetica,sans-serif]
            "
          >
            {/* ──────────────────────────────────────────────
              KOP SURAT RESMI SEKOLAH
            ────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 mb-1">
              {/* Logo Kiri */}
              <div
                className="shrink-0 w-12 h-12 rounded-full border-2 border-black flex items-center justify-center"
                style={{ fontSize: 9, textAlign: "center", lineHeight: "1.2" }}
              >
                <span className="font-bold text-[8px] leading-tight text-center px-1">
                  LOGO
                  <br />
                  DINAS
                </span>
              </div>

              {/* Teks Kop */}
              <div className="flex-1 text-center">
                <p className="text-[11px] font-normal tracking-wide">
                  PEMERINTAH DAERAH PROVINSI JAWA BARAT
                </p>
                <p className="text-[11px] font-normal tracking-wide">
                  DINAS PENDIDIKAN
                </p>
                <p className="text-[15px] font-bold tracking-wide uppercase">
                  SMA NEGERI 1 MAJALAYA
                </p>
                <p className="text-[10px] font-normal">
                  Perum Citra Kebun Mas , Kec. Majalaya, Kab. Karawang, Prov. Jawa Barat
                </p>
                <p className="text-[10px] font-normal">
                  Telepon: (022) 5951089 &nbsp;|&nbsp; Email: sman1majalaya@gmail.com
                </p>
              </div>

              {/* Logo Kanan */}
              <div
                className="shrink-0 w-12 h-12 rounded-full border-2 border-black flex items-center justify-center"
                style={{ fontSize: 9, textAlign: "center", lineHeight: "1.2" }}
              >
                <span className="font-bold text-[8px] leading-tight text-center px-1">
                  LOGO
                  <br />
                  JABAR
                </span>
              </div>
            </div>

            {/* Garis Ganda Kop */}
            <div className="border-t-2 border-black mt-2 mb-4" />

            {/* ──────────────────────────────────────────────
              JUDUL & SUB-INFO
            ────────────────────────────────────────────── */}
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

            {/* ──────────────────────────────────────────────
              TABEL IDENTITAS BARANG (Di Atas Tabel Mutasi)
            ────────────────────────────────────────────── */}
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
                      <span className="w-28 text-gray-600 font-normal">Satuan</span>
                      <span className="font-semibold text-black">: {barang.satuan}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-gray-600 font-normal">Merek</span>
                      <span className="font-semibold text-black">
                        : {barang.merk && barang.merk.trim() !== "" ? barang.merk : "—"}
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
                      <span className="w-28 text-gray-600 font-normal">Harga Referensi</span>
                      <span className="font-medium text-black">
                        : {formatRupiah(barang.harga)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ──────────────────────────────────────────────
              TABEL MUTASI & TRANSAKSI KRONOLOGIS
            ────────────────────────────────────────────── */}
            <div className="mb-4">
              <table
                className="w-full border-collapse text-[8.5px]"
                style={{ tableLayout: "fixed" }}
              >
                <colgroup>
                  <col style={{ width: "5%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "23%" }} />
                  <col style={{ width: "24%" }} />
                  <col style={{ width: "11%" }} />
                  <col style={{ width: "11%" }} />
                  <col style={{ width: "12%" }} />
                </colgroup>

                <thead>
                  <tr className="bg-gray-800 text-white font-bold text-center">
                    <th className="border border-black py-1.5 px-1 uppercase text-center">
                      No
                    </th>
                    <th className="border border-black py-1.5 px-1 uppercase text-center">
                      Tanggal
                    </th>
                    <th className="border border-black py-1.5 px-1 uppercase text-center">
                      Pihak Terkait (Oleh / Kepada)
                    </th>
                    <th className="border border-black py-1.5 px-1 uppercase text-center">
                      Keterangan / Keperluan
                    </th>
                    <th className="border border-black py-1.5 px-1 uppercase text-center">
                      Masuk ({barang.satuan})
                    </th>
                    <th className="border border-black py-1.5 px-1 uppercase text-center">
                      Keluar ({barang.satuan})
                    </th>
                    <th className="border border-black py-1.5 px-1 uppercase text-center">
                      Sisa ({barang.satuan})
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {/* Baris Saldo Awal */}
                  <tr className="bg-gray-100 font-medium">
                    <td className="border border-black text-center py-1.5 px-1 text-gray-500">
                      —
                    </td>
                    <td className="border border-black text-center py-1.5 px-1 font-mono text-[8px]">
                      01/{String(bulan).padStart(2, "0")}/{tahun}
                    </td>
                    <td className="border border-black py-1.5 px-1.5 text-center text-gray-500">
                      —
                    </td>
                    <td className="border border-black py-1.5 px-1.5 font-bold uppercase text-gray-700">
                      SALDO AWAL PERIODE
                    </td>
                    <td className="border border-black py-1.5 px-1 text-center text-gray-400">
                      —
                    </td>
                    <td className="border border-black py-1.5 px-1 text-center text-gray-400">
                      —
                    </td>
                    <td
                      className={`border border-black py-1.5 px-1.5 text-right font-bold tabular-nums ${
                        saldoAwal < 0 ? "text-red-600" : "text-black"
                      }`}
                    >
                      {saldoAwal.toLocaleString("id-ID")}
                    </td>
                  </tr>

                  {/* Riwayat Transaksi Kronologis */}
                  {transaksi.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="border border-black text-center py-6 text-gray-500 italic text-[9px]"
                      >
                        — Tidak ada transaksi mutasi barang pada periode {periodeLabel} —
                      </td>
                    </tr>
                  ) : (
                    transaksi.map((item, idx) => (
                      <tr
                        key={item.id}
                        className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="border border-black text-center py-1.5 px-1">
                          {idx + 1}
                        </td>
                        <td className="border border-black text-center py-1.5 px-1 whitespace-nowrap">
                          {formatDate(item.tanggal)}
                        </td>
                        <td className="border border-black py-1.5 px-1.5 break-words">
                          {item.pihakTerkait && item.pihakTerkait.trim() !== "" ? (
                            <span>{item.pihakTerkait}</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="border border-black py-1.5 px-1.5 break-words">
                          {item.keterangan && item.keterangan.trim() !== "" ? (
                            <span>{item.keterangan}</span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="border border-black py-1.5 px-1.5 text-right tabular-nums">
                          {item.tipe === "MASUK" ? (
                            <span className="font-semibold text-emerald-700">
                              +{item.jumlah.toLocaleString("id-ID")}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="border border-black py-1.5 px-1.5 text-right tabular-nums">
                          {item.tipe === "KELUAR" ? (
                            <span className="font-semibold text-rose-700">
                              {item.jumlah.toLocaleString("id-ID")}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td
                          className={`border border-black py-1.5 px-1.5 text-right font-bold tabular-nums ${
                            item.saldoBerjalan < 0 ? "text-red-600" : "text-black"
                          }`}
                        >
                          {item.saldoBerjalan.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))
                  )}

                  {/* Baris Total Mutasi & Saldo Akhir */}
                  <tr className="bg-gray-200 font-bold">
                    <td
                      colSpan={4}
                      className="border border-black py-2 px-2 uppercase text-center text-[9px]"
                    >
                      TOTAL MUTASI &amp; SALDO AKHIR
                    </td>
                    <td className="border border-black py-2 px-1.5 text-right tabular-nums text-emerald-800">
                      {totalMasuk > 0 ? `+${totalMasuk.toLocaleString("id-ID")}` : "0"}
                    </td>
                    <td className="border border-black py-2 px-1.5 text-right tabular-nums text-rose-800">
                      {totalKeluar > 0 ? totalKeluar.toLocaleString("id-ID") : "0"}
                    </td>
                    <td
                      className={`border border-black py-2 px-1.5 text-right tabular-nums text-[9px] ${
                        saldoAkhir < 0 ? "text-red-700" : "text-black"
                      }`}
                    >
                      {saldoAkhir.toLocaleString("id-ID")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ──────────────────────────────────────────────
              PERINGATAN & TRANSPARANSI AUDIT (Jika ada)
            ────────────────────────────────────────────── */}
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

            {/* ──────────────────────────────────────────────
              BLOK TANDA TANGAN
            ────────────────────────────────────────────── */}
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

      {/* ====================================================
          PRINT STYLES — inlined via style tag
      ==================================================== */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 1.8cm;
          }

          html,
          body {
            width: 100%;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
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
            min-height: 258mm !important;
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

