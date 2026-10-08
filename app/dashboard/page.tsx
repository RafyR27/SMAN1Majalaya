import { SiteHeader } from "@/components/layouts/Sidebar/common/SideBar/site-header";
import SidebarLayout from "@/components/layouts/Sidebar/SidebarLayout/SidebarLayout";
import DashboardSection from "@/components/views/DashboardSection/DashboardSection";
import { requireRole } from "@/lib/session";

export default async function Dashboard() {
  const session = await requireRole("admin");

  return (
    <SidebarLayout user={session.user}>
      {/* Tombol sidebar */}
      <SiteHeader title="Dashboard" />

      {/* Isi Dashboard */}
      <DashboardSection />
    </SidebarLayout>
  );
}
