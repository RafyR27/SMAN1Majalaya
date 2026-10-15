import { SiteHeader } from "@/components/layouts/Sidebar/common/SideBar/site-header";
import SidebarLayout from "@/components/layouts/Sidebar/SidebarLayout/SidebarLayout";
import ProfileContent from "@/components/views/User/Profile/ProfileContent";
import UserLayout from "@/components/views/User/User";
import { requireRole } from "@/lib/session";

export default async function Profile() {
  const session = await requireRole("admin");

  return (
    <SidebarLayout user={session.user}>
      {/* Tombol sidebar */}
      <SiteHeader title="Profil Akun" />

      {/* Isi Dashboard */}
      <UserLayout>
        <ProfileContent user={session.user} />
      </UserLayout>
    </SidebarLayout>
  );
}
