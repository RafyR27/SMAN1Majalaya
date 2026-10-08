interface Barang {
  id: string;
  namaBarang: string;
  harga: number;
  stok: number;
  merk?: string;
  sumber?: string;
  rekening: {
    kodeRekening: string;
  };
  kategori: {
    kategori: string;
  };
  satuan: {
    satuan: string;
  };
  tanggal: Date
}

interface ImportBarang {
  namaBarang: string;
  harga: number;
  merk?: string;
  sumber?: string;
  kodeRekening: string;
  kategori: string;
  satuan: string;
  tanggal: string;
}

export type { Barang, ImportBarang, EditBarang, BarangFilter };

interface BarangFilter {
  rekeningId?: string;
  kategoriId?: string;
  startDate?: string;
  endDate?: string;
}

interface EditBarang {
  id: string;
  namaBarang: string;
  harga: number;
  stok: number;
  merk?: string;
  sumber?: string;
  rekeningId: string;
  kategoriId: string;
  satuanId: string;
  rekening: {
    id: string;
    kodeRekening: string;
  };
  kategori: {
    id: string;
    kategori: string;
  };
  satuan: {
    id: string;
    satuan: string;
  };
  tanggal: Date;
}

