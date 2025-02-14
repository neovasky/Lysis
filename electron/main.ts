import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import { fileURLToPath } from "url";
import { setupFileHandlers } from "./handlers/fileHandlers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.DIST_ELECTRON = path.join(__dirname);
process.env.DIST = path.join(process.env.DIST_ELECTRON, "../dist");

let mainWindow: BrowserWindow | null = null;

// Setup file handlers before app is ready
setupFileHandlers();

async function createWindow() {
  const isDev = !app.isPackaged;
  const VITE_DEV_SERVER_URL =
    process.env.VITE_DEV_SERVER_URL || "http://localhost:5173";

  const pdfPath = isDev
    ? path.join(__dirname, "..", "public", "example.pdf") // Dev Mode
    : path.join(process.resourcesPath, "example.pdf"); // Prod Mode

  console.log(`✅ PDF Path: ${pdfPath}`);

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 1000,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (!mainWindow) {
    console.error("❌ Failed to create mainWindow.");
    return;
  }

  if (VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(VITE_DEV_SERVER_URL);
    if (process.env.ELECTRON_DEBUG === "1") {
      mainWindow.webContents.on("did-finish-load", () => {
        console.log("📌 DevTools are disabled to prevent Chromium warnings.");
      });
    }
  }

  // ✅ Send PDF path to renderer when window loads
  mainWindow.webContents.once("did-finish-load", () => {
    mainWindow?.webContents.send("load-pdf", pdfPath);
  });
}

// ✅ IPC: Handle PDF Path Request from Renderer
ipcMain.handle("get-pdf-path", () => {
  const isDev = !app.isPackaged;
  return isDev
    ? path.join(__dirname, "..", "public", "example.pdf") // Dev Mode
    : path.join(process.resourcesPath, "example.pdf"); // Prod Mode
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();

  process.on("unhandledRejection", (error) => {
    console.error("Unhandled rejection:", error);
  });
});
