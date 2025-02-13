import { app, BrowserWindow } from "electron";
import * as path from "path";
import { fileURLToPath } from "url";
import { setupFileHandlers } from "./handlers/fileHandlers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.DIST_ELECTRON = path.join(__dirname);
process.env.DIST = path.join(process.env.DIST_ELECTRON, "../dist");
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST_ELECTRON, "../public");

let mainWindow: BrowserWindow | null = null;

// Setup file handlers before app is ready
setupFileHandlers();

async function createWindow() {
  const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      // Possibly set to false if you're still having issues
      webSecurity: true,
      sandbox: false,
    },
  });

  // Override response headers to set a lenient CSP
  mainWindow.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [
            // Example policy that allows inline styles/scripts, data: or blob: sources, etc.
            "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:;" +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:;" +
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;" +
              "font-src 'self' https://fonts.gstatic.com;" +
              "img-src 'self' data: blob:;" +
              "object-src 'self' data: blob:;" +
              "media-src 'self' data: blob:;",
          ],
        },
      });
    }
  );

  if (VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(VITE_DEV_SERVER_URL);
    if (process.env.ELECTRON_DEBUG === "1") {
      mainWindow.webContents.openDevTools();
    }
  } else {
    // production build
    mainWindow.loadFile(path.join(process.env.DIST!, "index.html"));
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
});
