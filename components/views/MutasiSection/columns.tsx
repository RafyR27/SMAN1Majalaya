"use client";

import { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { Checkbox } from "@/components/ui/checkbox";
import { MutasiItem } from "@/types/mutasi";
import Link from "next/link";
import { FileText } from "lucide-react";

export const Columns = (
  pageIndex: number = 0,
  pageSize: number = 10,
  bulan?: number,
  tahun?: number,
): LegacyColumnDef<MutasiItem, unknown>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center px-1">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomePageRowsSelected()
              ? "indeterminate"
              : false
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Pilih semua baris"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center px-1">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Pilih baris"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "namaBarang",
    header: () => <div>Nama Barang</div>,
    accessorFn: (row) => row.namaBarang,
    cell: ({ row }) => {
      return (
        <p className="font-medium text-foreground">{row.original.namaBarang}</p>
      );
    },
  },
  {
    id: "kategori",
    header: () => <div className="max-w-44 truncate">Kategori</div>,
    accessorFn: (row) => row.kategori,
    cell: ({ row }) => {
      return (
        <span className="text-foreground max-w-44 truncate block text-sm">
          {row.original.kategori}
        </span>
      );
    },
  },
  {
    id: "kodeRekening",
    header: () => <div>Kode Rekening</div>,
    accessorFn: (row) => row.kodeRekening,
    cell: ({ row }) => {
      return (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.kodeRekening}
        </span>
      );
    },
  },
  {
    id: "satuan",
    header: () => <div>Satuan</div>,
    accessorFn: (row) => row.satuan,
    cell: ({ row }) => {
      return (
        <span className="text-muted-foreground text-sm">
          {row.original.satuan}
        </span>
      );
    },
  },
  {
    id: "saldoAwal",
    header: () => <div className="text-right">Saldo Awal</div>,
    accessorFn: (row) => row.saldoAwal,
    cell: ({ row }) => {
      return (
        <div className="text-right font-medium tabular-nums text-foreground">
          {row.original.saldoAwal.toLocaleString("id-ID")}
        </div>
      );
    },
  },
  {
    id: "masuk",
    header: () => <div className="text-right">Masuk</div>,
    accessorFn: (row) => row.masuk,
    cell: ({ row }) => {
      const masuk = row.original.masuk;
      return (
        <div className="text-right tabular-nums">
          {masuk > 0 ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              +{masuk.toLocaleString("id-ID")}
            </span>
          ) : (
            <span className="text-muted-foreground">0</span>
          )}
        </div>
      );
    },
  },
  {
    id: "keluar",
    header: () => <div className="text-right">Keluar</div>,
    accessorFn: (row) => row.keluar,
    cell: ({ row }) => {
      const keluar = row.original.keluar;
      return (
        <div className="text-right tabular-nums">
          {keluar > 0 ? (
            <span className="text-rose-600 dark:text-rose-400 font-semibold">
              -{keluar.toLocaleString("id-ID")}
            </span>
          ) : (
            <span className="text-muted-foreground">0</span>
          )}
        </div>
      );
    },
  },
  {
    id: "saldoAkhir",
    header: () => <div className="text-right">Saldo Akhir</div>,
    accessorFn: (row) => row.saldoAkhir,
    cell: ({ row }) => {
      return (
        <div className="text-right font-bold tabular-nums text-foreground">
          {row.original.saldoAkhir.toLocaleString("id-ID")}
        </div>
      );
    },
  },
  {
    id: "aksi",
    header: () => <div className="text-center">Aksi</div>,
    cell: ({ row }) => {
      const b = bulan ?? new Date().getMonth() + 1;
      const t = tahun ?? new Date().getFullYear();
      return (
        <div className="flex items-center justify-center">
          <Link
            href={`/mutasi/kartu-persediaan?barangId=${row.original.id}&bulan=${b}&tahun=${t}`}
            className="inline-flex items-center justify-center rounded-lg h-7 px-2 text-xs font-medium text-primary hover:bg-primary/10 gap-1.5 transition-colors"
            title="Cetak Kartu Persediaan Barang"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Kartu Stok</span>
          </Link>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
