import { SiteHeader } from "@/components/layouts/Sidebar/common/SideBar/site-header";
import SidebarLayout from "@/components/layouts/Sidebar/SidebarLayout/SidebarLayout";
import BarangSectionView from "@/components/views/BarangSection/BarangSection";
import { requireRole } from "@/lib/session";

export default async function TambahBarang() {
  const session = await requireRole("admin");

  return (
    <SidebarLayout user={session.user}>
      {/* Tombol sidebar */}
      <SiteHeader title="Tambah Barang" />

      {/* Isi Dashboard */}
      <BarangSectionView />
    </SidebarLayout>
  );
}