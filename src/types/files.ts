/**
 * File: src/types/files.ts
 * Description: Shared type definitions for file operations
 */

export interface FileInfo {
  name: string;
  path: string;
  size: number;
  lastModified: Date;
  type: string;
  isDirectory: boolean;
  hash: string | null;
}

export interface FileOperations {
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
}
