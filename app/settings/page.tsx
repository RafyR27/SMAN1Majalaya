import { SiteHeader } from "@/components/layouts/Sidebar/common/SideBar/site-header";
import SidebarLayout from "@/components/layouts/Sidebar/SidebarLayout/SidebarLayout";
import SettingsSection from "@/components/views/Settings/SettingsSection";
import { requireRole } from "@/lib/session";

export default async function SettingsPage() {
  const session = await requireRole("admin");

  return (
    <SidebarLayout user={session.user}>
      <SiteHeader title="Pengaturan" />
      <SettingsSection />
    </SidebarLayout>
  );
}
