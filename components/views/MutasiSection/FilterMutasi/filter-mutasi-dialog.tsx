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
import { ComboboxCreate } from "@/components/ui/combobox";
import { useIsMobile } from "@/hooks/use-mobile";
import { IKategori, IKodeRekening } from "@/types/settings";
import { MutasiFilter } from "@/types/mutasi";
import { Funnel, RotateCcw } from "lucide-react";

interface FilterMutasiDialogProps {
  rekeningList?: IKodeRekening[];
  kategoriList?: IKategori[];
  currentFilters?: MutasiFilter;
  onApplyFilters: (filters: MutasiFilter) => void;
  onResetFilters: () => void;
  isLoading?: boolean;
}

export default function FilterMutasiDialog({
  rekeningList = [],
  kategoriList = [],
  currentFilters = {},
  onApplyFilters,
  onResetFilters,
  isLoading = false,
}: FilterMutasiDialogProps) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] =
    useState<MutasiFilter>(currentFilters);

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
  ].filter(Boolean).length;

  const hasLocalFilters = Boolean(
    localFilters.rekeningId || localFilters.kategoriId,
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

      <DrawerContent className="data-[swipe-axis=x]:sm:[--drawer-content-width:28rem] data-[swipe-axis=y]:max-h-[85dvh] flex flex-col">
        <DrawerHeader className="shrink-0 pb-3 pt-4 px-5 border-b">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5 text-left">
              <DrawerTitle className="text-lg font-semibold tracking-tight">
                Filter Data Mutasi
              </DrawerTitle>
              <DrawerDescription className="text-sm text-muted-foreground text-left">
                Saring data mutasi barang berdasarkan kode rekening dan
                kategori.
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
        </div>

        <DrawerFooter className="border-t shrink-0 p-4 px-5 bg-background/95 backdrop-blur-xs flex flex-row items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!hasLocalFilters && activeFilterCount === 0}
            className="rounded-lg cursor-pointer gap-1.5 text-muted-foreground hover:text-foreground"
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
              onClick={handleApply}
              disabled={isLoading}
              className="rounded-lg cursor-pointer gap-1.5 shadow-xs"
            >
              Terapkan
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
