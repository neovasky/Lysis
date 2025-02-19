import "react";
import { PanelLeft } from "lucide-react";
import { ModeToggle } from "../ThemeSwitcher/ModeToggle";
// Remove useTheme if you're not using it in TopBar, or at least the "accent" property.
// import { useTheme } from "@/theme/hooks/useTheme";  // If not used, remove entirely

interface TopBarProps {
  isSidebarOpen: boolean;
  onSidebarToggle: (isOpen: boolean) => void;
}

export const TopBar = ({ isSidebarOpen, onSidebarToggle }: TopBarProps) => {
  // If you don't need the accent value, don't destructure it.
  // const { accent } = useTheme();

  return (
    <div
      className="fixed top-0 left-0 right-0 h-16 z-50"
      style={{ backgroundColor: "var(--color-pageBackground)" }}
    >
      <div className="flex items-center justify-between px-4 h-full">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onSidebarToggle(!isSidebarOpen)}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Toggle Sidebar"
          >
            <PanelLeft className="h-6 w-6" />
          </button>
          {/* Additional left-side elements */}
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          {/* Additional right-side elements */}
        </div>
      </div>
    </div>
  );
};
