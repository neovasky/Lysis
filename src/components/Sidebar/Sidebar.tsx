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
          backgroundColor: "#1a1a1a",
        },
      }}
    >
      {/* Logo and Collapse Button */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {isOpen ? (
          <Typography
            variant="h6"
            sx={{
              background: "linear-gradient(45deg, #90caf9 30%, #ce93d8 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 600,
            }}
          >
            Lysis
          </Typography>
        ) : (
          <div /> // Empty div for spacing
        )}
        <IconButton
          onClick={() => setIsOpen(!isOpen)}
          sx={{
            minWidth: 0,
            p: 1,
            bgcolor: "rgba(144, 202, 249, 0.04)",
            "&:hover": {
              bgcolor: "rgba(144, 202, 249, 0.08)",
            },
          }}
        >
          {isOpen ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Box>

      {/* Profile Section */}
      <Box sx={{ px: 2, py: 1.5 }}>
        <Box
          onClick={() => navigate("/profile")}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            cursor: "pointer",
            "&:hover": {
              "& .MuiTypography-root": {
                color: "primary.main",
              },
            },
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: "primary.main",
              fontSize: "0.875rem",
            }}
          >
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </Avatar>
          {isOpen && (
            <Typography
              variant="subtitle2"
              sx={{
                transition: "color 0.2s",
              }}
            >
              {user?.firstName} {user?.lastName}
            </Typography>
          )}
        </Box>
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Navigation Items */}
      <List sx={{ px: 1, py: 1 }}>
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
                minHeight: 44,
                borderRadius: 1,
                mb: 0.5,
                justifyContent: isOpen ? "initial" : "center",
                "&.Mui-selected": {
                  bgcolor: "rgba(144, 202, 249, 0.08)",
                  "&:hover": {
                    bgcolor: "rgba(144, 202, 249, 0.12)",
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
                primaryTypographyProps={{
                  fontSize: "0.875rem",
                }}
                sx={{
                  opacity: isOpen ? 1 : 0,
                  visibility: isOpen ? "visible" : "hidden",
                }}
              />
            </ListItemButton>
          </Tooltip>
        ))}
      </List>

      {/* Bottom Section */}
      <Box sx={{ mt: "auto" }}>
        <Divider />
        <List sx={{ px: 1, py: 1 }}>
          <ListItemButton
            onClick={() => navigate("/settings")}
            selected={location.pathname === "/settings"}
            sx={{
              minHeight: 44,
              borderRadius: 1,
              mb: 0.5,
              justifyContent: isOpen ? "initial" : "center",
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
              primaryTypographyProps={{
                fontSize: "0.875rem",
              }}
              sx={{
                opacity: isOpen ? 1 : 0,
                visibility: isOpen ? "visible" : "hidden",
              }}
            />
          </ListItemButton>

          <ListItemButton
            onClick={handleLogout}
            sx={{
              minHeight: 44,
              borderRadius: 1,
              justifyContent: isOpen ? "initial" : "center",
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
              primaryTypographyProps={{
                fontSize: "0.875rem",
              }}
              sx={{
                opacity: isOpen ? 1 : 0,
                visibility: isOpen ? "visible" : "hidden",
              }}
            />
          </ListItemButton>
        </List>
      </Box>
    </Drawer>
  );
};
