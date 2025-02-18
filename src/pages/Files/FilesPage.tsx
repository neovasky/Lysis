"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FileMetadata, FileType } from "@/store/slices/fileSlice";
import FileService from "@/services/fileService";
import { FILE_CONSTANTS } from "@/services/constants";
import { CreateFolderDialog } from "@/components/Files/CreateFolderDialog";
import FileUploadDialog from "@/components/Files/FileUploadDialog";
import ContinuousPDFViewerWithSidebar from "@/components/PDFViewer/PDFViewer";
import { useFiles } from "@/components/Files/hooks/useFiles";

import {
  Upload,
  Plus,
  LayoutGrid,
  List as ListIcon,
  RefreshCw,
  ChevronLeft,
  Folder,
  File as FileIcon,
  FileText,
  FileImage,
  MoreVertical,
} from "lucide-react";

// Import generated shadcn/ui components
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const { DEFAULT_BASE_DIRECTORY, LAST_DIRECTORY_KEY } = FILE_CONSTANTS;

type FileFilter = "all" | "recent" | "pdf" | "excel" | "word";

function dataURLtoBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(",");
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
  const bstr = atob(parts[1]);
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  return new Blob([u8arr], { type: mime });
}

function formatTimeAgo(timestamp: number) {
  if (!timestamp) return "";
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `about ${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `about ${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0)
    return `about ${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "just now";
}

function humanFileSize(size: number) {
  if (!size) return "";
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return (
    (size / Math.pow(1024, i)).toFixed(2) +
    " " +
    ["B", "KB", "MB", "GB", "TB"][i]
  );
}

export default function FilesPage() {
  const { error } = useFiles();
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [currentDirectory, setCurrentDirectory] = useState<{
    path: string;
    name: string;
    fileCount: number;
  } | null>(null);
  const [directories, setDirectories] = useState<FileMetadata[]>([]);
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [activeFilter, setActiveFilter] = useState<FileFilter>("all");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedPdfData, setSelectedPdfData] = useState<Uint8Array | null>(
    null
  );

  useEffect(() => {
    const initDir = async () => {
      const savedDir =
        localStorage.getItem(LAST_DIRECTORY_KEY) || DEFAULT_BASE_DIRECTORY;
      await loadDirectories(savedDir);
    };
    initDir();
  }, []);

  async function loadDirectories(dirPath?: string) {
    try {
      const targetDir =
        dirPath ||
        localStorage.getItem(LAST_DIRECTORY_KEY) ||
        DEFAULT_BASE_DIRECTORY;
      FileService.setCurrentDirectory(targetDir);
      localStorage.setItem(LAST_DIRECTORY_KEY, targetDir);
      const items = await FileService.getFiles(targetDir);
      const dirs = items.filter((f: FileMetadata) => f.isDirectory);
      const fs = items.filter((f: FileMetadata) => !f.isDirectory);
      setDirectories(dirs);
      setFiles(fs);
      setCurrentDirectory({
        path: targetDir,
        name:
          targetDir === DEFAULT_BASE_DIRECTORY
            ? "Base"
            : targetDir.split("/").pop() || targetDir,
        fileCount: dirs.length,
      });
    } catch (err) {
      console.error("Error loading directories:", err);
    }
  }

  async function handleCreateFolder(name: string) {
    try {
      const targetDir = currentDirectory?.path || DEFAULT_BASE_DIRECTORY;
      FileService.setCurrentDirectory(targetDir);
      const result = await FileService.createDirectory(name);
      if (!result.success) {
        throw new Error(result.error || "Folder creation failed");
      }
      await loadDirectories(targetDir);
      setIsNewFolderOpen(false);
    } catch (err) {
      console.error("Error creating folder:", err);
      alert("Failed to create folder");
    }
  }

  async function handleFolderOpen(folder: FileMetadata) {
    try {
      if (!folder.isDirectory) return;
      setCurrentDirectory({
        path: folder.path,
        name: folder.name,
        fileCount: 0,
      });
      FileService.setCurrentDirectory(folder.path);
      localStorage.setItem(LAST_DIRECTORY_KEY, folder.path);
      await loadDirectories(folder.path);
    } catch (err) {
      console.error("Error opening folder:", err);
    }
  }

  async function handleFileOpen(file: FileMetadata) {
    if (isOpening) return;
    setIsOpening(true);
    try {
      const key = `fileContent_${file.path}`;
      const dataUrl = localStorage.getItem(key);
      if (!dataUrl) {
        if (window.fileAPI?.openFile) {
          await window.fileAPI.openFile(file.path);
        } else {
          alert("File interaction not implemented.");
        }
        return;
      }
      const mimeMatch = dataUrl.match(/^data:(.*?);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : "application/octet-stream";
      if (mimeType === "application/pdf") {
        const blob = dataURLtoBlob(dataUrl);
        const arrayBuf = await blob.arrayBuffer();
        setSelectedPdfData(new Uint8Array(arrayBuf));
        setShowPdfModal(true);
      } else if (mimeType.startsWith("image/")) {
        const blob = dataURLtoBlob(dataUrl);
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      } else {
        const newWindow = window.open("", "_blank");
        if (!newWindow) {
          alert("Popup blocked. Please allow popups for this site.");
          return;
        }
        newWindow.document.open();
        newWindow.document.write(`
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta http-equiv="Content-Security-Policy" content="default-src 'self' data: blob:;">
              <title>${file.name}</title>
              <style>
                html, body { margin: 0; padding: 0; width: 100%; height: 100vh; overflow: hidden; background: #1a1a1a; }
                embed { width: 100%; height: 100%; border: none; }
              </style>
            </head>
            <body>
              <embed src="${dataUrl}" type="${mimeType}">
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    } catch (err) {
      console.error("Error opening file:", err);
      alert("Failed to open file.");
    } finally {
      setIsOpening(false);
    }
  }

  async function handleOpenItem(item: FileMetadata) {
    if (item.isDirectory) {
      await handleFolderOpen(item);
    } else {
      await handleFileOpen(item);
    }
  }

  async function handleBackToRoot() {
    try {
      FileService.setCurrentDirectory(DEFAULT_BASE_DIRECTORY);
      localStorage.setItem(LAST_DIRECTORY_KEY, DEFAULT_BASE_DIRECTORY);
      await loadDirectories(DEFAULT_BASE_DIRECTORY);
    } catch (err) {
      console.error("Error going back to root:", err);
    }
  }

  async function handleDeleteItem(folderPath: string) {
    try {
      const result = await FileService.deleteItem(folderPath);
      if (result.success) {
        await loadDirectories(currentDirectory?.path);
      } else {
        alert(result.error);
      }
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("Error deleting item");
    }
  }

  // Combine directories and files.
  const displayItems = useMemo(() => {
    const dirItems = directories.map((dir) => ({
      ...dir,
      type: "folder" as FileType,
    }));
    return [...dirItems, ...files];
  }, [directories, files]);

  const filteredItems = useCallback(() => {
    if (activeFilter === "all") {
      return displayItems;
    } else if (activeFilter === "recent") {
      return [...displayItems].sort((a, b) => b.lastModified - a.lastModified);
    } else {
      return displayItems.filter((item) => item.type === activeFilter);
    }
  }, [displayItems, activeFilter]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          {currentDirectory &&
            currentDirectory.path !== DEFAULT_BASE_DIRECTORY && (
              <Button variant="outline" onClick={handleBackToRoot}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Root
              </Button>
            )}
          <Button variant="solid" onClick={() => setIsNewFolderOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
          <Button variant="solid" onClick={() => setIsUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Files
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "solid" : "outline"}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "solid" : "outline"}
            onClick={() => setViewMode("list")}
          >
            <ListIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => loadDirectories(currentDirectory?.path)}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-2 bg-destructive/20 text-destructive m-4 rounded-md">
          Error: {error}
        </div>
      )}

      {/* Filter Bar */}
      {currentDirectory && (
        <div className="px-4 py-3 border-b border-border">
          <ToggleGroup
            type="single"
            value={activeFilter}
            onValueChange={(val: string) => {
              if (val) setActiveFilter(val as FileFilter);
            }}
            className="flex space-x-2"
          >
            <ToggleGroupItem value="all">All</ToggleGroupItem>
            <ToggleGroupItem value="recent">Recent</ToggleGroupItem>
            <ToggleGroupItem value="pdf">Pdf</ToggleGroupItem>
            <ToggleGroupItem value="excel">Excel</ToggleGroupItem>
            <ToggleGroupItem value="word">Word</ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4">
        {currentDirectory ? (
          viewMode === "list" ? (
            <ListView
              files={filteredItems()}
              onFileOpen={handleOpenItem}
              onDelete={handleDeleteItem}
            />
          ) : (
            <GridView files={filteredItems()} onFileOpen={handleOpenItem} />
          )
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {directories.map((dir) => (
              <Card
                key={dir.path}
                className="cursor-pointer p-4"
                onClick={() =>
                  handleFolderOpen({
                    ...dir,
                    type: "folder" as FileType,
                  })
                }
              >
                <div className="flex items-center gap-2 mb-2">
                  <Folder className="text-blue-500" size={20} />
                  <span className="font-medium">{dir.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">Folder</p>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <FileUploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onUploadComplete={() => loadDirectories(currentDirectory?.path)}
        currentFolderPath={currentDirectory?.path ?? undefined}
      />
      <CreateFolderDialog
        open={isNewFolderOpen}
        onOpenChange={setIsNewFolderOpen}
        onConfirm={handleCreateFolder}
        currentPath={currentDirectory?.path ?? undefined}
      />

      {/* PDF Modal */}
      {showPdfModal && selectedPdfData && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
          <div className="flex justify-end p-2 bg-neutral-800">
            <Button
              variant="outline"
              onClick={() => {
                setShowPdfModal(false);
                setSelectedPdfData(null);
              }}
            >
              Close
            </Button>
          </div>
          <div className="flex-1 overflow-auto">
            <ContinuousPDFViewerWithSidebar pdfData={selectedPdfData} />
          </div>
        </div>
      )}
    </div>
  );
}

function ListView({
  files,
  onFileOpen,
  onDelete,
}: {
  files: FileMetadata[];
  onFileOpen: (item: FileMetadata) => void;
  onDelete: (path: string) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Modified</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow
              key={file.path}
              className="hover:bg-accent cursor-pointer"
              onClick={() => onFileOpen(file)}
            >
              <TableCell className="flex items-center gap-2">
                {renderIcon(file)}
                <span className="truncate">{file.name}</span>
              </TableCell>
              <TableCell>
                {file.lastModified ? formatTimeAgo(file.lastModified) : ""}
              </TableCell>
              <TableCell>
                {file.isDirectory
                  ? "FOLDER"
                  : file.type?.toUpperCase() || "FILE"}
              </TableCell>
              <TableCell>{humanFileSize(file.size)}</TableCell>
              <TableCell className="max-w-[150px] truncate">
                {file.tags?.join(", ") || ""}
              </TableCell>
              <TableCell className="text-right relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                      }}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                        e.stopPropagation();
                        onDelete(file.path);
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function GridView({
  files,
  onFileOpen,
}: {
  files: FileMetadata[];
  onFileOpen: (item: FileMetadata) => void;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {files.map((file) => (
        <Card
          key={file.path}
          className="cursor-pointer p-4 hover:opacity-90 transition"
          onClick={() => onFileOpen(file)}
        >
          <div className="flex items-center gap-2 mb-2">
            {renderIcon(file, 24)}
            <span className="font-medium truncate">{file.name}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {file.isDirectory ? "Folder" : file.type?.toUpperCase() || "File"}
          </p>
        </Card>
      ))}
    </div>
  );
}

function renderIcon(file: FileMetadata, iconSize = 16) {
  if (file.isDirectory)
    return <Folder size={iconSize} className="text-blue-500" />;
  if (file.name.toLowerCase().endsWith(".pdf"))
    return <FileText size={iconSize} className="text-red-500" />;
  if (/\.(png|jpe?g|gif)$/i.test(file.name))
    return <FileImage size={iconSize} className="text-green-500" />;
  return <FileIcon size={iconSize} className="text-gray-500" />;
}
