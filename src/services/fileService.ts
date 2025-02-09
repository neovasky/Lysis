/**
 * File: src/services/fileService.ts
 * Description: Service for handling file operations and monitoring
 */

import { FileMetadata, FileType, FileVersion } from "../store/slices/fileSlice";

export class FileService {
  private static instance: FileService;
  private fileWatchers: Map<string, () => void> = new Map();

  private constructor() {}

  static getInstance(): FileService {
    if (!FileService.instance) {
      FileService.instance = new FileService();
    }
    return FileService.instance;
  }

  /**
   * Get file metadata from a file path
   */
  async getFileMetadata(path: string): Promise<FileMetadata> {
    try {
      const stats = await window.fs.stat(path);
      const name = path.split("/").pop() || "";
      const type = this.getFileType(name);

      return {
        id: this.generateFileId(),
        name,
        type,
        path,
        lastModified: stats.mtimeMs,
        size: stats.size,
        tags: [],
      };
    } catch (error) {
      throw new Error(`Failed to get file metadata: ${error}`);
    }
  }

  /**
   * Read file content
   */
  async readFile(path: string): Promise<ArrayBuffer> {
    try {
      return await window.fs.readFile(path);
    } catch (error) {
      throw new Error(`Failed to read file: ${error}`);
    }
  }

  /**
   * Create a new version of a file
   */
  async createVersion(
    fileId: string,
    path: string,
    changes: string
  ): Promise<FileVersion> {
    try {
      // Copy file to versions directory
      const versionPath = this.generateVersionPath(fileId);
      const content = await this.readFile(path);
      await window.fs.writeFile(versionPath, content);

      return {
        id: this.generateFileId(),
        fileId,
        version: Date.now(),
        path: versionPath,
        createdAt: Date.now(),
        changes,
      };
    } catch (error) {
      throw new Error(`Failed to create version: ${error}`);
    }
  }

  /**
   * Start watching a file for changes
   */
  watchFile(path: string, onChange: () => void): void {
    if (this.fileWatchers.has(path)) {
      return;
    }

    const watcher = async () => {
      try {
        await window.fs.stat(path);
        onChange();
        // Recursive watch
        setTimeout(watcher, 1000);
      } catch (error) {
        console.error(`Error watching file: ${error}`);
        this.unwatchFile(path);
      }
    };

    this.fileWatchers.set(path, watcher);
    watcher();
  }

  /**
   * Stop watching a file
   */
  unwatchFile(path: string): void {
    if (this.fileWatchers.has(path)) {
      this.fileWatchers.delete(path);
    }
  }

  /**
   * Get the type of file from its name
   */
  private getFileType(filename: string): FileType {
    const extension = filename.split(".").pop()?.toLowerCase() || "";
    switch (extension) {
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

  /**
   * Generate a unique file ID
   */
  private generateFileId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a path for a new version of a file
   */
  private generateVersionPath(fileId: string): string {
    const timestamp = Date.now();
    return `versions/${fileId}_${timestamp}`;
  }

  /**
   * Extract text content from a PDF file
   */
  async extractPdfText(buffer: ArrayBuffer): Promise<string> {
    try {
      // This is a placeholder. We'll need to implement PDF text extraction
      // using a library like pdf.js
      console.log(`Processing PDF buffer of size: ${buffer.byteLength}`);
      throw new Error("PDF text extraction not implemented");
    } catch (error) {
      throw new Error(`Failed to extract PDF text: ${error}`);
    }
  }

  /**
   * Create a file annotation
   */
  async createAnnotation(annotation: {
    fileId: string;
    text: string;
    position?: { page: number; x: number; y: number };
  }): Promise<void> {
    try {
      // This is a placeholder. We'll need to implement annotation storage
      // and possibly use a PDF annotation library
      console.log(
        `Creating annotation for file ${annotation.fileId}:`,
        `"${annotation.text}"`,
        annotation.position
          ? `at position ${JSON.stringify(annotation.position)}`
          : "without position"
      );
      throw new Error("File annotation not implemented");
    } catch (error) {
      throw new Error(`Failed to create annotation: ${error}`);
    }
  }
}

export default FileService.getInstance();
