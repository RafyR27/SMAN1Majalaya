"use client";

import instance from "@/lib/instance";
import { normalizeOptionalString } from "@/lib/string";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { ITransaksiKeluar } from "@/types/transaksi";
import { useEffect } from "react";

const formEditTransaksiKeluarSchema = z.object({
  volume: z.number().int().min(1, "Volume minimal 1"),
  tanggal: z.date({ message: "Tanggal wajib diisi" }),
  kepada: z.string().trim().nullable().optional(),
  tujuan: z.string().trim().nullable().optional(),
});

export type IFormEditTransaksiKeluar = z.infer<
  typeof formEditTransaksiKeluarSchema
>;

export const useEditTransaksiKeluar = ({
  transaksi,
}: {
  transaksi: ITransaksiKeluar | null;
}) => {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset, watch } =
    useForm<IFormEditTransaksiKeluar>({
      resolver: zodResolver(formEditTransaksiKeluarSchema),
      defaultValues: {
        volume: transaksi?.jumlah ?? 1,
        tanggal: transaksi?.createdAt
          ? new Date(transaksi.createdAt)
          : new Date(),
        kepada: transaksi?.kepada ?? "",
        tujuan: transaksi?.tujuan ?? "",
      },
    });

  useEffect(() => {
    if (transaksi) {
      reset({
        volume: transaksi.jumlah,
        tanggal: transaksi.createdAt
          ? new Date(transaksi.createdAt)
          : new Date(),
        kepada: transaksi.kepada ?? "",
        tujuan: transaksi.tujuan ?? "",
      });
    }
  }, [transaksi, reset]);

  const editTransaksiKeluarService = async (
    payload: IFormEditTransaksiKeluar,
  ) => {
    await instance.put("/transaksi/keluar", {
      id: transaksi?.id,
      volume: payload.volume,
      tanggal: payload.tanggal,
      kepada: normalizeOptionalString(payload.kepada),
      tujuan: normalizeOptionalString(payload.tujuan),
    });
  };

  const {
    mutate: mutateEditTransaksiKeluar,
    isPending: isPendingEdit,
    isSuccess: isSuccessEdit,
  } = useMutation({
    mutationFn: editTransaksiKeluarService,
    onError(error: { response?: { data?: { message?: string } } }) {
      toast.error(
        error?.response?.data?.message || "Gagal mengubah transaksi keluar",
        { position: "top-right" },
      );
    },
    onSuccess: () => {
      toast.success("Berhasil mengubah transaksi keluar!", {
        position: "top-right",
      });
      queryClient.invalidateQueries({ queryKey: ["transaksi"] });
      queryClient.invalidateQueries({ queryKey: ["items-barang"] });
      queryClient.invalidateQueries({ queryKey: ["barang-all"] });
    },
  });

  const handleEditTransaksiKeluar = (data: IFormEditTransaksiKeluar) =>
    mutateEditTransaksiKeluar(data);

  return {
    control,
    handleSubmit,
    handleEditTransaksiKeluar,
    isPendingEdit,
    isSuccessEdit,
    watch,
  };
};
