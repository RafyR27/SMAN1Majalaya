import { SiteHeader } from "@/components/layouts/Sidebar/common/SideBar/site-header";
import SidebarLayout from "@/components/layouts/Sidebar/SidebarLayout/SidebarLayout";
import UsersManagementView from "@/components/views/UsersManagement/UsersManagement";
import { requireRole } from "@/lib/session";

export default async function UsersManagementPage() {
  const session = await requireRole("admin");

  return (
    <SidebarLayout user={session.user}>
      <SiteHeader title="Manajemen Pengguna" />
      <UsersManagementView />
    </SidebarLayout>
  );
}
