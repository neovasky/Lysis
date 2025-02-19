// File: src/layouts/MainLayout.tsx
import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Sidebar } from "../components/Sidebar/Sidebar";
import { TopBar } from "../components/TopBar/TopBar";

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 72;

export const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div
      // Instead of using a static bg-background class, we use inline style referencing our CSS variable.
      style={{ backgroundColor: "var(--color-pageBackground)" }}
      className="flex min-h-screen text-foreground"
    >
      <TopBar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={setIsSidebarOpen}
      />
      <Sidebar isOpen={isSidebarOpen} />
      <div
        className="relative flex-grow mt-16 overflow-auto transition-all duration-200"
        style={{
          width: `calc(100% - ${
            isSidebarOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH
          }px)`,
          marginLeft: `${isSidebarOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH}px`,
          minHeight: "calc(100vh - 64px)",
          backgroundColor: "var(--color-pageBackground)",
        }}
      >
        <div
          className="w-full h-full p-4"
          style={{ backgroundColor: "var(--color-pageBackground)" }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};
