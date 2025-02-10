import { ipcMain, dialog, app, BrowserWindow } from "electron";
import * as path from "path";
import path__default from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import crypto from "crypto";
const FILE_CHANNELS = {
  SELECT_FILE: "file:select",
  READ_FILE: "file:read",
  WRITE_FILE: "file:write",
  GET_FILES: "file:get-all",
  DELETE_FILE: "file:delete",
  GET_FILE_INFO: "file:info",
  RENAME_FILE: "file:rename",
  CREATE_DIRECTORY: "file:create-dir",
  MOVE_FILE: "file:move",
  COPY_FILE: "file:copy"
};
function setupFileHandlers() {
  ipcMain.handle(
    FILE_CHANNELS.SELECT_FILE,
    async (_, options) => {
      try {
        const properties = (options == null ? void 0 : options.directory) ? ["openDirectory"] : ["openFile"];
        if ((options == null ? void 0 : options.multiple) && !(options == null ? void 0 : options.directory)) {
          properties.push("multiSelections");
        }
        const result = await dialog.showOpenDialog({
          properties,
          filters: options == null ? void 0 : options.filters
        });
        return result.filePaths;
      } catch (error) {
        console.error("File selection error:", error);
        throw error;
      }
    }
  );
  ipcMain.handle(FILE_CHANNELS.READ_FILE, async (_, filePath) => {
    try {
      const content = await fs.readFile(filePath);
      const stats = await fs.stat(filePath);
      const hash = await getFileHash(filePath);
      return {
        content,
        name: path__default.basename(filePath),
        path: filePath,
        size: stats.size,
        lastModified: stats.mtime,
        hash
      };
    } catch (error) {
      console.error("File read error:", error);
      throw new Error(
        `Failed to read file: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  });
  ipcMain.handle(
    FILE_CHANNELS.WRITE_FILE,
    async (_, { filePath, content, createDirectory }) => {
      try {
        if (createDirectory) {
          await fs.mkdir(path__default.dirname(filePath), { recursive: true });
        }
        await fs.writeFile(filePath, content);
        const stats = await fs.stat(filePath);
        const hash = await getFileHash(filePath);
        return {
          name: path__default.basename(filePath),
          path: filePath,
          size: stats.size,
          lastModified: stats.mtime,
          hash
        };
      } catch (error) {
        console.error("File write error:", error);
        throw new Error(
          `Failed to write file: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }
  );
  ipcMain.handle(FILE_CHANNELS.GET_FILES, async (_, dirPath) => {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const files = await Promise.all(
        entries.map(async (entry) => {
          const filePath = path__default.join(dirPath, entry.name);
          const stats = await fs.stat(filePath);
          const hash = entry.isFile() ? await getFileHash(filePath) : null;
          return {
            name: entry.name,
            path: filePath,
            size: stats.size,
            lastModified: stats.mtime,
            type: entry.isDirectory() ? "directory" : getFileType(entry.name),
            isDirectory: entry.isDirectory(),
            hash
          };
        })
      );
      return files;
    } catch (error) {
      console.error("Get files error:", error);
      throw new Error(
        `Failed to get files: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  });
  ipcMain.handle(FILE_CHANNELS.DELETE_FILE, async (_, filePath) => {
    try {
      const stats = await fs.stat(filePath);
      if (stats.isDirectory()) {
        await fs.rm(filePath, { recursive: true });
      } else {
        await fs.unlink(filePath);
      }
      return true;
    } catch (error) {
      console.error("File deletion error:", error);
      throw new Error(
        `Failed to delete file: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  });
  ipcMain.handle(FILE_CHANNELS.GET_FILE_INFO, async (_, filePath) => {
    try {
      const stats = await fs.stat(filePath);
      const hash = stats.isFile() ? await getFileHash(filePath) : null;
      return {
        name: path__default.basename(filePath),
        path: filePath,
        size: stats.size,
        lastModified: stats.mtime,
        type: stats.isDirectory() ? "directory" : getFileType(filePath),
        isDirectory: stats.isDirectory(),
        hash
      };
    } catch (error) {
      console.error("Get file info error:", error);
      throw new Error(
        `Failed to get file info: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  });
  ipcMain.handle(FILE_CHANNELS.RENAME_FILE, async (_, { oldPath, newPath }) => {
    try {
      await fs.rename(oldPath, newPath);
      const stats = await fs.stat(newPath);
      const hash = stats.isFile() ? await getFileHash(newPath) : null;
      return {
        name: path__default.basename(newPath),
        path: newPath,
        size: stats.size,
        lastModified: stats.mtime,
        type: stats.isDirectory() ? "directory" : getFileType(newPath),
        isDirectory: stats.isDirectory(),
        hash
      };
    } catch (error) {
      console.error("File rename error:", error);
      throw new Error(
        `Failed to rename file: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  });
  ipcMain.handle(FILE_CHANNELS.CREATE_DIRECTORY, async (_, dirPath) => {
    try {
      await fs.mkdir(dirPath, { recursive: true });
      const stats = await fs.stat(dirPath);
      return {
        name: path__default.basename(dirPath),
        path: dirPath,
        size: stats.size,
        lastModified: stats.mtime,
        type: "directory",
        isDirectory: true,
        hash: null
      };
    } catch (error) {
      console.error("Directory creation error:", error);
      throw new Error(
        `Failed to create directory: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  });
  ipcMain.handle(
    FILE_CHANNELS.MOVE_FILE,
    async (_, { sourcePath, targetPath }) => {
      try {
        await fs.rename(sourcePath, targetPath);
        const stats = await fs.stat(targetPath);
        const hash = stats.isFile() ? await getFileHash(targetPath) : null;
        return {
          name: path__default.basename(targetPath),
          path: targetPath,
          size: stats.size,
          lastModified: stats.mtime,
          type: stats.isDirectory() ? "directory" : getFileType(targetPath),
          isDirectory: stats.isDirectory(),
          hash
        };
      } catch (error) {
        console.error("File move error:", error);
        throw new Error(
          `Failed to move file: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }
  );
  ipcMain.handle(
    FILE_CHANNELS.COPY_FILE,
    async (_, { sourcePath, targetPath }) => {
      try {
        await fs.copyFile(sourcePath, targetPath);
        const stats = await fs.stat(targetPath);
        const hash = await getFileHash(targetPath);
        return {
          name: path__default.basename(targetPath),
          path: targetPath,
          size: stats.size,
          lastModified: stats.mtime,
          type: getFileType(targetPath),
          isDirectory: false,
          hash
        };
      } catch (error) {
        console.error("File copy error:", error);
        throw new Error(
          `Failed to copy file: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }
  );
  function getFileType(filename) {
    const ext = path__default.extname(filename).toLowerCase();
    switch (ext) {
      case ".pdf":
        return "pdf";
      case ".xlsx":
      case ".xls":
        return "excel";
      case ".doc":
      case ".docx":
        return "word";
      case ".txt":
      case ".md":
        return "text";
      default:
        return "other";
    }
  }
  async function getFileHash(filePath) {
    try {
      const content = await fs.readFile(filePath);
      return crypto.createHash("sha256").update(content).digest("hex");
    } catch (error) {
      console.error("Hash calculation error:", error);
      throw new Error(
        `Failed to calculate file hash: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
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
