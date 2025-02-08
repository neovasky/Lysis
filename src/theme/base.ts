/**
 * File: src/theme/base.ts
 * Description: Base theme configuration shared across all themes
 */

import { ThemeConfig } from "./types";

export const baseConfig: ThemeConfig = {
  accentColor: "blue",
  grayColor: "slate",
  radius: "medium",
  scaling: "95%",
};

export const fontStack = {
  primary: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
  mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
};

export const radii = {
  small: "4px",
  medium: "6px",
  large: "8px",
  full: "9999px",
};

export const spacing = {
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  7: "32px",
  8: "40px",
  9: "48px",
};

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};
