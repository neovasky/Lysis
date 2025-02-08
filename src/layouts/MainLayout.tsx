/**
 * File: src/layouts/MainLayout.tsx
 * Description: Main application layout with sidebar and top bar
 */

import { Box, Container } from "@radix-ui/themes";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar/Sidebar";
import { TopBar } from "../components/TopBar/TopBar";
import { useState } from "react";

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 72;

export const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <Box
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--color-pageBackground)",
      }}
    >
      <TopBar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={setIsSidebarOpen}
      />
      <Sidebar isOpen={isSidebarOpen} />
      <Box
        style={{
          flexGrow: 1,
          width: `calc(100% - ${
            isSidebarOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH
          }px)`,
          marginLeft: `${isSidebarOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH}px`,
          transition: "margin 0.2s ease-in-out, width 0.2s ease-in-out",
          marginTop: "64px",
          minHeight: "calc(100vh - 64px)",
          backgroundColor: "var(--color-pageBackground)",
          overflow: "hidden",
        }}
      >
        <Container p="4" size="4">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};
