import { contextBridge, ipcRenderer } from "electron";
import { FILE_CHANNELS } from "./handlers/fileHandlers";

// Define valid channel types
type ValidChannels = "main-process-message" | keyof typeof FILE_CHANNELS;

// Define IPC message types
type IpcMessage = {
  type: string;
  payload?: unknown;
};

// ✅ Expose Electron API for IPC communication
contextBridge.exposeInMainWorld("electronAPI", {
  ipcRenderer: {
    on: (channel: ValidChannels, func: (data: unknown) => void) => {
      const subscription = (_: unknown, ...args: unknown[]) => func(args[0]); // Fix TypeScript spread issue
      ipcRenderer.on(channel, subscription);
      return () => ipcRenderer.removeListener(channel, subscription);
    },
    once: (channel: ValidChannels, func: (data: unknown) => void) => {
      ipcRenderer.once(channel, (_: unknown, ...args: unknown[]) =>
        func(args[0])
      ); // Fix TypeScript spread issue
    },
    send: (channel: ValidChannels, message: IpcMessage) => {
      ipcRenderer.send(channel, message);
    },
    invoke: async (
      channel: ValidChannels,
      message?: IpcMessage
    ): Promise<unknown> => {
      return await ipcRenderer.invoke(channel, message);
    },
  },

  // ✅ Expose an async function to get the PDF path
  getPDFPath: async (): Promise<string> => {
    try {
      return await ipcRenderer.invoke("get-pdf-path");
    } catch (error) {
      console.error("❌ Error retrieving PDF path:", error);
      return "";
    }
  },
});

// ✅ Define the file API with correct typings and error handling
const fileAPI = {
  selectFile: async (options?: { multiple?: boolean }): Promise<unknown> => {
    try {
      return await ipcRenderer.invoke(FILE_CHANNELS.SELECT_FILE, options);
    } catch (error) {
      console.error("❌ Error selecting file:", error);
    }
  },

  readFile: async (path: string): Promise<unknown> => {
    try {
      return await ipcRenderer.invoke(FILE_CHANNELS.READ_FILE, path);
    } catch (error) {
      console.error(`❌ Error reading file at ${path}:`, error);
    }
  },

  writeFile: async (options: {
    filePath: string;
    content: Buffer;
  }): Promise<unknown> => {
    try {
      return await ipcRenderer.invoke(FILE_CHANNELS.WRITE_FILE, options);
    } catch (error) {
      console.error(`❌ Error writing to file ${options.filePath}:`, error);
    }
  },

  getFiles: async (dirPath: string): Promise<unknown> => {
    try {
      return await ipcRenderer.invoke(FILE_CHANNELS.GET_FILES, dirPath);
    } catch (error) {
      console.error(`❌ Error getting files from ${dirPath}:`, error);
    }
  },

  deleteFile: async (path: string): Promise<unknown> => {
    try {
      return await ipcRenderer.invoke(FILE_CHANNELS.DELETE_FILE, path);
    } catch (error) {
      console.error(`❌ Error deleting file at ${path}:`, error);
    }
  },

  getFileInfo: async (path: string): Promise<unknown> => {
    try {
      return await ipcRenderer.invoke(FILE_CHANNELS.GET_FILE_INFO, path);
    } catch (error) {
      console.error(`❌ Error getting file info for ${path}:`, error);
    }
  },

  renameFile: async (oldPath: string, newPath: string): Promise<unknown> => {
    try {
      return await ipcRenderer.invoke(FILE_CHANNELS.RENAME_FILE, {
        oldPath,
        newPath,
      });
    } catch (error) {
      console.error(
        `❌ Error renaming file from ${oldPath} to ${newPath}:`,
        error
      );
    }
  },

  createDirectory: async (path: string): Promise<unknown> => {
    try {
      return await ipcRenderer.invoke(FILE_CHANNELS.CREATE_DIRECTORY, path);
    } catch (error) {
      console.error(`❌ Error creating directory at ${path}:`, error);
    }
  },

  moveFile: async (options: {
    sourcePath: string;
    targetPath: string;
  }): Promise<unknown> => {
    try {
      return await ipcRenderer.invoke(FILE_CHANNELS.MOVE_FILE, options);
    } catch (error) {
      console.error(
        `❌ Error moving file from ${options.sourcePath} to ${options.targetPath}:`,
        error
      );
    }
  },

  copyFile: async (options: {
    sourcePath: string;
    targetPath: string;
  }): Promise<unknown> => {
    try {
      return await ipcRenderer.invoke(FILE_CHANNELS.COPY_FILE, options);
    } catch (error) {
      console.error(
        `❌ Error copying file from ${options.sourcePath} to ${options.targetPath}:`,
        error
      );
    }
  },

  openFile: async (filePath: string): Promise<unknown> => {
    try {
      return await ipcRenderer.invoke(FILE_CHANNELS.OPEN_FILE, filePath);
    } catch (error) {
      console.error(`❌ Error opening file ${filePath}:`, error);
    }
  },
};

// ✅ Expose fileAPI to the renderer process
contextBridge.exposeInMainWorld("fileAPI", fileAPI);

// Declare the fileAPI type for TypeScript
export type FileAPI = typeof fileAPI;
