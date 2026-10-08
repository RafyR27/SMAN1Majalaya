"use client";

import instance from "@/lib/instance";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const transaksiKeluarSchema = z.object({
  barangId: z.string().min(1, "Barang wajib dipilih"),
  namaBarang: z.string().optional(), // display only
  kodeRekening: z.string().optional(), // display only (disabled)
  kategori: z.string().optional(), // display only (disabled)
  hargaSatuan: z.number().optional(), // display only (disabled)
  stok: z.number().optional(), // display only
  satuanNama: z.string().optional(), // display only
  volume: z.number().int().min(1, "Volume minimal 1"),
  tanggal: z.date("Tanggal wajib diisi"),
  kepada: z.string().trim().optional(),
  tujuan: z.string().trim().optional(),
});

const formSchema = z.object({
  item: transaksiKeluarSchema,
});

export type IFormTransaksiKeluar = z.infer<typeof formSchema>;

export const defaultItem = {
  barangId: "",
  namaBarang: "",
  kodeRekening: "",
  kategori: "",
  hargaSatuan: 0,
  stok: 0,
  satuanNama: "",
  volume: 1,
  tanggal: new Date(),
  kepada: "",
  tujuan: "",
};

export const useAddTransaksiKeluar = () => {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset, setValue, watch } =
    useForm<IFormTransaksiKeluar>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        item: { ...defaultItem },
      },
    });

  const addTransaksiKeluarService = async (data: IFormTransaksiKeluar) => {
    await instance.post("/transaksi/keluar", {
      payload: {
        item: {
          barangId: data.item.barangId,
          volume: data.item.volume,
          tanggal: data.item.tanggal,
          kepada: data.item.kepada || undefined,
          tujuan: data.item.tujuan || undefined,
        },
      },
    });
  };

  const {
    mutate: mutateAddTransaksiKeluar,
    isPending: isPendingAdd,
    isSuccess: isSuccessAdd,
  } = useMutation({
    mutationFn: addTransaksiKeluarService,
    onError(error: { response?: { data?: { message?: string } } }) {
      toast.error(
        error?.response?.data?.message || "Gagal mencatat transaksi keluar",
        { position: "top-right" },
      );
    },
    onSuccess: () => {
      toast.success("Berhasil mencatat transaksi keluar!", {
        position: "top-right",
      });
      queryClient.invalidateQueries({ queryKey: ["transaksi"] });
      queryClient.invalidateQueries({ queryKey: ["items-barang"] });
      queryClient.invalidateQueries({ queryKey: ["barang-all"] });
      reset({ item: { ...defaultItem } });
    },
  });

  const handleAddTransaksiKeluar = (data: IFormTransaksiKeluar) =>
    mutateAddTransaksiKeluar(data);

  return {
    control,
    handleSubmit,
    isPendingAdd,
    isSuccessAdd,
    handleAddTransaksiKeluar,
    setValue,
    watch,
    reset,
  };
};
