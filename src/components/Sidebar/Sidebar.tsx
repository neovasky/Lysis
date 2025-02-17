/**
 * File: src/components/Sidebar/Sidebar.tsx
 * Description: Main navigation sidebar component
 */

import { Box, Flex, Text, Avatar } from "@radix-ui/themes";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";
// Replace Radix icons with lucide-react icons
import {
  Home,
  BookOpen,
  BarChart,
  File,
  Calendar,
  FileText,
  Settings,
  User,
} from "lucide-react";

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
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const menuSections: MenuSection[] = [
    {
      title: "MAIN NAVIGATION",
      items: [
        { text: "Dashboard", icon: <Home size={24} />, path: "/" },
        { text: "Glossary", icon: <BookOpen size={24} />, path: "/glossary" },
        { text: "Analysis", icon: <BarChart size={24} />, path: "/analysis" },
      ],
    },
    {
      title: "RESOURCES",
      items: [
        { text: "Files", icon: <File size={24} />, path: "/files", badge: 3 },
        {
          text: "Calendar",
          icon: <Calendar size={24} />,
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
          icon: <FileText size={24} />,
          path: "/notes",
          badge: 5,
        },
      ],
    },
  ];

  const SidebarItem = ({ item }: { item: MenuSection["items"][0] }) => {
    const isActive = location.pathname === item.path;
    const isHovered = hoveredItem === item.path;

    return (
      <Flex
        align="center"
        gap="3"
        p="2"
        onClick={() => navigate(item.path)}
        onMouseEnter={() => setHoveredItem(item.path)}
        onMouseLeave={() => setHoveredItem(null)}
        style={{
          cursor: "pointer",
          borderRadius: "var(--radius-3)",
          backgroundColor: isActive
            ? "var(--accent-3)"
            : isHovered
            ? "var(--accent-2)"
            : "transparent",
          transition: "background-color 0.2s ease",
        }}
      >
        <Box style={{ color: isActive ? "var(--accent-9)" : "var(--gray-11)" }}>
          {item.icon}
        </Box>
        {isOpen && (
          <Text
            size="2"
            weight={isActive ? "bold" : "regular"}
            style={{
              color: isActive ? "var(--accent-9)" : "var(--gray-11)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {item.text}
          </Text>
        )}
        {item.badge && isOpen && (
          <Box
            style={{
              marginLeft: "auto",
              backgroundColor: "var(--accent-9)",
              color: "white",
              padding: "2px 8px",
              borderRadius: "9999px",
              fontSize: "12px",
            }}
          >
            {item.badge}
          </Box>
        )}
      </Flex>
    );
  };

  return (
    <Box
      style={{
        position: "fixed",
        top: "64px",
        left: 0,
        bottom: 0,
        width: isOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH,
        backgroundColor: "var(--color-panelSolid)",
        borderRight: "1px solid var(--color-borderCard)",
        transition: "width 0.2s ease",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        style={{
          flex: 1,
          overflow: "auto",
          padding: "16px",
        }}
      >
        <Flex direction="column" gap="5">
          {menuSections.map((section) => (
            <Box key={section.title}>
              {isOpen && (
                <Text
                  size="1"
                  weight="bold"
                  style={{
                    color: "var(--gray-11)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "8px",
                  }}
                >
                  {section.title}
                </Text>
              )}
              <Flex direction="column" gap="1">
                {section.items.map((item) => (
                  <SidebarItem key={item.path} item={item} />
                ))}
              </Flex>
            </Box>
          ))}
        </Flex>
      </Box>

      <Box
        style={{
          padding: "16px",
          borderTop: "1px solid var(--color-borderCard)",
        }}
      >
        <Flex direction="column" gap="1">
          <SidebarItem
            item={{
              text: "Settings",
              icon: <Settings size={24} />,
              path: "/settings",
            }}
          />
          <SidebarItem
            item={{
              text: user ? `${user.firstName} ${user.lastName}` : "Profile",
              icon: isOpen ? (
                <Avatar
                  size="1"
                  src=""
                  fallback={user?.firstName?.[0] || "U"}
                  style={{
                    backgroundColor: "var(--accent-9)",
                  }}
                />
              ) : (
                <User size={24} />
              ),
              path: "/profile",
            }}
          />
        </Flex>
      </Box>
    </Box>
  );
};
