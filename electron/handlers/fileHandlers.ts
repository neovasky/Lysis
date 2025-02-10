/**
 * File: electron/handlers/fileHandlers.ts
 * Description: Main process handlers for file operations
 */

import { ipcMain, dialog } from "electron";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

// Define channel names as constants
export const FILE_CHANNELS = {
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
} as const;

export function setupFileHandlers() {
  // Handler for file selection dialog
  ipcMain.handle(
    FILE_CHANNELS.SELECT_FILE,
    async (
      _,
      options?: {
        multiple?: boolean;
        directory?: boolean;
        filters?: { name: string; extensions: string[] }[];
      }
    ) => {
      try {
        const properties: Array<
          "openFile" | "multiSelections" | "openDirectory"
        > = options?.directory ? ["openDirectory"] : ["openFile"];

        if (options?.multiple && !options?.directory) {
          properties.push("multiSelections");
        }

        const result = await dialog.showOpenDialog({
          properties,
          filters: options?.filters,
        });

        return result.filePaths;
      } catch (error) {
        console.error("File selection error:", error);
        throw error;
      }
    }
  );

  // Handler for reading file contents
  ipcMain.handle(FILE_CHANNELS.READ_FILE, async (_, filePath: string) => {
    try {
      const content = await fs.readFile(filePath);
      const stats = await fs.stat(filePath);
      const hash = await getFileHash(filePath);

      return {
        content,
        name: path.basename(filePath),
        path: filePath,
        size: stats.size,
        lastModified: stats.mtime,
        hash,
      };
    } catch (error) {
      console.error("File read error:", error);
      throw new Error(
        `Failed to read file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  });

  // Handler for writing files
  ipcMain.handle(
    FILE_CHANNELS.WRITE_FILE,
    async (_, { filePath, content, createDirectory }) => {
      try {
        if (createDirectory) {
          await fs.mkdir(path.dirname(filePath), { recursive: true });
        }

        await fs.writeFile(filePath, content);
        const stats = await fs.stat(filePath);
        const hash = await getFileHash(filePath);

        return {
          name: path.basename(filePath),
          path: filePath,
          size: stats.size,
          lastModified: stats.mtime,
          hash,
        };
      } catch (error) {
        console.error("File write error:", error);
        throw new Error(
          `Failed to write file: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }
  );

  // Handler for getting all files in a directory
  ipcMain.handle(FILE_CHANNELS.GET_FILES, async (_, dirPath: string) => {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      const files = await Promise.all(
        entries.map(async (entry) => {
          const filePath = path.join(dirPath, entry.name);
          const stats = await fs.stat(filePath);
          const hash = entry.isFile() ? await getFileHash(filePath) : null;

          return {
            name: entry.name,
            path: filePath,
            size: stats.size,
            lastModified: stats.mtime,
            type: entry.isDirectory() ? "directory" : getFileType(entry.name),
            isDirectory: entry.isDirectory(),
            hash,
          };
        })
      );

      return files;
    } catch (error) {
      console.error("Get files error:", error);
      throw new Error(
        `Failed to get files: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  });

  // Handler for deleting files
  ipcMain.handle(FILE_CHANNELS.DELETE_FILE, async (_, filePath: string) => {
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
        `Failed to delete file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  });

  // Handler for getting file information
  ipcMain.handle(FILE_CHANNELS.GET_FILE_INFO, async (_, filePath: string) => {
    try {
      const stats = await fs.stat(filePath);
      const hash = stats.isFile() ? await getFileHash(filePath) : null;

      return {
        name: path.basename(filePath),
        path: filePath,
        size: stats.size,
        lastModified: stats.mtime,
        type: stats.isDirectory() ? "directory" : getFileType(filePath),
        isDirectory: stats.isDirectory(),
        hash,
      };
    } catch (error) {
      console.error("Get file info error:", error);
      throw new Error(
        `Failed to get file info: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  });

  // Handler for renaming files
  ipcMain.handle(FILE_CHANNELS.RENAME_FILE, async (_, { oldPath, newPath }) => {
    try {
      await fs.rename(oldPath, newPath);
      const stats = await fs.stat(newPath);
      const hash = stats.isFile() ? await getFileHash(newPath) : null;

      return {
        name: path.basename(newPath),
        path: newPath,
        size: stats.size,
        lastModified: stats.mtime,
        type: stats.isDirectory() ? "directory" : getFileType(newPath),
        isDirectory: stats.isDirectory(),
        hash,
      };
    } catch (error) {
      console.error("File rename error:", error);
      throw new Error(
        `Failed to rename file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  });

  // Handler for creating directories
  ipcMain.handle(FILE_CHANNELS.CREATE_DIRECTORY, async (_, dirPath: string) => {
    try {
      await fs.mkdir(dirPath, { recursive: true });
      const stats = await fs.stat(dirPath);

      return {
        name: path.basename(dirPath),
        path: dirPath,
        size: stats.size,
        lastModified: stats.mtime,
        type: "directory",
        isDirectory: true,
        hash: null,
      };
    } catch (error) {
      console.error("Directory creation error:", error);
      throw new Error(
        `Failed to create directory: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  });

  // Handler for moving files
  ipcMain.handle(
    FILE_CHANNELS.MOVE_FILE,
    async (_, { sourcePath, targetPath }) => {
      try {
        await fs.rename(sourcePath, targetPath);
        const stats = await fs.stat(targetPath);
        const hash = stats.isFile() ? await getFileHash(targetPath) : null;

        return {
          name: path.basename(targetPath),
          path: targetPath,
          size: stats.size,
          lastModified: stats.mtime,
          type: stats.isDirectory() ? "directory" : getFileType(targetPath),
          isDirectory: stats.isDirectory(),
          hash,
        };
      } catch (error) {
        console.error("File move error:", error);
        throw new Error(
          `Failed to move file: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }
  );

  // Handler for copying files
  ipcMain.handle(
    FILE_CHANNELS.COPY_FILE,
    async (_, { sourcePath, targetPath }) => {
      try {
        await fs.copyFile(sourcePath, targetPath);
        const stats = await fs.stat(targetPath);
        const hash = await getFileHash(targetPath);

        return {
          name: path.basename(targetPath),
          path: targetPath,
          size: stats.size,
          lastModified: stats.mtime,
          type: getFileType(targetPath),
          isDirectory: false,
          hash,
        };
      } catch (error) {
        console.error("File copy error:", error);
        throw new Error(
          `Failed to copy file: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }
  );

  // Helper function to get file type from extension
  function getFileType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
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

  // Helper function to calculate file hash
  async function getFileHash(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath);
      return crypto.createHash("sha256").update(content).digest("hex");
    } catch (error) {
      console.error("Hash calculation error:", error);
      throw new Error(
        `Failed to calculate file hash: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
