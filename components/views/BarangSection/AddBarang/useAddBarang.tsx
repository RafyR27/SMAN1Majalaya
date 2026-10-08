"use client";

import instance from "@/lib/instance";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const barangSchema = z.object({
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

  tanggal: z.date("Tanggal wajib diisi"),
});

const formAddBarangSchema = z.object({
  items: z.array(barangSchema).min(1, "Tambahkan minimal satu barang"),
});

type IFormAddBarang = z.infer<typeof formAddBarangSchema>;

export const defaultBarang = {
  namaBarang: "",
  rekeningId: "",
  kodeRekening: "",
  kategoriId: "",
  satuanId: "",
  merk: "",
  harga: 0,
  stok: 0,
  sumber: "",
  tanggal: new Date(),
};

export const useAddBarang = () => {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset } = useForm<
    z.infer<typeof formAddBarangSchema>
  >({
    resolver: zodResolver(formAddBarangSchema),
    defaultValues: {
      items: [{ ...defaultBarang }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const addBarangService = async (payload: IFormAddBarang) => {
    await instance.post("/barang", {
      payload,
    });
  };

  const { mutate: mutateAddBarang, isPending: isPendingAddBarang, isSuccess: isSuccessAddBarang } =
    useMutation({
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
        reset({
          items: [{ ...defaultBarang }],
        });
      },
    });

  const handleAddBarang = (data: IFormAddBarang) => mutateAddBarang(data);

  return {
    fields,
    append,
    remove,
    control,
    handleSubmit,
    isPendingAddBarang,
    handleAddBarang,
    isSuccessAddBarang,
  };
};
