// File: src/types/window.d.ts

export interface FileInfo {
  name: string;
  path: string;
  size: number;
  lastModified: Date;
  type: string;
  isDirectory: boolean;
  hash: string | null;
}

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
  getFiles: (dirPath: string) => Promise<FileInfo[]>;
  deleteFile: (path: string) => Promise<boolean>;
  getFileInfo: (path: string) => Promise<FileInfo>;
  renameFile: (oldPath: string, newPath: string) => Promise<FileInfo>;
  createDirectory: (path: string) => Promise<FileInfo>;
  moveFile: (options: {
    sourcePath: string;
    targetPath: string;
  }) => Promise<FileInfo>;
  copyFile: (options: {
    sourcePath: string;
    targetPath: string;
  }) => Promise<FileInfo>;
  openFile?: (filePath: string) => Promise<void>;
}

export interface ElectronAPI {
  getPDFPath: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

declare global {
  interface Window {
    fileAPI: FileAPI;
    electron: {
      ipcRenderer: {
        send: (
          channel: string,
          message: { type: string; payload?: unknown }
        ) => void;
        on: (channel: string, func: (data: unknown) => void) => () => void;
        once: (channel: string, func: (data: unknown) => void) => void;
      };
    };
  }
}

export {};
