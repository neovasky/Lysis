/**
 * File: src/layouts/MainLayout.tsx
 * Description: Main application layout with sidebar and top bar
 */

import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar/Sidebar";
import { TopBar } from "../components/TopBar/TopBar";

export const MainLayout = () => {
  return (
    <Box sx={{ display: "flex" }}>
      <TopBar />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          transition: "margin 0.2s ease-in-out",
          mt: "64px", // Height of TopBar
          minHeight: "100vh",
          backgroundColor: "background.default",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
