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
import { ProfileData } from "@/types/user";
import { TriangleAlert } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup } from "@/components/ui/field";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import instance from "@/lib/instance";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

const DeleteUserDialog = ({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ProfileData | null;
}) => {
  const [name, setName] = useState("");

  const queryClient = useQueryClient();

  const deleteUserService = async (id: string) => {
    await instance.delete(`/admin/user?id=${id}`, {
      data: {
        name,
      },
    });
  };

  const { mutate: mutateDeleteUser, isPending: isPendingDelete } = useMutation({
    mutationFn: deleteUserService,
    onError(error) {
      toast.error(error?.message || "Gagal menghapus akun user", {
        position: "top-right",
      });
    },
    onSuccess() {
      toast.success("Akun user berhasil dihapus!", {
        position: "top-right",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      onOpenChange(false);
      setName("");
    },
  });

  const handleDeleteUser = () => {
    if (user?.id) {
      mutateDeleteUser(user?.id);
    }
  };

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pb-2 text-destructive">
            <TriangleAlert className="w-5 h-5" />
            Hapus Pengguna
          </DialogTitle>
          <DialogDescription>
            Apakah kamu yakin ingin menghapus akun{" "}
            <span className="font-semibold">{user?.name}</span>?
          </DialogDescription>

          <DialogDescription>
            Akun yang dihapus tidak dapat digunakan lagi.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup className="grid flex-1 gap-5">
          <Field orientation="horizontal" className="space-x-4">
            <Label htmlFor="name">Nama:</Label>
            <Input
              id="name"
              placeholder="Masukan nama akun"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              >
                Tutup
              </Button>
            }
          />
          <Button
            type="button"
            className="p-4 md:w-35 w-full"
            variant="destructive"
            onClick={handleDeleteUser}
            disabled={
              name.toLocaleLowerCase() !== user?.name?.toLowerCase() ||
              isPendingDelete
            }
          >
            {isPendingDelete ? <Spinner /> : "Hapus Pengguna"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserDialog;
