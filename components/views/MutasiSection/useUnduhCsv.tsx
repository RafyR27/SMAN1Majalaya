"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import instance from "@/lib/instance";
import { MutasiCsvItem, MutasiCsvMeta, MutasiCsvResponse } from "@/types/mutasi";

interface UseUnduhCsvParams {
  bulan: number;
  tahun: number;
}

const CACHE_KEY_PREFIX = "mutasi_csv_cache_";
const PENDING_KEY = "mutasi_csv_pending_download";
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 menit
const TOAST_ID = "unduh-csv-toast";

function getCachedData(
  bulan: number,
  tahun: number,
): { items: MutasiCsvItem[]; meta: MutasiCsvMeta } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`${CACHE_KEY_PREFIX}${bulan}_${tahun}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      sessionStorage.removeItem(`${CACHE_KEY_PREFIX}${bulan}_${tahun}`);
      return null;
    }
    return { items: parsed.items, meta: parsed.meta };
  } catch {
    return null;
  }
}

function setCachedData(
  bulan: number,
  tahun: number,
  items: MutasiCsvItem[],
  meta: MutasiCsvMeta,
) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      `${CACHE_KEY_PREFIX}${bulan}_${tahun}`,
      JSON.stringify({ items, meta, timestamp: Date.now() }),
    );
  } catch (e) {
    console.warn("Storage quota exceeded or error caching CSV data:", e);
  }
}

function generateAndDownloadCsv(
  items: MutasiCsvItem[],
  meta: MutasiCsvMeta | undefined,
  bulan: number,
  tahun: number,
  toastId: string,
) {
  const saldoAwalLabel = meta?.saldoAwalLabel ?? `1 ${bulan} ${tahun}`;
  const saldoAkhirLabel = meta?.saldoAkhirLabel ?? `${bulan} ${tahun}`;
  const namaFile = meta?.namaFile ?? `Laporan-Mutasi-${bulan}-${tahun}`;

  // Baris 1: Header Grup Kolom dengan label tanggal dinamis
  const headerRow1 = [
    "No",
    "Kode Rekening",
    "Nama Barang",
    "Kategori",
    "Merk",
    "Sumber",
    `Saldo Awal ${saldoAwalLabel}`,
    "",
    "",
    "",
    "Penambahan",
    "",
    "",
    "",
    "Pengurangan",
    "",
    "",
    "",
    `Saldo Akhir ${saldoAkhirLabel}`,
    "",
    "",
    "",
  ];

  // Baris 2: Sub-kolom rincian
  const headerRow2 = [
    "",
    "",
    "",
    "",
    "",
    "",
    "Volume",
    "Satuan",
    "Harga Satuan",
    "Jumlah",
    "Volume",
    "Satuan",
    "Harga Satuan",
    "Jumlah",
    "Volume",
    "Satuan",
    "Harga Satuan",
    "Jumlah",
    "Volume",
    "Satuan",
    "Harga Satuan",
    "Jumlah",
  ];

  // Baris data: 22 kolom per barang
  const dataRows = items.map((item, index) => [
    index + 1,
    item.kodeRekening,
    item.namaBarang,
    item.kategori,
    item.merk,
    item.sumber,
    // Saldo Awal
    item.saldoAwalVolume,
    item.saldoAwalSatuan,
    item.saldoAwalHargaSatuan,
    item.saldoAwalJumlah,
    // Penambahan
    item.penambahanVolume,
    item.penambahanSatuan,
    item.penambahanHargaSatuan,
    item.penambahanJumlah,
    // Pengurangan
    item.penguranganVolume,
    item.penguranganSatuan,
    item.penguranganHargaSatuan,
    item.penguranganJumlah,
    // Saldo Akhir
    item.saldoAkhirVolume,
    item.saldoAkhirSatuan,
    item.saldoAkhirHargaSatuan,
    item.saldoAkhirJumlah,
  ]);

  // Gabungkan header dan data ke dalam format CSV menggunakan PapaParse
  const allRows = [headerRow1, headerRow2, ...dataRows];
  const csvString = Papa.unparse(allRows);

  // Tambahkan UTF-8 BOM (\uFEFF) agar terbaca sempurna di Microsoft Excel Windows
  const blob = new Blob(["\uFEFF" + csvString], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${namaFile}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  toast.success("Laporan mutasi berhasil diunduh dalam format CSV!", {
    id: toastId,
    position: "top-right",
  });
}

export function useUnduhCsv({ bulan, tahun }: UseUnduhCsvParams) {
  const [isLoadingCsv, setIsLoadingCsv] = useState(false);
  const isExecutingRef = useRef(false);

  const handleUnduhCsv = useCallback(async () => {
    if (isExecutingRef.current) return;
    isExecutingRef.current = true;
    setIsLoadingCsv(true);

    try {
      // 1. Periksa apakah data sudah tersimpan di cache sessionStorage
      const cached = getCachedData(bulan, tahun);
      if (cached && cached.items.length > 0) {
        toast.loading("Menyiapkan data mutasi dari cache...", {
          id: TOAST_ID,
          position: "top-right",
        });

        generateAndDownloadCsv(cached.items, cached.meta, bulan, tahun, TOAST_ID);

        if (typeof window !== "undefined") {
          sessionStorage.removeItem(PENDING_KEY);
        }
        return;
      }

      // 2. Tandai bahwa proses unduh sedang berjalan di sessionStorage jika terjadi reload
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          PENDING_KEY,
          JSON.stringify({ bulan, tahun, timestamp: Date.now() }),
        );
      }

      toast.loading("Sedang mengambil data mutasi barang...", {
        id: TOAST_ID,
        position: "top-right",
      });

      const res = await instance.get<MutasiCsvResponse>("/mutasi/export-csv", {
        params: { bulan, tahun },
      });

      const items = res?.data?.data?.items ?? [];
      const meta = res?.data?.data?.meta;

      if (items.length === 0) {
        toast.warning("Tidak ada data barang pada periode yang dipilih.", {
          id: TOAST_ID,
          position: "top-right",
        });
        if (typeof window !== "undefined") {
          sessionStorage.removeItem(PENDING_KEY);
        }
        return;
      }

      // Simpan ke cache agar jika direfresh atau diunduh ulang tidak memanggil API dari awal
      if (meta) {
        setCachedData(bulan, tahun, items, meta);
      }

      toast.loading("Menyusun file CSV...", {
        id: TOAST_ID,
        position: "top-right",
      });

      generateAndDownloadCsv(items, meta, bulan, tahun, TOAST_ID);

      if (typeof window !== "undefined") {
        sessionStorage.removeItem(PENDING_KEY);
      }
    } catch (error: unknown) {
      console.error("Gagal mengunduh CSV:", error);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(PENDING_KEY);
      }
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || "Terjadi kesalahan saat mengunduh CSV",
        {
          id: TOAST_ID,
          position: "top-right",
        },
      );
    } finally {
      isExecutingRef.current = false;
      setIsLoadingCsv(false);
    }
  }, [bulan, tahun]);

  // Efek untuk melanjutkan proses unduh secara otomatis jika halaman direfresh saat unduhan sedang berlangsung
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(PENDING_KEY);
      if (raw) {
        const pending = JSON.parse(raw);
        if (
          pending.bulan === bulan &&
          pending.tahun === tahun &&
          Date.now() - pending.timestamp < 5 * 60 * 1000
        ) {
          toast.loading("Melanjutkan proses unduh CSV...", {
            id: TOAST_ID,
            position: "top-right",
          });
          handleUnduhCsv();
        } else if (Date.now() - pending.timestamp >= 5 * 60 * 1000) {
          sessionStorage.removeItem(PENDING_KEY);
        }
      }
    } catch {
      sessionStorage.removeItem(PENDING_KEY);
    }
  }, [bulan, tahun, handleUnduhCsv]);

  return {
    handleUnduhCsv,
    isLoadingCsv,
  };
}
