// File: src/components/Sidebar/SidebarToggle.tsx
import React, { useState } from "react";
import { PanelLeft, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useSidebar } from "./sidebar-layout";

interface SidebarToggleProps {
  className?: string;
}

export const SidebarToggle: React.FC<SidebarToggleProps> = ({
  className = "",
}) => {
  const { isOpen, toggle } = useSidebar();
  const [isHovered, setIsHovered] = useState(false);

  // Determine which icon to show based on hover state and sidebar state
  const renderIcon = () => {
    if (!isHovered) {
      // Default state (not hovered): always show PanelLeft
      return <PanelLeft className="h-5 w-5" />;
    } else if (isOpen) {
      // Hovered + Sidebar open: show PanelLeftClose
      return <PanelLeftClose className="h-5 w-5" />;
    } else {
      // Hovered + Sidebar closed: show PanelLeftOpen
      return <PanelLeftOpen className="h-5 w-5" />;
    }
  };

  return (
    <button
      onClick={toggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`p-2 rounded hover:bg-opacity-80 focus:outline-none ${className}`}
      style={{
        backgroundColor: isOpen ? "transparent" : "rgba(0, 0, 0, 0.2)",
      }}
      aria-label="Toggle Sidebar"
    >
      {renderIcon()}
    </button>
  );
};

export default SidebarToggle;
