"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "cn";

const BULAN_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

interface SelectBulanProps {
  bulan: number; // 1 - 12
  tahun: number;
  onChange: (bulan: number, tahun: number) => void;
  disabled?: boolean;
}

export default function SelectBulan({
  bulan,
  tahun,
  onChange,
  disabled = false,
}: SelectBulanProps) {
  const [open, setOpen] = useState(false);
  const [tempYear, setTempYear] = useState(tahun);

  const namaBulanTerpilih = BULAN_NAMES[bulan - 1] ?? "Pilih Bulan";

  const handleSelectMonth = (monthIndex: number) => {
    onChange(monthIndex + 1, tempYear);
    setOpen(false);
  };

  const handlePrevYear = () => {
    setTempYear((prev) => prev - 1);
  };

  const handleNextYear = () => {
    setTempYear((prev) => prev + 1);
  };

  const handleSetCurrentMonth = () => {
    const now = new Date();
    const curMonth = now.getMonth() + 1;
    const curYear = now.getFullYear();
    setTempYear(curYear);
    onChange(curMonth, curYear);
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          setTempYear(tahun);
        }
      }}
    >
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className="flex items-center gap-2 h-9.5 px-3 rounded-lg border-input bg-background font-normal text-sm cursor-pointer hover:bg-muted/50 transition-colors shrink-0"
            disabled={disabled}
          >
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-foreground">
              {namaBulanTerpilih} {tahun}
            </span>
          </Button>
        }
      />
      <PopoverContent
        align="start"
        className="w-72 p-3 shadow-lg rounded-xl border border-border bg-popover z-50"
      >
        <div className="space-y-3">
          {/* Header Tahun */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tahun
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handlePrevYear}
                className="h-7 w-7 rounded-md cursor-pointer hover:bg-muted"
                aria-label="Tahun sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-semibold text-sm px-1.5">{tempYear}</span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleNextYear}
                className="h-7 w-7 rounded-md cursor-pointer hover:bg-muted"
                aria-label="Tahun berikutnya"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Grid 12 Bulan */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {BULAN_NAMES.map((name, idx) => {
              const isSelected = bulan === idx + 1 && tahun === tempYear;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleSelectMonth(idx)}
                  className={cn(
                    "h-8 rounded-lg text-xs font-medium transition-all cursor-pointer text-center",
                    isSelected
                      ? "bg-primary/80 text-primary-foreground font-semibold shadow-xs"
                      : "hover:bg-muted text-foreground",
                  )}
                >
                  {name.slice(0, 3)}
                </button>
              );
            })}
          </div>

          {/* Footer aksi cepat */}
          <div className="border-t border-border pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleSetCurrentMonth}
              className="text-sm text-primary hover:underline font-medium cursor-pointer"
            >
              Bulan Sekarang
            </button>
            <span className="text-[11px] text-muted-foreground">
              {tempYear}
            </span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
