"use client";

import { useSyncExternalStore } from "react";

export type MasterDataType = "kodeRekening" | "kategori" | "satuan";

export interface MasterTypeMeta {
  key: MasterDataType;
  label: string;
  singular: string;
  description: string;
  placeholder: string;
  badgeColor: string;
}

export const MASTER_TYPE_METAS: Record<MasterDataType, MasterTypeMeta> = {
  kodeRekening: {
    key: "kodeRekening",
    label: "Kode Rekening",
    singular: "Kode Rekening",
    description:
      "Daftar nomor rekening anggaran belanja standar untuk pelaporan & pengelompokan barang.",
    placeholder: "Contoh: 5.1.02.01.01.0024",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50",
  },
  kategori: {
    key: "kategori",
    label: "Kategori",
    singular: "Kategori",
    description:
      "Klasifikasi kategori barang inventaris dan operasional sekolah.",
    placeholder: "Contoh: Alat Tulis Kantor",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
  },
  satuan: {
    key: "satuan",
    label: "Satuan",
    singular: "Satuan",
    description:
      "Daftar unit atau satuan hitung jumlah barang (misal: Pcs, Rim, Box).",
    placeholder: "Contoh: Pcs, Rim, Dus",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/50",
  },
};

export const DEFAULT_MASTER_DATA: Record<MasterDataType, string[]> = {
  kodeRekening: [
    "5.1.02.01.01.0024",
    "5.1.02.01.01.0025",
    "5.1.02.01.01.0026",
    "5.1.02.01.01.0030",
    "5.1.02.01.01.0036",
    "5.1.02.01.01.0037",
    "5.1.02.01.01.0040",
  ],
  kategori: [
    "Alat Tulis Kantor",
    "Kertas & Cover",
    "Elektronik & Komputer",
    "Kebersihan",
    "Perlengkapan Olahraga",
    "Laboratorium & Sains",
    "Peralatan & Perlengkapan Sekolah",
    "Kesehatan & PMR",
    "Perabot & Meubelair",
  ],
  satuan: [
    "Pcs",
    "Rim",
    "Box",
    "Botol",
    "Buah",
    "Set",
    "Pack",
    "Roll",
    "Lembar",
    "Meter",
    "Unit",
    "Pasang",
    "Dus",
  ],
};

const STORAGE_KEY = "sman1_master_data_v1";

let memoryStore: Record<MasterDataType, string[]> = {
  kodeRekening: [...DEFAULT_MASTER_DATA.kodeRekening],
  kategori: [...DEFAULT_MASTER_DATA.kategori],
  satuan: [...DEFAULT_MASTER_DATA.satuan],
};

let isInitialized = false;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function initStore() {
  if (isInitialized) return;
  if (typeof window === "undefined") return;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      memoryStore = {
        kodeRekening: Array.isArray(parsed.kodeRekening)
          ? parsed.kodeRekening
          : [...DEFAULT_MASTER_DATA.kodeRekening],
        kategori: Array.isArray(parsed.kategori)
          ? parsed.kategori
          : [...DEFAULT_MASTER_DATA.kategori],
        satuan: Array.isArray(parsed.satuan)
          ? parsed.satuan
          : [...DEFAULT_MASTER_DATA.satuan],
      };
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryStore));
    }
  } catch (err) {
    console.error("Failed to load master data from localStorage:", err);
  }
  isInitialized = true;
}

function persistStore() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryStore));
  } catch (err) {
    console.error("Failed to save master data to localStorage:", err);
  }
  emitChange();
}

// Attach storage event listener for cross-tab sync
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        memoryStore = JSON.parse(event.newValue);
        emitChange();
      } catch (err) {
        console.error("Cross-tab sync error:", err);
      }
    }
  });
}

export function getMasterDataSnapshot(): Record<MasterDataType, string[]> {
  initStore();
  return memoryStore;
}

export function subscribeMasterData(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useMasterData(): Record<MasterDataType, string[]>;
export function useMasterData(type: MasterDataType): string[];
export function useMasterData(
  type?: MasterDataType
): string[] | Record<MasterDataType, string[]> {
  const store = useSyncExternalStore(
    subscribeMasterData,
    getMasterDataSnapshot,
    () => DEFAULT_MASTER_DATA
  );

  if (type) {
    return store[type] || [];
  }
  return store;
}

export function addMasterDataItem(
  type: MasterDataType,
  rawVal: string
): { success: boolean; error?: string } {
  initStore();
  const val = rawVal.trim();
  if (!val) {
    return { success: false, error: "Nilai tidak boleh kosong" };
  }

  const currentList = memoryStore[type] || [];
  const exists = currentList.some(
    (item) => item.toLowerCase() === val.toLowerCase()
  );

  if (exists) {
    return {
      success: false,
      error: `Data "${val}" sudah ada dalam daftar ${MASTER_TYPE_METAS[type].label}!`,
    };
  }

  memoryStore = {
    ...memoryStore,
    [type]: [...currentList, val],
  };

  persistStore();
  return { success: true };
}

export function editMasterDataItem(
  type: MasterDataType,
  oldVal: string,
  rawNewVal: string
): { success: boolean; error?: string } {
  initStore();
  const newVal = rawNewVal.trim();
  if (!newVal) {
    return { success: false, error: "Nilai baru tidak boleh kosong" };
  }

  const currentList = memoryStore[type] || [];
  const oldIndex = currentList.findIndex(
    (item) => item.toLowerCase() === oldVal.toLowerCase()
  );

  if (oldIndex === -1) {
    return { success: false, error: "Data lama tidak ditemukan" };
  }

  // Jika nilainya sama persis, tidak ada perubahan
  if (currentList[oldIndex] === newVal) {
    return { success: true };
  }

  // Cek apakah nilai baru duplikat dengan item lain
  const conflict = currentList.some(
    (item, idx) =>
      idx !== oldIndex && item.toLowerCase() === newVal.toLowerCase()
  );

  if (conflict) {
    return {
      success: false,
      error: `Data "${newVal}" sudah ada dalam daftar ${MASTER_TYPE_METAS[type].label}!`,
    };
  }

  const updatedList = [...currentList];
  updatedList[oldIndex] = newVal;

  memoryStore = {
    ...memoryStore,
    [type]: updatedList,
  };

  persistStore();
  return { success: true };
}

export function deleteMasterDataItem(
  type: MasterDataType,
  val: string
): { success: boolean; error?: string } {
  initStore();
  const currentList = memoryStore[type] || [];
  const updatedList = currentList.filter(
    (item) => item.toLowerCase() !== val.toLowerCase()
  );

  if (updatedList.length === currentList.length) {
    return { success: false, error: "Data tidak ditemukan" };
  }

  memoryStore = {
    ...memoryStore,
    [type]: updatedList,
  };

  persistStore();
  return { success: true };
}

export function resetMasterData(type?: MasterDataType): void {
  initStore();
  if (type) {
    memoryStore = {
      ...memoryStore,
      [type]: [...DEFAULT_MASTER_DATA[type]],
    };
  } else {
    memoryStore = {
      kodeRekening: [...DEFAULT_MASTER_DATA.kodeRekening],
      kategori: [...DEFAULT_MASTER_DATA.kategori],
      satuan: [...DEFAULT_MASTER_DATA.satuan],
    };
  }
  persistStore();
}
