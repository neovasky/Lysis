/**
 * File: src/theme/ThemeProvider.tsx
 * Description: Theme provider component
 */

import React, { useState, useEffect } from "react";
import { Theme as RadixTheme } from "@radix-ui/themes";
import { Theme, ThemeMode, ThemeAccent } from "./types";
import { ThemeContext, ThemeContextValue } from "./context";
import { defaultDarkTheme } from "./variants/dark";
import { defaultLightTheme } from "./variants/light";
import "./globalStyles.css";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
  defaultAccent?: ThemeAccent;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = "dark",
  defaultAccent = "blue",
}) => {
  const [mode, setMode] = useState<ThemeMode>(defaultMode);
  const [accent, setAccent] = useState<ThemeAccent>(defaultAccent);
  const [theme, setTheme] = useState<Theme>(
    mode === "dark" ? defaultDarkTheme : defaultLightTheme
  );

  useEffect(() => {
    const newTheme = mode === "dark" ? defaultDarkTheme : defaultLightTheme;
    setTheme(newTheme);
    applyTheme(newTheme, mode, accent);
  }, [mode, accent]);

  const applyTheme = (theme: Theme, mode: ThemeMode, accent: ThemeAccent) => {
    const root = document.documentElement;

    // Set theme mode and accent
    root.setAttribute("data-theme", mode);
    root.setAttribute("data-accent", accent);

    // Apply colors
    Object.entries(theme.tokens.colors).forEach(([key, value]) => {
      if (value && typeof value === "object") {
        // Handle nested color objects (like text: { primary, secondary })
        Object.entries(value as Record<string, string>).forEach(
          ([subKey, subValue]) => {
            root.style.setProperty(`--color-${key}-${subKey}`, subValue);
          }
        );
      } else if (typeof value === "string") {
        // Handle direct color values
        root.style.setProperty(`--color-${key}`, value);
      }
    });

    // Apply shadows
    Object.entries(theme.tokens.shadows).forEach(([key, value]) => {
      if (typeof value === "string") {
        root.style.setProperty(`--shadow-${key}`, value);
      }
    });
  };

  const contextValue: ThemeContextValue = {
    mode,
    accent,
    theme,
    setMode,
    setAccent,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <RadixTheme
        appearance={mode}
        accentColor={accent}
        grayColor={theme.config.grayColor}
        radius={theme.config.radius}
        scaling={theme.config.scaling}
      >
        {children}
      </RadixTheme>
    </ThemeContext.Provider>
  );
};
