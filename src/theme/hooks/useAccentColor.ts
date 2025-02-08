/**
 * File: src/theme/hooks/useAccentColor.ts
 */

import { useTheme } from "./useTheme";

export const useAccentColor = () => {
  const { accent, setAccent } = useTheme();
  return { accent, setAccent };
};
