"use client";

import { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { ITransaksiMasuk, ITransaksiKeluar } from "@/types/transaksi";
import { formatDate } from "@/lib/date-formatted";
import { formatRupiah } from "@/lib/rupiah-foramatted";
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
import { useState } from "react";
import EditTransaksiMasukDrawer from "./EditBarang/edit-transaksi-masuk-drawer";
import EditTransaksiKeluarDrawer from "./EditBarang/edit-transaksi-keluar-drawer";
import DeleteTransaksiDialog from "./DeleteBarang/delete-transaksi-dialog";

// ─── Transaksi Masuk Columns ─────────────────────────────────────────────────

export const PenambahanColumns = (): LegacyColumnDef<ITransaksiMasuk, unknown>[] => [
  {
    id: "tanggal",
    header: () => <div>Tanggal</div>,
    accessorFn: (row) => row.createdAt,
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm whitespace-nowrap">
        {formatDate(row.original.createdAt)}
      </span>
    ),
  },
  {
    id: "namaBarang",
    header: () => <div>Nama Barang</div>,
    accessorFn: (row) => row.barang.namaBarang,
    filterFn: "includesString",
    cell: ({ row }) => {
      const { namaBarang, rekening } = row.original.barang;
      return (
        <div className="flex flex-col gap-0.5">
          <p className="font-medium text-foreground">{namaBarang}</p>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              {rekening.kodeRekening}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    id: "kategori",
    header: () => <div>Kategori</div>,
    accessorFn: (row) => row.barang.kategori,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground block max-w-40 truncate">
        {row.original.barang.kategori.kategori}
      </span>
    ),
  },
  {
    id: "volume",
    header: () => <div>Volume</div>,
    accessorFn: (row) => row.jumlah,
    cell: ({ row }) => (
      <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
        +{row.original.jumlah}
      </span>
    ),
  },
  {
    id: "satuan",
    header: () => <div>Satuan</div>,
    accessorFn: (row) => row.barang.satuan.satuan,
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.barang.satuan.satuan}
      </span>
    ),
  },
  {
    id: "hargaSatuan",
    header: () => <div>Harga Satuan</div>,
    accessorFn: (row) => row.hargaSatuan,
    cell: ({ row }) => (
      <span className="font-medium text-foreground tabular-nums whitespace-nowrap">
        {formatRupiah(row.original.hargaSatuan)}
      </span>
    ),
  },
  {
    id: "jumlah",
    header: () => <div>Jumlah</div>,
    accessorFn: (row) => row.total,
    cell: ({ row }) => (
      <span className="font-semibold text-foreground tabular-nums whitespace-nowrap">
        {formatRupiah(row.original.total)}
      </span>
    ),
  },
  {
    id: "merk",
    header: () => <div>Merk</div>,
    accessorFn: (row) => row.barang.merk,
    cell: ({ row }) => {
      const merk = row.original.barang.merk;
      return (
        <span className="text-muted-foreground block max-w-40 truncate">
          {merk && merk.trim() !== "" ? merk : "-"}
        </span>
      );
    },
  },
  {
    id: "sumber",
    header: () => <div>Sumber</div>,
    accessorFn: (row) => row.sumber,
    cell: ({ row }) => {
      const sumber = row.original.sumber;
      return (
        <span className="text-muted-foreground block max-w-40 truncate">
          {sumber && sumber.trim() !== "" ? sumber : "-"}
        </span>
      );
    },
  },
  {
    id: "oleh",
    header: () => <div>Diserahkan Oleh</div>,
    accessorFn: (row) => row.oleh,
    cell: ({ row }) => {
      const oleh = row.original.oleh;
      return (
        <span className="text-muted-foreground block max-w-40 truncate">
          {oleh && oleh.trim() !== "" ? oleh : "-"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Aksi</div>,
    cell: ({ row }) => (
      <div className="flex justify-center min-w-20">
        <PenambahanActions transaksi={row.original} />
      </div>
    ),
  },
];

// ─── Transaksi Keluar Columns ─────────────────────────────────────────────────

export const PenguranganColumns = (): LegacyColumnDef<ITransaksiKeluar, unknown>[] => [
  {
    id: "tanggal",
    header: () => <div>Tanggal</div>,
    accessorFn: (row) => row.createdAt,
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm whitespace-nowrap">
        {formatDate(row.original.createdAt)}
      </span>
    ),
  },
  {
    id: "namaBarang",
    header: () => <div>Nama Barang</div>,
    accessorFn: (row) => row.barang.namaBarang,
    filterFn: "includesString",
    cell: ({ row }) => {
      const { namaBarang, rekening } = row.original.barang;
      return (
        <div className="flex flex-col gap-0.5">
          <p className="font-medium text-foreground">{namaBarang}</p>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              {rekening.kodeRekening}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    id: "kategori",
    header: () => <div>Kategori</div>,
    accessorFn: (row) => row.barang.kategori,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground block max-w-40 truncate">
        {row.original.barang.kategori.kategori}
      </span>
    ),
  },
  {
    id: "volume",
    header: () => <div>Volume</div>,
    accessorFn: (row) => row.jumlah,
    cell: ({ row }) => (
      <span className="font-semibold tabular-nums text-rose-600 dark:text-rose-400">
        -{row.original.jumlah}
      </span>
    ),
  },
  {
    id: "satuan",
    header: () => <div>Satuan</div>,
    accessorFn: (row) => row.barang.satuan.satuan,
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.barang.satuan.satuan}
      </span>
    ),
  },
  {
    id: "kepada",
    header: () => <div>Diberikan Kepada</div>,
    accessorFn: (row) => row.kepada,
    cell: ({ row }) => {
      const kepada = row.original.kepada;
      return (
        <span className="text-muted-foreground">
          {kepada && kepada.trim() !== "" ? kepada : "-"}
        </span>
      );
    },
  },
  {
    id: "tujuan",
    header: () => <div>Tujuan</div>,
    accessorFn: (row) => row.tujuan,
    cell: ({ row }) => {
      const tujuan = row.original.tujuan;
      return (
        <span className="text-muted-foreground max-w-52 truncate block">
          {tujuan && tujuan.trim() !== "" ? tujuan : "-"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Aksi</div>,
    cell: ({ row }) => (
      <div className="flex justify-center min-w-20">
        <PenguranganActions transaksi={row.original} />
      </div>
    ),
  },
];

// ─── Action Components ────────────────────────────────────────────────────────

const PenambahanActions = ({
  transaksi,
}: {
  transaksi: ITransaksiMasuk;
}) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] =
    useState<ITransaksiMasuk | null>(null);

  const handleEdit = () => {
    setSelectedTransaksi(transaksi);
    setEditOpen(true);
  };

  const handleDelete = () => {
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

      {selectedTransaksi && (
        <EditTransaksiMasukDrawer
          open={editOpen}
          onOpenChange={setEditOpen}
          transaksi={selectedTransaksi}
        />
      )}

      <DeleteTransaksiDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        transaksi={deleteOpen ? { type: "masuk", data: transaksi } : null}
      />
    </>
  );
};

const PenguranganActions = ({
  transaksi,
}: {
  transaksi: ITransaksiKeluar;
}) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] =
    useState<ITransaksiKeluar | null>(null);

  const handleEdit = () => {
    setSelectedTransaksi(transaksi);
    setEditOpen(true);
  };

  const handleDelete = () => {
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

      {selectedTransaksi && (
        <EditTransaksiKeluarDrawer
          open={editOpen}
          onOpenChange={setEditOpen}
          transaksi={selectedTransaksi}
        />
      )}

      <DeleteTransaksiDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        transaksi={deleteOpen ? { type: "keluar", data: transaksi } : null}
      />
    </>
  );
};
