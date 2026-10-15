"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "./data-table";
import { KategoriColumns, KodeRekeningColumns, SatuanColumns } from "./columns";
import { useQuery } from "@tanstack/react-query";
import { PaginationState } from "@tanstack/react-table";
import instance from "@/lib/instance";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddItemDialog, { ItemType } from "./AddItem/AddItemDialog";

export default function SettingsSection() {
  const [activeTab, setActiveTab] = useState("kodeRekening");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

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

  const { data: items, isLoading } = useQuery({
    queryKey: ["items-setting", pagination, debouncedSearch, activeTab],
    queryFn: async () => {
      let response;

      if (activeTab === "kodeRekening") {
        response = await instance.get("/rekening", {
          params: {
            pageIndex: pagination.pageIndex,
            pageSize: pagination.pageSize,
            search: debouncedSearch,
          },
        });
      } else if (activeTab === "kategori") {
        response = await instance.get("/kategori", {
          params: {
            pageIndex: pagination.pageIndex,
            pageSize: pagination.pageSize,
            search: debouncedSearch,
          },
        });
      } else if (activeTab === "satuan") {
        response = await instance.get("/satuan", {
          params: {
            pageIndex: pagination.pageIndex,
            pageSize: pagination.pageSize,
            search: debouncedSearch,
          },
        });
      }

      return response?.data;
    },
  });

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 p-4 py-6 md:p-6 max-w-7xl w-full mx-auto">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">Pengaturan</h2>
              <p className="text-muted-foreground">
                Kelola data Kode Rekening, Satuan, dan Kategori barang.
              </p>
            </div>

            <Button
              size="lg"
              className="flex items-center gap-2 rounded-lg shadow-xs cursor-pointer"
              onClick={() => setIsAddOpen(true)}
            >
              <Plus />
              <span>Tambah Data</span>
            </Button>

            <AddItemDialog
              open={isAddOpen}
              onOpenChange={setIsAddOpen}
              activeType={activeTab as ItemType}
            />
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="max-w-full"
          >
            <TabsList className="min-w-full md:min-w-110 h-10! lg:h-9!">
              <TabsTrigger value="kodeRekening">Kode Rekening</TabsTrigger>
              <TabsTrigger value="satuan">Satuan</TabsTrigger>
              <TabsTrigger value="kategori">Kategori</TabsTrigger>
            </TabsList>
            <TabsContent value="kodeRekening">
              <DataTable
                columns={KodeRekeningColumns(
                  pagination.pageIndex,
                  pagination.pageSize,
                )}
                data={items?.data ?? []}
                isLoading={isLoading}
                searchPlaceholder="Cari kode rekening..."
                emptyMessage="Tidak ada kode rekening yang ditemukan."
                pagination={pagination}
                onPaginationChange={setPagination}
                rowCount={
                  items?.pagination?.totalRekening ?? items?.data?.length ?? 0
                }
                globalFilter={search}
                onGlobalFilterChange={setSearch}
              />
            </TabsContent>
            <TabsContent value="kategori">
              <DataTable
                columns={KategoriColumns(
                  pagination.pageIndex,
                  pagination.pageSize,
                )}
                data={items?.data ?? []}
                isLoading={isLoading}
                searchPlaceholder="Cari kategori..."
                emptyMessage="Tidak ada data kategori yang ditemukan."
                pagination={pagination}
                onPaginationChange={setPagination}
                rowCount={
                  items?.pagination?.totalKategori ?? items?.data?.length ?? 0
                }
                globalFilter={search}
                onGlobalFilterChange={setSearch}
              />
            </TabsContent>
            <TabsContent value="satuan">
              <DataTable
                columns={SatuanColumns(
                  pagination.pageIndex,
                  pagination.pageSize,
                )}
                data={items?.data ?? []}
                isLoading={isLoading}
                searchPlaceholder="Cari satuan..."
                emptyMessage="Tidak ada data satuan yang ditemukan."
                pagination={pagination}
                onPaginationChange={setPagination}
                rowCount={
                  items?.pagination?.totalSatuan ?? items?.data?.length ?? 0
                }
                globalFilter={search}
                onGlobalFilterChange={setSearch}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
