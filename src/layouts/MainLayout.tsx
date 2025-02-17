/**
 * File: src/layouts/MainLayout.tsx
 * Description: Main application layout with sidebar and top bar, implemented with shadcn styling using Tailwind CSS
 */

import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Sidebar } from "../components/Sidebar/Sidebar";
import { TopBar } from "../components/TopBar/TopBar";

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 72;

export const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-background">
      <TopBar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={setIsSidebarOpen}
      />
      <Sidebar isOpen={isSidebarOpen} />
      <div
        className="flex-grow transition-all duration-200 ease-in-out mt-16 overflow-hidden"
        style={{
          width: `calc(100% - ${
            isSidebarOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH
          }px)`,
          marginLeft: `${isSidebarOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH}px`,
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <div className="container mx-auto p-4 max-w-7xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
