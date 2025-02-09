/**
 * File: electron/handlers/fileHandlers.ts
 * Description: Main process handlers for file operations
 */

import { ipcMain, dialog } from "electron";
import fs from "fs/promises";
import path from "path";

// Define channel names as constants
export const FILE_CHANNELS = {
  SELECT_FILE: "file:select",
  READ_FILE: "file:read",
  WRITE_FILE: "file:write",
  GET_FILES: "file:get-all",
  DELETE_FILE: "file:delete",
  GET_FILE_INFO: "file:info",
} as const;

export function setupFileHandlers() {
  // Handler for file selection dialog
  ipcMain.handle(
    FILE_CHANNELS.SELECT_FILE,
    async (_, options?: { multiple?: boolean }) => {
      const result = await dialog.showOpenDialog({
        properties: options?.multiple
          ? ["openFile", "multiSelections"]
          : ["openFile"],
      });

      return result.filePaths;
    }
  );

  // Handler for reading file contents
  ipcMain.handle(FILE_CHANNELS.READ_FILE, async (_, filePath: string) => {
    try {
      const content = await fs.readFile(filePath);
      const stats = await fs.stat(filePath);

      return {
        content,
        name: path.basename(filePath),
        path: filePath,
        size: stats.size,
        lastModified: stats.mtime,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to read file: ${message}`);
    }
  });

  // Handler for writing files
  ipcMain.handle(FILE_CHANNELS.WRITE_FILE, async (_, { filePath, content }) => {
    try {
      await fs.writeFile(filePath, content);
      const stats = await fs.stat(filePath);

      return {
        name: path.basename(filePath),
        path: filePath,
        size: stats.size,
        lastModified: stats.mtime,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to write file: ${message}`);
    }
  });

  // Handler for getting all files in a directory
  ipcMain.handle(FILE_CHANNELS.GET_FILES, async (_, dirPath: string) => {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      const files = await Promise.all(
        entries
          .filter((entry) => entry.isFile())
          .map(async (entry) => {
            const filePath = path.join(dirPath, entry.name);
            const stats = await fs.stat(filePath);

            return {
              name: entry.name,
              path: filePath,
              size: stats.size,
              lastModified: stats.mtime,
              type:
                path.extname(entry.name).toLowerCase().slice(1) || "unknown",
            };
          })
      );

      return files;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to get files: ${message}`);
    }
  });

  // Handler for deleting files
  ipcMain.handle(FILE_CHANNELS.DELETE_FILE, async (_, filePath: string) => {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to delete file: ${message}`);
    }
  });

  // Handler for getting file information
  ipcMain.handle(FILE_CHANNELS.GET_FILE_INFO, async (_, filePath: string) => {
    try {
      const stats = await fs.stat(filePath);

      return {
        name: path.basename(filePath),
        path: filePath,
        size: stats.size,
        lastModified: stats.mtime,
        type: path.extname(filePath).toLowerCase().slice(1) || "unknown",
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to get file info: ${message}`);
    }
  });
}
