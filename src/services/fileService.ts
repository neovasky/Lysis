/**
 * File: src/services/fileService.ts
 * Description: Service for handling file operations and monitoring
 */

import { FileMetadata, FileType } from "../store/slices/fileSlice";
import { FileInfo } from "../types/files";

interface FileSelection {
  multiple?: boolean;
  directory?: boolean;
  filters?: Array<{
    name: string;
    extensions: string[];
  }>;
}

interface FileOperationResult {
  success: boolean;
  metadata?: FileMetadata;
  error?: string;
}

export class FileService {
  private static instance: FileService;
  private currentDirectory: string | undefined = undefined;

  private constructor() {}

  static getInstance(): FileService {
    if (!FileService.instance) {
      FileService.instance = new FileService();
    }
    return FileService.instance;
  }

  /**
   * Get or select current working directory.
   * If no directory is set, attempt to prompt the user.
   */
  async getCurrentDirectory(): Promise<string | undefined> {
    if (!this.currentDirectory) {
      const selected = await this.selectFiles({
        directory: true,
        multiple: false,
      });
      if (selected && selected.length > 0) {
        this.currentDirectory = selected[0];
      }
    }
    return this.currentDirectory;
  }

  /**
   * Set current working directory.
   */
  setCurrentDirectory(path: string | undefined) {
    this.currentDirectory = path;
  }

  /**
   * Select files or directories.
   */
  async selectFiles(options?: FileSelection): Promise<string[]> {
    try {
      const paths = await window.fileAPI.selectFile(options);
      if (options?.directory && paths.length > 0) {
        this.currentDirectory = paths[0];
      }
      return paths;
    } catch (error) {
      console.error("File selection error:", error);
      throw new Error("Failed to select files");
    }
  }

  /**
   * Get all files in a directory.
   * If window.fileAPI isn’t available, return simulated folders stored in localStorage.
   */
  /**
   * Get all files in a directory.
   * If window.fileAPI isn’t available, return simulated folders stored in localStorage.
   */
  async getFiles(dirPath: string): Promise<FileMetadata[]> {
    if (!window.fileAPI || typeof window.fileAPI.getFiles !== "function") {
      // Simulation: read from localStorage.
      const storageKey = `simulatedFolders_${this.currentDirectory}`;
      const stored = localStorage.getItem(storageKey);
      const folders: FileMetadata[] = stored ? JSON.parse(stored) : [];
      return folders;
    }
    try {
      const files = await window.fileAPI.getFiles(dirPath);
      return files.map((file) => this.convertFileInfo(file));
    } catch (error) {
      console.error("Failed to get files:", error);
      throw new Error(`Failed to get files: ${error}`);
    }
  }

  /**
   * Write file content.
   */
  async writeFile(path: string, content: Buffer): Promise<FileMetadata> {
    try {
      await window.fileAPI.writeFile({ filePath: path, content });
      const info = await window.fileAPI.getFileInfo(path);
      return this.convertFileInfo(info);
    } catch (error) {
      console.error("File write error:", error);
      throw new Error(`Failed to write file: ${error}`);
    }
  }

  /**
   * Create new directory.
   * If window.fileAPI is not available, simulate folder creation and persist it in localStorage.
   */
  async createDirectory(name: string): Promise<FileOperationResult> {
    try {
      if (!this.currentDirectory) {
        throw new Error("No current directory selected");
      }
      // Build the full path by concatenating the current directory with the new folder name.
      const path = `${this.currentDirectory}/${name}`;
      // If the file API isn’t available, simulate success.
      if (
        !window.fileAPI ||
        typeof window.fileAPI.createDirectory !== "function"
      ) {
        console.warn(
          "window.fileAPI not available. Simulating folder creation."
        );
        const simulatedFolder: FileMetadata = {
          id: `folder_${Date.now()}`,
          name,
          path,
          type: "folder", // Ensure FileType includes "folder"
          size: 0,
          lastModified: Date.now(),
          isDirectory: true,
          tags: [],
        };
        // Persist the simulated folder in localStorage.
        const storageKey = `simulatedFolders_${this.currentDirectory}`;
        const stored = localStorage.getItem(storageKey);
        const folders: FileMetadata[] = stored ? JSON.parse(stored) : [];
        folders.push(simulatedFolder);
        localStorage.setItem(storageKey, JSON.stringify(folders));
        return { success: true, metadata: simulatedFolder };
      }
      // Otherwise, use the actual API.
      await window.fileAPI.createDirectory(path);
      const info = await window.fileAPI.getFileInfo(path);
      return {
        success: true,
        metadata: this.convertFileInfo(info),
      };
    } catch (error) {
      console.error("Failed to create directory:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create directory",
      };
    }
  }

  /**
   * Upload files to current directory.
   */
  async uploadFiles(files: File[]): Promise<FileOperationResult[]> {
    if (!this.currentDirectory) {
      throw new Error("No current directory selected");
    }
    const results: FileOperationResult[] = [];
    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const path = `${this.currentDirectory}/${file.name}`;
        await this.writeFile(path, buffer);
        const info = await window.fileAPI.getFileInfo(path);
        results.push({
          success: true,
          metadata: this.convertFileInfo(info),
        });
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : "Upload failed",
        });
      }
    }
    return results;
  }

  /**
   * Delete file or directory.
   */
  async deleteItem(path: string): Promise<FileOperationResult> {
    try {
      await window.fileAPI.deleteFile(path);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Deletion failed",
      };
    }
  }

  /**
   * Rename file or directory.
   */
  async renameItem(
    oldPath: string,
    newName: string
  ): Promise<FileOperationResult> {
    try {
      const directory = oldPath.substring(0, oldPath.lastIndexOf("/"));
      const newPath = `${directory}/${newName}`;
      await window.fileAPI.renameFile(oldPath, newPath);
      const info = await window.fileAPI.getFileInfo(newPath);
      return {
        success: true,
        metadata: this.convertFileInfo(info),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Rename failed",
      };
    }
  }

  /**
   * Move file or directory.
   */
  async moveItem(
    sourcePath: string,
    targetPath: string
  ): Promise<FileOperationResult> {
    try {
      await window.fileAPI.moveFile({ sourcePath, targetPath });
      const info = await window.fileAPI.getFileInfo(targetPath);
      return {
        success: true,
        metadata: this.convertFileInfo(info),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Move failed",
      };
    }
  }

  /**
   * Convert FileInfo to FileMetadata.
   */
  private convertFileInfo(info: FileInfo): FileMetadata {
    return {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: info.name,
      path: info.path,
      type: this.getFileType(info.name),
      size: info.size,
      lastModified: new Date(info.lastModified).getTime(),
      isDirectory: info.isDirectory,
      tags: [],
    };
  }

  /**
   * Get file type from extension.
   */
  private getFileType(filename: string): FileType {
    const ext = filename.toLowerCase().split(".").pop() || "";
    switch (ext) {
      case "pdf":
        return "pdf";
      case "xlsx":
      case "xls":
        return "excel";
      case "doc":
      case "docx":
        return "word";
      case "txt":
      case "md":
        return "text";
      default:
        return "other";
    }
  }
}

export default FileService.getInstance();
