"use strict";
const electron = require("electron");
require("fs/promises");
require("path");
require("crypto");
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
  COPY_FILE: "file:copy",
  WATCH_FILE: "file:watch",
  GET_FILE_HASH: "file:hash",
  OPEN_FILE: "file:open"
};
electron.contextBridge.exposeInMainWorld("electronAPI", {
  ipcRenderer: {
    on: (channel, func) => {
      const subscription = (_, ...args) => func(args[0]);
      electron.ipcRenderer.on(channel, subscription);
      return () => electron.ipcRenderer.removeListener(channel, subscription);
    },
    once: (channel, func) => {
      electron.ipcRenderer.once(
        channel,
        (_, ...args) => func(args[0])
      );
    },
    send: (channel, message) => {
      electron.ipcRenderer.send(channel, message);
    },
    invoke: async (channel, message) => {
      return await electron.ipcRenderer.invoke(channel, message);
    }
  },
  // ✅ Expose an async function to get the PDF path
  getPDFPath: async () => {
    try {
      return await electron.ipcRenderer.invoke("get-pdf-path");
    } catch (error) {
      console.error("❌ Error retrieving PDF path:", error);
      return "";
    }
  }
});
const fileAPI = {
  selectFile: async (options) => {
    try {
      return await electron.ipcRenderer.invoke(FILE_CHANNELS.SELECT_FILE, options);
    } catch (error) {
      console.error("❌ Error selecting file:", error);
    }
  },
  readFile: async (path) => {
    try {
      return await electron.ipcRenderer.invoke(FILE_CHANNELS.READ_FILE, path);
    } catch (error) {
      console.error(`❌ Error reading file at ${path}:`, error);
    }
  },
  writeFile: async (options) => {
    try {
      return await electron.ipcRenderer.invoke(FILE_CHANNELS.WRITE_FILE, options);
    } catch (error) {
      console.error(`❌ Error writing to file ${options.filePath}:`, error);
    }
  },
  getFiles: async (dirPath) => {
    try {
      return await electron.ipcRenderer.invoke(FILE_CHANNELS.GET_FILES, dirPath);
    } catch (error) {
      console.error(`❌ Error getting files from ${dirPath}:`, error);
    }
  },
  deleteFile: async (path) => {
    try {
      return await electron.ipcRenderer.invoke(FILE_CHANNELS.DELETE_FILE, path);
    } catch (error) {
      console.error(`❌ Error deleting file at ${path}:`, error);
    }
  },
  getFileInfo: async (path) => {
    try {
      return await electron.ipcRenderer.invoke(FILE_CHANNELS.GET_FILE_INFO, path);
    } catch (error) {
      console.error(`❌ Error getting file info for ${path}:`, error);
    }
  },
  renameFile: async (oldPath, newPath) => {
    try {
      return await electron.ipcRenderer.invoke(FILE_CHANNELS.RENAME_FILE, {
        oldPath,
        newPath
      });
    } catch (error) {
      console.error(
        `❌ Error renaming file from ${oldPath} to ${newPath}:`,
        error
      );
    }
  },
  createDirectory: async (path) => {
    try {
      return await electron.ipcRenderer.invoke(FILE_CHANNELS.CREATE_DIRECTORY, path);
    } catch (error) {
      console.error(`❌ Error creating directory at ${path}:`, error);
    }
  },
  moveFile: async (options) => {
    try {
      return await electron.ipcRenderer.invoke(FILE_CHANNELS.MOVE_FILE, options);
    } catch (error) {
      console.error(
        `❌ Error moving file from ${options.sourcePath} to ${options.targetPath}:`,
        error
      );
    }
  },
  copyFile: async (options) => {
    try {
      return await electron.ipcRenderer.invoke(FILE_CHANNELS.COPY_FILE, options);
    } catch (error) {
      console.error(
        `❌ Error copying file from ${options.sourcePath} to ${options.targetPath}:`,
        error
      );
    }
  },
  openFile: async (filePath) => {
    try {
      return await electron.ipcRenderer.invoke(FILE_CHANNELS.OPEN_FILE, filePath);
    } catch (error) {
      console.error(`❌ Error opening file ${filePath}:`, error);
    }
  }
};
electron.contextBridge.exposeInMainWorld("fileAPI", fileAPI);
//# sourceMappingURL=preload.mjs.map
