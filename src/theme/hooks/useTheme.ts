/**
 * File: src/theme/hooks/useTheme.ts
 */

import { useContext } from "react";
import { ThemeContext, ThemeContextValue } from "../context";

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
