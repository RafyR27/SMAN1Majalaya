"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TriangleAlert } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup } from "@/components/ui/field";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import instance from "@/lib/instance";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { ITransaksiMasuk, ITransaksiKeluar } from "@/types/transaksi";

type TransaksiDeleteTarget =
  | { type: "masuk"; data: ITransaksiMasuk }
  | { type: "keluar"; data: ITransaksiKeluar };

interface DeleteTransaksiDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaksi: TransaksiDeleteTarget | null;
}

const DeleteTransaksiDialog = ({
  open,
  onOpenChange,
  transaksi,
}: DeleteTransaksiDialogProps) => {
  const [namaBarangInput, setNamaBarangInput] = useState("");

  const queryClient = useQueryClient();

  const namaBarang = transaksi?.data?.barang?.namaBarang ?? "";
  const jenis = transaksi?.type === "masuk" ? "Masuk" : "Keluar";

  const deleteTransaksiService = async (id: string) => {
    const endpoint =
      transaksi?.type === "masuk" ? "/transaksi/masuk" : "/transaksi/keluar";
    await instance.delete(`${endpoint}?id=${id}`);
  };

  const { mutate: mutateDeleteTransaksi, isPending: isPendingDelete } =
    useMutation({
      mutationFn: deleteTransaksiService,
      onError(error: { response?: { data?: { message?: string } } }) {
        toast.error(
          error?.response?.data?.message ||
            `Gagal menghapus transaksi ${jenis.toLowerCase()}`,
          { position: "top-right" },
        );
      },
      onSuccess() {
        toast.success(`Transaksi ${jenis} berhasil dihapus!`, {
          position: "top-right",
        });
        queryClient.invalidateQueries({ queryKey: ["transaksi"] });
        queryClient.invalidateQueries({ queryKey: ["items-barang"] });
        queryClient.invalidateQueries({ queryKey: ["barang-all"] });
        onOpenChange(false);
        setNamaBarangInput("");
      },
    });

  const handleDeleteTransaksi = () => {
    if (transaksi?.data?.id) {
      mutateDeleteTransaksi(transaksi.data.id);
    }
  };

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNamaBarangInput("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pb-2 text-destructive">
            <TriangleAlert className="w-5 h-5" />
            Hapus Transaksi {jenis}
          </DialogTitle>
          <DialogDescription>
            Apakah kamu yakin ingin menghapus transaksi {jenis.toLowerCase()}{" "}
            barang{" "}
            <span className="font-semibold text-foreground">{namaBarang}</span>?
          </DialogDescription>

          <DialogDescription>
            Data transaksi yang dihapus tidak dapat dikembalikan.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup className="grid flex-1 gap-5">
          <Field orientation="horizontal" className="space-x-4">
            <Label htmlFor="namaBarangDeleteTransaksi">Nama Barang:</Label>
            <Input
              id="namaBarangDeleteTransaksi"
              placeholder="Ketik nama barang untuk konfirmasi"
              value={namaBarangInput}
              onChange={(e) => setNamaBarangInput(e.target.value)}
              disabled={isPendingDelete}
            />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose
            render={
              <Button
                type="button"
                className="p-4 cursor-pointer"
                variant="outline"
                disabled={isPendingDelete}
              >
                Tutup
              </Button>
            }
          />
          <Button
            type="button"
            className="p-4 md:w-35 w-full"
            variant="destructive"
            onClick={handleDeleteTransaksi}
            disabled={
              namaBarangInput.trim().toLowerCase() !==
                namaBarang?.trim().toLowerCase() || isPendingDelete
            }
          >
            {isPendingDelete ? <Spinner /> : `Hapus Transaksi`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTransaksiDialog;
