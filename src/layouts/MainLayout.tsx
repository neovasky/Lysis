"use client";

import "react";
import { Outlet } from "react-router-dom";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/Sidebar/sidebar-layout";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { ModeToggle } from "@/components/ThemeSwitcher/ModeToggle";

export const MainLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Render the sidebar */}
        <Sidebar />

        {/* Content area with proper spacing */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <header
            className="flex h-16 shrink-0 items-center gap-2 px-4 border-b-0"
            style={{ backgroundColor: "var(--color-pageBackground)" }}
          >
            {/* Sidebar trigger (with updated icon) */}
            <SidebarTrigger className="mr-2" />
            <div className="flex-1" />
            <ModeToggle />
          </header>

          {/* Main Content */}
          <main
            className="flex-1 overflow-auto p-4"
            style={{ backgroundColor: "var(--color-pageBackground)" }}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
