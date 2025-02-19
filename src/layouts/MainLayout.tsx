"use client";

import "react";
import { Outlet } from "react-router-dom";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/Sidebar/sidebar-layout";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { ModeToggle } from "@/components/ThemeSwitcher/ModeToggle";

export const MainLayout = () => {
  return (
    <SidebarProvider>
      {/* Render the collapsible sidebar */}
      <Sidebar />

      {/* Content area automatically inset by sidebar */}
      <SidebarInset>
        {/* Header */}
        <header
          className="flex h-16 shrink-0 items-center gap-2 px-4 transition-all duration-300 ease-in-out border-b-0"
          style={{ backgroundColor: "var(--color-pageBackground)" }}
        >
          {/* Sidebar trigger (with updated icon) */}
          <SidebarTrigger className="mr-2" />
          <div className="flex-1" />
          <ModeToggle />
        </header>

        {/* Main Content */}
        <main
          className="flex flex-1 flex-col gap-4 p-4 transition-all duration-300 ease-in-out"
          style={{ backgroundColor: "var(--color-pageBackground)" }}
        >
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default MainLayout;
