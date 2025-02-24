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

function getStoredValue(key: string) {
  return typeof window !== "undefined" ? localStorage.getItem(key) : null;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = "dark",
  defaultAccent = "classic",
}) => {
  const initialMode =
    (getStoredValue(MODE_KEY) as ThemeMode | null) || defaultMode;
  const initialAccent =
    (getStoredValue(ACCENT_KEY) as ThemeAccent | null) || defaultAccent;

  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const [accent, setAccent] = useState<ThemeAccent>(initialAccent);

  useEffect(() => {
    const root = document.documentElement;

    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    root.setAttribute("data-accent", accent);

    // Set card background: use accent-400 in light mode and accent-700 in dark mode.
    if (mode === "dark") {
      // Regular card variables
      root.style.setProperty(
        "--card-background",
        `hsl(var(--${accent}-700) / 1)`
      );
      root.style.setProperty("--card-border", `hsl(var(--${accent}-800) / 1)`);
      root.style.setProperty(
        "--color-pageBackground",
        `hsl(var(--${accent}-1000) / 1)`
      );

      // Button variables
      root.style.setProperty(
        "--button-background",
        `hsl(var(--${accent}-600) / 1)`
      );
      root.style.setProperty(
        "--button-background-hover",
        `hsl(var(--${accent}-400) / 1)`
      );

      // Grid card variables - with enhanced visibility in dark mode
      root.style.setProperty(
        "--grid-card-background",
        `hsl(var(--${accent}-500) / 1)`
      );
      root.style.setProperty(
        "--grid-card-border",
        `hsl(var(--${accent}-700) / 1)`
      );
      root.style.setProperty("--grid-card-text", "#ffffff");
      root.style.setProperty(
        "--grid-card-shadow",
        "0 4px 8px rgba(0, 0, 0, 0.3)"
      );
      root.style.setProperty(
        "--grid-card-shadow-hover",
        "0 6px 12px rgba(0, 0, 0, 0.5)"
      );

      // Quick Access button variables for home page
      root.style.setProperty(
        "--quick-access-background",
        `hsl(var(--${accent}-600) / 1)`
      );
      root.style.setProperty(
        "--quick-access-border",
        `hsl(var(--${accent}-800) / 1)`
      );
      root.style.setProperty("--quick-access-text", "#ffffff");
      root.style.setProperty(
        "--quick-access-shadow",
        "0 4px 8px rgba(0, 0, 0, 0.3)"
      );
      root.style.setProperty(
        "--quick-access-shadow-hover",
        "0 6px 12px rgba(0, 0, 0, 0.5)"
      );
    } else {
      // Regular card variables
      root.style.setProperty(
        "--card-background",
        `hsl(var(--${accent}-500) / 1)`
      );
      root.style.setProperty("--card-border", `hsl(var(--${accent}-300) / 1)`);
      root.style.setProperty(
        "--color-pageBackground",
        `hsl(var(--${accent}-50) / 1)`
      );

      // Button variables
      root.style.setProperty(
        "--button-background",
        `hsl(var(--${accent}-500) / 1)`
      );
      root.style.setProperty(
        "--button-background-hover",
        `hsl(var(--${accent}-600) / 1)`
      );

      // Grid card variables - with appropriate contrast in light mode
      root.style.setProperty(
        "--grid-card-background",
        `hsl(var(--${accent}-600) / 1)`
      );
      root.style.setProperty(
        "--grid-card-border",
        `hsl(var(--${accent}-800) / 1)`
      );
      root.style.setProperty("--grid-card-text", "#ffffff");
      root.style.setProperty(
        "--grid-card-shadow",
        "0 4px 8px rgba(0, 0, 0, 0.2)"
      );
      root.style.setProperty(
        "--grid-card-shadow-hover",
        "0 6px 12px rgba(0, 0, 0, 0.4)"
      );

      // Quick Access button variables for home page
      root.style.setProperty(
        "--quick-access-background",
        `hsl(var(--${accent}-500) / 1)`
      );
      root.style.setProperty(
        "--quick-access-border",
        `hsl(var(--${accent}-700) / 1)`
      );
      root.style.setProperty("--quick-access-text", "#ffffff");
      root.style.setProperty(
        "--quick-access-shadow",
        "0 4px 6px rgba(0, 0, 0, 0.2)"
      );
      root.style.setProperty(
        "--quick-access-shadow-hover",
        "0 6px 10px rgba(0, 0, 0, 0.3)"
      );
    }

    localStorage.setItem(MODE_KEY, mode);
    localStorage.setItem(ACCENT_KEY, accent);

    console.log("ThemeProvider update:", {
      mode,
      accent,
      dataAccent: root.getAttribute("data-accent"),
      cardBackground: root.style.getPropertyValue("--card-background"),
      gridCardBackground: root.style.getPropertyValue("--grid-card-background"),
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
