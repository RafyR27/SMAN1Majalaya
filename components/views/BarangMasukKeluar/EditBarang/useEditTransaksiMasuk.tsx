"use client";

import instance from "@/lib/instance";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { ITransaksiMasuk } from "@/types/transaksi";
import { useEffect } from "react";

const formEditTransaksiMasukSchema = z.object({
  volume: z.number().int().min(1, "Volume minimal 1"),
  tanggal: z.date({ message: "Tanggal wajib diisi" }),
  oleh: z.string().trim().nullable().optional(),
});

export type IFormEditTransaksiMasuk = z.infer<
  typeof formEditTransaksiMasukSchema
>;

export const useEditTransaksiMasuk = ({
  transaksi,
}: {
  transaksi: ITransaksiMasuk | null;
}) => {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset, watch } =
    useForm<IFormEditTransaksiMasuk>({
      resolver: zodResolver(formEditTransaksiMasukSchema),
      defaultValues: {
        volume: transaksi?.jumlah ?? 1,
        tanggal: transaksi?.createdAt
          ? new Date(transaksi.createdAt)
          : new Date(),
        oleh: transaksi?.oleh ?? "",
      },
    });

  useEffect(() => {
    if (transaksi) {
      reset({
        volume: transaksi.jumlah,
        tanggal: transaksi.createdAt
          ? new Date(transaksi.createdAt)
          : new Date(),
        oleh: transaksi.oleh ?? "",
      });
    }
  }, [transaksi, reset]);

  const editTransaksiMasukService = async (
    payload: IFormEditTransaksiMasuk,
  ) => {
    await instance.put("/transaksi/masuk", {
      id: transaksi?.id,
      volume: payload.volume,
      tanggal: payload.tanggal,
      oleh: payload.oleh || null,
    });
  };

  const {
    mutate: mutateEditTransaksiMasuk,
    isPending: isPendingEdit,
    isSuccess: isSuccessEdit,
  } = useMutation({
    mutationFn: editTransaksiMasukService,
    onError(error: { response?: { data?: { message?: string } } }) {
      toast.error(
        error?.response?.data?.message || "Gagal mengubah transaksi masuk",
        { position: "top-right" },
      );
    },
    onSuccess: () => {
      toast.success("Berhasil mengubah transaksi masuk!", {
        position: "top-right",
      });
      queryClient.invalidateQueries({ queryKey: ["transaksi"] });
      queryClient.invalidateQueries({ queryKey: ["items-barang"] });
      queryClient.invalidateQueries({ queryKey: ["barang-all"] });
    },
  });

  const handleEditTransaksiMasuk = (data: IFormEditTransaksiMasuk) =>
    mutateEditTransaksiMasuk(data);

  return {
    control,
    handleSubmit,
    handleEditTransaksiMasuk,
    isPendingEdit,
    isSuccessEdit,
    watch,
  };
};
