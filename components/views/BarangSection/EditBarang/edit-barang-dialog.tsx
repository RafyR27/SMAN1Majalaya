"use client";

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
import { useIsMobile } from "@/hooks/use-mobile";
import { ComboboxCreate } from "@/components/ui/combobox";
import { useEditBarang } from "./useEditBarang";
import { Controller } from "react-hook-form";
import { Spinner } from "@/components/ui/spinner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDate } from "@/lib/date-formatted";
import { IKategori, IKodeRekening, ISatuan } from "@/types/settings";
import { EditBarang } from "@/types/barang";
import { useEffect } from "react";

interface EditBarangDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  barang: EditBarang | null;
  rekeningList: IKodeRekening[];
  kategoriList: IKategori[];
  satuanList: ISatuan[];
}

export default function EditBarangDialog({
  open,
  onOpenChange,
  barang,
  rekeningList,
  kategoriList,
  satuanList,
}: EditBarangDialogProps) {
  const {
    control,
    handleSubmit,
    isPendingEditBarang,
    handleEditBarang,
    isSuccessEditBarang,
  } = useEditBarang({ barang });

  const isMobile = useIsMobile();
  const swipeDirection = isMobile ? "down" : "right";

  const comboboxList = {
    kodeRekening: rekeningList,
    kategori: kategoriList,
    satuan: satuanList,
  };

  useEffect(() => {
    if (isSuccessEditBarang) {
      onOpenChange(false);
    }
  }, [isSuccessEditBarang, onOpenChange]);

  return (
    <Drawer
      disablePointerDismissal
      key={swipeDirection}
      modal={true}
      swipeDirection={swipeDirection}
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
      }}
    >
      <DrawerContent className="data-[swipe-axis=x]:sm:[--drawer-content-width:38rem] data-[swipe-axis=y]:max-h-[90dvh] flex flex-col">
        <DrawerHeader className="shrink-0 pb-3 pt-4 px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="space-y-0.5 text-left">
                <div className="flex items-center gap-2">
                  <DrawerTitle className="text-lg font-semibold tracking-tight">
                    Edit Data Barang
                  </DrawerTitle>
                </div>
                <DrawerDescription className="text-sm text-muted-foreground text-left">
                  Perbarui informasi barang di bawah ini. Klik simpan setelah selesai.
                </DrawerDescription>
              </div>
            </div>
          </div>
        </DrawerHeader>

        <form
          id="edit-barang-form"
          onSubmit={handleSubmit(handleEditBarang)}
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-3.5"
        >
          {/* Nama Barang */}
          <Controller
            control={control}
            name="namaBarang"
            render={({ field, fieldState }) => (
              <Field className="space-y-1.5">
                <FieldLabel
                  htmlFor="edit-namaBarang"
                  className="text-sm font-semibold text-foreground flex items-center gap-1"
                >
                  Nama Barang <span className="text-destructive">*</span>
                </FieldLabel>

                <FieldContent>
                  <Input
                    {...field}
                    id="edit-namaBarang"
                    placeholder="Contoh: Kertas HVS A4 70gr"
                    className="rounded-lg h-9 text-sm"
                    aria-invalid={!!fieldState.error}
                    disabled={isPendingEditBarang}
                  />

                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldContent>
              </Field>
            )}
          />

          {/* Kode Rekening & Kategori */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Kode Rekening */}
            <Controller
              control={control}
              name="rekeningId"
              render={({ field, fieldState }) => (
                <Field className="space-y-1.5">
                  <FieldLabel
                    htmlFor="edit-kodeRekening"
                    className="text-sm font-semibold text-foreground"
                  >
                    Kode Rekening{" "}
                    <span className="text-destructive">*</span>
                  </FieldLabel>

                  <FieldContent>
                    <ComboboxCreate
                      id="edit-kodeRekening"
                      type="kodeRekening"
                      value={field.value}
                      onChange={field.onChange}
                      comboboxList={comboboxList}
                      placeholder="Pilih kode rekening..."
                      searchPlaceholder="Cari atau ketik kode baru..."
                      emptyText="Kode rekening tidak ditemukan"
                      disabled={isPendingEditBarang}
                    />

                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                </Field>
              )}
            />

            {/* Kategori */}
            <Controller
              control={control}
              name="kategoriId"
              render={({ field, fieldState }) => (
                <Field className="space-y-1.5">
                  <FieldLabel
                    htmlFor="edit-kategori"
                    className="text-sm font-semibold text-foreground"
                  >
                    Kategori <span className="text-destructive">*</span>
                  </FieldLabel>

                  <FieldContent>
                    <ComboboxCreate
                      id="edit-kategori"
                      type="kategori"
                      value={field.value}
                      onChange={field.onChange}
                      comboboxList={comboboxList}
                      placeholder="Pilih kategori..."
                      searchPlaceholder="Cari atau ketik kategori baru..."
                      emptyText="Kategori tidak ditemukan"
                      disabled={isPendingEditBarang}
                    />

                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                </Field>
              )}
            />
          </div>

          {/* Satuan & Harga Satuan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Satuan */}
            <Controller
              control={control}
              name="satuanId"
              render={({ field, fieldState }) => (
                <Field className="space-y-1.5">
                  <FieldLabel
                    htmlFor="edit-satuan"
                    className="text-sm font-semibold text-foreground"
                  >
                    Satuan <span className="text-destructive">*</span>
                  </FieldLabel>

                  <FieldContent>
                    <ComboboxCreate
                      id="edit-satuan"
                      type="satuan"
                      value={field.value}
                      onChange={field.onChange}
                      comboboxList={comboboxList}
                      placeholder="Pilih satuan..."
                      searchPlaceholder="Cari atau ketik satuan baru..."
                      emptyText="Satuan tidak ditemukan"
                      disabled={isPendingEditBarang}
                    />

                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                </Field>
              )}
            />

            {/* Harga Satuan */}
            <Controller
              control={control}
              name="harga"
              render={({ field, fieldState }) => (
                <Field className="space-y-1.5">
                  <FieldLabel
                    htmlFor="edit-hargaSatuan"
                    className="text-sm font-semibold text-foreground"
                  >
                    Harga Satuan (Rp){" "}
                    <span className="text-destructive">*</span>
                  </FieldLabel>

                  <FieldContent>
                    <Input
                      id="edit-hargaSatuan"
                      type="text"
                      min="0"
                      placeholder="Contoh: 45000"
                      value={
                        field.value === 0
                          ? ""
                          : Number(field.value).toLocaleString("id-ID")
                      }
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, "");
                        field.onChange(
                          rawValue === "" ? 0 : Number(rawValue),
                        );
                      }}
                      className="rounded-lg h-9 text-sm"
                      aria-invalid={!!fieldState.error}
                      disabled={isPendingEditBarang}
                    />

                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                </Field>
              )}
            />
          </div>

          {/* Tanggal */}
          <div className="w-full gap-3">
            <Controller
              control={control}
              name="tanggal"
              render={({ field, fieldState }) => (
                <Field className="space-y-1.5">
                  <FieldLabel
                    htmlFor="edit-tanggal"
                    className="text-sm font-semibold text-foreground"
                  >
                    Tanggal <span className="text-destructive">*</span>
                  </FieldLabel>

                  <Popover>
                    <div className="space-y-0.5 min-w-full">
                      <PopoverTrigger
                        render={
                          <Button
                            variant="outline"
                            id="edit-tanggal"
                            className="justify-start rounded-lg h-9 text-sm w-full"
                            disabled={isPendingEditBarang}
                          >
                            {field.value ? (
                              formatDate(field.value)
                            ) : (
                              <span>Masukkan Tanggal</span>
                            )}
                          </Button>
                        }
                      />
                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </div>

                    <PopoverContent className="w-auto p-0" align="center">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>
                </Field>
              )}
            />
          </div>

          {/* Merk & Sumber — Opsional */}
          <p className="text-sm font-bold my-6">Opsional</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Merk */}
            <Controller
              control={control}
              name="merk"
              render={({ field, fieldState }) => (
                <Field className="space-y-1.5">
                  <FieldLabel
                    htmlFor="edit-merk"
                    className="font-semibold text-foreground"
                  >
                    Merk
                  </FieldLabel>

                  <FieldContent>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      id="edit-merk"
                      placeholder="Contoh: PaperOne, Snowman"
                      className="rounded-lg h-9 text-sm"
                      aria-invalid={!!fieldState.error}
                      disabled={isPendingEditBarang}
                    />

                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                </Field>
              )}
            />

            {/* Sumber */}
            <Controller
              control={control}
              name="sumber"
              render={({ field, fieldState }) => (
                <Field className="space-y-1.5">
                  <FieldLabel
                    htmlFor="edit-sumber"
                    className="font-semibold text-foreground"
                  >
                    Sumber
                  </FieldLabel>

                  <FieldContent>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      id="edit-sumber"
                      placeholder="Contoh: Toko, distributor..."
                      className="rounded-lg h-9 text-sm"
                      aria-invalid={!!fieldState.error}
                      disabled={isPendingEditBarang}
                    />

                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                </Field>
              )}
            />
          </div>
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
                disabled={isPendingEditBarang}
              >
                Batal
              </Button>
            }
          />
          <Button
            type="submit"
            form="edit-barang-form"
            size="lg"
            className="rounded-lg cursor-pointer shadow-xs min-w-40"
            disabled={isPendingEditBarang}
          >
            {isPendingEditBarang ? <Spinner /> : "Simpan Perubahan"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
