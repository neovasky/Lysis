// File: src/components/Sidebar/Sidebar.tsx
"use client";

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/theme/hooks/useTheme";
import { useSidebar } from "@/components/Sidebar/sidebar-layout";
import {
  Home,
  BookOpen,
  BarChart,
  Folder,
  Calendar,
  FileText,
  Settings,
  User,
} from "lucide-react";
import cn from "classnames";

interface MenuItem {
  text: string;
  icon: JSX.Element;
  path: string;
  badge?: number;
}

const mainItems: MenuItem[] = [
  { text: "Dashboard", icon: <Home size={24} />, path: "/" },
  { text: "Glossary", icon: <BookOpen size={24} />, path: "/glossary" },
  { text: "Analysis", icon: <BarChart size={24} />, path: "/analysis" },
];

const resourceItems: MenuItem[] = [
  { text: "Files", icon: <Folder size={24} />, path: "/files", badge: 3 },
  { text: "Calendar", icon: <Calendar size={24} />, path: "/calendar" },
];

const researchItems: MenuItem[] = [
  { text: "Research Notes", icon: <FileText size={24} />, path: "/notes" },
];

function SidebarItem({ item }: { item: MenuItem }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { accent } = useTheme();
  const { isOpen } = useSidebar();

  const isActive = location.pathname === item.path;

  return (
    <div
      onClick={() => navigate(item.path)}
      className={cn(
        "flex items-center rounded-md cursor-pointer transition-all duration-300 ease-in-out",
        {
          "p-2 gap-3 justify-start": isOpen,
          "p-2 justify-center": !isOpen,
          [`bg-[hsl(var(--${accent}-700))] text-[hsl(var(--${accent}-900))]`]:
            isActive,
        }
      )}
    >
      <div className="shrink-0">{item.icon}</div>

      {/* Animated text container */}
      <div
        className="ml-1 overflow-hidden whitespace-nowrap"
        style={{
          maxWidth: isOpen ? "150px" : "0px",
          opacity: isOpen ? 1 : 0,
          transition:
            "max-width 300ms ease-in-out, opacity 300ms ease-in-out 100ms",
        }}
      >
        <span className="text-sm">{item.text}</span>
      </div>

      {item.badge && (
        <div
          className="overflow-hidden whitespace-nowrap ml-auto"
          style={{
            maxWidth: isOpen ? "50px" : "0px",
            opacity: isOpen ? 1 : 0,
            transition:
              "max-width 300ms ease-in-out, opacity 300ms ease-in-out 100ms",
            backgroundColor: `hsl(var(--${accent}-900))`,
          }}
        >
          <span className="text-white text-xs px-2 py-1 rounded-full">
            {item.badge}
          </span>
        </div>
      )}
    </div>
  );
}

function SidebarSection({
  heading,
  items,
}: {
  heading: string;
  items: MenuItem[];
}) {
  const { isOpen } = useSidebar();

  return (
    <div
      className={cn("transition-all duration-300 ease-in-out", {
        "mb-4": isOpen,
        "mb-2": !isOpen,
      })}
    >
      <h3
        className="text-xs font-bold uppercase text-foreground/80 overflow-hidden whitespace-nowrap"
        style={{
          opacity: isOpen ? 1 : 0,
          maxHeight: isOpen ? "1rem" : "0",
          transition: "max-height 300ms ease-in-out, opacity 300ms ease-in-out",
          marginBottom: isOpen ? "0.5rem" : "0",
        }}
      >
        {heading}
      </h3>
      <div className="space-y-2">
        {items.map((item) => (
          <SidebarItem key={item.path} item={item} />
        ))}
      </div>
    </div>
  );
}

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { accent } = useTheme();
  const { isOpen } = useSidebar();

  return (
    <div
      className={cn(
        "h-screen overflow-hidden flex-shrink-0 z-40 transition-all duration-300 ease-in-out",
        isOpen ? "w-60" : "w-16"
      )}
      style={{
        backgroundColor: `hsl(var(--${accent}-500))`,
        borderRight: "none", // Remove any border that might be causing the black line
      }}
    >
      <div className="p-3 overflow-y-auto h-full flex flex-col">
        <SidebarSection heading="MAIN" items={mainItems} />
        <SidebarSection heading="RESOURCES" items={resourceItems} />
        <SidebarSection heading="RESEARCH" items={researchItems} />

        <div className="mt-auto border-t border-gray-300 pt-3 space-y-2">
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
              icon: <User size={24} />,
              path: "/profile",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
