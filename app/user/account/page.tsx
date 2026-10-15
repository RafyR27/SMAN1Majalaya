import { SiteHeader } from "@/components/layouts/Sidebar/common/SideBar/site-header";
import SidebarLayout from "@/components/layouts/Sidebar/SidebarLayout/SidebarLayout";
import AccountContent from "@/components/views/User/Account/AccountContent";
import UserLayout from "@/components/views/User/User";

import { requireRole } from "@/lib/session";

export default async function Account() {
  const session = await requireRole("admin");
  
  return (
    <SidebarLayout user={session.user}>
      {/* Tombol sidebar */}
      <SiteHeader title="Profile Account" />

      {/* Isi Dashboard */}
      <UserLayout>
        <AccountContent user={session.user} />
      </UserLayout>
    </SidebarLayout>
  );
}
