"use client";

import {
  LegacyColumnDef,
  getCoreRowModel,
  useLegacyTable,
} from "@tanstack/react-table/legacy";
import { flexRender } from "@tanstack/react-table";
import {
  type OnChangeFn,
  type PaginationState,
  type RowData,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type DataTableProps<TData extends RowData> = {
  columns: LegacyColumnDef<TData>[];
  data: TData[];

  searchPlaceholder?: string;
  emptyMessage?: string;

  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;

  rowCount: number;

  globalFilter?: string;
  onGlobalFilterChange?: OnChangeFn<string>;
};

export function DataTable<TData extends RowData>({
  columns,
  data,
  searchPlaceholder = "Cari nama atau email...",
  emptyMessage = "Tidak ada data yang ditemukan.",
  pagination,
  onPaginationChange,
  rowCount,
  globalFilter = "",
  onGlobalFilterChange,
}: DataTableProps<TData>) {
  const table = useLegacyTable<TData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
    rowCount,
    state: {
      pagination,
      globalFilter,
    },
    onPaginationChange,
    onGlobalFilterChange,
  });

  const searchValue = (table.getState().globalFilter as string) ?? "";

  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;

  const start = rowCount === 0 ? 0 : pageIndex * pageSize + 1;

  const end = Math.min((pageIndex + 1) * pageSize, rowCount);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pb-4">
        <div className="relative w-full sm:max-w-sm">
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            className="py-4.5 rounded-lg"
          />
          {searchValue && (
            <button
              type="button"
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              onClick={() => table.setGlobalFilter("")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="font-semibold text-xs uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
        <div className="text-sm text-muted-foreground">
          Menampilkan <span className="font-medium">{start}</span> -{" "}
          <span className="font-medium">{end}</span> dari{" "}
          <span className="font-medium">{rowCount}</span> barang
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            Halaman {pageIndex + 1} / {table.getPageCount() || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
