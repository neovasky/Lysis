/**
 * File: src/types/window.d.ts
 * Description: Type definitions for window object extensions
 */

interface FileStats {
  size: number;
  mtimeMs: number;
  ctimeMs: number;
  birthtimeMs: number;
}

interface FileSystem {
  readFile(path: string, options?: { encoding?: string }): Promise<ArrayBuffer>;
  writeFile(path: string, data: ArrayBuffer): Promise<void>;
  stat(path: string): Promise<FileStats>;
}

declare global {
  interface Window {
    fs: FileSystem;
  }
}

export {};
