"use client";

import instance from "@/lib/instance";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { EditBarang } from "@/types/barang";
import { useEffect } from "react";

const formEditBarangSchema = z.object({
  namaBarang: z
    .string()
    .trim()
    .min(3, "Nama barang harus memiliki minimal 3 karakter"),

  rekeningId: z.string().min(1, "Kode Rekening wajib diisi"),

  kategoriId: z.string().min(1, "Kategori wajib diisi"),

  satuanId: z.string().min(1, "Satuan Barang wajib diisi"),

  merk: z.string().trim().optional(),

  harga: z.number().min(0, "Harga tidak boleh negatif"),

  sumber: z.string().trim().optional(),

  tanggal: z.date({ message: "Tanggal wajib diisi" }),
});

export type IFormEditBarang = z.infer<typeof formEditBarangSchema>;

export const useEditBarang = ({ barang }: { barang: EditBarang | null }) => {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset } = useForm<IFormEditBarang>({
    resolver: zodResolver(formEditBarangSchema),
    defaultValues: {
      namaBarang: barang?.namaBarang ?? "",
      rekeningId: barang?.rekeningId ?? "",
      kategoriId: barang?.kategoriId ?? "",
      satuanId: barang?.satuanId ?? "",
      merk: barang?.merk ?? "",
      harga: barang?.harga ?? 0,
      sumber: barang?.sumber ?? "",
      tanggal: barang?.tanggal ? new Date(barang.tanggal) : new Date(),
    },
  });

  // Sync form values ketika barang yang dipilih berubah
  useEffect(() => {
    if (barang) {
      reset({
        namaBarang: barang.namaBarang,
        rekeningId: barang.rekeningId,
        kategoriId: barang.kategoriId,
        satuanId: barang.satuanId,
        merk: barang.merk ?? "",
        harga: barang.harga,
        sumber: barang.sumber ?? "",
        tanggal: barang.tanggal ? new Date(barang.tanggal) : new Date(),
      });
    }
  }, [barang, reset]);

  const editBarangService = async (payload: IFormEditBarang) => {
    await instance.put("/barang", {
      id: barang?.id,
      ...payload,
    });
  };

  const {
    mutate: mutateEditBarang,
    isPending: isPendingEditBarang,
    isSuccess: isSuccessEditBarang,
  } = useMutation({
    mutationFn: editBarangService,
    onError(error) {
      toast.error(error?.message || "Gagal mengubah data barang", {
        position: "top-right",
      });
    },

    onSuccess: () => {
      toast.success("Berhasil mengubah data barang!", {
        position: "top-right",
      });
      queryClient.invalidateQueries({ queryKey: ["items-barang"] });
    },
  });

  const handleEditBarang = (data: IFormEditBarang) => mutateEditBarang(data);

  return {
    control,
    handleSubmit,
    handleEditBarang,
    isPendingEditBarang,
    isSuccessEditBarang,
  };
};
