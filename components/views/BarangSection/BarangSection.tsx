"use client";

import { useEffect, useState } from "react";
import { PaginationState } from "@tanstack/react-table";
import { DataTable } from "./data-table";
import { Columns } from "./columns";
import AddBarangDialog from "./AddBarang/Add-barang-dialog";
import ImportBarangDialog from "./ImportBarang/Import-barang-dialog";
import FilterBarangDialog from "./FilterBarang/filter-barang-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  RefreshCw, 
  ChevronDown, 
  FileSpreadsheet, 
  Plus 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import instance from "@/lib/instance";
import { BarangFilter } from "@/types/barang";

export default function BarangSectionView() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState<BarangFilter>({});

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearch]);

  // Filter dummy data by namaBarang
  const { data: items, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["items-barang", pagination, debouncedSearch, filters],
    queryFn: async () => {
      const response = await instance.get("/barang", {
        params: {
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
          search: debouncedSearch,
          rekeningId: filters.rekeningId,
          kategoriId: filters.kategoriId,
          startDate: filters.startDate,
          endDate: filters.endDate,
        },
      });

      return response?.data;
    },
  });

  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [isImportDrawerOpen, setIsImportDrawerOpen] = useState(false);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-6 p-4 py-6 md:p-6 max-w-7xl w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">Data Barang</h2>
              <p className="text-muted-foreground">
                Kelola data barang dan inventaris operasional sekolah.
              </p>
            </div>

            <DropdownMenu>
              <div className="flex justify-end">
                <DropdownMenuTrigger
                  render={
                    <Button
                      size="lg"
                      className="min-w-52 md:min-w-full flex items-center gap-2"
                      disabled={isError}
                    >
                      <span>Tambah Barang</span>
                      <ChevronDown />
                    </Button>
                  }
                />
              </div>
              <DropdownMenuContent
                className="w-52 p-1.5 shadow-md rounded-xl"
                align="end"
              >
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="flex items-center gap-2.5 cursor-pointer py-2 px-2.5 rounded-lg text-sm"
                    onClick={() => setIsAddDrawerOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    <div className="flex flex-col text-left">
                      <span className="font-medium text-foreground">
                        Input Manual
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Tambah 1 s/d 5 barang
                      </span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1" />

                  <DropdownMenuItem
                    className="flex items-center gap-2.5 cursor-pointer py-2 px-2.5 rounded-lg text-sm"
                    onClick={() => setIsImportDrawerOpen(true)}
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    <div className="flex flex-col text-left">
                      <span className="font-medium text-foreground">
                        Import dari CSV
                      </span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <AddBarangDialog
              open={isAddDrawerOpen}
              onOpenChange={setIsAddDrawerOpen}
              rekeningList={items?.data.rekeningList}
              kategoriList={items?.data.kategoriList}
              satuanList={items?.data.satuanList}
            />

            <ImportBarangDialog
              open={isImportDrawerOpen}
              onOpenChange={setIsImportDrawerOpen}
              rekeningList={items?.data.rekeningList}
              kategoriList={items?.data.kategoriList}
              satuanList={items?.data.satuanList}
            />
          </div>

          {/* Data Table */}
          {isError ? (
            <div className="border border-border/80 rounded-xl bg-card p-8 flex flex-col items-center justify-center text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-base">Gagal Memuat Data Barang</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Terjadi gangguan koneksi ke server. Pastikan sesi login Anda masih aktif.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="mt-2 gap-2 cursor-pointer"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                <span>{isFetching ? "Mencoba lagi..." : "Coba Lagi"}</span>
              </Button>
            </div>
          ) : (
            <DataTable
              columns={Columns(pagination.pageIndex, pagination.pageSize, {
                rekeningList: items?.data?.rekeningList ?? [],
                kategoriList: items?.data?.kategoriList ?? [],
                satuanList: items?.data?.satuanList ?? [],
              })}
              data={items?.data?.barangList ?? []}
              isLoading={isLoading}
              pagination={pagination}
              onPaginationChange={setPagination}
              rowCount={items?.pagination?.totalBarang ?? items?.data?.barangList?.length ?? 0}
              globalFilter={search}
              onGlobalFilterChange={setSearch}
              searchPlaceholder="Cari nama barang..."
              emptyMessage="Tidak ada data barang yang ditemukan."
              filterSlot={
                <FilterBarangDialog
                  rekeningList={items?.data?.rekeningList ?? []}
                  kategoriList={items?.data?.kategoriList ?? []}
                  currentFilters={filters}
                  onApplyFilters={(newFilters) => {
                    setFilters(newFilters);
                    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                  }}
                  onResetFilters={() => {
                    setFilters({});
                    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                  }}
                  isLoading={isLoading}
                />
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
