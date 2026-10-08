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

export type { ITransaksiMasuk, ITransaksiKeluar, TransaksiFilter };
