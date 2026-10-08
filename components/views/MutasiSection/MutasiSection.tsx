"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PaginationState, RowSelectionState } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import instance from "@/lib/instance";
import { DataTable } from "./data-table";
import { Columns } from "./columns";
import FilterMutasiDialog from "./FilterMutasi/filter-mutasi-dialog";
import SelectBulan from "./SelectBulan/select-bulan";
import { MutasiApiResponse, MutasiFilter } from "@/types/mutasi";

export default function MutasiSectionView() {
  const now = new Date();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [bulan, setBulan] = useState(now.getMonth() + 1);
  const [tahun, setTahun] = useState(now.getFullYear());
  const [filters, setFilters] = useState<MutasiFilter>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

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
  }, [debouncedSearch, bulan, tahun, filters]);

  // Reset row selection when page, month, or search changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRowSelection({});
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearch,
    bulan,
    tahun,
    filters,
  ]);

  const { data: response, isLoading } = useQuery<MutasiApiResponse>({
    queryKey: [
      "mutasi-barang",
      pagination.pageIndex,
      pagination.pageSize,
      debouncedSearch,
      bulan,
      tahun,
      filters,
    ],
    queryFn: async () => {
      const res = await instance.get("/mutasi", {
        params: {
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
          search: debouncedSearch,
          bulan,
          tahun,
          rekeningId: filters.rekeningId,
          kategoriId: filters.kategoriId,
        },
      });

      return res?.data;
    },
  });

  // Handler navigasi ke halaman cetak PDF
  const handleUnduhPdf = () => {
    const selectedIds = Object.keys(rowSelection).filter(
      (k) => rowSelection[k],
    );
    const params = new URLSearchParams({
      bulan: String(bulan),
      tahun: String(tahun),
      ...(selectedIds.length > 0 && { ids: selectedIds.join(",") }),
    });
    router.push(`/mutasi/unduh-pdf?${params.toString()}`);
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-6 p-4 py-6 md:p-6 max-w-7xl w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">
                Laporan Mutasi Barang
              </h2>
              <p className="text-sm text-muted-foreground">
                Rekapitulasi pergerakan persediaan barang, saldo awal, barang
                masuk, barang keluar, dan saldo akhir.
              </p>
            </div>
          </div>

          {/* Data Table */}
          <DataTable
            columns={Columns(pagination.pageIndex, pagination.pageSize)}
            data={response?.data?.mutasiList ?? []}
            isLoading={isLoading}
            pagination={pagination}
            onPaginationChange={setPagination}
            rowCount={
              response?.pagination?.totalItems ??
              response?.data?.mutasiList?.length ??
              0
            }
            globalFilter={search}
            onGlobalFilterChange={setSearch}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            searchPlaceholder="Cari nama barang..."
            emptyMessage="Tidak ada data mutasi barang pada periode yang dipilih."
            onUnduhPdf={handleUnduhPdf}
            selectBulanSlot={
              <SelectBulan
                bulan={bulan}
                tahun={tahun}
                onChange={(newBulan, newTahun) => {
                  setBulan(newBulan);
                  setTahun(newTahun);
                }}
                disabled={isLoading}
              />
            }
            filterSlot={
              <FilterMutasiDialog
                rekeningList={response?.data?.rekeningList ?? []}
                kategoriList={response?.data?.kategoriList ?? []}
                currentFilters={filters}
                onApplyFilters={(newFilters) => {
                  setFilters(newFilters);
                }}
                onResetFilters={() => {
                  setFilters({});
                }}
                isLoading={isLoading}
              />
            }
          />
        </div>
      </div>
    </div>
  );
}
