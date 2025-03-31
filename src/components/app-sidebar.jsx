"use client";

import * as React from "react";
import { History, Bot, Coins, Settings2, LogOut } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { NAV_PATHS } from "@/utils/constants/paths";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { getUser, logout } from "@/lib/supabase";
import { Tooltip } from "@radix-ui/react-tooltip";
import { TooltipTrigger } from "./ui/tooltip";

const data = [
  {
    name: "Dashboard",
    icon: <Bot />,
    href: NAV_PATHS.DASHBOARD,
  },
  {
    name: "History",
    icon: <History />,
    href: NAV_PATHS.HISTORY,
  },
  {
    name: "Credits",
    icon: <Coins />,
    href: NAV_PATHS.CREDITS,
  },
  {
    name: "Settings",
    icon: <Settings2 />,
    href: NAV_PATHS.SETTINGS,
  },
];

export function AppSidebar({ ...props }) {
  const { state } = useSidebar();
  const pathName = usePathname();
  const [user, setUser] = React.useState(null);

  const fetchUser = async () => {
    const user = await getUser();
    setUser(user);
  };

  React.useEffect(() => {
    fetchUser();
  }, []);

  const isExpanded = state === "expanded";

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu
          className={!isExpanded && "flex items-center justify-center  "}
        >
          <SidebarMenuItem>
            <div className="flex items-center space-x-2">
              <h4 className="text-lg font-bold dark:bg-white dark:text-black text-white bg-black p-1 rounded-sm">
                HH
              </h4>
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
          <SidebarMenuItem >
            <SidebarMenuButton  className={"flex h-10 items-center justify-between space-x-2"} onClick={() => { logout(); redirect(NAV_PATHS.LOGIN); }}>
              {isExpanded && <span>Logout</span>}
              <LogOut/>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
