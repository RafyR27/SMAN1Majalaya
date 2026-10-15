import { SiteHeader } from "@/components/layouts/Sidebar/common/SideBar/site-header";
import SidebarLayout from "@/components/layouts/Sidebar/SidebarLayout/SidebarLayout";
import EditEmailSection from "@/components/views/User/EditEmail/EditEmail";
import UserLayout from "@/components/views/User/User";
import { requireRole } from "@/lib/session";

export default async function AdminEditEmailPage() {
  const session = await requireRole("admin");

  return (
    <SidebarLayout user={session.user}>
      {/* Tombol sidebar */}
      <SiteHeader title="Profil Akun" />

      {/* Isi Dashboard */}
      <UserLayout>
        <EditEmailSection user={session.user} />
      </UserLayout>
    </SidebarLayout>
  );

  // return <EditEmailLayout user={session.user} />;
}
