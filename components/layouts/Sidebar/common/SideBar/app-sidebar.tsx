"use client";

import * as React from "react";

import { NavDocuments } from "./NavSection/nav-documents";
import { NavMain } from "./NavSection/nav-main";
import { NavTools } from "./NavSection/nav-tools";
import { NavUser } from "./NavSection/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SIDEBAR_CONTENT } from "./sidebarContent.constants";
import { SessionUser } from "@/types/user";
import { NavSecondary } from "./NavSection/nav-secondary";
import Image from "next/image";

export function AppSidebar({
  user,
  onLogout,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: SessionUser;
  onLogout?: () => void;
}) {
  // isi sidebar disimpan pada file sidebarAdmin.constants dan sidebarKasir.constants
  const DATA = SIDEBAR_CONTENT;

  if (!DATA) {
    return null;
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              size={"lg"}
            >
              <Image
                src={"/logo.png"}
                alt="SMAN 1 Majalaya"
                width={100}
                height={100}
                className="w-5.5"
              />
              <span className="text-base font-semibold">SMAN 1 Majalaya</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={DATA?.navMain} />
        <NavSecondary items={DATA?.secondary} />
        <NavDocuments items={DATA?.documents} />
        <NavTools items={DATA?.tools} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} onLogout={onLogout} />
      </SidebarFooter>
    </Sidebar>
  );
}
