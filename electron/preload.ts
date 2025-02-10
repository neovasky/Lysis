// File: electron/preload.ts
import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { FILE_CHANNELS } from "./handlers/fileHandlers";
import type { FileAPI } from "../src/types/window";

// Define valid channel types
type ValidChannels = "main-process-message" | keyof typeof FILE_CHANNELS;

// Define IPC message types
type IpcMessage = {
  type: string;
  payload?: unknown;
};

// Expose protected IPC methods to renderer
contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    on: (channel: ValidChannels, func: (data: unknown) => void) => {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(args);
      ipcRenderer.on(channel, subscription);
      return () => ipcRenderer.removeListener(channel, subscription);
    },
    once: (channel: ValidChannels, func: (data: unknown) => void) => {
      ipcRenderer.once(
        channel,
        (_event: IpcRendererEvent, ...args: unknown[]) => func(args)
      );
    },
    send: (channel: ValidChannels, message: IpcMessage) => {
      ipcRenderer.send(channel, message);
    },
  },
});

// Expose the file API to the renderer process
contextBridge.exposeInMainWorld("fileAPI", {
  selectFile: (options?: { multiple?: boolean }) =>
    ipcRenderer.invoke(FILE_CHANNELS.SELECT_FILE, options),

  readFile: (path: string) => ipcRenderer.invoke(FILE_CHANNELS.READ_FILE, path),

  writeFile: (options: { filePath: string; content: Buffer }) =>
    ipcRenderer.invoke(FILE_CHANNELS.WRITE_FILE, options),

  getFiles: (dirPath: string) =>
    ipcRenderer.invoke(FILE_CHANNELS.GET_FILES, dirPath),

  deleteFile: (path: string) =>
    ipcRenderer.invoke(FILE_CHANNELS.DELETE_FILE, path),

  getFileInfo: (path: string) =>
    ipcRenderer.invoke(FILE_CHANNELS.GET_FILE_INFO, path),

  renameFile: (oldPath: string, newPath: string) =>
    ipcRenderer.invoke(FILE_CHANNELS.RENAME_FILE, { oldPath, newPath }),

  createDirectory: (path: string) =>
    ipcRenderer.invoke(FILE_CHANNELS.CREATE_DIRECTORY, path),

  moveFile: (options: { sourcePath: string; targetPath: string }) =>
    ipcRenderer.invoke(FILE_CHANNELS.MOVE_FILE, options),

  copyFile: (options: { sourcePath: string; targetPath: string }) =>
    ipcRenderer.invoke(FILE_CHANNELS.COPY_FILE, options),
} as FileAPI);
