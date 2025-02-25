"use client";

import "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/Sidebar/sidebar-layout";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { SidebarToggle } from "@/components/Sidebar/SidebarToggle";
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
            {/* Header with integrated tabs and controls */}
            <header
              className="flex h-12 shrink-0 items-center px-4 justify-between"
              style={{ backgroundColor: "var(--color-pageBackground)" }}
            >
              {/* Left section with sidebar toggle */}
              <SidebarToggle className="mr-2" />

              {/* Middle section with tabs - will expand to fill available space */}
              <div className="flex-1 flex overflow-x-auto">
                <TabBar />
              </div>

              {/* Right section with theme toggle */}
              <div className="ml-2">
                <ModeToggle />
              </div>
            </header>

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
