import "react";
import { PanelLeft } from "lucide-react";
import { ModeToggle } from "../ThemeSwitcher/ModeToggle";

interface TopBarProps {
  isSidebarOpen: boolean;
  onSidebarToggle: (isOpen: boolean) => void;
}

export const TopBar = ({ isSidebarOpen, onSidebarToggle }: TopBarProps) => {
  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-panelSolid dark:bg-[#18181b] border-b border-gray-300 z-50">
      <div className="flex items-center justify-between px-4 h-full">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onSidebarToggle(!isSidebarOpen)}
            className="p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            aria-label="Toggle Sidebar"
          >
            <PanelLeft className="h-6 w-6" />
          </button>
          {/* You can add more left-side elements here */}
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          {/* You can add more right-side elements here */}
        </div>
      </div>
    </div>
  );
};
