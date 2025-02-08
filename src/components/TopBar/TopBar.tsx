/**
 * File: src/components/TopBar/TopBar.tsx
 * Description: Top application bar with notifications
 */

import { AppBar, Toolbar, Typography, Stack, Box } from "@mui/material";
import { NotificationsMenu } from "../NotificationsMenu/NotificationsMenu";
import ViewSidebarOutlinedIcon from "@mui/icons-material/ViewSidebarOutlined";

interface TopBarProps {
  isSidebarOpen: boolean;
  onSidebarToggle: (isOpen: boolean) => void;
}

export const TopBar = ({ isSidebarOpen, onSidebarToggle }: TopBarProps) => {
  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <Box
          onClick={() => onSidebarToggle(!isSidebarOpen)}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            cursor: "pointer",
            borderRadius: "4px",
            mr: 2,
            color: "text.secondary",
            "&:hover": {
              bgcolor: "rgba(144, 202, 249, 0.08)",
              color: "text.primary",
            },
          }}
        >
          <ViewSidebarOutlinedIcon sx={{ width: 20, height: 20 }} />
        </Box>

        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            background: "linear-gradient(45deg, #90caf9 30%, #ce93d8 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 600,
          }}
        >
          Lysis
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <NotificationsMenu />
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
