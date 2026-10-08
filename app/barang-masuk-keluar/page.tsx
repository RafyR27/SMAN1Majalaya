import { SiteHeader } from "@/components/layouts/Sidebar/common/SideBar/site-header";
import SidebarLayout from "@/components/layouts/Sidebar/SidebarLayout/SidebarLayout";
import BarangMasukKeluarSection from "@/components/views/BarangMasukKeluar/BarangMasukKeluarSection";
import { requireRole } from "@/lib/session";

export default async function BarangMasukKeluarPage() {
  const session = await requireRole("admin");

  return (
    <SidebarLayout user={session.user}>
      <SiteHeader title="Barang Masuk & Keluar" />
      <BarangMasukKeluarSection />
    </SidebarLayout>
  );
}
