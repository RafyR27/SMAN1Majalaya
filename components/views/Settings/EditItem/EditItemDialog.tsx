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
import { IKodeRekening, ISatuan, IKategori } from "@/types/settings";
import { ItemType } from "../AddItem/AddItemDialog";
import {
  useEditRekening,
  useEditKategori,
  useEditSatuan,
} from "./useEditItem";

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeType: ItemType;
  item: IKodeRekening | ISatuan | IKategori | null;
}


interface FormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

// ─── EditRekeningForm ────────────────────────────────────────────────

function EditRekeningForm({
  item,
  onSuccess,
  onCancel,
}: FormProps & { item: IKodeRekening }) {
  const {
    control,
    handleSubmit,
    isPendingEditRekening,
    isSuccessEditRekening,
    handleEditRekening,
  } = useEditRekening({ item });

  useEffect(() => {
    if (isSuccessEditRekening) {
      onSuccess();
    }
  }, [isSuccessEditRekening, onSuccess]);

  return (
    <form onSubmit={handleSubmit(handleEditRekening)} className="space-y-4">
      <DialogHeader className="space-y-1.5 text-left">
        <DialogTitle className="text-base font-semibold">
          Ubah Kode Rekening
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          Perbaiki kesalahan penulisan atau perbarui nilai kode rekening.
          Perubahan ini langsung berlaku pada seluruh form combobox.
        </DialogDescription>
      </DialogHeader>

      <div className="py-2 space-y-3">
        <div className="space-y-1">
          <span className="text-[11px] text-muted-foreground">
            Data Saat Ini:
          </span>
          <p className="text-sm font-mono font-medium px-2.5 py-1.5 rounded-md bg-muted/60 text-foreground border border-border/60">
            {item.kodeRekening}
          </p>
        </div>

        <Controller
          name="kodeRekening"
          control={control}
          render={({ field, fieldState }) => (
            <Field className="space-y-1.5 pt-1" data-invalid={fieldState.invalid}>
              <FieldLabel
                htmlFor="input-edit-kode-rekening"
                className="text-sm font-medium text-foreground"
              >
                Nilai Baru / Perbaikan <span className="text-destructive">*</span>
              </FieldLabel>

              <FieldContent>
                <Input
                  {...field}
                  id="input-edit-kode-rekening"
                  autoFocus
                  placeholder="Contoh: 5.1.02.01.01.0024"
                  disabled={isPendingEditRekening}
                  className="h-9 text-sm rounded-lg"
                  aria-invalid={!!fieldState.error}
                />
              </FieldContent>

              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <DialogFooter className="gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPendingEditRekening}
          className="cursor-pointer"
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isPendingEditRekening}
          className="cursor-pointer shadow-xs"
        >
          {isPendingEditRekening ? (
            <div className="flex items-center gap-2">
              <Spinner className="h-4 w-4" />
              <span>Menyimpan...</span>
            </div>
          ) : (
            "Simpan Perubahan"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ─── EditSatuanForm ──────────────────────────────────────────────────

function EditSatuanForm({
  item,
  onSuccess,
  onCancel,
}: FormProps & { item: ISatuan }) {
  const {
    control,
    handleSubmit,
    isPendingEditSatuan,
    isSuccessEditSatuan,
    handleEditSatuan,
  } = useEditSatuan({ item });

  useEffect(() => {
    if (isSuccessEditSatuan) {
      onSuccess();
    }
  }, [isSuccessEditSatuan, onSuccess]);

  return (
    <form onSubmit={handleSubmit(handleEditSatuan)} className="space-y-4">
      <DialogHeader className="space-y-1.5 text-left">
        <DialogTitle className="text-base font-semibold">
          Ubah Satuan
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          Perbaiki kesalahan penulisan atau perbarui nilai satuan.
          Perubahan ini langsung berlaku pada seluruh form combobox.
        </DialogDescription>
      </DialogHeader>

      <div className="py-2 space-y-3">
        <div className="space-y-1">
          <span className="text-[11px] text-muted-foreground">
            Data Saat Ini:
          </span>
          <p className="text-sm font-mono font-medium px-2.5 py-1.5 rounded-md bg-muted/60 text-foreground border border-border/60">
            {item.satuan}
          </p>
        </div>

        <Controller
          name="satuan"
          control={control}
          render={({ field, fieldState }) => (
            <Field className="space-y-1.5 pt-1" data-invalid={fieldState.invalid}>
              <FieldLabel
                htmlFor="input-edit-satuan"
                className="text-sm font-medium text-foreground"
              >
                Nilai Baru / Perbaikan <span className="text-destructive">*</span>
              </FieldLabel>

              <FieldContent>
                <Input
                  {...field}
                  id="input-edit-satuan"
                  autoFocus
                  placeholder="Contoh: Pcs, Unit, Rim, Kotak"
                  disabled={isPendingEditSatuan}
                  className="h-9 text-sm rounded-lg"
                  aria-invalid={!!fieldState.error}
                />
              </FieldContent>

              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <DialogFooter className="gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPendingEditSatuan}
          className="cursor-pointer"
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isPendingEditSatuan}
          className="cursor-pointer shadow-xs"
        >
          {isPendingEditSatuan ? (
            <div className="flex items-center gap-2">
              <Spinner className="h-4 w-4" />
              <span>Menyimpan...</span>
            </div>
          ) : (
            "Simpan Perubahan"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ─── EditKategoriForm ────────────────────────────────────────────────

function EditKategoriForm({
  item,
  onSuccess,
  onCancel,
}: FormProps & { item: IKategori }) {
  const {
    control,
    handleSubmit,
    isPendingEditKategori,
    isSuccessEditKategori,
    handleEditKategori,
  } = useEditKategori({ item });

  useEffect(() => {
    if (isSuccessEditKategori) {
      onSuccess();
    }
  }, [isSuccessEditKategori, onSuccess]);

  return (
    <form onSubmit={handleSubmit(handleEditKategori)} className="space-y-4">
      <DialogHeader className="space-y-1.5 text-left">
        <DialogTitle className="text-base font-semibold">
          Ubah Kategori
        </DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">
          Perbaiki kesalahan penulisan atau perbarui nilai kategori.
          Perubahan ini langsung berlaku pada seluruh form combobox.
        </DialogDescription>
      </DialogHeader>

      <div className="py-2 space-y-3">
        <div className="space-y-1">
          <span className="text-[11px] text-muted-foreground">
            Data Saat Ini:
          </span>
          <p className="text-sm font-mono font-medium px-2.5 py-1.5 rounded-md bg-muted/60 text-foreground border border-border/60">
            {item.kategori}
          </p>
        </div>

        <Controller
          name="kategori"
          control={control}
          render={({ field, fieldState }) => (
            <Field className="space-y-1.5 pt-1" data-invalid={fieldState.invalid}>
              <FieldLabel
                htmlFor="input-edit-kategori"
                className="text-sm font-medium text-foreground"
              >
                Nilai Baru / Perbaikan <span className="text-destructive">*</span>
              </FieldLabel>

              <FieldContent>
                <Input
                  {...field}
                  id="input-edit-kategori"
                  autoFocus
                  placeholder="Contoh: Alat Tulis Kantor, Elektronik"
                  disabled={isPendingEditKategori}
                  className="h-9 text-sm rounded-lg"
                  aria-invalid={!!fieldState.error}
                />
              </FieldContent>

              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <DialogFooter className="gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPendingEditKategori}
          className="cursor-pointer"
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isPendingEditKategori}
          className="cursor-pointer shadow-xs"
        >
          {isPendingEditKategori ? (
            <div className="flex items-center gap-2">
              <Spinner className="h-4 w-4" />
              <span>Menyimpan...</span>
            </div>
          ) : (
            "Simpan Perubahan"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ─── Main Dialog ─────────────────────────────────────────────────────

export default function EditItemDialog({
  open,
  onOpenChange,
  activeType,
  item,
}: EditItemDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && item && activeType === "kodeRekening" && (
          <EditRekeningForm
            item={item as IKodeRekening}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
        {open && item && activeType === "satuan" && (
          <EditSatuanForm
            item={item as ISatuan}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
        {open && item && activeType === "kategori" && (
          <EditKategoriForm
            item={item as IKategori}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
