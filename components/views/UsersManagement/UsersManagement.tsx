"use client";

import { DataTable } from "./data-table";
import AddUserDialog from "./AddUser/Add-user-dialog";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import instance from "@/lib/instance";
import { PaginationState } from "@tanstack/react-table";
import { Columns } from "./columns";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UsersManagementView() {
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

  const { data, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin-users", pagination, debouncedSearch],
    queryFn: async () => {
      const response = await instance.get("/admin/user", {
        params: {
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
          search: debouncedSearch,
        },
      });

      return response.data;
    },
    placeholderData: keepPreviousData,
    retry: 1,
  });

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-6 p-4 py-6 md:p-6 max-w-7xl w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">
                Manajemen Pengguna
              </h2>
              <p className="text-muted-foreground">
                Kelola data akun pengguna.
              </p>
            </div>
            <div className="flex justify-end">
              <AddUserDialog />
            </div>
          </div>

          {isError ? (
            <div className="border border-border/80 rounded-xl bg-card p-8 flex flex-col items-center justify-center text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-base">
                  Gagal Memuat Data Pengguna
                </h3>
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
              columns={Columns}
              data={data?.data ?? []}
              pagination={pagination}
              onPaginationChange={setPagination}
              rowCount={data?.pagination.totalUsers ?? 0}
              globalFilter={search}
              onGlobalFilterChange={setSearch}
            />
          )}
        </div>
      </div>
    </div>
  );
}
