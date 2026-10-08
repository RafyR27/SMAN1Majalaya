"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
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
import { defaultBarang, useAddBarang } from "./useAddBarang";
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
import { useEffect } from "react";

interface AddBarangDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rekeningList: IKodeRekening[];
  kategoriList: IKategori[];
  satuanList: ISatuan[];
}

const MAX_ITEMS = 5;

export default function AddBarangDialog({
  open,
  onOpenChange,
  rekeningList,
  kategoriList,
  satuanList,
}: AddBarangDialogProps) {
  const {
    control,
    handleSubmit,
    isPendingAddBarang,
    handleAddBarang,
    fields,
    append,
    remove,
    isSuccessAddBarang,
  } = useAddBarang();

  const isMobile = useIsMobile();

  const swipeDirection = isMobile ? "down" : "right";

  const comboboxList = {
    kodeRekening: rekeningList,
    kategori: kategoriList,
    satuan: satuanList,
  };

  useEffect(() => {
    if(isSuccessAddBarang){
      onOpenChange(false)
    }
  }, [isSuccessAddBarang, onOpenChange])
  

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
                    Tambah Data Barang
                  </DrawerTitle>
                </div>
                <DrawerDescription className="text-sm text-muted-foreground text-left">
                  Tambahkan satu atau hingga maksimal 5 data barang sekaligus.
                </DrawerDescription>
              </div>
            </div>
          </div>
        </DrawerHeader>

        <form
          id="add-barang-form"
          onSubmit={handleSubmit(handleAddBarang)}
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-6"
        >
          {fields.map((item, index) => (
            <div key={item.id} className="space-y-4 relative transition-all">
              {/* Item Card Header */}
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                    {index + 1}
                  </span>

                  <h4 className="text-sm font-semibold text-foreground">
                    Barang #{index + 1}
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

              {/* Form Fields */}
              <div className="space-y-3.5">
                {/* Nama Barang */}
                <Controller
                  control={control}
                  name={`items.${index}.namaBarang`}
                  render={({ field, fieldState }) => (
                    <Field className="space-y-1.5">
                      <FieldLabel
                        htmlFor={`namaBarang-${index}`}
                        className="text-sm font-semibold text-foreground flex items-center gap-1"
                      >
                        Nama Barang <span className="text-destructive">*</span>
                      </FieldLabel>

                      <FieldContent>
                        <Input
                          {...field}
                          id={`namaBarang-${index}`}
                          placeholder="Contoh: Kertas HVS A4 70gr"
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

                {/* Kode Rekening & Kategori */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Kode Rekening */}
                  <Controller
                    control={control}
                    name={`items.${index}.rekeningId`}
                    render={({ field, fieldState }) => (
                      <Field className="space-y-1.5">
                        <FieldLabel
                          htmlFor={`kodeRekening-${index}`}
                          className="text-sm font-semibold text-foreground"
                        >
                          Kode Rekening{" "}
                          <span className="text-destructive">*</span>
                        </FieldLabel>

                        <FieldContent>
                          <ComboboxCreate
                            id={`kodeRekening-${index}`}
                            type="kodeRekening"
                            value={field.value}
                            onChange={field.onChange}
                            comboboxList={comboboxList}
                            placeholder="Pilih kode rekening..."
                            searchPlaceholder="Cari atau ketik kode baru..."
                            emptyText="Kode rekening tidak ditemukan"
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
                    name={`items.${index}.kategoriId`}
                    render={({ field, fieldState }) => (
                      <Field className="space-y-1.5">
                        <FieldLabel
                          htmlFor={`kategori-${item.id}`}
                          className="text-sm font-semibold text-foreground"
                        >
                          Kategori <span className="text-destructive">*</span>
                        </FieldLabel>

                        <FieldContent>
                          <ComboboxCreate
                            id={`kategori-${item.id}`}
                            type="kategori"
                            value={field.value}
                            onChange={field.onChange}
                            comboboxList={comboboxList}
                            placeholder="Pilih kategori..."
                            searchPlaceholder="Cari atau ketik kategori baru..."
                            emptyText="Kategori tidak ditemukan"
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
                    name={`items.${index}.satuanId`}
                    render={({ field, fieldState }) => (
                      <Field className="space-y-1.5">
                        <FieldLabel
                          htmlFor={`satuan-${item.id}`}
                          className="text-sm font-semibold text-foreground"
                        >
                          Satuan <span className="text-destructive">*</span>
                        </FieldLabel>

                        <FieldContent>
                          <ComboboxCreate
                            id={`satuan-${item.id}`}
                            type="satuan"
                            value={field.value}
                            onChange={field.onChange}
                            comboboxList={comboboxList}
                            placeholder="Pilih satuan..."
                            searchPlaceholder="Cari atau ketik satuan baru..."
                            emptyText="Satuan tidak ditemukan"
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
                    name={`items.${index}.harga`}
                    render={({ field, fieldState }) => (
                      <Field className="space-y-1.5">
                        <FieldLabel
                          htmlFor={`hargaSatuan-${item.id}`}
                          className="text-sm font-semibold text-foreground"
                        >
                          Harga Satuan (Rp){" "}
                          <span className="text-destructive">*</span>
                        </FieldLabel>

                        <FieldContent>
                          <Input
                            id={`hargaSatuan-${item.id}`}
                            type="text"
                            min="0"
                            placeholder="Contoh: 45000"
                            value={
                              field.value === 0
                                ? ""
                                : Number(field.value).toLocaleString("id-ID")
                            }
                            onChange={(e) => {
                              const rawValue = e.target.value.replace(
                                /\D/g,
                                "",
                              );

                              field.onChange(
                                rawValue === "" ? 0 : Number(rawValue),
                              );
                            }}
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

                {/* calender */}
                <div className="w-full gap-3">
                  {/* Tanggal */}
                  <Controller
                    control={control}
                    name={`items.${index}.tanggal`}
                    render={({ field, fieldState }) => (
                      <Field className="space-y-1.5">
                        <FieldLabel
                          htmlFor={`tanggal-${item.id}`}
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
                                  id={`tanggal-${item.id}`}
                                  className="justify-start rounded-lg h-9 text-sm w-full"
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

                {/* Merk & Sumber */}
                <p className="text-sm font-bold my-6">Opsional</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Merk */}
                  <Controller
                    control={control}
                    name={`items.${index}.merk`}
                    render={({ field, fieldState }) => (
                      <Field className="space-y-1.5">
                        <FieldLabel
                          htmlFor={`merk-${item.id}`}
                          className="font-semibold text-foreground"
                        >
                          Merk
                        </FieldLabel>

                        <FieldContent>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            id={`merk-${item.id}`}
                            placeholder="Contoh: PaperOne, Snowman"
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

                  {/* Sumber */}
                  <Controller
                    control={control}
                    name={`items.${index}.sumber`}
                    render={({ field, fieldState }) => (
                      <Field className="space-y-1.5">
                        <FieldLabel
                          htmlFor={`sumber-${item.id}`}
                          className=" font-semibold text-foreground"
                        >
                          Sumber
                        </FieldLabel>

                        <FieldContent>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            id={`sumber-${item.id}`}
                            placeholder="Contoh: Toko, distributor..."
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
              </div>
            </div>
          ))}

          {/* Tombol Tambah Form Barang (Maksimal 5) */}
          {fields.length < MAX_ITEMS && (
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ ...defaultBarang })}
              className="w-full border-dashed border-2 py-5 hover:border-muted-foreground hover:bg-muted-foreground/5 transition-colors text-muted-foreground font-medium flex items-center justify-center gap-2 rounded-xl"
            >
              <PlusCircle className="h-4 w-4" />

              <span>
                Tambah Form Barang ({fields.length}/{MAX_ITEMS})
              </span>
            </Button>
          )}
        </form>

        {/* Footer */}
        <DrawerFooter className="border-t shrink-0 p-4 px-5 bg-background/95 backdrop-blur-xs flex flex-row items-center justify-between gap-3">
          <div className=" text-muted-foreground font-medium">
            Total:{" "}
            <span className="font-semibold text-foreground">
              {fields.length} / {MAX_ITEMS}
            </span>{" "}
            barang
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
              form="add-barang-form"
              size="lg"
              className="rounded-lg cursor-pointer shadow-xs min-w-35"
              disabled={isPendingAddBarang}
            >
              {isPendingAddBarang ? (
                <Spinner />
              ) : (
                `Simpan ${fields.length > 1 ? `${fields.length} Barang` : "Barang"}`
              )}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
