"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { IKodeRekening, ISatuan, IKategori } from "@/types/settings";
import { ItemType } from "../AddItem/AddItemDialog";
import {
  useDeleteRekening,
  useDeleteKategori,
  useDeleteSatuan,
} from "./useDeleteItem";

interface DeleteItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeType: ItemType;
  item: IKodeRekening | ISatuan | IKategori | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────

const TYPE_LABELS: Record<ItemType, { singular: string; label: string }> = {
  kodeRekening: { singular: "Kode Rekening", label: "Kode Rekening" },
  satuan: { singular: "Satuan", label: "Satuan" },
  kategori: { singular: "Kategori", label: "Kategori" },
};

function getDisplayValue(
  item: IKodeRekening | ISatuan | IKategori | null,
  type: ItemType,
): string {
  if (!item) return "";
  if (type === "kodeRekening") return (item as IKodeRekening).kodeRekening;
  if (type === "satuan") return (item as ISatuan).satuan;
  if (type === "kategori") return (item as IKategori).kategori;
  return "";
}

// ─── Form per Type ───────────────────────────────────────────────────

interface DeleteFormProps {
  item: IKodeRekening | ISatuan | IKategori;
  onSuccess: () => void;
  onCancel: () => void;
  displayValue: string;
  meta: { singular: string; label: string };
}

function DeleteRekeningForm({
  item,
  onSuccess,
  onCancel,
  displayValue,
  meta,
}: DeleteFormProps) {
  const {
    isPendingDeleteRekening,
    isSuccessDeleteRekening,
    handleDeleteRekening,
  } = useDeleteRekening();

  useEffect(() => {
    if (isSuccessDeleteRekening) {
      onSuccess();
    }
  }, [isSuccessDeleteRekening, onSuccess]);

  return (
    <DeleteFormLayout
      isPending={isPendingDeleteRekening}
      onDelete={() => handleDeleteRekening(item.id)}
      onCancel={onCancel}
      displayValue={displayValue}
      meta={meta}
    />
  );
}

function DeleteKategoriForm({
  item,
  onSuccess,
  onCancel,
  displayValue,
  meta,
}: DeleteFormProps) {
  const {
    isPendingDeleteKategori,
    isSuccessDeleteKategori,
    handleDeleteKategori,
  } = useDeleteKategori();

  useEffect(() => {
    if (isSuccessDeleteKategori) {
      onSuccess();
    }
  }, [isSuccessDeleteKategori, onSuccess]);

  return (
    <DeleteFormLayout
      isPending={isPendingDeleteKategori}
      onDelete={() => handleDeleteKategori(item.id)}
      onCancel={onCancel}
      displayValue={displayValue}
      meta={meta}
    />
  );
}

function DeleteSatuanForm({
  item,
  onSuccess,
  onCancel,
  displayValue,
  meta,
}: DeleteFormProps) {
  const { isPendingDeleteSatuan, isSuccessDeleteSatuan, handleDeleteSatuan } =
    useDeleteSatuan();

  useEffect(() => {
    if (isSuccessDeleteSatuan) {
      onSuccess();
    }
  }, [isSuccessDeleteSatuan, onSuccess]);

  return (
    <DeleteFormLayout
      isPending={isPendingDeleteSatuan}
      onDelete={() => handleDeleteSatuan(item.id)}
      onCancel={onCancel}
      displayValue={displayValue}
      meta={meta}
    />
  );
}

// ─── Shared Layout ───────────────────────────────────────────────────

function DeleteFormLayout({
  isPending,
  onDelete,
  onCancel,
  displayValue,
  meta,
}: {
  isPending: boolean;
  onDelete: () => void;
  onCancel: () => void;
  displayValue: string;
  meta: { singular: string; label: string };
}) {
  return (
    <>
      <DialogHeader className="space-y-2 text-left">
        <div className="flex items-center gap-2 text-destructive">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-destructive shrink-0">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <DialogTitle className="text-base font-semibold">
            Hapus {meta.singular}?
          </DialogTitle>
        </div>
        <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
          Apakah Anda yakin ingin menghapus data ini dari daftar{" "}
          {meta.label.toLowerCase()}? Data yang telah dihapus tidak akan lagi
          muncul sebagai opsi pilihan di formulir barang.
        </DialogDescription>
      </DialogHeader>

      <div className="py-2">
        <div className="p-3 rounded-lg bg-muted/60 border border-border/70">
          <span className="text-[11px] text-muted-foreground block mb-0.5">
            Data yang akan dihapus:
          </span>
          <p className="text-sm font-semibold text-foreground break-all">
            {displayValue}
          </p>
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
          className="cursor-pointer"
        >
          Batal
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={onDelete}
          disabled={isPending}
          className="cursor-pointer shadow-xs"
        >
          {isPending ? (
            <div className="flex items-center gap-2">
              <Spinner className="h-4 w-4" />
              <span>Menghapus...</span>
            </div>
          ) : (
            "Hapus Data"
          )}
        </Button>
      </DialogFooter>
    </>
  );
}

// ─── Main Dialog ─────────────────────────────────────────────────────

export default function DeleteItemDialog({
  open,
  onOpenChange,
  activeType,
  item,
}: DeleteItemDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const meta = TYPE_LABELS[activeType];
  const displayValue = getDisplayValue(item, activeType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && item && activeType === "kodeRekening" && (
          <DeleteRekeningForm
            item={item}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            displayValue={displayValue}
            meta={meta}
          />
        )}
        {open && item && activeType === "satuan" && (
          <DeleteSatuanForm
            item={item}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            displayValue={displayValue}
            meta={meta}
          />
        )}
        {open && item && activeType === "kategori" && (
          <DeleteKategoriForm
            item={item}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            displayValue={displayValue}
            meta={meta}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
