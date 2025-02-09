/**
 * File: electron/main.ts
 * Description: Main process entry point
 */

import { app, BrowserWindow } from "electron";
import path from "path";
import { setupFileHandlers } from "./handlers/fileHandlers";

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js
// │ ├─┬ preload
// │ │ └── index.js
// │ ├─┬ renderer
// │ │ └── index.html

process.env.DIST_ELECTRON = path.join(__dirname, "..");
process.env.DIST = path.join(process.env.DIST_ELECTRON, "../dist");
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? path.join(process.env.DIST_ELECTRON, "../public")
  : process.env.DIST;

let mainWindow: BrowserWindow | null = null;

// Setup file handlers before app is ready
setupFileHandlers();

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the app
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    // Ensure DIST exists and is a string
    const distPath = process.env.DIST;
    if (!distPath) {
      throw new Error("DIST path is not defined");
    }
    mainWindow.loadFile(path.join(distPath, "index.html"));
  }
}

app.whenReady().then(createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
