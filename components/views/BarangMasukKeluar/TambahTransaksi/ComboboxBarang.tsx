"use client";
import { useQuery } from "@tanstack/react-query";
import { ChevronsUpDownIcon, CheckIcon, SearchIcon, XIcon } from "lucide-react";
import { cn } from "cn";
import instance from "@/lib/instance";
import { useEffect, useMemo, useRef, useState } from "react";

export interface BarangOption {
  id: string;
  namaBarang: string;
  merk?: string | null;
  harga: number;
  stok: number;
  sumber?: string | null;
  rekening: { id: string; kodeRekening: string };
  kategori: { id: string; kategori: string };
  satuan: { id: string; satuan: string };
}

interface ComboboxBarangProps {
  id?: string;
  value: string; // barangId
  onChange: (barang: BarangOption | null) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ComboboxBarang({
  id,
  value,
  onChange,
  disabled = false,
  placeholder = "Pilih nama barang...",
  className,
}: ComboboxBarangProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: allBarang = [] } = useQuery({
    queryKey: ["barang-all"],
    queryFn: async () => {
      const res = await instance.get("/barang", { params: { all: true } });
      return res.data?.data as BarangOption[];
    },
    staleTime: 60_000,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allBarang;
    return allBarang.filter(
      (b) =>
        b.namaBarang.toLowerCase().includes(q) ||
        (b.merk ?? "").toLowerCase().includes(q),
    );
  }, [allBarang, search]);

  const selected = allBarang.find((b) => b.id === value);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus search on open
  useEffect(() => {
    if (open) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearch("");
    }
  }, [open]);

  const handleSelect = (barang: BarangOption) => {
    onChange(barang);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div
        id={id}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={() => !disabled && setOpen((p) => !p)}
        onKeyDown={(e) => {
          if (disabled) return;

          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((p) => !p);
          }
        }}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground shadow-xs transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-left font-normal cursor-pointer",
          !selected && "text-muted-foreground",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <span
          className={cn(
            "truncate flex-1",
            !selected && "text-muted-foreground",
          )}
        >
          {selected ? selected.namaBarang : placeholder}
        </span>

        <div className="flex items-center gap-1 shrink-0 ml-1">
          {selected && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear(e);
              }}
              className="text-muted-foreground hover:text-foreground rounded p-0.5 cursor-pointer"
            >
              <XIcon className="h-3 w-3" />
            </button>
          )}

          <ChevronsUpDownIcon className="h-3.5 w-3.5 opacity-50 text-muted-foreground" />
        </div>
      </div>

      {open && (
        <div className="absolute top-full left-0 z-70 mt-1.5 w-full min-w-68 max-w-104 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-xl animate-in fade-in-0 zoom-in-95">
          {/* Search */}
          <div className="flex items-center border-b border-border/80 px-2.5 py-2 bg-muted/20">
            <SearchIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground mr-2" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Cari nama barang atau merk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-muted-foreground hover:text-foreground rounded p-0.5 ml-1 cursor-pointer"
              >
                <XIcon className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
            {filtered.length === 0 ? (
              <div className="py-4 text-center text-xs text-muted-foreground">
                Barang tidak ditemukan
              </div>
            ) : (
              filtered.map((barang) => {
                const isSelected = barang.id === value;
                return (
                  <button
                    key={barang.id}
                    type="button"
                    onClick={() => handleSelect(barang)}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer",
                      isSelected
                        ? "bg-primary/15 font-medium"
                        : "hover:bg-muted text-foreground",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate leading-tight text-[0.8rem] font-medium">
                        {barang.namaBarang}
                      </p>
                      {barang.merk && (
                        <p className="text-[0.72rem] text-muted-foreground truncate">
                          {barang.merk}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 flex items-center gap-0.5">
                      <span
                        className={cn(
                          "text-[0.7rem] font-medium px-1.5 py-0.5 rounded-full",
                          barang.stok > 0
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                            : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400",
                        )}
                      >
                        Stok: {barang.stok} {barang.satuan.satuan}
                      </span>
                      {isSelected && (
                        <CheckIcon className="h-3.5 w-3.5 text-primary ml-1" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
