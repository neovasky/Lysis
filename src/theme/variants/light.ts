/**
 * File: src/theme/variants/light.ts
 * Description: Light theme configuration
 */

import { Theme } from "../types";

export const defaultLightTheme: Theme = {
  config: {
    accentColor: "blue",
    grayColor: "slate",
    radius: "medium",
    scaling: "100%",
  },
  tokens: {
    colors: {
      pageBackground: "#ffffff",
      panelSolid: "#f8fafc",
      panelTranslucent: "rgba(248, 250, 252, 0.85)",
      surface1: "#f1f5f9",
      surface2: "#e2e8f0",
      focusRoot: "#3b82f6",
      borderCard: "rgba(0, 0, 0, 0.08)",
      text: {
        primary: "rgba(0, 0, 0, 0.87)",
        secondary: "rgba(0, 0, 0, 0.6)",
        disabled: "rgba(0, 0, 0, 0.38)",
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
