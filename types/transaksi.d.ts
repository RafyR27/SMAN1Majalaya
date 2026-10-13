interface ITransaksiMasuk {
  id: string;
  barangId: string;
  barang: {
    id: string;
    namaBarang: string;
    merk?: string | null;
    rekening: {
      kodeRekening: string;
    };
    kategori: {
      kategori: string;
    };
    satuan: {
      satuan: string;
    };
  };
  jumlah: number;
  hargaSatuan: number;
  total: number;
  sumber?: string | null;
  oleh?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ITransaksiKeluar {
  id: string;
  barangId: string;
  barang: {
    id: string;
    namaBarang: string;
    merk?: string | null;
    rekening: {
      kodeRekening: string;
    };
    kategori: {
      kategori: string;
    };
    satuan: {
      satuan: string;
    };
  };
  jumlah: number;
  harga: number;
  total: number;
  kepada?: string | null;
  tujuan?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TransaksiFilter {
  kategoriId?: string;
  startDate?: string;
  endDate?: string;
}

interface IKartuTransaksiItem {
  id: string;
  tanggal: string; // ISO string dari createdAt (tanggal transaksi aktual)
  tipe: "MASUK" | "KELUAR";
  jumlah: number;
  hargaSatuan: number;
  total: number;
  pihakTerkait: string | null; // TransaksiMasuk.oleh atau TransaksiKeluar.kepada
  keterangan: string | null;   // TransaksiMasuk.sumber atau TransaksiKeluar.tujuan
  saldoBerjalan: number;
}

interface IKartuBarangInfo {
  id: string;
  namaBarang: string;
  merk: string | null;
  harga: number;
  satuan: string;
  kodeRekening: string;
  kategori: string;
  sumber: string | null;
  stokSistem: number;
}

interface IKartuValidasi {
  isConsistent: boolean;
  hasDeficit: boolean;
  discrepancyDiff: number;
  warnings: string[];
}

interface IKartuPersediaanResponse {
  status: number;
  message: string;
  data: {
    barang: IKartuBarangInfo;
    period: {
      bulan: number;
      tahun: number;
      label: string;
    };
    saldoAwal: number;
    totalMasuk: number;
    totalKeluar: number;
    saldoAkhir: number;
    transaksi: IKartuTransaksiItem[];
    validasi: IKartuValidasi;
  };
}

export type {
  ITransaksiMasuk,
  ITransaksiKeluar,
  TransaksiFilter,
  IKartuTransaksiItem,
  IKartuBarangInfo,
  IKartuValidasi,
  IKartuPersediaanResponse,
};
