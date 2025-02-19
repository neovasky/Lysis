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
  defaultAccent?: ThemeAccent; // e.g. "blue", "red", etc.
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = "dark",
  defaultAccent = "slate",
}) => {
  const [mode, setMode] = useState<ThemeMode>(defaultMode);
  const [accent, setAccent] = useState<ThemeAccent>(defaultAccent);

  useEffect(() => {
    const root = document.documentElement;

    // Toggle dark mode class for Tailwind
    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Set the data-accent attribute and log the change
    root.setAttribute("data-accent", accent);
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
