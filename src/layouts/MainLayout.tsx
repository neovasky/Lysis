/**
 * File: src/layouts/MainLayout.tsx
 * Description: Main application layout with sidebar and top bar
 */

import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar/Sidebar";
import { TopBar } from "../components/TopBar/TopBar";
import { useState } from "react";

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 72;

export const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <Box sx={{ display: "flex" }}>
      <TopBar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={setIsSidebarOpen}
      />
      <Sidebar isOpen={isSidebarOpen} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - ${
            isSidebarOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH
          }px)`,
          marginLeft: `${isSidebarOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH}px`,
          transition: (theme) =>
            theme.transitions.create(["margin", "width"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          mt: "64px",
          minHeight: "100vh",
          backgroundColor: "background.default",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
