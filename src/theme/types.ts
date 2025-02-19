/**
 * File: src/theme/types.ts
 * Description: Theme system type definitions
 */

export type ThemeMode = "light" | "dark";

// Updated ThemeAccent union to include all desired accent colors
export type ThemeAccent =
  | "slate"
  | "gray"
  | "zinc"
  | "neutral"
  | "stone"
  | "red"
  | "orange"
  | "amber"
  | "yellow"
  | "lime"
  | "green"
  | "emerald"
  | "teal"
  | "cyan"
  | "sky"
  | "blue"
  | "indigo"
  | "violet"
  | "purple"
  | "fuchsia"
  | "pink"
  | "rose"
  | "tomato";

export interface ThemeColors {
  pageBackground: string;
  panelSolid: string;
  panelTranslucent: string;
  surface1: string;
  surface2: string;
  focusRoot: string;
  borderCard: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
}

export interface ThemeConfig {
  accentColor: ThemeAccent;
  grayColor: "slate" | "mauve" | "olive" | "sage" | "sand";
  radius: "none" | "small" | "medium" | "large" | "full";
  scaling: "90%" | "95%" | "100%" | "105%" | "110%";
}

export interface ThemeShadows {
  card: string;
  dropdown: string;
  modal: string;
}

export interface ThemeTokens {
  colors: ThemeColors;
  shadows: ThemeShadows;
}

export interface Theme {
  config: ThemeConfig;
  tokens: ThemeTokens;
}
