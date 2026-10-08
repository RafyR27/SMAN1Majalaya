"use client";

import { ImportBarang } from "@/types/barang";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import Papa from "papaparse";
import instance from "@/lib/instance";

export const useImportBarang = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ImportBarang[]>([]);
  const [invalidFormat, setInvalidFormat] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const resetState = () => {
    setFile(null);
    setParsedData([]);
    setInvalidFormat(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileProcess = (selectedFile: File) => {
    if (
      !selectedFile.name.toLowerCase().endsWith(".csv") &&
      selectedFile.type !== "text/csv"
    ) {
      toast.error("Format file harus berupa CSV (.csv)", {
        position: "top-right",
      });
      return;
    }

    Papa.parse<ImportBarang>(selectedFile, {
      header: true,
      skipEmptyLines: "greedy",

      complete: (result) => {
        const fileCSV = result.data;

        if (fileCSV.length === 0 || !fileCSV) {
          toast.error("File CSV tidak memiliki isi", {
            position: "top-right",
          });

          return;
        }

        const headers = Object.keys(fileCSV[0] as object);

        const requiredHeaders = [
          "namaBarang",
          "kodeRekening",
          "kategori",
          "satuan",
          "merk",
          "sumber",
          "harga",
          "tanggal",
        ];

        const isValidHeader = requiredHeaders.every((header) =>
          headers.includes(header),
        );

        if (!isValidHeader) {
          toast.error("Format file CSV tidak sesuai", {
            position: "top-right",
          });

          setInvalidFormat(1);

          return;
        }

        const requiredFields: (keyof ImportBarang)[] = [
          "namaBarang",
          "kodeRekening",
          "kategori",
          "satuan",
          "harga",
          "tanggal",
        ];

        const hasEmptyField = fileCSV.some((row) =>
          requiredFields.some((field) => !row[field]),
        );

        if (hasEmptyField) {
          toast.error("Terdapat field yang kosong", {
            position: "top-right",
          });

          return;
        }

        setInvalidFormat(0);
        setFile(selectedFile);
        setParsedData(fileCSV);
      },
      error: () => {
        toast.error("Terjadi kesalahan saat memuat file", {
          position: "top-right",
        });
      },
    });
  };

  const addBarangService = async (payload: ImportBarang[]) => {
    const newPayload = payload.map((row) => ({
      namaBarang: row.namaBarang,
      kodeRekening: row.kodeRekening,
      kategori: row.kategori,
      satuan: row.satuan,
      merk: row.merk,
      sumber: row.sumber,
      harga: Number(row.harga),
      tanggal: row.tanggal,
    }));

    await instance.post("/barang/importCsv", {
      items: newPayload,
    });
  };

  const {
    mutate: mutateAddBarang,
    isPending: isPendingAddBarang,
    isSuccess: isSuccessAddBarang,
  } = useMutation({
    mutationFn: addBarangService,
    onError(error) {
      toast.error(error?.message || "Gagal menambahkan barang", {
        position: "top-right",
      });
    },

    onSuccess: () => {
      toast.success("Berhasil menambahkan barang!", {
        position: "top-right",
      });

      queryClient.invalidateQueries({ queryKey: ["items-barang"] });
      resetState();
    },
  });

  const handleImportSubmit = async () => {
    if (parsedData.length === 0) {
      toast.error("Belum ada data barang valid yang dipilih untuk di-import.", {
        position: "top-right",
      });
      return;
    }

    const seenNames = new Set<string>();
    for (const item of parsedData) {
      const lowerName = item.namaBarang.trim().toLowerCase();
      if (seenNames.has(lowerName)) {
        toast.error(
          `Terdapat nama barang yang sama di dalam data: "${item.namaBarang}"`,
          {
            position: "top-right",
          },
        );
        return;
      }
      seenNames.add(lowerName);
    }

    // logic
    mutateAddBarang(parsedData);
  };

  return {
    file,
    fileInputRef,
    invalidFormat,
    resetState,
    handleFileProcess,
    handleImportSubmit,
    parsedData,
    isSuccessAddBarang,
    isPendingAddBarang,
  };
};
