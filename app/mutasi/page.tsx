import { SiteHeader } from "@/components/layouts/Sidebar/common/SideBar/site-header";
import SidebarLayout from "@/components/layouts/Sidebar/SidebarLayout/SidebarLayout";
import MutasiSectionView from "@/components/views/MutasiSection/MutasiSection";
import { requireRole } from "@/lib/session";

export default async function MutasiPage() {
  const session = await requireRole("admin");

  return (
    <SidebarLayout user={session.user}>
      <SiteHeader title="Mutasi Barang" />
      <MutasiSectionView />
    </SidebarLayout>
  );
}
