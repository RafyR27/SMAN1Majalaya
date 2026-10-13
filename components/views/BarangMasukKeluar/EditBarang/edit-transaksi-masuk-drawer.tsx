"use client";

import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Spinner } from "@/components/ui/spinner";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDate } from "@/lib/date-formatted";
import { formatRupiah } from "@/lib/rupiah-foramatted";
import { CalendarIcon } from "lucide-react";
import { cn } from "cn";
import { ITransaksiMasuk } from "@/types/transaksi";
import { useEditTransaksiMasuk } from "./useEditTransaksiMasuk";
import { useEffect } from "react";

interface EditTransaksiMasukDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaksi: ITransaksiMasuk | null;
}

export default function EditTransaksiMasukDrawer({
  open,
  onOpenChange,
  transaksi,
}: EditTransaksiMasukDrawerProps) {
  const {
    control,
    handleSubmit,
    handleEditTransaksiMasuk,
    isPendingEdit,
    isSuccessEdit,
    watch,
  } = useEditTransaksiMasuk({ transaksi });

  const isMobile = useIsMobile();
  const swipeDirection = isMobile ? "down" : "right";

  const volume = watch("volume") ?? 0;
  const hargaSatuan = transaksi?.hargaSatuan ?? 0;
  const subtotal = hargaSatuan * volume;
  const satuanNama = transaksi?.barang?.satuan?.satuan ?? "";

  useEffect(() => {
    if (isSuccessEdit) {
      onOpenChange(false);
    }
  }, [isSuccessEdit, onOpenChange]);

  return (
    <Drawer
      disablePointerDismissal
      key={swipeDirection}
      modal={true}
      swipeDirection={swipeDirection}
      open={open}
      onOpenChange={onOpenChange}
    >
      <DrawerContent className="data-[swipe-axis=x]:sm:[--drawer-content-width:38rem] data-[swipe-axis=y]:max-h-[92dvh] flex flex-col">
        <DrawerHeader className="shrink-0 pb-3 pt-4 px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5 text-left">
              <div className="flex items-center gap-2">
                <DrawerTitle className="text-lg font-semibold tracking-tight">
                  Edit Transaksi Masuk
                </DrawerTitle>
              </div>
              <DrawerDescription className="text-sm text-muted-foreground text-left">
                Perbarui data transaksi masuk. Klik simpan setelah selesai.
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <form
          id="edit-transaksi-masuk-form"
          onSubmit={handleSubmit(handleEditTransaksiMasuk)}
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4"
        >
          {/* Info Barang (read-only) */}
          <div className="rounded-lg bg-muted/40 border border-border/60 px-4 py-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Informasi Barang
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              <div>
                <span className="text-muted-foreground">Nama Barang</span>
                <p className="font-medium text-foreground truncate">
                  {transaksi?.barang?.namaBarang ?? "-"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Kode Rekening</span>
                <p className="font-mono font-medium text-foreground">
                  {transaksi?.barang?.rekening?.kodeRekening ?? "-"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Kategori</span>
                <p className="font-medium text-foreground truncate">
                  {transaksi?.barang?.kategori?.kategori ?? "-"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Harga Satuan</span>
                <p className="font-medium text-foreground">
                  {formatRupiah(transaksi?.hargaSatuan ?? 0)}
                </p>
              </div>
              {transaksi?.barang?.merk && (
                <div>
                  <span className="text-muted-foreground">Merk</span>
                  <p className="font-medium text-foreground">
                    {transaksi.barang.merk}
                  </p>
                </div>
              )}
              {transaksi?.sumber && (
                <div>
                  <span className="text-muted-foreground">Sumber</span>
                  <p className="font-medium text-foreground">
                    {transaksi.sumber}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Volume & Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Volume */}
            <Controller
              control={control}
              name="volume"
              render={({ field: f, fieldState }) => (
                <Field className="space-y-1.5">
                  <FieldLabel
                    htmlFor="volume-edit-masuk"
                    className="text-sm font-semibold text-foreground flex items-center gap-1"
                  >
                    Volume{" "}
                    {satuanNama && (
                      <span className="text-muted-foreground font-normal">
                        ({satuanNama})
                      </span>
                    )}
                    <span className="text-destructive">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="volume-edit-masuk"
                      type="text"
                      inputMode="numeric"
                      placeholder="Contoh: 10"
                      value={f.value === 0 ? "" : String(f.value)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        f.onChange(raw === "" ? 0 : Number(raw));
                      }}
                      className={cn(
                        "rounded-lg h-9 text-sm",
                        fieldState.error &&
                          "border-destructive focus-visible:ring-destructive/20",
                      )}
                      aria-invalid={!!fieldState.error}
                    />
                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                </Field>
              )}
            />

            {/* Tanggal */}
            <Controller
              control={control}
              name="tanggal"
              render={({ field: f, fieldState }) => (
                <Field className="space-y-1.5">
                  <FieldLabel
                    htmlFor="tanggal-edit-masuk"
                    className="text-sm font-semibold text-foreground flex items-center gap-1"
                  >
                    Tanggal <span className="text-destructive">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <Popover>
                      <div className="space-y-0.5 w-full">
                        <PopoverTrigger
                          render={
                            <Button
                              variant="outline"
                              id="tanggal-edit-masuk"
                              className={cn(
                                "justify-start rounded-lg h-9 text-sm w-full font-normal",
                                !f.value && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-3.5 w-3.5 opacity-60 shrink-0" />
                              {f.value ? (
                                formatDate(f.value)
                              ) : (
                                <span>Pilih tanggal</span>
                              )}
                            </Button>
                          }
                        />
                        {fieldState.error && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </div>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={f.value}
                          onSelect={f.onChange}
                        />
                      </PopoverContent>
                    </Popover>
                  </FieldContent>
                </Field>
              )}
            />
          </div>

          {/* Diserahkan Oleh */}
          <Controller
            control={control}
            name="oleh"
            render={({ field: f, fieldState }) => (
              <Field className="space-y-1.5">
                <FieldLabel
                  htmlFor="oleh-edit-masuk"
                  className="text-sm font-semibold text-foreground"
                >
                  Diserahkan Oleh{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    (Opsional)
                  </span>
                </FieldLabel>
                <FieldContent>
                  <Input
                    {...f}
                    value={f.value ?? ""}
                    id="oleh-edit-masuk"
                    placeholder="Contoh: Pak Budi, Staf TU, CV. Mandiri..."
                    className="rounded-lg h-9 text-sm"
                    aria-invalid={!!fieldState.error}
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldContent>
              </Field>
            )}
          />

          {/* Subtotal preview */}
          {subtotal > 0 && (
            <div className="rounded-lg bg-muted-foreground/5 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Subtotal: </span>
              <span className="font-semibold text-primary">
                Rp {subtotal.toLocaleString("id-ID")}
              </span>
              <span className="text-muted-foreground text-xs ml-1">
                ({volume} × Rp {hargaSatuan.toLocaleString("id-ID")})
              </span>
            </div>
          )}
        </form>

        {/* Footer */}
        <DrawerFooter className="border-t shrink-0 p-4 px-5 bg-background/95 backdrop-blur-xs flex flex-row items-center justify-end gap-3">
          <DrawerClose
            render={
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="rounded-lg cursor-pointer"
                disabled={isPendingEdit}
              >
                Batal
              </Button>
            }
          />
          <Button
            type="submit"
            form="edit-transaksi-masuk-form"
            size="lg"
            className="rounded-lg shadow-xs min-w-36"
            disabled={isPendingEdit}
          >
            {isPendingEdit ? <Spinner /> : "Simpan Perubahan"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
