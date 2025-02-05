import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9", // A lighter blue that works well in dark mode
      light: "#e3f2fd",
      dark: "#42a5f5",
    },
    secondary: {
      main: "#ce93d8", // A softer purple for dark mode
    },
    background: {
      default: "#121212", // Material Design dark mode background
      paper: "#1e1e1e", // Slightly lighter than default for cards/surfaces
    },
    text: {
      primary: "#ffffff",
      secondary: "rgba(255, 255, 255, 0.7)",
    },
  },
  typography: {
    fontFamily: [
      "Plus Jakarta Sans", // Modern, clean font
      "SF Pro Display", // Apple's system font
      "Roboto",
      "system-ui",
      "-apple-system",
      "BlinkMacSystemFont",
      "sans-serif",
    ].join(","),
    h6: {
      fontWeight: 600, // Making headings slightly bolder
      letterSpacing: 0.5,
    },
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#1a1a1a", // Slightly lighter than background
          borderRight: "1px solid rgba(255, 255, 255, 0.05)",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: "4px 8px",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.05)",
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: "rgba(255, 255, 255, 0.7)",
        },
      },
    },
  },
});
