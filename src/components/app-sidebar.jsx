"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { NAV_PATHS } from "@/utils/constants/paths";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { getUser, logout } from "@/lib/supabase";
import { NAV_ITEMS as data } from "@/utils/constants/navItems";
import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import clsx from "clsx";

export function AppSidebar({ ...props }) {
  const { state } = useSidebar();
  const pathName = usePathname();
  const [user, setUser] = React.useState(null);
  const { theme, setTheme } = useTheme();

  const fetchUser = async () => {
    const user = await getUser();
    setUser(user);
  };

  React.useEffect(() => {
    fetchUser();
  }, []);

  const isExpanded = state === "expanded";

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu
          className={!isExpanded && "flex items-center justify-center  "}
        >
          <SidebarMenuItem>
            <div className="flex flex-row-reverse items-center justify-between space-x-2">
              <SidebarTrigger className="rounded-xs" />
              {isExpanded && (
                <span className="text-xl font-medium">HeadlineHero</span>
              )}
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-2 mt-1 py-2 border-t-[1px] border-t-neutral-200 dark:border-t-neutral-700">
        <SidebarMenu
          className={!isExpanded && "flex items-center justify-center"}
        >
          {data.map((item) => (
            <Link key={item.name} href={item.href}>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathName === item.href}
                  className={"h-10"}
                >
                  {item.icon}
                  {isExpanded && <span>{item.name}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Link>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu
          className={!isExpanded && "flex items-center justify-center"}
        >
          <SidebarMenuItem>
            <SidebarMenuButton
              className={clsx(
                "flex h-10 items-center justify-between border-2 my-2 space-x-2",
                !isExpanded && "justify-center")}
              onClick={() => {
                toggleTheme();
              }}
            >
              {isExpanded && <span>Theme</span>}
              {theme === "dark" ? <Moon /> : <Sun />}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className={"flex items-center space-x-2"}>
            <Avatar>
              <AvatarFallback>{user?.email[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            {isExpanded && (
              <span className="text-sm font-medium">
                {user?.email?.split("@")[0]}
              </span>
            )}
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              className={"flex h-10 items-center justify-between space-x-2"}
              onClick={() => {
                logout();
                redirect(NAV_PATHS.LOGIN);
              }}
            >
              {isExpanded && <span>Logout</span>}
              <LogOut />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
