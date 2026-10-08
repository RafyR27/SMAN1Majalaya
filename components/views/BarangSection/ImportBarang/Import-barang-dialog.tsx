"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  UploadCloud,
  FileCheck,
  AlertCircle,
  Trash2,
  CircleQuestionMark,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { IKategori, IKodeRekening, ISatuan } from "@/types/settings";
import { Spinner } from "@/components/ui/spinner";
import Papa from "papaparse";
import { useImportBarang } from "./useImportBarang";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface ImportBarangDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rekeningList: IKodeRekening[];
  kategoriList: IKategori[];
  satuanList: ISatuan[];
}

export default function ImportBarangDialog({
  open,
  onOpenChange,
  rekeningList,
  kategoriList,
  satuanList,
}: ImportBarangDialogProps) {
  const isMobile = useIsMobile();
  const swipeDirection = isMobile ? "down" : "right";

  const [isDragging, setIsDragging] = useState(false);

  const handleDownloadTemplate = () => {
    const maxRows = Math.max(
      rekeningList.length,
      kategoriList.length,
      satuanList.length,
    );

    const now = new Date();

    const tanggalHariIni = [
      String(now.getDate()).padStart(2, "0"),
      String(now.getMonth() + 1).padStart(2, "0"),
      now.getFullYear(),
    ].join("-");

    const dataRows = Array.from({ length: maxRows }, (_, index) => {
      const rekening = rekeningList[index];
      const kategori = kategoriList[index];
      const satuan = satuanList[index];

      return [
        `Contoh ${index + 1}`,
        rekening?.kodeRekening ?? "",
        kategori?.kategori ?? "",
        satuan?.satuan ?? "",
        "",
        "",
        (index + 1) * 1000,
        tanggalHariIni,
      ];
    });

    const csvContent = Papa.unparse({
      fields: [
        "namaBarang",
        "kodeRekening",
        "kategori",
        "satuan",
        "merk",
        "sumber",
        "harga",
        "tanggal",
      ],
      data: dataRows,
    });

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "template-import-barang.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.info("Template CSV berhasil diunduh.", {
      position: "top-right",
    });
  };

  const {
    file,
    fileInputRef,
    invalidFormat,
    resetState,
    handleFileProcess,
    handleImportSubmit,
    parsedData,
    isSuccessAddBarang,
    isPendingAddBarang,
  } = useImportBarang();

  const duplicateNames = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of parsedData) {
      const name = item.namaBarang?.trim().toLowerCase();
      if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    const dupes = new Set<string>();
    for (const [name, count] of counts.entries()) {
      if (count > 1) dupes.add(name);
    }
    return dupes;
  }, [parsedData]);

  const hasDuplicates = duplicateNames.size > 0;

  useEffect(() => {
    if (isSuccessAddBarang) {
      onOpenChange(false);
    }
  }, [isSuccessAddBarang, onOpenChange]);

  return (
    <Drawer
      disablePointerDismissal
      key={swipeDirection}
      modal={true}
      swipeDirection={swipeDirection}
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) resetState();
      }}
    >
      <DrawerContent className="data-[swipe-axis=x]:sm:[--drawer-content-width:40rem] data-[swipe-axis=y]:max-h-[92dvh] flex flex-col">
        {/* Drawer Header */}
        <DrawerHeader className="border-b shrink-0 pb-3 pt-4 px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center justify-between gap-3 w-full">
              <div className="space-y-0.5 text-left">
                <div className="flex items-center gap-2">
                  <DrawerTitle className="text-lg font-semibold tracking-tight">
                    Import Barang dari CSV
                  </DrawerTitle>
                </div>
                <DrawerDescription className="text-xs text-muted-foreground text-left">
                  Unggah file spreadsheet CSV untuk menambahkan banyak data
                  barang sekaligus.
                </DrawerDescription>
              </div>
              <HoverCard>
                <HoverCardTrigger
                  delay={10}
                  closeDelay={100}
                  className="cursor-pointer group rounded-full p-1 hover:bg-muted transition-colors shrink-0"
                >
                  <CircleQuestionMark className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </HoverCardTrigger>
                <HoverCardContent
                  align="end"
                  sideOffset={8}
                  className="w-80 sm:w-96 p-4 text-xs space-y-3"
                >
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <span className="font-semibold text-foreground text-sm">
                      Ketentuan File CSV
                    </span>
                  </div>

                  <div className="space-y-2 text-muted-foreground leading-relaxed">
                    <div className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <p>
                        <strong className="text-foreground font-medium">
                          Format Tanggal:
                        </strong>
                        <code className="text-[11px] bg-muted px-1 py-0.5 rounded font-mono text-foreground">
                          DD-MM-YYYY
                        </code>{" "}
                        atau
                        <code className="text-[11px] bg-muted px-1 py-0.5 rounded font-mono text-foreground">
                          DD/MM/YYYY
                        </code>{" "}
                        (contoh:{" "}
                        <span className="font-mono text-foreground">
                          08-10-2026 atau 08/10/2026
                        </span>
                        ).
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <p>
                        <strong className="text-foreground font-medium">
                          Format Harga:
                        </strong>{" "}
                        Tulis angka murni tanpa simbol mata uang atau titik
                        pemisah ribuan (contoh:{" "}
                        <span className="font-mono text-foreground">50000</span>
                        , bukan{" "}
                        <span className="font-mono line-through">
                          Rp 50.000
                        </span>
                        ).
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <p>
                        <strong className="text-foreground font-medium">
                          Format Sel Spreadsheet:
                        </strong>{" "}
                        Pastikan semua sel berformat{" "}
                        <strong className="text-foreground">
                          General (Umum)
                        </strong>
                        , hindari rumus atau formula Excel.
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <p>
                        <strong className="text-foreground font-medium">
                          Kolom Wajib & Minimal:
                        </strong>{" "}
                        <span className="text-foreground font-medium">
                          namaBarang
                        </span>{" "}
                        (min. 3 karakter),{" "}
                        <span className="text-foreground font-medium">
                          kodeRekening
                        </span>
                        ,{" "}
                        <span className="text-foreground font-medium">
                          kategori
                        </span>
                        ,{" "}
                        <span className="text-foreground font-medium">
                          satuan
                        </span>
                        ,{" "}
                        <span className="text-foreground font-medium">
                          harga
                        </span>
                        , dan{" "}
                        <span className="text-foreground font-medium">
                          tanggal
                        </span>
                        . Kolom{" "}
                        <span className="text-foreground font-medium">
                          merk
                        </span>{" "}
                        &{" "}
                        <span className="text-foreground font-medium">
                          sumber
                        </span>{" "}
                        bersifat opsional.
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <p>
                        <strong className="text-foreground font-medium">
                          Kesesuaian:
                        </strong>{" "}
                        Nilai{" "}
                        <span className="text-foreground font-medium">
                          kodeRekening
                        </span>
                        ,{" "}
                        <span className="text-foreground font-medium">
                          kategori
                        </span>
                        , dan{" "}
                        <span className="text-foreground font-medium">
                          satuan
                        </span>{" "}
                        harus sudah terdaftar pada pengaturan sistem.
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <p>
                        <strong className="text-foreground font-medium">
                          Keunikan Data:
                        </strong>{" "}
                        Tidak boleh ada nama barang duplikat di dalam file CSV,
                        serta kombinasi barang belum pernah tersimpan
                        sebelumnya.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t text-[11px] text-muted-foreground bg-muted/40 -mx-4 -mb-4 p-3 rounded-b-lg flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>
                      Disarankan mengunduh template CSV resmi di bawah sebagai
                      acuan.
                    </span>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          </div>
        </DrawerHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5">
          {/* Template Helper Card */}
          <div className="rounded-xl border border-border/80 bg-muted/30 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-foreground">
                Format Kolom CSV yang Didukung
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="text-xs h-8 cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              Unduh Template
            </Button>
          </div>

          {/* Upload Area */}
          {!file ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files?.[0]) {
                  handleFileProcess(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-muted-foreground bg-muted-foreground/5"
                  : "border-muted-foreground/30  hover:border-muted-foreground hover:bg-muted-foreground/5"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
              />
              <div className="h-12 w-12 rounded-full bg-muted-foreground/10 flex items-center justify-center">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  Pilih file CSV atau tarik ke sini
                </p>
                <p className="text-xs text-muted-foreground">
                  Hanya file berekstensi .csv
                </p>
              </div>
            </div>
          ) : (
            /* Selected File Card */
            <div className="rounded-xl border border-border/80 bg-card p-4 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-10 w-10 rounded-lg bg-muted-foreground/10 text-muted-foreground flex items-center justify-center shrink-0">
                  <FileCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB &bull;{" "}
                    {parsedData.length} data terbaca
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={resetState}
                disabled={isPendingAddBarang}
                className="h-8 w-8"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Hapus file</span>
              </Button>
            </div>
          )}

          {invalidFormat > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                Format file CSV tidak sesuai. Silahkan unduh template yang sudah
                di sediakan
              </div>
            </div>
          )}

          {/* Preview Table */}
          {parsedData.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Pratinjau Data ({parsedData.length} Barang)
                </h4>
                <span className="text-xs text-muted-foreground">
                  Menampilkan hasil pembacaan CSV
                </span>
              </div>

              {/* Duplicate Warning Banner */}
              {hasDuplicates && (
                <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-3 flex items-center gap-2.5 text-xs text-orange-800 dark:text-orange-200">
                  <AlertCircle className="h-4 w-4 text-orange-500 shrink-0" />
                  <div>
                    Terdapat{" "}
                    <span className="font-semibold">
                      {duplicateNames.size} nama barang
                    </span>{" "}
                    yang duplikat (ditandai warna oranye). Perbaiki nama barang
                    agar unik sebelum mengimpor.
                  </div>
                </div>
              )}

              <div className="border rounded-lg max-h-lg overflow-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted text-muted-foreground sticky top-0 border-b">
                    <tr>
                      <th className="p-2.5 font-semibold w-10">No</th>
                      <th className="p-2.5 font-semibold">Nama Barang</th>
                      <th className="p-2.5 font-semibold">Kode Rekening</th>
                      <th className="p-2.5 font-semibold">Kategori</th>
                      <th className="p-2.5 font-semibold">Satuan</th>
                      <th className="p-2.5 font-semibold">Merk</th>
                      <th className="p-2.5 font-semibold">Sumber</th>
                      <th className="p-2.5 font-semibold text-right">Harga</th>
                      <th className="p-2.5 font-semibold text-right">
                        Tanggal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {parsedData.map((item, index) => {
                      const isDuplicate = duplicateNames.has(
                        item.namaBarang?.trim().toLowerCase(),
                      );
                      return (
                        <tr
                          key={index}
                          className={`transition-colors ${
                            isDuplicate
                              ? "bg-orange-500/15 dark:bg-orange-500/20 hover:bg-orange-500/20 dark:hover:bg-orange-500/30"
                              : "hover:bg-muted/20"
                          }`}
                        >
                          <td
                            className={`p-2.5 ${
                              isDuplicate
                                ? "text-orange-700 dark:text-orange-300"
                                : "text-muted-foreground"
                            }`}
                          >
                            {index + 1}
                          </td>
                          <td
                            className={`p-2.5 font-medium ${
                              isDuplicate
                                ? "text-orange-900 dark:text-orange-100"
                                : "text-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{item.namaBarang}</span>
                              {isDuplicate && (
                                <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold bg-orange-500/20 text-orange-700 dark:text-orange-300">
                                  Duplikat
                                </span>
                              )}
                            </div>
                          </td>
                          <td
                            className={`p-2.5 font-medium ${
                              isDuplicate
                                ? "text-orange-900 dark:text-orange-100"
                                : "text-foreground"
                            }`}
                          >
                            {item.kodeRekening}
                          </td>
                          <td
                            className={`p-2.5 ${
                              isDuplicate
                                ? "text-orange-700 dark:text-orange-300"
                                : "text-muted-foreground"
                            }`}
                          >
                            {item.kategori}
                          </td>
                          <td
                            className={`p-2.5 ${
                              isDuplicate
                                ? "text-orange-700 dark:text-orange-300"
                                : "text-muted-foreground"
                            }`}
                          >
                            {item.satuan}
                          </td>
                          <td
                            className={`p-2.5 ${
                              isDuplicate
                                ? "text-orange-700 dark:text-orange-300"
                                : "text-muted-foreground"
                            }`}
                          >
                            {item.merk}
                          </td>
                          <td
                            className={`p-2.5 ${
                              isDuplicate
                                ? "text-orange-700 dark:text-orange-300"
                                : "text-muted-foreground"
                            }`}
                          >
                            {item.sumber}
                          </td>
                          <td
                            className={`p-2.5 text-right font-medium ${
                              isDuplicate
                                ? "text-orange-900 dark:text-orange-100"
                                : ""
                            }`}
                          >
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                              maximumFractionDigits: 0,
                            }).format(item.harga)}
                          </td>
                          <td
                            className={`p-2.5 text-right font-medium ${
                              isDuplicate
                                ? "text-orange-900 dark:text-orange-100"
                                : ""
                            }`}
                          >
                            {item.tanggal}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <DrawerFooter className="border-t shrink-0 p-4 px-5 bg-background/95 backdrop-blur-xs flex flex-row items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground font-medium">
            Total:{" "}
            <span className="font-semibold text-foreground">
              {parsedData.length}
            </span>{" "}
            barang siap diimpor
          </div>

          <div className="flex items-center gap-2">
            <DrawerClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="rounded-lg cursor-pointer"
                  disabled={isPendingAddBarang}
                >
                  Batal
                </Button>
              }
            />
            <Button
              type="button"
              size="lg"
              onClick={handleImportSubmit}
              disabled={
                parsedData.length === 0 || isPendingAddBarang || hasDuplicates
              }
              className="rounded-lg cursor-pointer shadow-xs flex items-center gap-2 min-w-35"
            >
              <span>
                {isPendingAddBarang ? (
                  <Spinner />
                ) : (
                  `Import
                ${
                  parsedData.length > 0
                    ? `(${parsedData.length}) Barang`
                    : "Data"
                }`
                )}
              </span>
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
