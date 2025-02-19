/**
 * File: src/theme/ThemeProvider.tsx
 * Description: Minimal theme provider for dark/light mode and accent color
 */

import React, { useState, useEffect } from "react";
import { ThemeContext, ThemeContextValue } from "./context";
import { ThemeMode, ThemeAccent } from "./types";
import "./globalStyles.css";

const MODE_KEY = "lysisThemeMode";
const ACCENT_KEY = "lysisThemeAccent";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode; // "light" | "dark"
  defaultAccent?: ThemeAccent; // e.g. "blue", "red", etc.
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = "dark",
  defaultAccent = "slate",
}) => {
  // 1) On initial render, read saved mode/accent from localStorage if present.
  const storedMode = localStorage.getItem(MODE_KEY) as ThemeMode | null;
  const storedAccent = localStorage.getItem(ACCENT_KEY) as ThemeAccent | null;

  const [mode, setMode] = useState<ThemeMode>(storedMode || defaultMode);
  const [accent, setAccent] = useState<ThemeAccent>(
    storedAccent || defaultAccent
  );

  useEffect(() => {
    const root = document.documentElement;

    // Toggle dark mode class for Tailwind
    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Set the data-accent attribute so CSS can pick up accent overrides
    root.setAttribute("data-accent", accent);

    // 2) Whenever mode or accent changes, save them to localStorage
    localStorage.setItem(MODE_KEY, mode);
    localStorage.setItem(ACCENT_KEY, accent);

    console.log("ThemeProvider update:", {
      mode,
      accent,
      dataAccent: root.getAttribute("data-accent"),
    });
  }, [mode, accent]);

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
