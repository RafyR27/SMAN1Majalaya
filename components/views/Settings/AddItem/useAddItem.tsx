"use client";

import instance from "@/lib/instance";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const rekeningSchema = z.object({
  kodeRekening: z
    .string()
    .trim()
    .min(3, "Kode rekening harus memiliki minimal 3 karakter"),
});

type IFormAddRekening = z.infer<typeof rekeningSchema>;

export const useAddRekening = () => {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset } = useForm<
    z.infer<typeof rekeningSchema>
  >({
    resolver: zodResolver(rekeningSchema),
    defaultValues: {
      kodeRekening: "",
    },
  });

  const addRekeningService = async (payload: IFormAddRekening) => {
    await instance.post("/rekening", {
      kodeRekening: payload.kodeRekening,
    });
  };

  const {
    mutate: mutateAddRekening,
    isPending: isPendingAddRekening,
    isSuccess: isSuccessAddRekening,
  } = useMutation({
    mutationFn: addRekeningService,
    onError(error) {
      toast.error(error?.message || "Gagal menambahkan rekening", {
        position: "top-right",
      });
    },

    onSuccess: () => {
      toast.success("Berhasil menambahkan rekening!", {
        position: "top-right",
      });
      queryClient.invalidateQueries({ queryKey: ["items-barang"] });
      queryClient.invalidateQueries({ queryKey: ["items-setting"] });
      reset({
        kodeRekening: "",
      });
    },
  });

  const handleAddRekening = (data: IFormAddRekening) => mutateAddRekening(data);

  return {
    control,
    handleSubmit,
    isPendingAddRekening,
    isSuccessAddRekening,
    handleAddRekening,
    reset,
  };
};

const kategoriSchema = z.object({
  kategori: z
    .string()
    .trim()
    .min(3, "Nama Kategori harus memiliki minimal 3 karakter"),
});

type IFormAddKategori = z.infer<typeof kategoriSchema>;

export const useAddKategori = () => {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset } = useForm<
    z.infer<typeof kategoriSchema>
  >({
    resolver: zodResolver(kategoriSchema),
    defaultValues: {
      kategori: "",
    },
  });

  const addKategoriService = async (payload: IFormAddKategori) => {
    await instance.post("/kategori", {
      kategori: payload.kategori,
    });
  };

  const {
    mutate: mutateAddKategori,
    isPending: isPendingAddKategori,
    isSuccess: isSuccessAddKategori,
  } = useMutation({
    mutationFn: addKategoriService,
    onError(error) {
      toast.error(error?.message || "Gagal menambahkan Kategori", {
        position: "top-right",
      });
    },

    onSuccess: () => {
      toast.success("Berhasil menambahkan Kategori!", {
        position: "top-right",
      });
      queryClient.invalidateQueries({ queryKey: ["items-barang"] });
      queryClient.invalidateQueries({ queryKey: ["items-setting"] });
      reset({
        kategori: "",
      });
    },
  });

  const handleAddKategori = (data: IFormAddKategori) => mutateAddKategori(data);

  return {
    control,
    handleSubmit,
    isPendingAddKategori,
    isSuccessAddKategori,
    handleAddKategori,
    reset,
  };
};

const satuanSchema = z.object({
  satuan: z
    .string()
    .trim()
    .min(2, "Nama Satuan harus memiliki minimal 2 karakter"),
});

type IFormAddSatuan = z.infer<typeof satuanSchema>;

export const useAddSatuan = () => {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset } = useForm<
    z.infer<typeof satuanSchema>
  >({
    resolver: zodResolver(satuanSchema),
    defaultValues: {
      satuan: "",
    },
  });

  const addSatuanService = async (payload: IFormAddSatuan) => {
    await instance.post("/satuan", {
      satuan: payload.satuan,
    });
  };

  const {
    mutate: mutateAddSatuan,
    isPending: isPendingAddSatuan,
    isSuccess: isSuccessAddSatuan,
  } = useMutation({
    mutationFn: addSatuanService,
    onError(error) {
      toast.error(error?.message || "Gagal menambahkan Satuan", {
        position: "top-right",
      });
    },

    onSuccess: () => {
      toast.success("Berhasil menambahkan Satuan!", {
        position: "top-right",
      });
      queryClient.invalidateQueries({ queryKey: ["items-barang"] });
      queryClient.invalidateQueries({ queryKey: ["items-setting"] });
      reset({
        satuan: "",
      });
    },
  });

  const handleAddSatuan = (data: IFormAddSatuan) => mutateAddSatuan(data);

  return {
    control,
    handleSubmit,
    isPendingAddSatuan,
    isSuccessAddSatuan,
    handleAddSatuan,
    reset,
  };
};