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
import { EditBarang } from "@/types/barang";
import { TriangleAlert } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup } from "@/components/ui/field";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import instance from "@/lib/instance";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

const DeleteBarangDialog = ({
  open,
  onOpenChange,
  barang,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  barang: EditBarang | null;
}) => {
  const [namaBarangInput, setNamaBarangInput] = useState("");

  const queryClient = useQueryClient();

  const deleteBarangService = async (id: string) => {
    await instance.delete(`/barang?id=${id}`, {
      data: {
        namaBarang: namaBarangInput,
      },
    });
  };

  const { mutate: mutateDeleteBarang, isPending: isPendingDelete } =
    useMutation({
      mutationFn: deleteBarangService,
      onError(error) {
        toast.error(error?.message || "Gagal menghapus data barang", {
          position: "top-right",
        });
      },
      onSuccess() {
        toast.success("Data barang berhasil dihapus!", {
          position: "top-right",
        });
        queryClient.invalidateQueries({ queryKey: ["items-barang"] });
        onOpenChange(false);
        setNamaBarangInput("");
      },
    });

  const handleDeleteBarang = () => {
    if (barang?.id) {
      mutateDeleteBarang(barang.id);
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
            Hapus Barang
          </DialogTitle>
          <DialogDescription>
            Apakah kamu yakin ingin menghapus barang{" "}
            <span className="font-semibold">{barang?.namaBarang}</span>?
          </DialogDescription>

          <DialogDescription>
            Data barang yang dihapus tidak dapat dikembalikan.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup className="grid flex-1 gap-5">
          <Field orientation="horizontal" className="space-x-4">
            <Label htmlFor="namaBarang">Nama Barang:</Label>
            <Input
              id="namaBarang"
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
            onClick={handleDeleteBarang}
            disabled={
              namaBarangInput.trim().toLowerCase() !==
                barang?.namaBarang?.trim().toLowerCase() || isPendingDelete
            }
          >
            {isPendingDelete ? <Spinner /> : "Hapus Barang"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteBarangDialog;
