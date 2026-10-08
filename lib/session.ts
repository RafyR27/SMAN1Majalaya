import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

type Role = "admin";

export async function getRequiredSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/auth");

  return session;
}

export async function requireRole(role: Role) {
  const session = await getRequiredSession();

  const roleDashboardMap: Record<Role, string> = {
    admin: "/dashboard",
  };

  if (session.user.role !== role) {
    const correctDashboard =
      roleDashboardMap[session.user.role as Role] || "/dashboard";
    redirect(correctDashboard);
  }

  return session;
}
