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

