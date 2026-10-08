"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowDownToLine, ArrowUpFromLine, ChevronRight } from "lucide-react";
import AddTransaksiMasukDrawer from "./AddTransaksiMasukDrawer";
import AddTransaksiKeluarDrawer from "./AddTransaksiKeluarDrawer";

interface TambahTransaksiDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TransaksiType = "masuk" | "keluar" | null;

export default function TambahTransaksiDrawer({
  open,
  onOpenChange,
}: TambahTransaksiDrawerProps) {
  const [selectedType, setSelectedType] = useState<TransaksiType>(null);
  const isMobile = useIsMobile();
  const swipeDirection = isMobile ? "down" : "right";

  console.log(selectedType)

  const handleOpenMasuk = () => setSelectedType("masuk");
  const handleOpenKeluar = () => setSelectedType("keluar");

  const handleCloseMasuk = (isOpen: boolean) => {
    if (!isOpen) setSelectedType(null);
  };

  const handleCloseKeluar = (isOpen: boolean) => {
    if (!isOpen) setSelectedType(null);
  };

  return (
    <>
      <Drawer
        key={swipeDirection}
        modal={true}
        swipeDirection={swipeDirection}
        open={open}
        onOpenChange={onOpenChange}
      >
        <DrawerContent className="data-[swipe-axis=x]:sm:[--drawer-content-width:26rem] data-[swipe-axis=y]:max-h-[60dvh] flex flex-col">
          <DrawerHeader className="shrink-0 pb-3 pt-5 px-6">
            <DrawerTitle className="text-lg font-semibold tracking-tight">
              Tambah Transaksi
            </DrawerTitle>
            <DrawerDescription className="text-sm text-muted-foreground">
              Pilih jenis transaksi yang ingin dicatat.
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 px-6 pb-8 pt-2 space-y-3">
            {/* Transaksi Masuk */}
            <button
              type="button"
              onClick={handleOpenMasuk}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card cursor-pointer hover:bg-muted-foreground/7 text-left"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                <ArrowDownToLine className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Transaksi Masuk
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Catat penambahan stok barang (hingga 5 barang sekaligus)
                </p>
              </div>
              <div className="ml-auto shrink-0 text-muted-foreground">
                <ChevronRight />
              </div>
            </button>

            {/* Transaksi Keluar */}
            <button
              type="button"
              onClick={handleOpenKeluar}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card cursor-pointer hover:bg-muted-foreground/7 text-left"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                <ArrowUpFromLine className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Transaksi Keluar
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Catat pengurangan atau pengeluaran stok barang
                </p>
              </div>
              <div className="ml-auto shrink-0 text-muted-foreground ">
                <ChevronRight />
              </div>
            </button>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Nested Drawer: Transaksi Masuk */}
      <AddTransaksiMasukDrawer
        open={selectedType === "masuk"}
        onOpenChange={handleCloseMasuk}
      />

      {/* Nested Drawer: Transaksi Keluar */}
      <AddTransaksiKeluarDrawer
        open={selectedType === "keluar"}
        onOpenChange={handleCloseKeluar}
      />
    </>
  );
}
