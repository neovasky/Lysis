/**
 * File: src/components/TopBar/TopBar.tsx
 * Description: Top application bar with notifications
 */

import { AppBar, Toolbar, Typography, Stack } from "@mui/material";
import { NotificationsMenu } from "../NotificationsMenu/NotificationsMenu";

export const TopBar = () => {
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
