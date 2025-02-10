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

export class FileService {
  private static instance: FileService;
  private lastKnownHashes: Map<string, string> = new Map();

  private constructor() {}

  static getInstance(): FileService {
    if (!FileService.instance) {
      FileService.instance = new FileService();
    }
    return FileService.instance;
  }

  /**
   * Open file selection dialog
   */
  async selectFiles(options?: FileSelection): Promise<string[]> {
    try {
      return await window.fileAPI.selectFile(options);
    } catch (error) {
      console.error("File selection error:", error);
      throw new Error("Failed to select files");
    }
  }

  /**
   * Get file metadata from a file path
   */
  async getFileMetadata(path: string): Promise<FileMetadata> {
    try {
      const info = await window.fileAPI.getFileInfo(path);
      return this.convertToFileMetadata(info);
    } catch (error) {
      console.error("Failed to get file metadata:", error);
      throw new Error(`Failed to get file metadata: ${error}`);
    }
  }

  /**
   * Read file content
   */
  async readFile(
    path: string
  ): Promise<{ content: Buffer; metadata: FileMetadata }> {
    try {
      const result = await window.fileAPI.readFile(path);
      const info = await window.fileAPI.getFileInfo(path);
      return {
        content: result.content,
        metadata: this.convertToFileMetadata(info),
      };
    } catch (error) {
      console.error("File read error:", error);
      throw new Error(`Failed to read file: ${error}`);
    }
  }

  /**
   * Write file content
   */
  async writeFile(path: string, content: Buffer): Promise<FileMetadata> {
    try {
      await window.fileAPI.writeFile({ filePath: path, content });
      return this.getFileMetadata(path);
    } catch (error) {
      console.error("File write error:", error);
      throw new Error(`Failed to write file: ${error}`);
    }
  }

  /**
   * Get all files in a directory
   */
  async getFiles(dirPath: string): Promise<FileMetadata[]> {
    try {
      const files = await window.fileAPI.getFiles(dirPath);
      return files.map((file) => this.convertToFileMetadata(file));
    } catch (error) {
      console.error("Failed to get files:", error);
      throw new Error(`Failed to get files: ${error}`);
    }
  }

  /**
   * Delete a file or directory
   */
  async deleteFile(path: string): Promise<boolean> {
    try {
      const result = await window.fileAPI.deleteFile(path);
      this.lastKnownHashes.delete(path);
      return result;
    } catch (error) {
      console.error("File deletion error:", error);
      throw new Error(`Failed to delete file: ${error}`);
    }
  }

  /**
   * Rename a file or directory
   */
  async renameFile(oldPath: string, newPath: string): Promise<FileMetadata> {
    try {
      await window.fileAPI.renameFile(oldPath, newPath);
      return this.getFileMetadata(newPath);
    } catch (error) {
      console.error("File rename error:", error);
      throw new Error(`Failed to rename file: ${error}`);
    }
  }

  /**
   * Create a new directory
   */
  async createDirectory(path: string): Promise<FileMetadata> {
    try {
      await window.fileAPI.createDirectory(path);
      return this.getFileMetadata(path);
    } catch (error) {
      console.error("Directory creation error:", error);
      throw new Error(`Failed to create directory: ${error}`);
    }
  }

  /**
   * Move a file or directory
   */
  async moveFile(
    sourcePath: string,
    targetPath: string
  ): Promise<FileMetadata> {
    try {
      await window.fileAPI.moveFile({ sourcePath, targetPath });
      this.lastKnownHashes.delete(sourcePath);
      return this.getFileMetadata(targetPath);
    } catch (error) {
      console.error("File move error:", error);
      throw new Error(`Failed to move file: ${error}`);
    }
  }

  /**
   * Copy a file
   */
  async copyFile(
    sourcePath: string,
    targetPath: string
  ): Promise<FileMetadata> {
    try {
      await window.fileAPI.copyFile({ sourcePath, targetPath });
      return this.getFileMetadata(targetPath);
    } catch (error) {
      console.error("File copy error:", error);
      throw new Error(`Failed to copy file: ${error}`);
    }
  }

  /**
   * Check if a file has been modified externally
   */
  async checkFileModified(path: string): Promise<boolean> {
    try {
      const info = await window.fileAPI.getFileInfo(path);
      const currentHash = info.hash;
      const lastKnownHash = this.lastKnownHashes.get(path);

      if (lastKnownHash && currentHash && currentHash !== lastKnownHash) {
        return true;
      }

      if (currentHash) {
        this.lastKnownHashes.set(path, currentHash);
      }
      return false;
    } catch (error) {
      console.error("File check error:", error);
      return false;
    }
  }

  /**
   * Convert FileInfo to FileMetadata
   */
  private convertToFileMetadata(info: FileInfo): FileMetadata {
    const fileType = this.getFileTypeEnum(info.type);
    if (info.hash) {
      this.lastKnownHashes.set(info.path, info.hash);
    }

    return {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: info.name,
      path: info.path,
      type: fileType,
      size: info.size,
      lastModified: new Date(info.lastModified).getTime(),
      tags: [],
    };
  }

  /**
   * Get FileType enum from string
   */
  private getFileTypeEnum(type: string): FileType {
    switch (type.toLowerCase()) {
      case "pdf":
        return "pdf";
      case "excel":
        return "excel";
      case "word":
        return "word";
      case "text":
        return "text";
      default:
        return "other";
    }
  }
}

export default FileService.getInstance();
