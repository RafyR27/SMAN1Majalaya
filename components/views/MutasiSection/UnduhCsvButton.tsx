"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FileSpreadsheet } from "lucide-react";
import { useUnduhCsv } from "./useUnduhCsv";

interface UnduhCsvButtonProps {
  bulan: number;
  tahun: number;
  disabled?: boolean;
}

export default function UnduhCsvButton({
  bulan,
  tahun,
  disabled = false,
}: UnduhCsvButtonProps) {
  const { handleUnduhCsv, isLoadingCsv } = useUnduhCsv({ bulan, tahun });

  return (
    <Button
      type="button"
      onClick={handleUnduhCsv}
      disabled={disabled || isLoadingCsv}
      className="gap-1.5 bg-teal-600 hover:bg-teal-700 text-white border-0 shadow-xs cursor-pointer transition-colors"
    >
      {isLoadingCsv ? (
        <Spinner className="h-4 w-4" />
      ) : (
        <FileSpreadsheet className="h-4 w-4" />
      )}
      Unduh CSV
    </Button>
  );
}
