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
import { PlusCircle, Trash2, CalendarIcon } from "lucide-react";
import { ComboboxBarang, type BarangOption } from "./ComboboxBarang";
import { defaultItem, useAddTransaksiMasuk } from "./useAddTransaksiMasuk";
import { cn } from "cn";

interface AddTransaksiMasukDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MAX_ITEMS = 5;

export default function AddTransaksiMasukDrawer({
  open,
  onOpenChange,
}: AddTransaksiMasukDrawerProps) {
  const {
    fields,
    append,
    remove,
    control,
    handleSubmit,
    isPendingAdd,
    handleAddTransaksiMasuk,
    setValue,
    watch,
  } = useAddTransaksiMasuk();

  const isMobile = useIsMobile();
  const swipeDirection = isMobile ? "down" : "right";

  const handleBarangSelect = (index: number, barang: BarangOption | null) => {
    if (barang) {
      setValue(`items.${index}.barangId`, barang.id);
      setValue(`items.${index}.namaBarang`, barang.namaBarang);
      setValue(`items.${index}.kodeRekening`, barang.rekening.kodeRekening);
      setValue(`items.${index}.kategori`, barang.kategori.kategori);
      setValue(`items.${index}.hargaSatuan`, barang.harga);
      setValue(`items.${index}.stok`, barang.stok);
      setValue(`items.${index}.sumber`, barang.sumber ?? "");
      setValue(`items.${index}.merk`, barang.merk ?? "");
      setValue(`items.${index}.satuanNama`, barang.satuan.satuan);
    } else {
      setValue(`items.${index}.barangId`, "");
      setValue(`items.${index}.namaBarang`, "");
      setValue(`items.${index}.kodeRekening`, "");
      setValue(`items.${index}.kategori`, "");
      setValue(`items.${index}.hargaSatuan`, 0);
      setValue(`items.${index}.stok`, 0);
      setValue(`items.${index}.sumber`, "");
      setValue(`items.${index}.satuanNama`, "");
    }
  };

  return (
    <Drawer
      disablePointerDismissal
      key={swipeDirection}
      modal={true}
      swipeDirection={swipeDirection}
      open={open}
      onOpenChange={onOpenChange}
    >
      <DrawerContent className="data-[swipe-axis=x]:sm:[--drawer-content-width:40rem] data-[swipe-axis=y]:max-h-[92dvh] flex flex-col">
        <DrawerHeader className="shrink-0 pb-3 pt-4 px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5 text-left">
              <div className="flex items-center gap-2">
                <DrawerTitle className="text-lg font-semibold tracking-tight">
                  Tambah Transaksi Masuk
                </DrawerTitle>
              </div>
              <DrawerDescription className="text-sm text-muted-foreground text-left">
                Tambahkan satu atau hingga maksimal 5 transaksi masuk sekaligus.
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <form
          id="add-transaksi-masuk-form"
          onSubmit={handleSubmit(handleAddTransaksiMasuk)}
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-6"
        >
          {fields.map((field, index) => {
            const hargaSatuan = watch(`items.${index}.hargaSatuan`) ?? 0;
            const volume = watch(`items.${index}.volume`) ?? 0;
            const subtotal = hargaSatuan * volume;
            const stok = watch(`items.${index}.stok`) ?? 0;
            const satuanNama = watch(`items.${index}.satuanNama`) ?? "";

            return (
              <div key={field.id} className="space-y-4 relative transition-all">
                {/* Item Card Header */}
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
                      {index + 1}
                    </span>
                    <h4 className="text-sm font-semibold text-foreground">
                      Transaksi Masuk #{index + 1}
                    </h4>
                  </div>

                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="h-7 px-2 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Hapus
                    </Button>
                  )}
                </div>

                <div className="space-y-3.5">
                  {/* Nama Barang — Combobox */}
                  <Controller
                    control={control}
                    name={`items.${index}.barangId`}
                    render={({ field: f, fieldState }) => (
                      <Field className="space-y-1.5">
                        <FieldLabel
                          htmlFor={`barang-masuk-${index}`}
                          className="text-sm font-semibold text-foreground flex items-center gap-1"
                        >
                          Nama Barang{" "}
                          <span className="text-destructive">*</span>
                        </FieldLabel>
                        <FieldContent>
                          <ComboboxBarang
                            id={`barang-masuk-${index}`}
                            value={f.value}
                            onChange={(barang) =>
                              handleBarangSelect(index, barang)
                            }
                          />
                          {fieldState.error && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </FieldContent>
                      </Field>
                    )}
                  />

                  {/* Kode Rekening & Kategori (disabled, auto-fill) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Controller
                      control={control}
                      name={`items.${index}.kodeRekening`}
                      render={({ field: f }) => (
                        <Field className="space-y-1.5">
                          <FieldLabel className="text-sm font-semibold text-foreground">
                            Kode Rekening
                          </FieldLabel>
                          <FieldContent>
                            <Input
                              value={f.value ?? ""}
                              disabled
                              placeholder="Otomatis dari barang"
                              className="rounded-lg h-9 text-sm bg-muted/40"
                            />
                          </FieldContent>
                        </Field>
                      )}
                    />
                    <Controller
                      control={control}
                      name={`items.${index}.kategori`}
                      render={({ field: f }) => (
                        <Field className="space-y-1.5">
                          <FieldLabel className="text-sm font-semibold text-foreground">
                            Kategori
                          </FieldLabel>
                          <FieldContent>
                            <Input
                              value={f.value ?? ""}
                              disabled
                              placeholder="Otomatis dari barang"
                              className="rounded-lg h-9 text-sm bg-muted/40"
                            />
                          </FieldContent>
                        </Field>
                      )}
                    />
                  </div>

                  {/* Harga Satuan (disabled, auto-fill) */}
                  <Controller
                    control={control}
                    name={`items.${index}.hargaSatuan`}
                    render={({ field: f }) => (
                      <Field className="space-y-1.5">
                        <FieldLabel className="text-sm font-semibold text-foreground">
                          Harga Satuan (Rp)
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            value={
                              (f.value ?? 0) === 0
                                ? ""
                                : Number(f.value).toLocaleString("id-ID")
                            }
                            disabled
                            placeholder="Otomatis dari barang"
                            className="rounded-lg h-9 text-sm bg-muted/40"
                          />
                        </FieldContent>
                      </Field>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Sumber (disabled, auto from barang) */}
                    <Controller
                      control={control}
                      name={`items.${index}.sumber`}
                      render={({ field: f }) => (
                        <Field className="space-y-1.5">
                          <FieldLabel className="text-sm font-semibold text-foreground">
                            Sumber
                          </FieldLabel>
                          <FieldContent>
                            <Input
                              value={f.value ?? ""}
                              disabled
                              placeholder="Otomatis dari barang"
                              className="rounded-lg h-9 text-sm bg-muted/40"
                            />
                          </FieldContent>
                        </Field>
                      )}
                    />
                    <Controller
                      control={control}
                      name={`items.${index}.merk`}
                      render={({ field: f }) => (
                        <Field className="space-y-1.5">
                          <FieldLabel className="text-sm font-semibold text-foreground">
                            Merk
                          </FieldLabel>
                          <FieldContent>
                            <Input
                              value={f.value ?? ""}
                              disabled
                              placeholder="Otomatis dari barang"
                              className="rounded-lg h-9 text-sm bg-muted/40"
                            />
                          </FieldContent>
                        </Field>
                      )}
                    />
                  </div>

                  {/* Volume & Tanggal */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Volume */}
                    <Controller
                      control={control}
                      name={`items.${index}.volume`}
                      render={({ field: f, fieldState }) => (
                        <Field className="space-y-1.5">
                          <FieldLabel
                            htmlFor={`volume-masuk-${index}`}
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
                              id={`volume-masuk-${index}`}
                              type="text"
                              inputMode="numeric"
                              placeholder="Contoh: 10"
                              value={f.value === 0 ? "" : String(f.value)}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, "");
                                f.onChange(raw === "" ? 0 : Number(raw));
                              }}
                              className="rounded-lg h-9 text-sm"
                              aria-invalid={!!fieldState.error}
                            />
                            {stok > 0 && (
                              <p className="text-[0.72rem] text-muted-foreground mt-0.5">
                                Stok saat ini: {stok} {satuanNama}
                              </p>
                            )}
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
                      name={`items.${index}.tanggal`}
                      render={({ field: f, fieldState }) => (
                        <Field className="space-y-1.5">
                          <FieldLabel
                            htmlFor={`tanggal-masuk-${index}`}
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
                                      id={`tanggal-masuk-${index}`}
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
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
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
                    name={`items.${index}.oleh`}
                    render={({ field: f, fieldState }) => (
                      <Field className="space-y-1.5">
                        <FieldLabel
                          htmlFor={`oleh-masuk-${index}`}
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
                            id={`oleh-masuk-${index}`}
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
                </div>
              </div>
            );
          })}

          {/* Tambah item (maks 5) */}
          {fields.length < MAX_ITEMS && (
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ ...defaultItem })}
              className="w-full border-dashed border-2 py-5 hover:border-muted-foreground hover:bg-muted-foreground/5 transition-colors text-muted-foreground font-medium flex items-center justify-center gap-2 rounded-xl"
            >
              <PlusCircle className="h-4 w-4" />
              <span>
                Tambah Form Transaksi Masuk ({fields.length}/{MAX_ITEMS})
              </span>
            </Button>
          )}
        </form>

        {/* Footer */}
        <DrawerFooter className="border-t shrink-0 p-4 px-5 bg-background/95 backdrop-blur-xs flex flex-row items-center justify-between gap-3">
          <div className="text-muted-foreground font-medium text-sm">
            Total:{" "}
            <span className="font-semibold text-foreground">
              {fields.length} / {MAX_ITEMS}
            </span>{" "}
            transaksi
          </div>

          <div className="flex items-center gap-2">
            <DrawerClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="rounded-lg cursor-pointer"
                >
                  Batal
                </Button>
              }
            />
            <Button
              type="submit"
              form="add-transaksi-masuk-form"
              size="lg"
              className="rounded-lg shadow-xs min-w-36"
              disabled={isPendingAdd}
            >
              {isPendingAdd ? (
                <Spinner />
              ) : (
                `Simpan ${fields.length > 1 ? `${fields.length} Transaksi` : "Transaksi"}`
              )}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
