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

// Use a helper function to safely read localStorage (since it only exists in the browser)
function getStoredValue(key: string) {
  return typeof window !== "undefined" ? localStorage.getItem(key) : null;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = "dark",
  defaultAccent = "classic",
}) => {
  // Initialize state from localStorage if available
  const initialMode =
    (getStoredValue(MODE_KEY) as ThemeMode | null) || defaultMode;
  const initialAccent =
    (getStoredValue(ACCENT_KEY) as ThemeAccent | null) || defaultAccent;

  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const [accent, setAccent] = useState<ThemeAccent>(initialAccent);

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

    // Set page background based on mode and accent
    if (mode === "dark") {
      root.style.setProperty(
        "--color-pageBackground",
        `hsl(var(--${accent}-1000) / 1)`
      );
    } else {
      root.style.setProperty(
        "--color-pageBackground",
        `hsl(var(--${accent}-50) / 1)`
      );
    }

    // Save updates to localStorage
    localStorage.setItem(MODE_KEY, mode);
    localStorage.setItem(ACCENT_KEY, accent);

    // Debug logs
    console.log("ThemeProvider update:", {
      mode,
      accent,
      dataAccent: root.getAttribute("data-accent"),
      inlinePageBackground: root.style.getPropertyValue(
        "--color-pageBackground"
      ),
    });
    const computedBackground = getComputedStyle(root)
      .getPropertyValue("--color-pageBackground")
      .trim();
    console.log("Computed --color-pageBackground:", computedBackground);
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
