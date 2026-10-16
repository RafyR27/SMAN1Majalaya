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
  type RowSelectionState,
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
import { ChevronLeft, ChevronRight, FileDown, Search, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Field } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

type DataTableProps<TData extends RowData> = {
  columns: LegacyColumnDef<TData>[];
  data: TData[];
  isLoading?: boolean;

  searchPlaceholder?: string;
  emptyMessage?: string;

  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;

  rowCount: number;

  globalFilter?: string;
  onGlobalFilterChange?: OnChangeFn<string>;

  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;

  selectBulanSlot?: React.ReactNode;
  filterSlot?: React.ReactNode;
  unduhCsvSlot?: React.ReactNode;

  onUnduhPdf?: () => void;
};

export function DataTable<TData extends RowData>({
  columns,
  data,
  isLoading = false,
  searchPlaceholder = "Cari nama barang...",
  emptyMessage = "Tidak ada data mutasi yang ditemukan.",
  pagination,
  onPaginationChange,
  rowCount,
  globalFilter = "",
  onGlobalFilterChange,
  rowSelection = {},
  onRowSelectionChange,
  selectBulanSlot,
  filterSlot,
  unduhCsvSlot,
  onUnduhPdf,
}: DataTableProps<TData>) {
  const effectiveRowCount = rowCount > 0 ? rowCount : data.length;

  const table = useLegacyTable<TData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => (row as { id: string }).id,
    manualPagination: true,
    manualFiltering: true,
    enableRowSelection: true,
    rowCount: effectiveRowCount,
    state: {
      pagination,
      globalFilter,
      rowSelection,
    },
    onPaginationChange,
    onGlobalFilterChange,
    onRowSelectionChange,
  });

  const searchValue = (table.getState().globalFilter as string) ?? "";
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;

  const start = effectiveRowCount === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, effectiveRowCount);
  const selectedCount = Object.keys(rowSelection).filter(
    (k) => rowSelection[k],
  ).length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Input Search */}
          <div className="relative w-full sm:max-w-xs">
            <Field>
              <InputGroup className="h-9.5">
                <InputGroupInput
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => table.setGlobalFilter(e.target.value)}
                />
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
                {searchValue && (
                  <InputGroupAddon align="inline-end">
                    <Button
                      size={"icon"}
                      variant={"ghost"}
                      type="button"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => table.setGlobalFilter("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </InputGroupAddon>
                )}
              </InputGroup>
            </Field>
          </div>

          {selectBulanSlot}
          {filterSlot}
        </div>

        {/* Selected rows info + Unduh PDF button & Unduh CSV button */}
        {selectedCount > 0 ? (
          <div className="flex items-center gap-2 shrink-0">
            {unduhCsvSlot}
            <Button
              onClick={onUnduhPdf}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
            >
              <FileDown className="h-4 w-4" />
              Unduh PDF
              <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold leading-none">
                {selectedCount}
              </span>
            </Button>
            <button
              type="button"
              onClick={() => onRowSelectionChange?.({})}
              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              Batal
            </button>
          </div>
        ) : (
          unduhCsvSlot && (
            <div className="flex items-center gap-2 shrink-0">
              {unduhCsvSlot}
            </div>
          )
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="font-semibold text-xs uppercase tracking-wider h-11 text-muted-foreground"
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
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-48 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Spinner className="h-6 w-6 text-primary" />
                      <span className="text-xs">Memuat data mutasi...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3">
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
                    className="h-40 text-center text-muted-foreground text-sm"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
        <div className="text-sm text-muted-foreground">
          Menampilkan{" "}
          <span className="font-medium text-foreground">{start}</span> -{" "}
          <span className="font-medium text-foreground">{end}</span> dari{" "}
          <span className="font-medium text-foreground">
            {effectiveRowCount}
          </span>{" "}
          barang
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
