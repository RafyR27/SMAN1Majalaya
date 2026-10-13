"use client";

import instance from "@/lib/instance";
import { normalizeOptionalString } from "@/lib/string";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const transaksiMasukItemSchema = z.object({
  barangId: z.string().min(1, "Barang wajib dipilih"),
  namaBarang: z.string().nullable().optional(), // display only
  kodeRekening: z.string().nullable().optional(), // display only (disabled)
  kategori: z.string().nullable().optional(), // display only (disabled)
  hargaSatuan: z.number().nullable().optional(), // display only (disabled)
  stok: z.number().nullable().optional(), // display only
  sumber: z.string().nullable().optional(), // auto from barang (disabled)
  merk: z.string().nullable().optional(), // auto from barang (disabled)
  satuanNama: z.string().nullable().optional(), // display only
  volume: z.number().int().min(1, "Volume minimal 1"),
  tanggal: z.date({ message: "Tanggal wajib diisi" }),
  oleh: z.string().trim().nullable().optional(),
});

const formSchema = z.object({
  items: z.array(transaksiMasukItemSchema).min(1).max(5),
});

export type ITransaksiMasukItem = z.infer<typeof transaksiMasukItemSchema>;
export type IFormTransaksiMasuk = z.infer<typeof formSchema>;

export const defaultItem: ITransaksiMasukItem = {
  barangId: "",
  namaBarang: "",
  kodeRekening: "",
  kategori: "",
  hargaSatuan: 0,
  stok: 0,
  sumber: "",
  merk: "",
  satuanNama: "",
  volume: 1,
  tanggal: new Date(),
  oleh: "",
};

export const useAddTransaksiMasuk = () => {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset, setValue, watch } =
    useForm<IFormTransaksiMasuk>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        items: [{ ...defaultItem }],
      },
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const addTransaksiMasukService = async (data: IFormTransaksiMasuk) => {
    await instance.post("/transaksi/masuk", {
      payload: {
        items: data.items.map((item) => ({
          barangId: item.barangId,
          volume: item.volume,
          tanggal: item.tanggal,
          oleh: normalizeOptionalString(item.oleh),
        })),
      },
    });
  };

  const {
    mutate: mutateAddTransaksiMasuk,
    isPending: isPendingAdd,
    isSuccess: isSuccessAdd,
  } = useMutation({
    mutationFn: addTransaksiMasukService,
    onError(error: { response?: { data?: { message?: string } } }) {
      toast.error(
        error?.response?.data?.message || "Gagal mencatat transaksi masuk",
        { position: "top-right" },
      );
    },
    onSuccess: () => {
      toast.success("Berhasil mencatat transaksi masuk!", {
        position: "top-right",
      });
      queryClient.invalidateQueries({ queryKey: ["transaksi"] });
      queryClient.invalidateQueries({ queryKey: ["items-barang"] });
      queryClient.invalidateQueries({ queryKey: ["barang-all"] });
      reset({ items: [{ ...defaultItem }] });
    },
  });

  const handleAddTransaksiMasuk = (data: IFormTransaksiMasuk) =>
    mutateAddTransaksiMasuk(data);

  return {
    fields,
    append,
    remove,
    control,
    handleSubmit,
    isPendingAdd,
    isSuccessAdd,
    handleAddTransaksiMasuk,
    setValue,
    watch,
    reset,
  };
};
