// File: src/components/Sidebar/Sidebar.tsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
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

interface SidebarProps {
  isOpen: boolean;
}

interface MenuItem {
  text: string;
  icon: JSX.Element;
  path: string;
  badge?: number;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

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
        { text: "Files", icon: <Folder size={24} />, path: "/files", badge: 3 },
        { text: "Calendar", icon: <Calendar size={24} />, path: "/calendar" },
      ],
    },
    {
      title: "RESEARCH",
      items: [
        {
          text: "Research Notes",
          icon: <FileText size={24} />,
          path: "/notes",
        },
      ],
    },
  ];

  const SidebarItem = ({ item }: { item: MenuItem }) => {
    const isActive = location.pathname === item.path;

    return (
      <div
        onClick={() => navigate(item.path)}
        className={cn(
          "flex items-center gap-3 p-2 rounded-md transition-colors cursor-pointer",
          {
            "bg-accent-2 text-accent-9": isActive,
            "hover:bg-accent-1 hover:text-accent-9": !isActive,
          }
        )}
      >
        <div className={cn("shrink-0", isActive ? "text-accent-9" : "")}>
          {item.icon}
        </div>
        {isOpen && (
          <>
            <span
              className={cn(
                "text-sm truncate",
                isActive ? "font-bold text-accent-9" : "text-foreground"
              )}
            >
              {item.text}
            </span>
            {item.badge && (
              <span className="ml-auto bg-accent-9 text-white text-xs px-2 py-1 rounded-full">
                {item.badge}
              </span>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "fixed top-16 left-0 bottom-0 border-r border-gray-300 transition-all duration-200 overflow-hidden",
        "bg-background text-foreground",
        isOpen ? "w-60" : "w-16"
      )}
    >
      <div className="p-4 overflow-y-auto h-full flex flex-col">
        {menuSections.map((section) => (
          <div key={section.title} className="mb-4">
            {isOpen && (
              <h3 className="text-xs font-bold uppercase mb-2 text-foreground/80">
                {section.title}
              </h3>
            )}
            <div>
              {section.items.map((item) => (
                <SidebarItem key={item.path} item={item} />
              ))}
            </div>
          </div>
        ))}
        <div className="mt-auto border-t border-gray-300 pt-4">
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
