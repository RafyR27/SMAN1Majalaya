"use client";

import instance from "@/lib/instance";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { IKodeRekening, ISatuan, IKategori } from "@/types/settings";
import { useEffect } from "react";

// ─── useEditRekening ─────────────────────────────────────────────────

const editRekeningSchema = z.object({
  kodeRekening: z
    .string()
    .trim()
    .min(3, "Kode rekening harus memiliki minimal 3 karakter"),
});

type IFormEditRekening = z.infer<typeof editRekeningSchema>;

export const useEditRekening = ({
  item,
}: {
  item: IKodeRekening | null;
}) => {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset } = useForm<IFormEditRekening>({
    resolver: zodResolver(editRekeningSchema),
    defaultValues: {
      kodeRekening: item?.kodeRekening ?? "",
    },
  });

  useEffect(() => {
    if (item) {
      reset({
        kodeRekening: item.kodeRekening,
      });
    }
  }, [item, reset]);

  const editRekeningService = async (payload: IFormEditRekening) => {
    await instance.put("/rekening", {
      id: item?.id,
      kodeRekening: payload.kodeRekening,
    });
  };

  const {
    mutate: mutateEditRekening,
    isPending: isPendingEditRekening,
    isSuccess: isSuccessEditRekening,
  } = useMutation({
    mutationFn: editRekeningService,
    onError(error) {
      toast.error(error?.message || "Gagal mengubah kode rekening", {
        position: "top-right",
      });
    },

    onSuccess: () => {
      toast.success("Berhasil mengubah kode rekening!", {
        position: "top-right",
      });
      queryClient.invalidateQueries({ queryKey: ["items-barang"] });
      queryClient.invalidateQueries({ queryKey: ["items-setting"] });
    },
  });

  const handleEditRekening = (data: IFormEditRekening) =>
    mutateEditRekening(data);

  return {
    control,
    handleSubmit,
    isPendingEditRekening,
    isSuccessEditRekening,
    handleEditRekening,
    reset,
  };
};

// ─── useEditKategori ─────────────────────────────────────────────────

const editKategoriSchema = z.object({
  kategori: z
    .string()
    .trim()
    .min(3, "Nama Kategori harus memiliki minimal 3 karakter"),
});

type IFormEditKategori = z.infer<typeof editKategoriSchema>;

export const useEditKategori = ({
  item,
}: {
  item: IKategori | null;
}) => {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset } = useForm<IFormEditKategori>({
    resolver: zodResolver(editKategoriSchema),
    defaultValues: {
      kategori: item?.kategori ?? "",
    },
  });

  useEffect(() => {
    if (item) {
      reset({
        kategori: item.kategori,
      });
    }
  }, [item, reset]);

  const editKategoriService = async (payload: IFormEditKategori) => {
    await instance.put("/kategori", {
      id: item?.id,
      kategori: payload.kategori,
    });
  };

  const {
    mutate: mutateEditKategori,
    isPending: isPendingEditKategori,
    isSuccess: isSuccessEditKategori,
  } = useMutation({
    mutationFn: editKategoriService,
    onError(error) {
      toast.error(error?.message || "Gagal mengubah kategori", {
        position: "top-right",
      });
    },

    onSuccess: () => {
      toast.success("Berhasil mengubah kategori!", {
        position: "top-right",
      });
      queryClient.invalidateQueries({ queryKey: ["items-barang"] });
      queryClient.invalidateQueries({ queryKey: ["items-setting"] });
    },
  });

  const handleEditKategori = (data: IFormEditKategori) =>
    mutateEditKategori(data);

  return {
    control,
    handleSubmit,
    isPendingEditKategori,
    isSuccessEditKategori,
    handleEditKategori,
    reset,
  };
};

// ─── useEditSatuan ───────────────────────────────────────────────────

const editSatuanSchema = z.object({
  satuan: z
    .string()
    .trim()
    .min(2, "Nama Satuan harus memiliki minimal 2 karakter"),
});

type IFormEditSatuan = z.infer<typeof editSatuanSchema>;

export const useEditSatuan = ({
  item,
}: {
  item: ISatuan | null;
}) => {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset } = useForm<IFormEditSatuan>({
    resolver: zodResolver(editSatuanSchema),
    defaultValues: {
      satuan: item?.satuan ?? "",
    },
  });

  useEffect(() => {
    if (item) {
      reset({
        satuan: item.satuan,
      });
    }
  }, [item, reset]);

  const editSatuanService = async (payload: IFormEditSatuan) => {
    await instance.put("/satuan", {
      id: item?.id,
      satuan: payload.satuan,
    });
  };

  const {
    mutate: mutateEditSatuan,
    isPending: isPendingEditSatuan,
    isSuccess: isSuccessEditSatuan,
  } = useMutation({
    mutationFn: editSatuanService,
    onError(error) {
      toast.error(error?.message || "Gagal mengubah satuan", {
        position: "top-right",
      });
    },

    onSuccess: () => {
      toast.success("Berhasil mengubah satuan!", {
        position: "top-right",
      });
      queryClient.invalidateQueries({ queryKey: ["items-barang"] });
      queryClient.invalidateQueries({ queryKey: ["items-setting"] });
    },
  });

  const handleEditSatuan = (data: IFormEditSatuan) =>
    mutateEditSatuan(data);

  return {
    control,
    handleSubmit,
    isPendingEditSatuan,
    isSuccessEditSatuan,
    handleEditSatuan,
    reset,
  };
};
