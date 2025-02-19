// File: src/components/ThemeSwitcher/ModeToggle.tsx
import "react";
import { Moon, Sun } from "lucide-react";
import { useColorMode } from "@/theme/hooks/useColorMode";

export const ModeToggle = () => {
  const { mode, toggleMode } = useColorMode();

  return (
    <button
      onClick={toggleMode}
      className="p-2 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
      aria-label="Toggle Dark Mode"
    >
      {mode === "dark" ? (
        <Sun className="h-6 w-6 text-yellow-400" />
      ) : (
        <Moon className="h-6 w-6 text-gray-800" />
      )}
    </button>
  );
};
