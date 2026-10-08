"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { SessionUser } from "@/types/user";
import { EllipsisVerticalIcon, LogOutIcon, UserRound } from "lucide-react";
import Link from "next/link";

export function NavUser({
  user,
  onLogout,
}: {
  user?: SessionUser;
  onLogout?: () => void;
}) {
  const { isMobile, setOpenMobile } = useSidebar();

  const handleLogoutClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
    onLogout?.();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <Avatar className="size-8 rounded-full grayscale">
              <AvatarImage
                src={
                  user?.image ||
                  "https://res.cloudinary.com/dejhqj1te/image/upload/v1787872501/Frame_3_ytpno7.png"
                }
                alt={user?.name}
              />
              <AvatarFallback className="rounded-full">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : "CN"}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user?.name}</span>
              <span className="truncate text-xs text-foreground/70">
                {user?.email}
              </span>
            </div>
            <EllipsisVerticalIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8">
                    <AvatarImage
                      src={
                        user?.image ||
                        "https://res.cloudinary.com/dejhqj1te/image/upload/v1787872501/Frame_3_ytpno7.png"
                      }
                      alt={user?.name}
                    />
                    <AvatarFallback className="rounded-lg">
                      {user?.name
                        ? user.name.substring(0, 2).toUpperCase()
                        : "CN"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user?.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link
                href={
                  user?.role === "admin"
                    ? "/admin/user/profile"
                    : "/kasir/user/profile"
                }
              >
                <DropdownMenuItem className="flex cursor-pointer hover:bg-muted/50">
                  <UserRound />
                  Account
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="flex cursor-pointer hover:bg-destructive/50"
              onClick={handleLogoutClick}
            >
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
