import "react";
import { PanelLeft } from "lucide-react";
import { ModeToggle } from "../ThemeSwitcher/ModeToggle";
import { useTheme } from "@/theme/hooks/useTheme";

interface TopBarProps {
  isSidebarOpen: boolean;
  onSidebarToggle: (isOpen: boolean) => void;
}

export const TopBar = ({ isSidebarOpen, onSidebarToggle }: TopBarProps) => {
  const { accent } = useTheme();

  return (
    <div
      className="fixed top-0 left-0 right-0 h-16 border-b border-gray-300 z-50"
      style={{ backgroundColor: `hsl(var(--${accent}-700))` }}
    >
      <div className="flex items-center justify-between px-4 h-full">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onSidebarToggle(!isSidebarOpen)}
            className="p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
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
