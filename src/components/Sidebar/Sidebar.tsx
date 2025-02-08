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
  Box,
  Tooltip,
  Divider,
  Avatar,
  Typography,
  Badge,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AssessmentIcon from "@mui/icons-material/Assessment";
import FolderIcon from "@mui/icons-material/Folder";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import NotesIcon from "@mui/icons-material/Notes";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 72;

interface SidebarProps {
  isOpen: boolean;
}

interface MenuSection {
  title: string;
  items: {
    text: string;
    icon: JSX.Element;
    path: string;
    badge?: number;
  }[];
}

export const Sidebar = ({ isOpen }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuSections: MenuSection[] = [
    {
      title: "MAIN NAVIGATION",
      items: [
        { text: "Dashboard", icon: <HomeIcon />, path: "/" },
        { text: "Glossary", icon: <MenuBookIcon />, path: "/glossary" },
        { text: "Analysis", icon: <AssessmentIcon />, path: "/analysis" },
      ],
    },
    {
      title: "RESOURCES",
      items: [
        { text: "Files", icon: <FolderIcon />, path: "/files", badge: 3 },
        {
          text: "Calendar",
          icon: <CalendarMonthIcon />,
          path: "/calendar",
          badge: 2,
        },
      ],
    },
    {
      title: "RESEARCH",
      items: [
        {
          text: "Research Notes",
          icon: <NotesIcon />,
          path: "/notes",
          badge: 5,
        },
      ],
    },
  ];

  const renderMenuItem = (item: MenuSection["items"][0]) => (
    <Tooltip key={item.text} title={!isOpen ? item.text : ""} placement="right">
      <ListItemButton
        onClick={() => navigate(item.path)}
        selected={location.pathname === item.path}
        sx={{
          minHeight: 44,
          borderRadius: 1,
          mb: 0.5,
          justifyContent: isOpen ? "initial" : "center",
          px: 2.5,
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
            mr: isOpen ? 2 : 0,
            justifyContent: "center",
          }}
        >
          {item.badge ? (
            <Badge badgeContent={item.badge} color="primary">
              {item.icon}
            </Badge>
          ) : (
            item.icon
          )}
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
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH,
        flexShrink: 0,
        whiteSpace: "nowrap",
        "& .MuiDrawer-paper": {
          width: isOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH,
          backgroundColor: "#1a1a1a",
          borderRight: "none",
          boxSizing: "border-box",
          overflowX: "hidden",
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          pt: "64px", // Match TopBar height
        },
      }}
    >
      {/* Navigation start padding */}
      <Box sx={{ height: 16 }} />

      {/* Navigation Items */}
      <Box sx={{ px: 1 }}>
        {menuSections.map((section, index) => (
          <Box key={section.title} sx={{ mb: 3 }}>
            {isOpen && (
              <Typography
                variant="overline"
                sx={{
                  px: 3,
                  py: 1,
                  color: "text.secondary",
                  fontSize: "0.65rem",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                }}
              >
                {section.title}
              </Typography>
            )}
            <List>{section.items.map(renderMenuItem)}</List>
            {index < menuSections.length - 1 && isOpen && (
              <Divider sx={{ my: 1 }} />
            )}
          </Box>
        ))}
      </Box>

      {/* Bottom Section */}
      <Box sx={{ mt: "auto" }}>
        <Divider />
        <List sx={{ px: 1 }}>
          <ListItemButton
            onClick={() => navigate("/settings")}
            selected={location.pathname === "/settings"}
            sx={{
              minHeight: 44,
              borderRadius: 1,
              mb: 0.5,
              justifyContent: isOpen ? "initial" : "center",
              px: 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: isOpen ? 2 : 0,
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
            onClick={() => navigate("/profile")}
            selected={location.pathname === "/profile"}
            sx={{
              minHeight: 44,
              borderRadius: 1,
              justifyContent: isOpen ? "initial" : "center",
              px: 2.5,
              mb: 0.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: isOpen ? 2 : 0,
                justifyContent: "center",
              }}
            >
              {isOpen ? (
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    fontSize: "0.75rem",
                    bgcolor: "primary.main",
                  }}
                >
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </Avatar>
              ) : (
                <PersonIcon />
              )}
            </ListItemIcon>
            <ListItemText
              primary={`${user?.firstName} ${user?.lastName}`}
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
