"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import clsx from "clsx";

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
import { Avatar, AvatarFallback } from "./ui/avatar";
import { getUser, logout } from "@/lib/supabase";
import { NAV_PATHS } from "@/utils/constants/paths";
import { NAV_ITEMS } from "@/utils/constants/navItems";

// Configuration and constants
const THEME_CONFIG = {
  dark: {
    icon: <Moon className="h-4 w-4" />,
    logoClasses: "bg-white text-black",
  },
  light: {
    icon: <Sun className="h-4 w-4" />,
    logoClasses: "bg-black text-white",
  },
};

// Utility functions
const getInitials = (email) => {
  return email?.[0]?.toUpperCase() || '?';
};

const getDisplayName = (email) => {
  return email?.split("@")[0] || 'User';
};

// UI Components
const Logo = ({ isExpanded, theme }) => {
  const themeConfig = THEME_CONFIG[theme] || THEME_CONFIG.light;
  
  return (
    <div className="flex items-center space-x-2 py-2">
      <h2 className={clsx("font-bold p-1 rounded-sm", themeConfig.logoClasses)}>
        HH
      </h2>
      {isExpanded && <span className="text-xl font-medium">HeadlineHero</span>}
    </div>
  );
};

const ThemeToggle = ({ theme, toggleTheme, showLabel }) => {
  const themeConfig = THEME_CONFIG[theme] || THEME_CONFIG.light;
  
  return (
    <SidebarMenuButton
      className={clsx(
        "flex h-10 items-center border space-x-2 w-full",
        showLabel ? "justify-between" : "justify-center"
      )}
      onClick={toggleTheme}
    >
      {showLabel && <span>Theme</span>}
      {themeConfig.icon}
    </SidebarMenuButton>
  );
};

const UserProfile = ({ user, showLabel }) => (
  <div 
    className={clsx(
      "flex items-center space-x-2 px-2 py-2",
      !showLabel && "justify-center"
    )}
  >
    <Avatar className="h-8 w-8">
      <AvatarFallback>
        {getInitials(user?.email)}
      </AvatarFallback>
    </Avatar>
    {showLabel && (
      <span className="text-sm font-medium">
        {getDisplayName(user?.email)}
      </span>
    )}
  </div>
);

const LogoutButton = ({ showLabel, onLogout, theme }) => (
  <SidebarMenuButton
    className={clsx(
      "flex h-10 items-center space-x-2 w-full border",
      "dark:bg-white bg-black text-white dark:text-black",
      showLabel ? "justify-between" : "justify-center"
    )}
    onClick={onLogout}
  >
    {showLabel && <span>Logout</span>}
    <LogOut className="h-4 w-4" />
  </SidebarMenuButton>
);

const NavigationItem = ({ item, isActive, showLabel }) => (
  <Link href={item.href}>
    <SidebarMenuItem>
      <SidebarMenuButton isActive={isActive} className="h-10 w-full">
        {item.icon}
        {showLabel && <span>{item.name}</span>}
      </SidebarMenuButton>
    </SidebarMenuItem>
  </Link>
);

const NavigationItems = ({ items, currentPath, showLabels }) => {
  // Memoize the rendering of navigation items for performance
  const navigationElements = useMemo(() => {
    return items.map((item) => (
      <NavigationItem 
        key={item.name}
        item={item}
        isActive={currentPath === item.href}
        showLabel={showLabels}
      />
    ));
  }, [items, currentPath, showLabels]);

  return (
    <SidebarMenu className={!showLabels ? "flex items-center justify-center" : ""}>
      {navigationElements}
    </SidebarMenu>
  );
};

// Main Component
export function AppSidebar({ ...props }) {
  const { state, isMobile } = useSidebar();
  const pathName = usePathname();
  const [user, setUser] = useState(null);
  const { theme, setTheme } = useTheme();
  
  // Derived state
  const displayConfig = useMemo(() => ({
    isExpanded: state === "expanded",
    showLabels: state === "expanded" || isMobile,
    layoutMode: isMobile ? "mobile" : "desktop",
    sidebarType: isMobile ? "offcanvas" : "icon",
    sidebarWidth: isMobile ? "w-full max-w-[280px]" : "w-auto",
  }), [state, isMobile]);
  
  // Event handlers
  const handleLogout = () => {
    logout();
    window.location.href = NAV_PATHS.LOGIN;
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  
  // Side effects
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUser();
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        // Could implement fallback behavior here
      }
    };
    
    fetchUser();
  }, []);

  // Render
  return (
    <Sidebar 
      collapsible={displayConfig.sidebarType} 
      className={clsx(
        "fixed inset-y-0 left-0 z-50",
        displayConfig.sidebarWidth
      )}
      {...props}
    >
      <SidebarHeader className="border-b border-border/10">
        <SidebarMenu className={!displayConfig.isExpanded ? "flex items-center" : "px-2"}>
          <SidebarMenuItem>
            <Logo 
              isExpanded={displayConfig.showLabels} 
              theme={theme} 
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="flex flex-col flex-1 px-2 py-4">
        <NavigationItems 
          items={NAV_ITEMS} 
          currentPath={pathName} 
          showLabels={displayConfig.showLabels} 
        />
      </SidebarContent>

      <SidebarFooter className="border-t border-border/10 px-2 py-4">
        <SidebarMenu className={!displayConfig.showLabels ? "flex items-center justify-center" : ""}>
          <SidebarMenuItem>
            <ThemeToggle 
              theme={theme} 
              toggleTheme={toggleTheme} 
              showLabel={displayConfig.showLabels} 
            />
          </SidebarMenuItem>

          <SidebarMenuItem>
            <UserProfile 
              user={user} 
              showLabel={displayConfig.showLabels} 
            />
          </SidebarMenuItem>

          <SidebarMenuItem>
            <LogoutButton 
              showLabel={displayConfig.showLabels} 
              onLogout={handleLogout}
              theme={theme}
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}