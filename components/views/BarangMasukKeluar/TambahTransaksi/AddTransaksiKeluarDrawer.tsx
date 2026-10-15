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
import { CalendarIcon } from "lucide-react";
import { ComboboxBarang, type BarangOption } from "./ComboboxBarang";
import { defaultItem, useAddTransaksiKeluar } from "./useAddTransaksiKeluar";
import { cn } from "cn";

interface AddTransaksiKeluarDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddTransaksiKeluarDrawer({
  open,
  onOpenChange,
}: AddTransaksiKeluarDrawerProps) {
  const {
    control,
    handleSubmit,
    isPendingAdd,
    handleAddTransaksiKeluar,
    setValue,
    watch,
  } = useAddTransaksiKeluar();

  const isMobile = useIsMobile();
  const swipeDirection = isMobile ? "down" : "right";

  const handleBarangSelect = (barang: BarangOption | null) => {
    if (barang) {
      setValue("item.barangId", barang.id);
      setValue("item.namaBarang", barang.namaBarang);
      setValue("item.kodeRekening", barang.rekening.kodeRekening);
      setValue("item.kategori", barang.kategori.kategori);
      setValue("item.hargaSatuan", barang.harga);
      setValue("item.stok", barang.stok);
      setValue("item.satuanNama", barang.satuan.satuan);
      // Reset volume when barang changes
      setValue("item.volume", 1);
    } else {
      setValue("item", { ...defaultItem });
    }
  };

  const hargaSatuan = watch("item.hargaSatuan") ?? 0;
  const volume = watch("item.volume") ?? 0;
  const stok = watch("item.stok") ?? 0;
  const satuanNama = watch("item.satuanNama") ?? "";
  const subtotal = hargaSatuan * volume;
  const barangId = watch("item.barangId");

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
          <div className="space-y-0.5 text-left">
            <DrawerTitle className="text-lg font-semibold tracking-tight">
              Tambah Transaksi Keluar
            </DrawerTitle>
            <DrawerDescription className="text-sm text-muted-foreground">
              Catat pengeluaran atau pengurangan stok barang.
            </DrawerDescription>
          </div>
        </DrawerHeader>

        <form
          id="add-transaksi-keluar-form"
          onSubmit={handleSubmit(handleAddTransaksiKeluar)}
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4"
        >
          {/* Nama Barang — Combobox */}
          <Controller
            control={control}
            name="item.barangId"
            render={({ field: f, fieldState }) => (
              <Field className="space-y-1.5">
                <FieldLabel
                  htmlFor="barang-keluar"
                  className="text-sm font-semibold text-foreground flex items-center gap-1"
                >
                  Nama Barang <span className="text-destructive">*</span>
                </FieldLabel>
                <FieldContent>
                  <ComboboxBarang
                    id="barang-keluar"
                    value={f.value}
                    onChange={handleBarangSelect}
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldContent>
              </Field>
            )}
          />

          {/* Kode Rekening & Kategori (disabled) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Controller
              control={control}
              name="item.kodeRekening"
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
              name="item.kategori"
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

          {/* Harga Satuan (disabled) */}
          <Controller
            control={control}
            name="item.hargaSatuan"
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

          {/* Volume & Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Volume */}
            <Controller
              control={control}
              name="item.volume"
              render={({ field: f, fieldState }) => (
                <Field className="space-y-1.5">
                  <FieldLabel
                    htmlFor="volume-keluar"
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
                      id="volume-keluar"
                      type="text"
                      inputMode="numeric"
                      placeholder="Contoh: 5"
                      value={f.value === 0 ? "" : String(f.value)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        const num = raw === "" ? 0 : Number(raw);
                        f.onChange(num);
                      }}
                      className={cn(
                        "rounded-lg h-9 text-sm",
                        barangId &&
                          volume > stok &&
                          stok > 0 &&
                          "border-destructive focus-visible:ring-destructive/20",
                      )}
                      aria-invalid={!!fieldState.error}
                    />
                    {stok > 0 && (
                      <p
                        className={cn(
                          "text-[0.72rem] mt-0.5",
                          volume > stok
                            ? "text-destructive"
                            : "text-muted-foreground",
                        )}
                      >
                        Stok tersedia: {stok} {satuanNama}
                        {volume > stok && " (melebihi stok!)"}
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
              name="item.tanggal"
              render={({ field: f, fieldState }) => (
                <Field className="space-y-1.5">
                  <FieldLabel
                    htmlFor="tanggal-keluar"
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
                              id="tanggal-keluar"
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

          {/* Diberikan Kepada & Tujuan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Controller
              control={control}
              name="item.kepada"
              render={({ field: f, fieldState }) => (
                <Field className="space-y-1.5">
                  <FieldLabel
                    htmlFor="kepada-keluar"
                    className="text-sm font-semibold text-foreground"
                  >
                    Diberikan Kepada{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (Opsional)
                    </span>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      {...f}
                      value={f.value ?? ""}
                      id="kepada-keluar"
                      placeholder="Contoh: Guru, Staf TU..."
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

            <Controller
              control={control}
              name="item.tujuan"
              render={({ field: f, fieldState }) => (
                <Field className="space-y-1.5">
                  <FieldLabel
                    htmlFor="tujuan-keluar"
                    className="text-sm font-semibold text-foreground"
                  >
                    Tujuan{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (Opsional)
                    </span>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      {...f}
                      value={f.value ?? ""}
                      id="tujuan-keluar"
                      placeholder="Contoh: Kegiatan belajar mengajar..."
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
          </div>

          {/* Subtotal preview */}
          {subtotal > 0 && (
            <div className="rounded-lg px-3 py-2 text-sm bg-muted-foreground/5">
              <span className="text-muted-foreground">Subtotal: </span>
              <span className="font-semibold text-rose-700 dark:text-rose-400">
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
              >
                Batal
              </Button>
            }
          />
          <Button
            type="submit"
            form="add-transaksi-keluar-form"
            size="lg"
            className="rounded-lg cursor-pointer shadow-xs min-w-36 bg-rose-600 hover:bg-rose-700 text-white"
            disabled={isPendingAdd}
          >
            {isPendingAdd ? <Spinner /> : "Simpan Transaksi"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
