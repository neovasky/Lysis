/**
 * File: electron/preload.ts
 * Description: Preload script to expose APIs to renderer process
 */

import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { FILE_CHANNELS } from "./handlers/fileHandlers";

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
    electron: {
      ipcRenderer: {
        send: (channel: ValidChannels, message: IpcMessage) => void;
        on: (
          channel: ValidChannels,
          func: (data: unknown) => void
        ) => () => void;
        once: (channel: ValidChannels, func: (data: unknown) => void) => void;
      };
    };
    fileAPI: FileAPI;
  }
}
