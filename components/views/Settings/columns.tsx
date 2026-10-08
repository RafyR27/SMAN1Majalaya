"use client";

import { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { IKategori, IKodeRekening, ISatuan } from "@/types/settings";
import { formatDate } from "@/lib/date-formatted";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import EditItemDialog from "./EditItem/EditItemDialog";
import DeleteItemDialog from "./DeleteItem/DeleteItemDialog";
import { ItemType } from "./AddItem/AddItemDialog";

// ─── Action Cell Component ──────────────────────────────────────────

function SettingsActionCell<T extends IKodeRekening | ISatuan | IKategori>({
  item,
  activeType,
}: {
  item: T;
  activeType: ItemType;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
              <span className="sr-only">Buka menu aksi</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          }
        />

        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="flex cursor-pointer justify-between"
              onClick={() => setEditOpen(true)}
            >
              Edit
              <Pencil className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="flex cursor-pointer justify-between text-destructive focus:text-destructive"
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
            >
              Hapus
              <Trash className="h-4 w-4" />
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditItemDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        activeType={activeType}
        item={item}
      />

      <DeleteItemDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        activeType={activeType}
        item={item}
      />
    </>
  );
}

// ─── Kode Rekening Columns ──────────────────────────────────────────

export const KodeRekeningColumns = (
  pageIndex: number = 0,
  pageSize: number = 5,
): LegacyColumnDef<IKodeRekening, unknown>[] => [
  {
    id: "no",
    header: () => <div className="w-10">No</div>,
    cell: ({ row }) => {
      return (
        <span className="text-muted-foreground font-medium">
          {pageIndex * pageSize + row.index + 1}
        </span>
      );
    },
  },
  {
    id: "kodeRekening",
    header: () => <div>Kode Rekening</div>,
    accessorFn: (row) => `${row.kodeRekening}`,
    filterFn: "includesString",
    cell: ({ row }) => {
      const kodeRekening = row.original.kodeRekening;

      return <p className="font-medium text-foreground">{kodeRekening}</p>;
    },
  },
  {
    id: "createdAt",
    header: () => <div>Dibuat</div>,
    cell: ({ row }) => {
      const Dibuat = row.original.createdAt;

      return <p className="text-muted-foreground">{formatDate(Dibuat)}</p>;
    },
  },
  {
    id: "updatedAt",
    header: () => <div>Diubah</div>,
    cell: ({ row }) => {
      const Diubah = row.original.updatedAt;

      return <p className="text-muted-foreground">{formatDate(Diubah)}</p>;
    },
  },
  {
    id: "actions",
    header: () => <div>Aksi</div>,
    cell: ({ row }) => {
      return (
        <SettingsActionCell
          item={row.original}
          activeType="kodeRekening"
        />
      );
    },
  },
];

// ─── Satuan Columns ─────────────────────────────────────────────────

export const SatuanColumns = (
  pageIndex: number = 0,
  pageSize: number = 5,
): LegacyColumnDef<ISatuan, unknown>[] => [
  {
    id: "no",
    header: () => <div className="w-10">No</div>,
    cell: ({ row }) => {
      return (
        <span className="text-muted-foreground font-medium">
          {pageIndex * pageSize + row.index + 1}
        </span>
      );
    },
  },
  {
    id: "satuan",
    header: () => <div>Nilai Satuan</div>,
    accessorFn: (row) => `${row.satuan}`,
    filterFn: "includesString",
    cell: ({ row }) => {
      const satuan = row.original.satuan;

      return <p className="font-medium text-foreground">{satuan}</p>;
    },
  },
  {
    id: "createdAt",
    header: () => <div>Dibuat</div>,
    cell: ({ row }) => {
      const Dibuat = row.original.createdAt;

      return <p className="text-muted-foreground">{formatDate(Dibuat)}</p>;
    },
  },
  {
    id: "updatedAt",
    header: () => <div>Diubah</div>,
    cell: ({ row }) => {
      const Diubah = row.original.updatedAt;

      return <p className="text-muted-foreground">{formatDate(Diubah)}</p>;
    },
  },
  {
    id: "actions",
    header: () => <div>Aksi</div>,
    cell: ({ row }) => {
      return (
        <SettingsActionCell
          item={row.original}
          activeType="satuan"
        />
      );
    },
  },
];

// ─── Kategori Columns ───────────────────────────────────────────────

export const KategoriColumns = (
  pageIndex: number = 0,
  pageSize: number = 5,
): LegacyColumnDef<IKategori, unknown>[] => [
  {
    id: "no",
    header: () => <div className="w-10">No</div>,
    cell: ({ row }) => {
      return (
        <span className="text-muted-foreground font-medium">
          {pageIndex * pageSize + row.index + 1}
        </span>
      );
    },
  },
  {
    id: "kategori",
    header: () => <div>Nama Kategori</div>,
    accessorFn: (row) => `${row.kategori}`,
    filterFn: "includesString",
    cell: ({ row }) => {
      const kategori = row.original.kategori;

      return <p className="font-medium text-foreground">{kategori}</p>;
    },
  },
  {
    id: "createdAt",
    header: () => <div>Dibuat</div>,
    cell: ({ row }) => {
      const Dibuat = row.original.createdAt;

      return <p className="text-muted-foreground">{formatDate(Dibuat)}</p>;
    },
  },
  {
    id: "updatedAt",
    header: () => <div>Diubah</div>,
    cell: ({ row }) => {
      const Diubah = row.original.updatedAt;

      return <p className="text-muted-foreground">{formatDate(Diubah)}</p>;
    },
  },
  {
    id: "actions",
    header: () => <div>Aksi</div>,
    cell: ({ row }) => {
      return (
        <SettingsActionCell
          item={row.original}
          activeType="kategori"
        />
      );
    },
  },
];

// Fallback default columns
export const columns = KodeRekeningColumns;
