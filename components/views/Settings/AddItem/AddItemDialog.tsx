"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Controller } from "react-hook-form";
import {
  useAddKategori,
  useAddRekening,
  useAddSatuan,
} from "./useAddItem";

export type ItemType = "kodeRekening" | "satuan" | "kategori";

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeType: ItemType;
}

interface FormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

function AddRekeningForm({ onSuccess, onCancel }: FormProps) {
  const {
    control,
    handleSubmit,
    isPendingAddRekening,
    isSuccessAddRekening,
    handleAddRekening,
  } = useAddRekening();

  useEffect(() => {
    if (isSuccessAddRekening) {
      onSuccess();
    }
  }, [isSuccessAddRekening, onSuccess]);

  return (
    <form onSubmit={handleSubmit(handleAddRekening)} className="space-y-4">
      <DialogHeader className="text-left space-y-1">
        <DialogTitle className="text-lg font-semibold tracking-tight">
          Tambah Kode Rekening Baru
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          Masukkan kode rekening baru untuk klasifikasi barang dan anggaran.
        </DialogDescription>
      </DialogHeader>

      <div className="py-2">
        <Controller
          name="kodeRekening"
          control={control}
          render={({ field, fieldState }) => (
            <Field className="space-y-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel
                htmlFor="input-kode-rekening"
                className="text-sm font-semibold text-foreground"
              >
                Kode Rekening <span className="text-destructive">*</span>
              </FieldLabel>

              <FieldContent>
                <Input
                  {...field}
                  id="input-kode-rekening"
                  autoFocus
                  placeholder="Contoh: 5.1.02.01.01.0024"
                  disabled={isPendingAddRekening}
                  className="h-9 text-sm rounded-lg"
                  aria-invalid={!!fieldState.error}
                />
              </FieldContent>

              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <DialogFooter className="gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPendingAddRekening}
          className="cursor-pointer"
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isPendingAddRekening}
          className="cursor-pointer"
        >
          {isPendingAddRekening ? (
            <div className="flex items-center gap-2">
              <Spinner className="h-4 w-4" />
              <span>Menyimpan...</span>
            </div>
          ) : (
            "Simpan"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

function AddSatuanForm({ onSuccess, onCancel }: FormProps) {
  const {
    control,
    handleSubmit,
    isPendingAddSatuan,
    isSuccessAddSatuan,
    handleAddSatuan,
  } = useAddSatuan();

  useEffect(() => {
    if (isSuccessAddSatuan) {
      onSuccess();
    }
  }, [isSuccessAddSatuan, onSuccess]);

  return (
    <form onSubmit={handleSubmit(handleAddSatuan)} className="space-y-4">
      <DialogHeader className="text-left space-y-1">
        <DialogTitle className="text-lg font-semibold tracking-tight">
          Tambah Satuan Baru
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          Masukkan unit satuan ukuran atau kemasan barang baru (misal: Pcs, Unit, Rim).
        </DialogDescription>
      </DialogHeader>

      <div className="py-2">
        <Controller
          name="satuan"
          control={control}
          render={({ field, fieldState }) => (
            <Field className="space-y-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel
                htmlFor="input-satuan"
                className="text-sm font-semibold text-foreground"
              >
                Nama Satuan <span className="text-destructive">*</span>
              </FieldLabel>

              <FieldContent>
                <Input
                  {...field}
                  id="input-satuan"
                  autoFocus
                  placeholder="Contoh: Pcs, Unit, Rim, Kotak"
                  disabled={isPendingAddSatuan}
                  className="h-9 text-sm rounded-lg"
                  aria-invalid={!!fieldState.error}
                />
              </FieldContent>

              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <DialogFooter className="gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPendingAddSatuan}
          className="cursor-pointer"
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isPendingAddSatuan}
          className="cursor-pointer"
        >
          {isPendingAddSatuan ? (
            <div className="flex items-center gap-2">
              <Spinner className="h-4 w-4" />
              <span>Menyimpan...</span>
            </div>
          ) : (
            "Simpan"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

function AddKategoriForm({ onSuccess, onCancel }: FormProps) {
  const {
    control,
    handleSubmit,
    isPendingAddKategori,
    isSuccessAddKategori,
    handleAddKategori,
  } = useAddKategori();

  useEffect(() => {
    if (isSuccessAddKategori) {
      onSuccess();
    }
  }, [isSuccessAddKategori, onSuccess]);

  return (
    <form onSubmit={handleSubmit(handleAddKategori)} className="space-y-4">
      <DialogHeader className="text-left space-y-1">
        <DialogTitle className="text-lg font-semibold tracking-tight">
          Tambah Kategori Baru
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          Masukkan nama kategori barang baru untuk pengelompokan inventaris.
        </DialogDescription>
      </DialogHeader>

      <div className="py-2">
        <Controller
          name="kategori"
          control={control}
          render={({ field, fieldState }) => (
            <Field className="space-y-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel
                htmlFor="input-kategori"
                className="text-sm font-semibold text-foreground"
              >
                Nama Kategori <span className="text-destructive">*</span>
              </FieldLabel>

              <FieldContent>
                <Input
                  {...field}
                  id="input-kategori"
                  autoFocus
                  placeholder="Contoh: Alat Tulis Kantor, Elektronik"
                  disabled={isPendingAddKategori}
                  className="h-9 text-sm rounded-lg"
                  aria-invalid={!!fieldState.error}
                />
              </FieldContent>

              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <DialogFooter className="gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPendingAddKategori}
          className="cursor-pointer"
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isPendingAddKategori}
          className="cursor-pointer"
        >
          {isPendingAddKategori ? (
            <div className="flex items-center gap-2">
              <Spinner className="h-4 w-4" />
              <span>Menyimpan...</span>
            </div>
          ) : (
            "Simpan"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function AddItemDialog({
  open,
  onOpenChange,
  activeType,
}: AddItemDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && activeType === "kodeRekening" && (
          <AddRekeningForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
        {open && activeType === "satuan" && (
          <AddSatuanForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
        {open && activeType === "kategori" && (
          <AddKategoriForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
