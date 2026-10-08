"use client";

import { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Barang, EditBarang } from "@/types/barang";
import { formatDate } from "@/lib/date-formatted";
import { useState } from "react";
import EditBarangDialog from "./EditBarang/edit-barang-dialog";
import DeleteBarangDialog from "./DeleteBarang/delete-barang-dialog";
import { IKategori, IKodeRekening, ISatuan } from "@/types/settings";
import { formatRupiah } from "@/lib/rupiah-foramatted";

interface ColumnsOptions {
  rekeningList: IKodeRekening[];
  kategoriList: IKategori[];
  satuanList: ISatuan[];
}

export const Columns = (
  pageIndex: number = 0,
  pageSize: number = 5,
  options?: ColumnsOptions,
): LegacyColumnDef<Barang, unknown>[] => [
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
    id: "kodeRekening",
    header: () => <div>Kode Rekening</div>,
    accessorFn: (row) => row.rekening.kodeRekening,
    cell: ({ row }) => {
      return (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.rekening.kodeRekening}
        </span>
      );
    },
  },
  {
    id: "kategori",
    header: () => <div className="max-w-50 truncate">Kategori</div>,
    accessorFn: (row) => row.kategori.kategori,
    cell: ({ row }) => {
      return (
        <span className="text-foreground max-w-50 truncate block">
          {row.original.kategori.kategori}
        </span>
      );
    },
  },
  {
    id: "satuan",
    header: () => <div>Satuan</div>,
    accessorFn: (row) => row.satuan.satuan,
    cell: ({ row }) => {
      return (
        <span className="text-muted-foreground">
          {row.original.satuan.satuan}
        </span>
      );
    },
  },
  {
    id: "merk",
    header: () => <div>Merk</div>,
    accessorFn: (row) => row.merk,
    cell: ({ row }) => {
      return (
        <span className="text-foreground">
          {row.original.merk === "" ? "-" : row.original.merk}
        </span>
      );
    },
  },
  {
    id: "sumber",
    header: () => <div>Sumber</div>,
    accessorFn: (row) => row.sumber,
    cell: ({ row }) => {
      return (
        <span className="text-foreground">
          {row.original.sumber === "" ? "-" : row.original.sumber}
        </span>
      );
    },
  },
  {
    id: "hargaSatuan",
    header: () => <div>Harga Satuan</div>,
    accessorFn: (row) => row.harga,
    cell: ({ row }) => {
      const formatted = formatRupiah(row.original.harga)

      return <span className="font-medium text-foreground">{formatted}</span>;
    },
  },
  {
    id: "tanggal",
    header: () => <div>Tanggal</div>,
    accessorFn: (row) => row.tanggal,
    cell: ({ row }) => {
      return (
        <span className="font-medium text-foreground">
          {formatDate(row.original.tanggal)}
        </span>
      );
    },
  },
  {
    id: "stokSaatIni",
    header: () => <div>Stok Saat Ini</div>,
    accessorFn: (row) => row.stok,
    cell: ({ row }) => {
      return (
        <span className="font-medium text-foreground">{row.original.stok}</span>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Aksi</div>,
    cell: ({ row }) => {
      return (
        <div className="flex justify-center min-w-20">
          <BarangActions
            barang={row.original as unknown as EditBarang}
            options={options}
          />
        </div>
      );
    },
  },
];

const BarangActions = ({
  barang,
  options,
}: {
  barang: EditBarang;
  options?: ColumnsOptions;
}) => {
  const [editOpen, setEditOpen] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState<EditBarang | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedDeleteBarang, setSelectedDeleteBarang] =
    useState<EditBarang | null>(null);

  const handleEdit = () => {
    setSelectedBarang(barang);
    setEditOpen(true);
  };

  const handleDelete = () => {
    setSelectedDeleteBarang(barang);
    setDeleteOpen(true);
  };

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
              onClick={handleEdit}
            >
              Edit
              <Pencil className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="flex cursor-pointer justify-between text-destructive focus:text-destructive"
              variant="destructive"
              onClick={handleDelete}
            >
              Hapus
              <Trash className="h-4 w-4" />
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedBarang && (
        <EditBarangDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          barang={selectedBarang}
          rekeningList={options?.rekeningList ?? []}
          kategoriList={options?.kategoriList ?? []}
          satuanList={options?.satuanList ?? []}
        />
      )}

      <DeleteBarangDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        barang={selectedDeleteBarang}
      />
    </>
  );
};
