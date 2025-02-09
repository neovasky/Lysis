/**
 * File: src/types/window.d.ts
 * Description: Type definitions for window APIs
 */

interface FileInfo {
  name: string;
  path: string;
  size: number;
  lastModified: Date;
  type: string;
}

interface FileAPI {
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
}

declare global {
  interface Window {
    fileAPI: FileAPI;
  }
}

export {};
