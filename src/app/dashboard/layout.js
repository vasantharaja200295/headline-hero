import {AppSidebar} from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";

export default function DashboardLayout({ children }) {

  return (
    <SidebarProvider >
      <AppSidebar />
      <main className="flex flex-col w-full h-screen overflow-hidden">
        <SidebarTrigger className="h-14 w-14"/>
        {children}
      </main>
    </SidebarProvider>
  );
}
