"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import instance from "@/lib/instance";
import {
  Boxes,
  Warehouse,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Package,
  FileSpreadsheet,
  AlertTriangle,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  History,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/date-formatted";

interface LowStockItem {
  id: string;
  namaBarang: string;
  stok: number;
  satuan: { satuan: string };
  kategori: { kategori: string };
}

interface LowStockPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

interface RecentActivity {
  id: string;
  type: "masuk" | "keluar";
  namaBarang: string;
  satuan: string;
  jumlah: number;
  keterangan: string | null;
  createdAt: string;
}

interface DashboardApiResponse {
  status: number;
  message: string;
  data: {
    totalItems: number;
    totalStock: number;
    stockIn: number;
    stockOut: number;
    lowStockItems: LowStockItem[];
    lowStockPagination: LowStockPagination;
    recentActivities: RecentActivity[];
  };
}

export default function DashboardSection() {
  const [threshold, setThreshold] = useState<number>(5);
  const [restockPage, setRestockPage] = useState<number>(1);

  const { data, isLoading, isError, error, refetch, isFetching } =
    useQuery<DashboardApiResponse>({
      queryKey: ["dashboard-stats", threshold, restockPage],
      queryFn: async () => {
        const response = await instance.get("/dashboard", {
          params: { 
            lowStockThreshold: threshold,
            lowStockPage: restockPage, 
          },
        });
        return response.data;
      },
      placeholderData: keepPreviousData,
      staleTime: 30_000,
      retry: 1,
    });

  // Penanganan Error State
  if (isError) {
    const errorMessage =
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message ||
      (error as Error)?.message ||
      "Terjadi gangguan koneksi ke server. Pastikan sesi login Anda masih aktif.";

    return (
      <div className="flex flex-1 flex-col p-4 md:p-6 max-w-7xl w-full mx-auto">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 flex flex-col items-center justify-center text-center gap-3">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-base text-foreground">
              Gagal Memuat Statistik Dashboard
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
              {errorMessage}
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
      </div>
    );
  }

  const stats = data?.data;
  const pagination = stats?.lowStockPagination;
  const pageSize = pagination?.pageSize ?? 5;

  // 4 Card Metrik Statistik Utama (Warna Dihilangkan - 100% Netral)
  const cards = [
    {
      title: "TOTAL ITEMS",
      value: stats?.totalItems ?? 0,
      icon: Boxes,
    },
    {
      title: "TOTAL STOCK",
      value: stats?.totalStock ?? 0,
      icon: Warehouse,
    },
    {
      title: "STOCK IN",
      value: stats?.stockIn ?? 0,
      icon: ArrowDownToLine,
    },
    {
      title: "STOCK OUT",
      value: stats?.stockOut ?? 0,
      icon: ArrowUpFromLine,
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-7xl w-full mx-auto">
        {/* ─── 4 METRIC CARDS (MONOKROM / TANPA WARNA) ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {cards.map((card, idx) => {
            const Icon = card.icon;

            return (
              <div
                key={idx}
                className="bg-card border border-border/80 rounded-lg shadow-xs overflow-hidden flex items-stretch transition-transform hover:-translate-y-0.5"
              >

                <div className="w-20 sm:w-24 bg-muted/60 border-r border-border/70 flex items-center justify-center shrink-0">
                  <Icon className="size-8 sm:size-9 stroke-[2] text-foreground" />
                </div>

                <div className="flex-1 py-3 px-4 flex flex-col justify-center">
                  {isLoading ? (
                    <div className="space-y-1.5">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-3.5 w-20" />
                    </div>
                  ) : (
                    <>
                      <span className="text-2xl sm:text-3xl font-semibold text-foreground leading-none">
                        {card.value.toLocaleString("id-ID")}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium mt-1 tracking-wider">
                        {card.title}
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── QUICK SHORTCUTS ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/barang">
            <Button
              variant="outline"
              className="w-full justify-between h-12 px-4 rounded-lg bg-card hover:bg-muted/50 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Package className="h-4 w-4 text-foreground" />
                <span className="font-medium text-sm text-foreground">Data Barang</span>
              </div>
              <ArrowRight className="h-4 w-4 text-foreground" />
            </Button>
          </Link>

          <Link href="/barang-masuk-keluar">
            <Button
              variant="outline"
              className="w-full justify-between h-12 px-4 rounded-lg bg-card hover:bg-muted/50 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ArrowLeftRight className="h-4 w-4 text-foreground" />
                <span className="font-medium text-sm text-foreground">Barang Masuk & Keluar</span>
              </div>
              <ArrowRight className="h-4 w-4 text-foreground" />
            </Button>
          </Link>

          <Link href="/mutasi">
            <Button
              variant="outline"
              className="w-full justify-between h-12 px-4 rounded-lg bg-card hover:bg-muted/50 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="h-4 w-4 text-foreground" />
                <span className="font-medium text-sm text-foreground">Mutasi</span>
              </div>
              <ArrowRight className="h-4 w-4 text-foreground" />
            </Button>
          </Link>
        </div>

        {/* ─── DUA KOTAK DI BAWAH ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kotak 1: Barang Perlu Restock */}
          <div className="border border-border/80 rounded-xl bg-card p-5 space-y-4 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-foreground" />
                  <h3 className="font-semibold text-sm text-foreground">
                    Barang Perlu Restock
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    aria-label="Filter threshold stok"
                    value={threshold}
                    onChange={(e) => {
                      setThreshold(Number(e.target.value));
                      setRestockPage(1);
                    }}
                    className="h-7 text-xs font-medium rounded-md border border-input bg-background px-2 text-foreground outline-none cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <option value={0}>Stok = 0</option>
                    <option value={3}>Stok &le; 3</option>
                    <option value={5}>Stok &le; 5</option>
                    <option value={10}>Stok &le; 10</option>
                    <option value={20}>Stok &le; 20</option>
                  </select>

                  <Link
                    href="/barang"
                    className="text-xs text-primary hover:underline font-medium shrink-0 ml-1"
                  >
                    Lihat Semua
                  </Link>
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : stats?.lowStockItems && stats.lowStockItems.length > 0 ? (
                <div className="space-y-2">
                  {stats.lowStockItems.map((item, index) => {
                    const itemNumber = (restockPage - 1) * pageSize + index + 1;

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground font-mono text-[11px] w-4">
                            {itemNumber}.
                          </span>
                          <div>
                            <p className="font-medium text-foreground">
                              {item.namaBarang}
                            </p>
                            <span className="text-muted-foreground">
                              {item.kategori?.kategori ?? "-"}
                            </span>
                          </div>
                        </div>

                        <span className="font-bold px-2 py-1 rounded-md uppercase tracking-wider text-[11px] bg-muted border border-border text-foreground">
                          Sisa {item.stok} {item.satuan?.satuan ?? ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-6 text-center">
                  Semua stok barang dalam kondisi aman (&gt; {threshold}).
                </p>
              )}
            </div>

            {pagination && pagination.totalItems > 0 && (
              <div className="pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Menampilkan{" "}
                  <strong className="text-foreground">
                    {Math.min((restockPage - 1) * pageSize + 1, pagination.totalItems)} -{" "}
                    {Math.min(restockPage * pageSize, pagination.totalItems)}
                  </strong>{" "}
                  dari{" "}
                  <strong className="text-foreground">
                    {pagination.totalItems}
                  </strong>{" "}
                  barang
                </span>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setRestockPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={restockPage <= 1 || isFetching}
                    className="h-7 w-7 p-0 cursor-pointer"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 text-foreground" />
                  </Button>
                  <span className="px-1 font-medium text-foreground">
                    {restockPage} / {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setRestockPage((prev) =>
                        Math.min(pagination.totalPages, prev + 1)
                      )
                    }
                    disabled={
                      restockPage >= pagination.totalPages || isFetching
                    }
                    className="h-7 w-7 p-0 cursor-pointer"
                  >
                    <ChevronRight className="h-3.5 w-3.5 text-foreground" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Kotak 2: Aktivitas Transaksi Terakhir */}
          <div className="border border-border/80 rounded-xl bg-card p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b">
              <div className="flex items-center gap-2">
                <History className="size-4 text-foreground" />
                <h3 className="font-semibold text-sm text-foreground">
                  Aktivitas Transaksi Terakhir
                </h3>
              </div>
 
              <Link
                href="/barang-masuk-keluar"
                className="text-xs text-primary hover:underline font-medium"
              >
                Detail Riwayat
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                  stats.recentActivities.map((act) => {
                    const isMasuk = act.type === "masuk";

                    return (
                      <div
                        key={`${act.type}-${act.id}`}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-border/80 bg-muted/40 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-md bg-background flex items-center justify-center shrink-0 border border-border/60">
                            {isMasuk ? (
                              <ArrowDownToLine className="size-3.5 text-foreground" />
                            ) : (
                              <ArrowUpFromLine className="size-3.5 text-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {act.namaBarang}
                            </p>
                            <span className="text-[11px] text-muted-foreground">
                              {formatDate(act.createdAt)}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`font-bold uppercase ${
                            isMasuk
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {isMasuk ? `+${act.jumlah}` : `-${act.jumlah}`}{" "}
                          {act.satuan}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-muted-foreground py-6 text-center">
                    Belum ada riwayat transaksi.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}