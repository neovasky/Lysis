import { Box, Toolbar } from "@mui/material";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar/Sidebar";

export const MainLayout = () => {
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          transition: "margin 0.2s ease-in-out",
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};
