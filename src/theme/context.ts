/**
 * File: src/theme/context.ts
 * Description: Theme context and types
 */

import { createContext } from "react";
import { ThemeMode, ThemeAccent } from "./types";

export interface ThemeContextValue {
  mode: ThemeMode;
  accent: ThemeAccent;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: ThemeAccent) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
