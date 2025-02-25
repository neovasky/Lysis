"use client";

import "react";
import { Outlet } from "react-router-dom";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/Sidebar/sidebar-layout";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { ModeToggle } from "@/components/ThemeSwitcher/ModeToggle";
import { TabProvider } from "@/contexts/TabContext";
import TabBar from "@/components/Tabs/TabBar";
import TabContent from "@/components/Tabs/TabContent";

export const MainLayout = () => {
  return (
    <SidebarProvider>
      <TabProvider>
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

            {/* Tab Bar */}
            <TabBar />

            {/* Main Content with Tab Management */}
            <main
              className="flex-1 overflow-auto"
              style={{ backgroundColor: "var(--color-pageBackground)" }}
            >
              <TabContent>
                <div className="p-4">
                  <Outlet />
                </div>
              </TabContent>
            </main>
          </div>
        </div>
      </TabProvider>
    </SidebarProvider>
  );
};

export default MainLayout;
