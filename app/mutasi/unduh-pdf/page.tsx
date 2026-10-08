import { requireRole } from "@/lib/session";
import MutasiUnduhPdfView from "@/components/views/MutasiUnduhPdf/MutasiUnduhPdf";

export default async function MutasiUnduhPdfPage() {
  await requireRole("admin");

  return <MutasiUnduhPdfView />;
}
