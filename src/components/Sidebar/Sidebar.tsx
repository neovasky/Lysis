/**
 * File: src/components/Sidebar/Sidebar.tsx
 * Description: Main navigation sidebar component with auth integration
 */

import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Divider,
  Avatar,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AssessmentIcon from "@mui/icons-material/Assessment";
import FolderIcon from "@mui/icons-material/Folder";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import NotesIcon from "@mui/icons-material/Notes";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 72;

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const { user, logout } = useAuth();

  const menuItems = [
    { text: "Dashboard", icon: <HomeIcon />, path: "/" },
    { text: "Glossary", icon: <MenuBookIcon />, path: "/glossary" },
    { text: "Analysis", icon: <AssessmentIcon />, path: "/analysis" },
    { text: "Files", icon: <FolderIcon />, path: "/files" },
    { text: "Calendar", icon: <CalendarMonthIcon />, path: "/calendar" },
    { text: "Research Notes", icon: <NotesIcon />, path: "/notes" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH,
        transition: "width 0.2s ease-in-out",
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH,
          transition: "width 0.2s ease-in-out",
          boxSizing: "border-box",
          overflowX: "hidden",
        },
      }}
    >
      <Toolbar
        sx={{
          px: 1,
          minHeight: 64,
          display: "flex",
          justifyContent: isOpen ? "space-between" : "center",
          alignItems: "center",
        }}
      >
        {isOpen ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: "primary.main",
                width: 32,
                height: 32,
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
              onClick={() => navigate("/profile")}
            >
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </Avatar>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 500,
                cursor: "pointer",
              }}
              onClick={() => navigate("/profile")}
            >
              {user?.firstName} {user?.lastName}
            </Typography>
          </Box>
        ) : (
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 32,
              height: 32,
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
            onClick={() => navigate("/profile")}
          >
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </Avatar>
        )}
        <IconButton
          onClick={() => setIsOpen(!isOpen)}
          sx={{
            width: 40,
            height: 40,
            backgroundColor: "rgba(144, 202, 249, 0.04)",
            "&:hover": {
              backgroundColor: "rgba(144, 202, 249, 0.08)",
            },
          }}
        >
          {isOpen ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Toolbar>

      <List sx={{ px: 1, py: 2 }}>
        {menuItems.map((item) => (
          <Tooltip
            key={item.text}
            title={!isOpen ? item.text : ""}
            placement="right"
          >
            <ListItemButton
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                mb: 0.5,
                justifyContent: isOpen ? "initial" : "center",
                minHeight: 48,
                "&.Mui-selected": {
                  backgroundColor: "rgba(144, 202, 249, 0.08)",
                  "&:hover": {
                    backgroundColor: "rgba(144, 202, 249, 0.12)",
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: isOpen ? 2 : "auto",
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  opacity: isOpen ? 1 : 0,
                  transition: "opacity 0.2s ease-in-out",
                  whiteSpace: "nowrap",
                  visibility: isOpen ? "visible" : "hidden",
                }}
                primaryTypographyProps={{
                  fontSize: "0.9rem",
                  fontWeight: location.pathname === item.path ? 600 : 400,
                }}
              />
            </ListItemButton>
          </Tooltip>
        ))}
      </List>

      <Divider sx={{ mx: 1 }} />

      <List sx={{ px: 1, py: 2 }}>
        <ListItemButton
          onClick={() => navigate("/settings")}
          selected={location.pathname === "/settings"}
          sx={{
            mb: 0.5,
            justifyContent: isOpen ? "initial" : "center",
            minHeight: 48,
            "&.Mui-selected": {
              backgroundColor: "rgba(144, 202, 249, 0.08)",
              "&:hover": {
                backgroundColor: "rgba(144, 202, 249, 0.12)",
              },
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: isOpen ? 2 : "auto",
              justifyContent: "center",
            }}
          >
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText
            primary="Settings"
            sx={{
              opacity: isOpen ? 1 : 0,
              transition: "opacity 0.2s ease-in-out",
              whiteSpace: "nowrap",
              visibility: isOpen ? "visible" : "hidden",
            }}
            primaryTypographyProps={{
              fontSize: "0.9rem",
              fontWeight: location.pathname === "/settings" ? 600 : 400,
            }}
          />
        </ListItemButton>

        <ListItemButton
          onClick={handleLogout}
          sx={{
            mb: 0.5,
            justifyContent: isOpen ? "initial" : "center",
            minHeight: 48,
            "&:hover": {
              backgroundColor: "rgba(144, 202, 249, 0.08)",
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: isOpen ? 2 : "auto",
              justifyContent: "center",
            }}
          >
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            sx={{
              opacity: isOpen ? 1 : 0,
              transition: "opacity 0.2s ease-in-out",
              whiteSpace: "nowrap",
              visibility: isOpen ? "visible" : "hidden",
            }}
            primaryTypographyProps={{
              fontSize: "0.9rem",
            }}
          />
        </ListItemButton>
      </List>
    </Drawer>
  );
};
