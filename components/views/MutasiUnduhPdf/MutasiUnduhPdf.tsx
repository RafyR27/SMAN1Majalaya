"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import instance from "@/lib/instance";
import { MutasiPdfResponse, MutasiPdfItem } from "@/types/mutasi";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatRupiah } from "@/lib/rupiah-foramatted";
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

export default function MutasiUnduhPdfView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tanggalCetak, setTanggalCetak] = useState("");

  const bulanParam = searchParams.get("bulan");
  const tahunParam = searchParams.get("tahun");
  const idsParam = searchParams.get("ids");

  const now = new Date();
  const bulan = bulanParam ? Number(bulanParam) : now.getMonth() + 1;
  const tahun = tahunParam ? Number(tahunParam) : now.getFullYear();
  const periodeLabel = `${BULAN_NAMA[bulan - 1]} ${tahun}`;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTanggalCetak(format(new Date(), "dd MMMM yyyy", { locale: idLocale }));
  }, []);

  // Nama file default saat "Simpan sebagai PDF" mengikuti document.title
  const namaFile = `Laporan Mutasi Periode ${periodeLabel}`;
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

  const { data: response, isLoading } = useQuery<MutasiPdfResponse>({
    queryKey: ["mutasi-pdf", bulan, tahun, idsParam],
    queryFn: async () => {
      const params: Record<string, string> = {
        bulan: String(bulan),
        tahun: String(tahun),
      };
      if (idsParam) params.ids = idsParam;
      const res = await instance.get("/mutasi/unduh-pdf", { params });
      return res?.data;
    },
  });

  const items: MutasiPdfItem[] = response?.data?.items ?? [];
  const totalSaldoAwalRp = response?.data?.summary?.totalSaldoAwalRp ?? 0;
  const totalSaldoAkhirRp = response?.data?.summary?.totalSaldoAkhirRp ?? 0;

  return (
    <>
      {/* ====================================================
          TOOLBAR — Tidak ikut tercetak
      ==================================================== */}
      <div className="print:hidden sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border shadow-sm">
        <div className="max-w-275 mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/mutasi")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Mutasi
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Pratinjau laporan sebelum dicetak
            </span>
            <Button
              size="sm"
              onClick={handlePrint}
              disabled={isLoading}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
            >
              <Printer className="h-4 w-4" />
              Cetak / Unduh PDF
            </Button>
          </div>
        </div>
      </div>

      {/* ====================================================
          LOADING STATE
      ==================================================== */}
      {isLoading && (
        <div className="print:hidden flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground">
          <Spinner className="h-8 w-8 text-primary" />
          <span className="text-sm">Memuat data laporan...</span>
        </div>
      )}

      {/* ====================================================
          DOKUMEN PDF — area yang akan dicetak
      ==================================================== */}
      {!isLoading && (
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
            px-[10mm] py-[10mm]
            shadow-md border border-gray-200
            print:w-full print:p-0
            print:shadow-none print:border-0
            font-[Arial,Helvetica,sans-serif]
          "
          >
            {/* ──────────────────────────────────────────────
              KOP SURAT
          ────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 mb-1">
              {/* Logo placeholder */}
              <div className="shrink-0">
                <Image
                  src="/logo_gemah_ripah.webp"
                  alt="Logo Gemah Ripah"
                  width={70}
                  height={70}
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

              {/* Kanan — logo Jawa Barat placeholder */}
              <div className="shrink-0 w-12 h-12 "></div>
            </div>

            {/* Garis ganda KOP */}
            <div className="border-t border-black mt-2 mb-5" />

            {/* ──────────────────────────────────────────────
              JUDUL & SUB-INFO
          ────────────────────────────────────────────── */}
            <div className="text-center mb-5">
              <h1 className="text-[14px] font-bold uppercase tracking-widest">
                Laporan Mutasi Barang Habis Pakai
              </h1>
              <div className="mt-2 text-[11px] flex justify-center gap-8">
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
              TABEL UTAMA
          ────────────────────────────────────────────── */}
            <table
              className="w-full mx-auto border-collapse text-[8px]"
              style={{ tableLayout: "fixed" }}
            >
              {/* Lebar kolom — total 100% dari area isi 15 cm (A4 portrait, margin 3 cm) */}
              <colgroup>
                <col style={{ width: "5%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "16%" }} />
              </colgroup>

              <thead>
                {/* Group header baris 1 */}
                <tr>
                  <th
                    rowSpan={2}
                    className="border border-black font-bold uppercase text-center py-1.5 px-1"
                    style={{ fontSize: 7.5 }}
                  >
                    No
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-black  font-bold uppercase text-center py-1.5 px-1"
                    style={{ fontSize: 7.5 }}
                  >
                    Nama Barang
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-black  font-bold uppercase text-center py-1.5 px-1"
                    style={{ fontSize: 7.5 }}
                  >
                    Kategori
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-black  font-bold uppercase text-center py-1.5 px-1"
                    style={{ fontSize: 7.5 }}
                  >
                    Kode Rekening
                  </th>
                  <th
                    colSpan={2}
                    className="border border-black font-bold uppercase text-center py-1.5 px-1"
                    style={{ fontSize: 7.5 }}
                  >
                    Saldo Awal
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-black font-bold uppercase text-center py-1.5 px-1"
                    style={{ fontSize: 7.5 }}
                  >
                    Masuk (Qty)
                  </th>
                  <th
                    rowSpan={2}
                    className="border border-black font-bold uppercase text-center py-1.5 px-1"
                    style={{ fontSize: 7.5 }}
                  >
                    Keluar (Qty)
                  </th>
                  <th
                    colSpan={2}
                    className="border border-black font-bold uppercase text-center py-1.5 px-1"
                    style={{ fontSize: 7.5 }}
                  >
                    Saldo Akhir
                  </th>
                </tr>
                {/* Baris sub-header */}
                <tr>
                  <th
                    className="border border-black font-bold uppercase text-center py-1 px-1"
                    style={{ fontSize: 7.5 }}
                  >
                    Qty
                  </th>
                  <th
                    className="border border-black font-bold uppercase text-center py-1 px-1"
                    style={{ fontSize: 7.5 }}
                  >
                    Rp
                  </th>
                  <th
                    className="border border-black font-bold uppercase text-center py-1 px-1"
                    style={{ fontSize: 7.5 }}
                  >
                    Qty
                  </th>
                  <th
                    className="border border-black font-bold uppercase text-center py-1 px-1"
                    style={{ fontSize: 7.5 }}
                  >
                    Rp
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="border border-black text-center py-8 text-gray-500 italic"
                      style={{ fontSize: 11 }}
                    >
                      Tidak ada data pada periode ini
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="border border-black text-center py-1 px-1">
                        {idx + 1}
                      </td>
                      <td className="border border-black py-1 px-0.5 font-medium wrap-break-word">
                        {item.namaBarang}
                      </td>
                      <td className="border border-black py-1 px-0.5">
                        {item.kategori}
                      </td>
                      <td className="border border-black py-1 px-0.5 font-mono text-[7.5px] text-center break-all">
                        {item.kodeRekening}
                      </td>
                      {/* Saldo Awal Qty */}
                      <td className="border border-black py-1 px-0.5 text-right tabular-nums">
                        {item.saldoAwal.toLocaleString("id-ID")}
                      </td>
                      {/* Saldo Awal Rp */}
                      <td className="border border-black py-1 px-0.5 text-right tabular-nums text-[7.5px]">
                        {formatRupiah(item.saldoAwalRp)}
                      </td>
                      {/* Masuk */}
                      <td className="border border-black py-1 px-0.5 text-right tabular-nums">
                        {item.masuk > 0 ? (
                          <span className="font-semibold">
                            +{item.masuk.toLocaleString("id-ID")}
                          </span>
                        ) : (
                          <span>0</span>
                        )}
                      </td>
                      {/* Keluar */}
                      <td className="border border-black py-1 px-0.5 text-right tabular-nums">
                        {item.keluar > 0 ? (
                          <span className="font-semibold">
                            {item.keluar.toLocaleString("id-ID")}
                          </span>
                        ) : (
                          <span>0</span>
                        )}
                      </td>
                      {/* Saldo Akhir Qty */}
                      <td className="border border-black py-1 px-0.5 text-right tabular-nums font-bold">
                        {item.saldoAkhir.toLocaleString("id-ID")}
                      </td>
                      {/* Saldo Akhir Rp */}
                      <td className="border border-black py-1 px-0.5 text-right tabular-nums font-bold text-[7.5px]">
                        {formatRupiah(item.saldoAkhirRp)}
                      </td>
                    </tr>
                  ))
                )}

                {/* ── Baris TOTAL NILAI ── */}
                {items.length > 0 && (
                  <tr className="bg-gray-200">
                    <td
                      colSpan={4}
                      className="border border-black py-1.5 px-2 font-bold uppercase text-center"
                      style={{ fontSize: 8 }}
                    >
                      Total Nilai
                    </td>
                    {/* Saldo Awal Qty — kosong */}
                    <td className="border border-black py-1.5 px-0.5 text-center font-bold">
                      —
                    </td>
                    {/* Saldo Awal Rp — sum */}
                    <td className="border border-black py-1.5 px-0.5 text-right tabular-nums font-bold text-[7.5px]">
                      {formatRupiah(totalSaldoAwalRp)}
                    </td>
                    {/* Masuk Qty — kosong */}
                    <td className="border border-black py-1.5 px-0.5 text-center font-bold">
                      —
                    </td>
                    {/* Keluar Qty — kosong */}
                    <td className="border border-black py-1.5 px-0.5 text-center font-bold">
                      —
                    </td>
                    {/* Saldo Akhir Qty — kosong */}
                    <td className="border border-black py-1.5 px-0.5 text-center font-bold">
                      —
                    </td>
                    {/* Saldo Akhir Rp — sum */}
                    <td className="border border-black py-1.5 px-0.5 text-right tabular-nums font-bold text-[7.5px]">
                      {formatRupiah(totalSaldoAkhirRp)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* ──────────────────────────────────────────────
              BLOK TANDA TANGAN
          ────────────────────────────────────────────── */}
            <div
              className="mt-auto pt-10 flex justify-between break-inside-avoid"
              style={{ pageBreakInside: "avoid" }}
            >
              {/* Kiri — Kepala Sekolah */}
              <div className="text-center text-[11px] w-[140px]">
                <p>Mengetahui,</p>
                {/* Spasi 4 baris tanda tangan */}
                <div className="h-[68px]" />
                <p className="font-bold">Kepala Sekolah</p>
                <p>(.....................................)</p>
              </div>

              {/* Kanan — Staf Tata Usaha */}
              <div className="text-center text-[11px] w-[140px]">
                <p>
                  Majalaya,{" "}
                  {tanggalCetak ||
                    format(new Date(), "dd MMMM yyyy", { locale: idLocale })}
                </p>
                <p>Dibuat oleh,</p>
                {/* Spasi tanda tangan */}
                <div className="h-[54px]" />
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
            margin: 2cm;
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

          /* Sembunyikan elemen non-print */
          .print\\:hidden {
            display: none !important;
          }

          #pdf-wrapper {
            padding: 0 !important;
            background: white !important;
            overflow: visible !important;
          }

          /* Dokumen PDF — mengisi penuh area cetak A4 (margin diatur oleh @page) */
          #pdf-document {
            margin: 0 auto !important;
            padding: 0 !important;
            border: 0 !important;
            box-shadow: none !important;
            width: 100% !important;
            max-width: 100% !important;
            /* Tinggi area cetak A4 (297mm - margin atas/bawah 2cm), dikurangi 1mm
               untuk mencegah halaman kosong akibat pembulatan. Tanda tangan
               didorong ke bawah via mt-auto. */
            min-height: 256mm !important;
          }

          /* Multi-halaman: header tabel berulang & baris tidak terpotong */
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
