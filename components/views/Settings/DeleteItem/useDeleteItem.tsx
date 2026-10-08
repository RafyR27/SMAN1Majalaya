"use client";

import instance from "@/lib/instance";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ─── useDeleteRekening ───────────────────────────────────────────────

export const useDeleteRekening = () => {
  const queryClient = useQueryClient();

  const deleteRekeningService = async (id: string) => {
    await instance.delete(`/rekening?id=${id}`);
  };

  const {
    mutate: mutateDeleteRekening,
    isPending: isPendingDeleteRekening,
    isSuccess: isSuccessDeleteRekening,
  } = useMutation({
    mutationFn: deleteRekeningService,
    onError(error) {
      toast.error(error?.message || "Gagal menghapus kode rekening", {
        position: "top-right",
      });
    },

    onSuccess: () => {
      toast.success("Berhasil menghapus kode rekening!", {
        position: "top-right",
      });
      queryClient.invalidateQueries({ queryKey: ["items-barang"] });
      queryClient.invalidateQueries({ queryKey: ["items-setting"] });
    },
  });

  const handleDeleteRekening = (id: string) => mutateDeleteRekening(id);

  return {
    isPendingDeleteRekening,
    isSuccessDeleteRekening,
    handleDeleteRekening,
  };
};

// ─── useDeleteKategori ───────────────────────────────────────────────

export const useDeleteKategori = () => {
  const queryClient = useQueryClient();

  const deleteKategoriService = async (id: string) => {
    await instance.delete(`/kategori?id=${id}`);
  };

  const {
    mutate: mutateDeleteKategori,
    isPending: isPendingDeleteKategori,
    isSuccess: isSuccessDeleteKategori,
  } = useMutation({
    mutationFn: deleteKategoriService,
    onError(error) {
      toast.error(error?.message || "Gagal menghapus kategori", {
        position: "top-right",
      });
    },

    onSuccess: () => {
      toast.success("Berhasil menghapus kategori!", {
        position: "top-right",
      });
      queryClient.invalidateQueries({ queryKey: ["items-barang"] });
      queryClient.invalidateQueries({ queryKey: ["items-setting"] });
    },
  });

  const handleDeleteKategori = (id: string) => mutateDeleteKategori(id);

  return {
    isPendingDeleteKategori,
    isSuccessDeleteKategori,
    handleDeleteKategori,
  };
};

// ─── useDeleteSatuan ─────────────────────────────────────────────────

export const useDeleteSatuan = () => {
  const queryClient = useQueryClient();

  const deleteSatuanService = async (id: string) => {
    await instance.delete(`/satuan?id=${id}`);
  };

  const {
    mutate: mutateDeleteSatuan,
    isPending: isPendingDeleteSatuan,
    isSuccess: isSuccessDeleteSatuan,
  } = useMutation({
    mutationFn: deleteSatuanService,
    onError(error) {
      toast.error(error?.message || "Gagal menghapus satuan", {
        position: "top-right",
      });
    },

    onSuccess: () => {
      toast.success("Berhasil menghapus satuan!", {
        position: "top-right",
      });
      queryClient.invalidateQueries({ queryKey: ["items-barang"] });
      queryClient.invalidateQueries({ queryKey: ["items-setting"] });
    },
  });

  const handleDeleteSatuan = (id: string) => mutateDeleteSatuan(id);

  return {
    isPendingDeleteSatuan,
    isSuccessDeleteSatuan,
    handleDeleteSatuan,
  };
};
