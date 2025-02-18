import { FileMetadata, FileType } from "../store/slices/fileSlice";
import { FileInfo } from "../types/files";

interface FileSelection {
  multiple?: boolean;
  directory?: boolean;
  filters?: Array<{ name: string; extensions: string[] }>;
}

class FileService {
  private static instance: FileService;
  private currentDirectory: string | undefined = undefined;
  static readonly DEFAULT_BASE_DIRECTORY = "BaseDirectory";
  static readonly LAST_DIRECTORY_KEY = "lysis_last_directory";

  private constructor() {
    const storedDir = localStorage.getItem(FileService.LAST_DIRECTORY_KEY);
    this.currentDirectory = storedDir || FileService.DEFAULT_BASE_DIRECTORY;
  }

  static getInstance(): FileService {
    if (!FileService.instance) {
      FileService.instance = new FileService();
    }
    return FileService.instance;
  }

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

  setCurrentDirectory(path: string | undefined) {
    this.currentDirectory = path;
    if (path) {
      localStorage.setItem(FileService.LAST_DIRECTORY_KEY, path);
    }
  }

  async selectFiles(options?: FileSelection): Promise<string[]> {
    try {
      if (!window.fileAPI || typeof window.fileAPI.selectFile !== "function") {
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

  async readFile(path: string) {
    try {
      if (!window.fileAPI || typeof window.fileAPI.readFile !== "function") {
        const fileContentKey = `fileContent_${path}`;
        const storedContent = localStorage.getItem(fileContentKey);
        if (!storedContent) {
          throw new Error("File not found in storage");
        }
        const parts = storedContent.split(",");
        if (parts.length < 2) {
          throw new Error("Invalid data URL stored");
        }
        const base64Content = parts[1];
        const binaryString = atob(base64Content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return {
          content: bytes,
          name: path.split("/").pop() || "",
          path: path,
          size: bytes.length,
          lastModified: new Date(),
        };
      }
      return await window.fileAPI.readFile(path);
    } catch (error) {
      console.error("File read error:", error);
      throw new Error(`Failed to read file: ${error}`);
    }
  }

  async readFileAsArrayBuffer(path: string): Promise<ArrayBuffer> {
    try {
      if (!window.fileAPI || typeof window.fileAPI.readFile !== "function") {
        const fileData = await this.readFile(path);
        return fileData.content.buffer;
      }
      const file = await window.fileAPI.readFile(path);
      return file.content.buffer;
    } catch (error) {
      console.error("readFileAsArrayBuffer error:", error);
      throw new Error("Failed to read file as ArrayBuffer");
    }
  }

  async getFiles(dirPath: string): Promise<FileMetadata[]> {
    if (!window.fileAPI || typeof window.fileAPI.getFiles !== "function") {
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

  async writeFile(path: string, content: Uint8Array): Promise<FileMetadata> {
    try {
      if (!window.fileAPI || typeof window.fileAPI.writeFile !== "function") {
        const pathParts = path.split("/");
        const fileName = pathParts.pop() || "";
        const dirPath = pathParts.join("/");
        const fileMetadata: FileMetadata = {
          id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: fileName,
          path: path,
          type: this.getFileType(fileName),
          size: content.length,
          lastModified: Date.now(),
          isDirectory: false,
          tags: [],
        };
        const storageKey = `simulatedFolders_${dirPath}`;
        const stored = localStorage.getItem(storageKey);
        const files: FileMetadata[] = stored ? JSON.parse(stored) : [];
        const filtered = files.filter((f) => f.name !== fileName);
        filtered.push(fileMetadata);
        localStorage.setItem(storageKey, JSON.stringify(filtered));
        const extension = fileName.split(".").pop()?.toLowerCase();
        let mime = "application/octet-stream";
        if (extension === "pdf") mime = "application/pdf";
        else if (extension === "png") mime = "image/png";
        else if (extension === "jpg" || extension === "jpeg")
          mime = "image/jpeg";
        else if (extension === "gif") mime = "image/gif";
        else if (extension === "txt") mime = "text/plain";
        const blob = new Blob([content], { type: mime });
        const dataUrl: string = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        localStorage.setItem(`fileContent_${path}`, dataUrl);
        return fileMetadata;
      }
      const buffer = Buffer.from(content);
      await window.fileAPI.writeFile({ filePath: path, content: buffer });
      const info = await window.fileAPI.getFileInfo(path);
      return this.convertFileInfo(info);
    } catch (error) {
      console.error("File write error:", error);
      throw new Error(`Failed to write file: ${error}`);
    }
  }

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
      return { success: true, metadata: this.convertFileInfo(info) };
    } catch (error) {
      console.error("Failed to create directory:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create directory",
      };
    }
  }

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

  async openFile(path: string): Promise<void> {
    try {
      if (!window.fileAPI || typeof window.fileAPI.openFile !== "function") {
        throw new Error("Open file operation not supported in simulation mode");
      }
      await window.fileAPI.openFile(path);
    } catch (error) {
      console.error("Failed to open file:", error);
      throw error;
    }
  }

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
        return { success: true, metadata: updatedItem };
      }
      await window.fileAPI.renameFile(oldPath, newPath);
      const info = await window.fileAPI.getFileInfo(newPath);
      return { success: true, metadata: this.convertFileInfo(info) };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Rename failed",
      };
    }
  }

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
      return { success: true, metadata: this.convertFileInfo(info) };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Move failed",
      };
    }
  }

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

export interface FileOperationResult {
  success: boolean;
  metadata?: FileMetadata;
  error?: string;
}
