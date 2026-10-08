"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "./data-table";
import { PenambahanColumns, PenguranganColumns } from "./columns";
import { useQuery } from "@tanstack/react-query";
import { PaginationState } from "@tanstack/react-table";
import instance from "@/lib/instance";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import TambahTransaksiDrawer from "./TambahTransaksi/TambahTransaksiDrawer";
import FilterTransaksiDialog from "./FilterTransaksi/filter-transaksi-dialog";
import { TransaksiFilter } from "@/types/transaksi";
import { IKategori } from "@/types/settings";

export default function BarangMasukKeluarSection() {
  const [activeTab, setActiveTab] = useState("penambahan");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState<TransaksiFilter>({});

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [isTambahDrawerOpen, setIsTambahDrawerOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  // Reset pagination on search change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [debouncedSearch]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearch("");
    setDebouncedSearch("");
    setFilters({});
    setPagination({ pageIndex: 0, pageSize: 10 });
  };

  // Fetch daftar kategori untuk filter
  const { data: kategoriData } = useQuery({
    queryKey: ["kategori-all"],
    queryFn: async () => {
      const res = await instance.get("/kategori", { params: { all: true } });
      return res.data?.data as IKategori[];
    },
    staleTime: 60_000,
  });

  const kategoriList = kategoriData ?? [];

  const { data: items, isLoading } = useQuery({
    queryKey: ["transaksi", activeTab, pagination, debouncedSearch, filters],
    queryFn: async () => {
      const endpoint =
        activeTab === "penambahan"
          ? "/transaksi/masuk"
          : "/transaksi/keluar";

      const response = await instance.get(endpoint, {
        params: {
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
          search: debouncedSearch,
          kategoriId: filters.kategoriId,
          startDate: filters.startDate,
          endDate: filters.endDate,
        },
      });

      return response?.data;
    },
  });

  const filterSlot = (
    <FilterTransaksiDialog
      kategoriList={kategoriList}
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
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 py-6 md:p-6 max-w-7xl w-full mx-auto">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">
                Barang Masuk &amp; Keluar
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Kelola dan pantau riwayat penambahan serta pengurangan stok
                barang.
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                size="lg"
                onClick={() => setIsTambahDrawerOpen(true)}
                className="flex items-center gap-2 cursor-pointer rounded-lg shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Transaksi</span>
              </Button>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="max-w-full"
          >
            <TabsList className="min-w-full md:min-w-110 h-10! lg:h-9!">
              <TabsTrigger
                value="penambahan"
                className="flex items-center gap-1.5"
              >
                Penambahan
              </TabsTrigger>
              <TabsTrigger
                value="pengurangan"
                className="flex items-center gap-1.5"
              >
                Pengurangan
              </TabsTrigger>
            </TabsList>

            <TabsContent value="penambahan">
              <DataTable
                columns={PenambahanColumns()}
                data={items?.data ?? []}
                isLoading={isLoading}
                searchPlaceholder="Cari nama barang ..."
                emptyMessage="Tidak ada data penambahan stok yang ditemukan."
                pagination={pagination}
                onPaginationChange={setPagination}
                rowCount={
                  items?.pagination?.totalTransaksiMasuk ??
                  items?.data?.length ??
                  0
                }
                globalFilter={search}
                onGlobalFilterChange={setSearch}
                filterSlot={filterSlot}
              />
            </TabsContent>

            <TabsContent value="pengurangan">
              <DataTable
                columns={PenguranganColumns()}
                data={items?.data ?? []}
                isLoading={isLoading}
                searchPlaceholder="Cari nama barang, kepada, atau tujuan..."
                emptyMessage="Tidak ada data pengurangan stok yang ditemukan."
                pagination={pagination}
                onPaginationChange={setPagination}
                rowCount={
                  items?.pagination?.totalTransaksiKeluar ??
                  items?.data?.length ??
                  0
                }
                globalFilter={search}
                onGlobalFilterChange={setSearch}
                filterSlot={filterSlot}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <TambahTransaksiDrawer
        open={isTambahDrawerOpen}
        onOpenChange={setIsTambahDrawerOpen}
      />
    </div>
  );
}
