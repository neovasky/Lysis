/**
 * File: src/theme/hooks/useColorMode.ts
 */

import { useTheme } from "./useTheme";

export const useColorMode = () => {
  const { mode, setMode } = useTheme();
  const toggleMode = () => setMode(mode === "light" ? "dark" : "light");
  return { mode, toggleMode };
};
