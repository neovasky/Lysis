// File: vite.config.ts
import { defineConfig } from "vite";
import path from "node:path";
import electron from "vite-plugin-electron/simple";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // No configuration object here – use your CSS for theme configuration
    electron({
      main: {
        entry: "electron/main.ts",
        vite: {
          build: {
            sourcemap: true,
            outDir: "dist-electron/main",
          },
        },
      },
      preload: {
        input: path.join(__dirname, "electron/preload.ts"),
        vite: {
          build: {
            sourcemap: true,
            outDir: "dist-electron/preload",
          },
        },
      },
      renderer: {},
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
