// File: src/components/ThemeSwitcher/ThemeCustomizer.tsx
import "react";
import { useTheme } from "@/theme/hooks/useTheme";
import { Moon, Sun } from "lucide-react";

const AVAILABLE_ACCENTS = [
  "blue",
  "red",
  "green",
  "orange",
  "purple",
  "pink",
  "yellow",
  "violet",
] as const;

export const ThemeCustomizer = () => {
  const { mode, setMode, accent, setAccent } = useTheme();

  const handleModeToggle = () => {
    setMode(mode === "dark" ? "light" : "dark");
  };

  return (
    <div className="p-4 space-y-4 bg-background text-foreground border border-gray-300 rounded">
      <h2 className="text-lg font-semibold">Theme Customizer</h2>

      {/* Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {mode === "dark" ? (
            <Moon className="h-5 w-5 text-gray-300" />
          ) : (
            <Sun className="h-5 w-5 text-yellow-400" />
          )}
          <span className="font-medium">Current Mode: {mode}</span>
        </div>
        <button
          onClick={handleModeToggle}
          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:opacity-80"
        >
          Toggle Mode
        </button>
      </div>

      {/* Accent Picker */}
      <div>
        <p className="font-medium mb-2">Accent Color</p>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_ACCENTS.map((color) => (
            <button
              key={color}
              onClick={() => setAccent(color)}
              className={`
                w-8 h-8 rounded-full border-2 hover:opacity-80
                ${accent === color ? "border-accent-9" : "border-transparent"}
              `}
              style={{
                backgroundColor: `hsl(var(--${color}-6))`,
              }}
              aria-label={`Set accent color to ${color}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
