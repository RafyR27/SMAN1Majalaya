"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ComboboxCreate } from "@/components/ui/combobox";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDate } from "@/lib/date-formatted";
import { IKategori, IKodeRekening } from "@/types/settings";
import { BarangFilter } from "@/types/barang";
import { CalendarIcon, Funnel, RotateCcw } from "lucide-react";

interface FilterBarangDialogProps {
  rekeningList?: IKodeRekening[];
  kategoriList?: IKategori[];
  currentFilters?: BarangFilter;
  onApplyFilters: (filters: BarangFilter) => void;
  onResetFilters: () => void;
  isLoading?: boolean;
}

export default function FilterBarangDialog({
  rekeningList = [],
  kategoriList = [],
  currentFilters = {},
  onApplyFilters,
  onResetFilters,
  isLoading = false,
}: FilterBarangDialogProps) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] =
    useState<BarangFilter>(currentFilters);
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);

  const isMobile = useIsMobile();
  const swipeDirection = isMobile ? "down" : "right";

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalFilters(currentFilters);
    }
  }, [open, currentFilters]);

  const activeFilterCount = [
    currentFilters.rekeningId,
    currentFilters.kategoriId,
    currentFilters.startDate,
    currentFilters.endDate,
  ].filter(Boolean).length;

  const hasLocalFilters = Boolean(
    localFilters.rekeningId ||
    localFilters.kategoriId ||
    localFilters.startDate ||
    localFilters.endDate,
  );

  const handleApply = () => {
    onApplyFilters(localFilters);
    setOpen(false);
  };

  const handleReset = () => {
    setLocalFilters({});
    onResetFilters();
    setOpen(false);
  };


  return (
    <Drawer
      disablePointerDismissal
      key={swipeDirection}
      modal={true}
      swipeDirection={swipeDirection}
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
      }}
    >
      <DrawerTrigger
        render={
          <Button
            variant="outline"
            className="relative cursor-pointer shrink-0 rounded-lg h-9.5 gap-1.5"
            disabled={isLoading}
          >
            <span>Filter</span>
            <Funnel className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background text-[10px] font-bold text-muted-foreground border-border border">
                {activeFilterCount}
              </span>
            )}
          </Button>
        }
      />

      <DrawerContent className="data-[swipe-axis=x]:sm:[--drawer-content-width:30rem] data-[swipe-axis=y]:max-h-[90dvh] flex flex-col">
        <DrawerHeader className="shrink-0 pb-3 pt-4 px-5 border-b">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5 text-left">
              <DrawerTitle className="text-lg font-semibold tracking-tight">
                Filter Data Barang
              </DrawerTitle>
              <DrawerDescription className="text-sm text-muted-foreground text-left">
                Saring data barang berdasarkan kode rekening, kategori, dan
                rentang tanggal.
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4">
          {/* Kode Rekening */}
          <Field className="space-y-1.5">
            <div className="flex items-center justify-between">
              <FieldLabel
                htmlFor="filter-kode-rekening"
                className="text-sm font-semibold text-foreground"
              >
                Kode Rekening
              </FieldLabel>
              {localFilters.rekeningId && (
                <button
                  type="button"
                  onClick={() =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      rekeningId: undefined,
                    }))
                  }
                  className="text-xs text-muted-foreground hover:text-destructive cursor-pointer transition-colors"
                  disabled={isLoading}
                >
                  Hapus
                </button>
              )}
            </div>

            <FieldContent>
              <ComboboxCreate
                id="filter-kode-rekening"
                type="kodeRekening"
                value={localFilters.rekeningId ?? ""}
                onChange={(value) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    rekeningId: value || undefined,
                  }))
                }
                comboboxList={{
                  kodeRekening: rekeningList,
                  kategori: [],
                  satuan: [],
                }}
                placeholder="Pilih kode rekening..."
                searchPlaceholder="Cari kode rekening..."
                emptyText="Kode rekening tidak ditemukan"
                hideCreate={true}
                disabled={isLoading}
              />
            </FieldContent>
          </Field>

          {/* Kategori */}
          <Field className="space-y-1.5">
            <div className="flex items-center justify-between">
              <FieldLabel
                htmlFor="filter-kategori"
                className="text-sm font-semibold text-foreground"
              >
                Kategori
              </FieldLabel>
              {localFilters.kategoriId && (
                <button
                  type="button"
                  onClick={() =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      kategoriId: undefined,
                    }))
                  }
                  className="text-xs text-muted-foreground hover:text-destructive cursor-pointer transition-colors"
                  disabled={isLoading}
                >
                  Hapus
                </button>
              )}
            </div>

            <FieldContent>
              <ComboboxCreate
                id="filter-kategori"
                type="kategori"
                value={localFilters.kategoriId ?? ""}
                onChange={(value) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    kategoriId: value || undefined,
                  }))
                }
                comboboxList={{
                  kodeRekening: [],
                  kategori: kategoriList,
                  satuan: [],
                }}
                placeholder="Pilih kategori..."
                searchPlaceholder="Cari kategori..."
                emptyText="Kategori tidak ditemukan"
                hideCreate={true}
                disabled={isLoading}
              />
            </FieldContent>
          </Field>

          {/* Rentang Tanggal */}
          <div className="space-y-3 pt-2">
            <p className="text-sm font-semibold text-foreground">
              Rentang Tanggal
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Tanggal Mulai */}
              <Field className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <FieldLabel
                    htmlFor="filter-start-date"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Tanggal Mulai
                  </FieldLabel>
                  {localFilters.startDate && (
                    <button
                      type="button"
                      onClick={() =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          startDate: undefined,
                        }))
                      }
                      className="text-xs text-muted-foreground hover:text-destructive cursor-pointer transition-colors"
                      disabled={isLoading}
                    >
                      Hapus
                    </button>
                  )}
                </div>

                <Popover
                  open={isStartDateOpen}
                  onOpenChange={setIsStartDateOpen}
                >
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        id="filter-start-date"
                        className="justify-between rounded-lg h-9 text-sm w-full font-normal"
                        disabled={isLoading}
                      >
                        <span className="truncate">
                          {localFilters.startDate ? (
                            formatDate(localFilters.startDate)
                          ) : (
                            <span className="text-muted-foreground">
                              Pilih tanggal mulai
                            </span>
                          )}
                        </span>
                        <CalendarIcon className="h-4 w-4 shrink-0 opacity-50 ml-1 text-muted-foreground" />
                      </Button>
                    }
                  />

                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        localFilters.startDate
                          ? new Date(localFilters.startDate)
                          : undefined
                      }
                      onSelect={(date) => {
                        setLocalFilters((prev) => ({
                          ...prev,
                          startDate: date
                            ? [
                                date.getFullYear(),
                                String(date.getMonth() + 1).padStart(2, "0"),
                                String(date.getDate()).padStart(2, "0"),
                              ].join("-")
                            : undefined,
                        }));
                        setIsStartDateOpen(false);
                      }}
                      disabled={isLoading}
                    />
                  </PopoverContent>
                </Popover>
              </Field>

              {/* Tanggal Selesai */}
              <Field className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <FieldLabel
                    htmlFor="filter-end-date"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Tanggal Selesai
                  </FieldLabel>
                  {localFilters.endDate && (
                    <button
                      type="button"
                      onClick={() =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          endDate: undefined,
                        }))
                      }
                      className="text-xs text-muted-foreground hover:text-destructive cursor-pointer transition-colors"
                      disabled={isLoading}
                    >
                      Hapus
                    </button>
                  )}
                </div>

                <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        id="filter-end-date"
                        className="justify-between rounded-lg h-9 text-sm w-full font-normal"
                        disabled={isLoading}
                      >
                        <span className="truncate">
                          {localFilters.endDate ? (
                            formatDate(localFilters.endDate)
                          ) : (
                            <span className="text-muted-foreground">
                              Pilih tanggal selesai
                            </span>
                          )}
                        </span>
                        <CalendarIcon className="h-4 w-4 shrink-0 opacity-50 ml-1 text-muted-foreground" />
                      </Button>
                    }
                  />

                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        localFilters.endDate
                          ? new Date(localFilters.endDate)
                          : undefined
                      }
                      onSelect={(date) => {
                        setLocalFilters((prev) => ({
                          ...prev,
                          endDate: date
                            ? [
                                date.getFullYear(),
                                String(date.getMonth() + 1).padStart(2, "0"),
                                String(date.getDate()).padStart(2, "0"),
                              ].join("-")
                            : undefined,
                        }));
                        setIsEndDateOpen(false);
                      }}
                      disabled={(date) => {
                        if (isLoading) return true;
                        if (!localFilters.startDate) return false;
                        const startDate = new Date(localFilters.startDate);
                        startDate.setHours(0, 0, 0, 0);
                        return date < startDate;
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </Field>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DrawerFooter className="border-t shrink-0 p-4 px-5 bg-background/95 backdrop-blur-xs flex flex-row items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="rounded-lg cursor-pointer gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={handleReset}
            disabled={
              isLoading || (!hasLocalFilters && activeFilterCount === 0)
            }
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </Button>

          <div className="flex items-center gap-2">
            <DrawerClose
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  className="rounded-lg cursor-pointer"
                  disabled={isLoading}
                >
                  Batal
                </Button>
              }
            />

            <Button
              type="button"
              size="lg"
              className="rounded-lg cursor-pointer gap-1.5 shadow-xs"
              onClick={handleApply}
              disabled={isLoading}
            >
              <Funnel className="h-4 w-4" />
              <span>Terapkan Filter</span>
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
