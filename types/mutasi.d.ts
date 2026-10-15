import { IKategori, IKodeRekening } from "./settings";

export interface MutasiItem {
  id: string;
  namaBarang: string;
  kategori: string;
  kodeRekening: string;
  satuan: string;
  saldoAwal: number;
  masuk: number;
  keluar: number;
  saldoAkhir: number;
}

export interface MutasiFilter {
  bulan?: number;
  tahun?: number;
  kategoriId?: string;
  rekeningId?: string;
}

export interface MutasiApiResponse {
  status: number;
  message: string;
  data: {
    mutasiList: MutasiItem[];
    rekeningList: IKodeRekening[];
    kategoriList: IKategori[];
  };
  pagination: {
    pageIndex: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  period: {
    bulan: number;
    tahun: number;
  };
}

export interface MutasiPdfItem {
  id: string;
  namaBarang: string;
  kategori: string;
  kodeRekening: string;
  satuan: string;
  saldoAwal: number;
  saldoAwalRp: number;
  masuk: number;
  keluar: number;
  saldoAkhir: number;
  saldoAkhirRp: number;
}

export interface MutasiPdfSummary {
  totalSaldoAwalRp: number;
  totalSaldoAkhirRp: number;
}

export interface MutasiPdfResponse {
  status: number;
  message: string;
  data: {
    items: MutasiPdfItem[];
    summary: MutasiPdfSummary;
  };
  period: {
    bulan: number;
    tahun: number;
  };
}

export interface MutasiCsvItem {
  id: string;
  kodeRekening: string;
  namaBarang: string;
  kategori: string;
  merk: string;
  sumber: string;
  satuan: string;
  // Saldo Awal
  saldoAwalVolume: number;
  saldoAwalSatuan: string;
  saldoAwalHargaSatuan: number;
  saldoAwalJumlah: number;
  // Penambahan
  penambahanVolume: number;
  penambahanSatuan: string;
  penambahanHargaSatuan: number;
  penambahanJumlah: number;
  // Pengurangan
  penguranganVolume: number;
  penguranganSatuan: string;
  penguranganHargaSatuan: number;
  penguranganJumlah: number;
  // Saldo Akhir
  saldoAkhirVolume: number;
  saldoAkhirSatuan: string;
  saldoAkhirHargaSatuan: number;
  saldoAkhirJumlah: number;
}

export interface MutasiCsvMeta {
  saldoAwalLabel: string;
  saldoAkhirLabel: string;
  periodeLabel: string;
  namaFile: string;
}

export interface MutasiCsvResponse {
  status: number;
  message: string;
  data: {
    items: MutasiCsvItem[];
    meta: MutasiCsvMeta;
  };
  period: {
    bulan: number;
    tahun: number;
  };
}

