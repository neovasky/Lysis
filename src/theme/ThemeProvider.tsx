/**
 * File: src/theme/ThemeProvider.tsx
 * Description: Minimal theme provider for dark/light mode and accent color
 */

import React, { useState, useEffect } from "react";
import { ThemeContext, ThemeContextValue } from "./context";
import { ThemeMode, ThemeAccent } from "./types";
import "./globalStyles.css";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode; // "light" | "dark"
  defaultAccent?: ThemeAccent; // e.g. "blue", "red", ...
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = "dark",
  defaultAccent = "blue",
}) => {
  const [mode, setMode] = useState<ThemeMode>(defaultMode);
  const [accent, setAccent] = useState<ThemeAccent>(defaultAccent);

  // This effect toggles the .dark class for Tailwind
  // and sets a data-accent attribute for your accent color.
  useEffect(() => {
    const root = document.documentElement;

    // 1) Toggle .dark for Tailwind dark mode
    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // 2) (Optional) Set a data-accent attribute you can read in CSS
    root.setAttribute("data-accent", accent);

    // 3) (Optional) If you want to set custom CSS vars, do so here:
    // Example:
    // root.style.setProperty("--my-accent-color", pickAccentHex(accent));
  }, [mode, accent]);

  // We still expose the context if other hooks (like useColorMode) want to read them
  const contextValue: ThemeContextValue = {
    mode,
    accent,
    setMode,
    setAccent,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
