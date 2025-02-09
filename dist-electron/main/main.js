import { ipcMain, dialog, app, BrowserWindow } from "electron";
import * as path from "path";
import path__default from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
const FILE_CHANNELS = {
  SELECT_FILE: "file:select",
  READ_FILE: "file:read",
  WRITE_FILE: "file:write",
  GET_FILES: "file:get-all",
  DELETE_FILE: "file:delete",
  GET_FILE_INFO: "file:info"
};
function setupFileHandlers() {
  ipcMain.handle(
    FILE_CHANNELS.SELECT_FILE,
    async (_, options) => {
      const result = await dialog.showOpenDialog({
        properties: (options == null ? void 0 : options.multiple) ? ["openFile", "multiSelections"] : ["openFile"]
      });
      return result.filePaths;
    }
  );
  ipcMain.handle(FILE_CHANNELS.READ_FILE, async (_, filePath) => {
    try {
      const content = await fs.readFile(filePath);
      const stats = await fs.stat(filePath);
      return {
        content,
        name: path__default.basename(filePath),
        path: filePath,
        size: stats.size,
        lastModified: stats.mtime
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to read file: ${message}`);
    }
  });
  ipcMain.handle(FILE_CHANNELS.WRITE_FILE, async (_, { filePath, content }) => {
    try {
      await fs.writeFile(filePath, content);
      const stats = await fs.stat(filePath);
      return {
        name: path__default.basename(filePath),
        path: filePath,
        size: stats.size,
        lastModified: stats.mtime
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to write file: ${message}`);
    }
  });
  ipcMain.handle(FILE_CHANNELS.GET_FILES, async (_, dirPath) => {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const files = await Promise.all(
        entries.filter((entry) => entry.isFile()).map(async (entry) => {
          const filePath = path__default.join(dirPath, entry.name);
          const stats = await fs.stat(filePath);
          return {
            name: entry.name,
            path: filePath,
            size: stats.size,
            lastModified: stats.mtime,
            type: path__default.extname(entry.name).toLowerCase().slice(1) || "unknown"
          };
        })
      );
      return files;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to get files: ${message}`);
    }
  });
  ipcMain.handle(FILE_CHANNELS.DELETE_FILE, async (_, filePath) => {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to delete file: ${message}`);
    }
  });
  ipcMain.handle(FILE_CHANNELS.GET_FILE_INFO, async (_, filePath) => {
    try {
      const stats = await fs.stat(filePath);
      return {
        name: path__default.basename(filePath),
        path: filePath,
        size: stats.size,
        lastModified: stats.mtime,
        type: path__default.extname(filePath).toLowerCase().slice(1) || "unknown"
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to get file info: ${message}`);
    }
  });
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
process.env.DIST_ELECTRON = path.join(__dirname);
process.env.DIST = path.join(process.env.DIST_ELECTRON, "../dist");
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST_ELECTRON, "../public");
let mainWindow = null;
setupFileHandlers();
async function createWindow() {
  const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      // Updated path
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      sandbox: false
    }
  });
  mainWindow.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [
            "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:;"
          ]
        }
      });
    }
  );
  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
    if (process.env.ELECTRON_DEBUG === "1") {
      mainWindow.webContents.openDevTools();
    }
  } else {
    mainWindow.loadFile(path.join(process.env.DIST, "index.html"));
  }
}
app.whenReady().then(createWindow);
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
process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
});
//# sourceMappingURL=main.js.map
