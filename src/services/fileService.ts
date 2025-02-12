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
  static readonly DEFAULT_BASE_DIRECTORY = "BaseDirectory";
  static readonly LAST_DIRECTORY_KEY = "lysis_last_directory";

  private constructor() {
    // Initialize currentDirectory from storage on instantiation
    const storedDir = localStorage.getItem(FileService.LAST_DIRECTORY_KEY);
    this.currentDirectory = storedDir || FileService.DEFAULT_BASE_DIRECTORY;
  }

  static getInstance(): FileService {
    if (!FileService.instance) {
      FileService.instance = new FileService();
    }
    return FileService.instance;
  }

  /**
   * Get or select current working directory.
   * If no directory is set, return the default directory.
   */
  async getCurrentDirectory(): Promise<string> {
    if (!this.currentDirectory) {
      try {
        const selected = await this.selectFiles({
          directory: true,
          multiple: false,
        });
        if (selected && selected.length > 0) {
          this.currentDirectory = selected[0];
          localStorage.setItem(
            FileService.LAST_DIRECTORY_KEY,
            this.currentDirectory
          );
        } else {
          this.currentDirectory = FileService.DEFAULT_BASE_DIRECTORY;
        }
      } catch (error) {
        console.warn("Failed to select directory, using default:", error);
        this.currentDirectory = FileService.DEFAULT_BASE_DIRECTORY;
      }
    }
    return this.currentDirectory;
  }

  /**
   * Set current working directory.
   */
  setCurrentDirectory(path: string | undefined) {
    this.currentDirectory = path;
    if (path) {
      localStorage.setItem(FileService.LAST_DIRECTORY_KEY, path);
    }
  }

  /**
   * Select files or directories.
   */
  async selectFiles(options?: FileSelection): Promise<string[]> {
    try {
      if (!window.fileAPI || typeof window.fileAPI.selectFile !== "function") {
        // In simulation mode, return default directory
        return [FileService.DEFAULT_BASE_DIRECTORY];
      }

      const paths = await window.fileAPI.selectFile(options);
      if (options?.directory && paths.length > 0) {
        this.setCurrentDirectory(paths[0]);
      }
      return paths;
    } catch (error) {
      console.error("File selection error:", error);
      throw new Error("Failed to select files");
    }
  }

  /**
   * Get all files in a directory.
   * If window.fileAPI isn't available, return simulated folders stored in localStorage.
   */
  async getFiles(dirPath: string): Promise<FileMetadata[]> {
    if (!window.fileAPI || typeof window.fileAPI.getFiles !== "function") {
      // Simulation: read from localStorage using the provided directory path
      const storageKey = `simulatedFolders_${dirPath}`;
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
      if (!window.fileAPI || typeof window.fileAPI.writeFile !== "function") {
        throw new Error("File writing not supported in simulation mode");
      }
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
        this.currentDirectory = FileService.DEFAULT_BASE_DIRECTORY;
      }

      const path = `${this.currentDirectory}/${name}`;

      if (
        !window.fileAPI ||
        typeof window.fileAPI.createDirectory !== "function"
      ) {
        const storageKey = `simulatedFolders_${this.currentDirectory}`;
        const stored = localStorage.getItem(storageKey);
        const folders: FileMetadata[] = stored ? JSON.parse(stored) : [];

        // Check for duplicate folder names
        if (folders.some((folder) => folder.name === name)) {
          return {
            success: false,
            error: "A folder with this name already exists",
          };
        }

        const simulatedFolder: FileMetadata = {
          id: `folder_${Date.now()}`,
          name,
          path,
          type: "folder",
          size: 0,
          lastModified: Date.now(),
          isDirectory: true,
          tags: [],
        };

        folders.push(simulatedFolder);
        localStorage.setItem(storageKey, JSON.stringify(folders));
        return { success: true, metadata: simulatedFolder };
      }

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
   * Delete file or directory.
   * When fileAPI is not available, simulate deletion by updating localStorage.
   */
  async deleteItem(path: string): Promise<FileOperationResult> {
    try {
      if (!window.fileAPI || typeof window.fileAPI.deleteFile !== "function") {
        const parentDir = path.substring(0, path.lastIndexOf("/"));
        const storageKey = `simulatedFolders_${parentDir}`;
        const stored = localStorage.getItem(storageKey);
        if (!stored) return { success: false, error: "Directory not found" };

        const items: FileMetadata[] = JSON.parse(stored);
        const newItems = items.filter((item) => item.path !== path);
        localStorage.setItem(storageKey, JSON.stringify(newItems));
        return { success: true };
      }
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
   * When fileAPI is not available, simulate renaming by updating localStorage.
   */
  async renameItem(
    oldPath: string,
    newName: string
  ): Promise<FileOperationResult> {
    try {
      const directory = oldPath.substring(0, oldPath.lastIndexOf("/"));
      const newPath = `${directory}/${newName}`;

      if (!window.fileAPI || typeof window.fileAPI.renameFile !== "function") {
        const storageKey = `simulatedFolders_${directory}`;
        const stored = localStorage.getItem(storageKey);
        if (!stored) return { success: false, error: "Directory not found" };

        const items: FileMetadata[] = JSON.parse(stored);
        const updatedItems = items.map((item) => {
          if (item.path === oldPath) {
            return {
              ...item,
              name: newName,
              path: newPath,
              lastModified: Date.now(),
            };
          }
          return item;
        });

        localStorage.setItem(storageKey, JSON.stringify(updatedItems));
        const updatedItem = updatedItems.find((item) => item.path === newPath);
        return {
          success: true,
          metadata: updatedItem,
        };
      }

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
      if (!window.fileAPI || typeof window.fileAPI.moveFile !== "function") {
        return {
          success: false,
          error: "Move operation not supported in simulation mode",
        };
      }

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
