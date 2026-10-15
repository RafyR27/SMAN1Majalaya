import { requireRole } from "@/lib/session";
import KartuPersediaanPdfView from "@/components/views/KartuPersediaanPdf/KartuPersediaanPdf";

export default async function KartuPersediaanPage() {
  await requireRole("admin");

  return <KartuPersediaanPdfView />;
}

