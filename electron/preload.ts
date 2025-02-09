/**
 * File: electron/preload.ts
 * Description: Preload script to expose APIs to renderer process
 */

import { contextBridge, ipcRenderer } from "electron";
import { FILE_CHANNELS } from "./handlers/fileHandlers";

// Define the API type
export interface FileAPI {
  selectFile: (options?: { multiple?: boolean }) => Promise<string[]>;
  readFile: (path: string) => Promise<{
    content: Buffer;
    name: string;
    path: string;
    size: number;
    lastModified: Date;
  }>;
  writeFile: (options: { filePath: string; content: Buffer }) => Promise<{
    name: string;
    path: string;
    size: number;
    lastModified: Date;
  }>;
  getFiles: (dirPath: string) => Promise<
    Array<{
      name: string;
      path: string;
      size: number;
      lastModified: Date;
      type: string;
    }>
  >;
  deleteFile: (path: string) => Promise<boolean>;
  getFileInfo: (path: string) => Promise<{
    name: string;
    path: string;
    size: number;
    lastModified: Date;
    type: string;
  }>;
}

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
} as FileAPI);

// Add the API type to the window object
declare global {
  interface Window {
    fileAPI: FileAPI;
  }
}
