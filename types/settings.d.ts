interface IKodeRekening {
    id: string;
    kodeRekening: string;
    createdAt: Date;
    updatedAt: Date;
}

interface ISatuan {
    id: string;
    satuan: string;
    createdAt: Date;
    updatedAt: Date;
}

interface IKategori {
    id: string;
    kategori: string;
    createdAt: Date;
    updatedAt: Date;
}

export type {
    IKodeRekening,
    ISatuan,
    IKategori
}