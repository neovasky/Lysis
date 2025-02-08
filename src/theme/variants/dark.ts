/**
 * File: src/theme/variants/dark.ts
 * Description: Dark theme configuration
 */

import { Theme } from "../types";

export const defaultDarkTheme: Theme = {
  config: {
    accentColor: "blue",
    grayColor: "slate",
    radius: "medium",
    scaling: "100%",
  },
  tokens: {
    colors: {
      pageBackground: "#09090b",
      panelSolid: "#18181b",
      panelTranslucent: "rgba(24, 24, 27, 0.85)",
      surface1: "#27272a",
      surface2: "#3f3f46",
      focusRoot: "#60a5fa",
      borderCard: "rgba(255, 255, 255, 0.08)",
      text: {
        primary: "rgba(255, 255, 255, 0.95)",
        secondary: "rgba(255, 255, 255, 0.65)",
        disabled: "rgba(255, 255, 255, 0.38)",
      },
    },
    shadows: {
      card: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      dropdown:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      modal:
        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    },
  },
};
