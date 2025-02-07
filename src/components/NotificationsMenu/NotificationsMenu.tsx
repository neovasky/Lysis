/**
 * File: src/components/NotificationsMenu/NotificationsMenu.tsx
 * Description: Notifications dropdown menu component
 */

import { useState } from "react";
import {
  IconButton,
  Badge,
  Menu,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  TrendingUp,
  ShowChart,
  AttachMoney,
  DateRange,
  Circle as CircleIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  type: "price_alert" | "earnings" | "news" | "watchlist" | "analysis";
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export const NotificationsMenu = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "price_alert",
      title: "AAPL Price Alert",
      description: "AAPL has crossed above $150",
      timestamp: new Date(),
      read: false,
      actionUrl: "/analysis",
    },
    {
      id: "2",
      type: "earnings",
      title: "Upcoming Earnings",
      description: "MSFT reports earnings tomorrow",
      timestamp: new Date(),
      read: false,
      actionUrl: "/calendar",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    handleClose();
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "price_alert":
        return <TrendingUp color="primary" />;
      case "earnings":
        return <AttachMoney color="success" />;
      case "news":
        return <ShowChart color="info" />;
      case "watchlist":
        return <DateRange color="warning" />;
      default:
        return <CircleIcon color="action" />;
    }
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton color="inherit" onClick={handleOpen}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
            overflow: "auto",
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Notifications</Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={handleMarkAllRead}>
                Mark all as read
              </Button>
            )}
          </Stack>
        </Box>

        <Divider />

        {notifications.length > 0 ? (
          <List>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  cursor: "pointer",
                  backgroundColor: notification.read
                    ? "transparent"
                    : "rgba(144, 202, 249, 0.08)",
                  "&:hover": {
                    backgroundColor: "rgba(144, 202, 249, 0.12)",
                  },
                }}
              >
                <ListItemIcon>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={notification.title}
                  secondary={
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      component="span"
                    >
                      {notification.description}
                      <br />
                      <Typography
                        variant="caption"
                        color="text.disabled"
                        component="span"
                      >
                        {notification.timestamp.toLocaleTimeString()}
                      </Typography>
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography color="text.secondary">No notifications</Typography>
          </Box>
        )}
      </Menu>
    </>
  );
};
