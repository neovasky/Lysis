"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { FileMetadata, FileType } from "@/store/slices/fileSlice";
import FileService from "@/services/fileService";
import { FILE_CONSTANTS } from "@/services/constants";
import { CreateFolderDialog } from "@/components/Files/CreateFolderDialog";
import FileUploadDialog from "@/components/Files/FileUploadDialog";
import PDFViewer from "@/components/PDFViewer/PDFViewer";
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

import { Button } from "@/components/ui/button"; // Named import
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
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

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

  // PDF modal
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
        // If there's a real "openFile" from some native API:
        if (window.fileAPI?.openFile) {
          await window.fileAPI.openFile(file.path);
        } else {
          alert("File interaction not implemented.");
        }
        return;
      }
      // We have a dataUrl in localStorage, parse it
      const mimeMatch = dataUrl.match(/^data:(.*?);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : "application/octet-stream";
      if (mimeType === "application/pdf") {
        const blob = dataURLtoBlob(dataUrl);
        const arrayBuf = await blob.arrayBuffer();
        setSelectedPdfData(new Uint8Array(arrayBuf));
        setShowPdfModal(true);
      } else if (mimeType.startsWith("image/")) {
        // Just open the image in a new tab
        const blob = dataURLtoBlob(dataUrl);
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      } else {
        // Fallback text or other type
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
                html, body { margin: 0; padding: 0; width: 100%; height: 100vh; overflow: hidden; background: #f1f5f9; }
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

  async function handleRename(file: FileMetadata) {
    const newName = prompt("Enter new name", file.name);
    if (!newName || newName === file.name) return;
    try {
      alert(`Pretending to rename ${file.name} to ${newName}`);
      await loadDirectories(currentDirectory?.path);
    } catch (err) {
      console.error("Error renaming file:", err);
      alert("Rename failed.");
    }
  }

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
      // Sort by lastModified descending
      return [...displayItems].sort((a, b) => b.lastModified - a.lastModified);
    } else {
      // Filter by type
      return displayItems.filter((item) => item.type === activeFilter);
    }
  }, [displayItems, activeFilter]);

  return (
    <div
      className="mx-auto w-full max-w-6xl flex flex-col h-screen"
      // Force normal body text to be black in light mode, near-white in dark mode
      style={{
        color: "var(--body-foreground)",
        backgroundColor: "hsl(var(--background))",
      }}
    >
      {/* Top Toolbar */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{
          borderColor: "hsl(var(--border))",
        }}
      >
        <div className="flex items-center gap-2">
          {currentDirectory &&
            currentDirectory.path !== DEFAULT_BASE_DIRECTORY && (
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBackToRoot();
                }}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Root
              </Button>
            )}
          <Button variant="solid" onClick={() => setIsNewFolderOpen(true)}>
            <Plus className="h-4 w-4" />
            New Folder
          </Button>

          <Button variant="solid" onClick={() => setIsUploadOpen(true)}>
            <Upload className="h-4 w-4" />
            Upload Files
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewMode === "grid" ? "solid" : "outline"}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Switch to Grid View</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={viewMode === "list" ? "solid" : "outline"}
                onClick={() => setViewMode("list")}
              >
                <ListIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Switch to List View</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                onClick={() => loadDirectories(currentDirectory?.path)}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-2 bg-red-100 text-red-800 m-4 rounded-md">
          Error: {error}
        </div>
      )}

      {/* Filter Bar */}
      {currentDirectory && (
        <div
          className="px-4 py-3 border-b"
          style={{ borderColor: "hsl(var(--border))" }}
        >
          <ToggleGroup
            type="single"
            value={activeFilter}
            onValueChange={(val) => {
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
              onRename={handleRename}
            />
          ) : (
            <GridView files={filteredItems()} onFileOpen={handleOpenItem} />
          )
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {directories.map((dir) => (
              <Card
                key={dir.path}
                className="cursor-pointer p-4 hover:opacity-90 transition"
                style={{
                  border: "1px solid hsl(var(--border))",
                }}
                onClick={() =>
                  handleFolderOpen({
                    ...dir,
                    type: "folder" as FileType,
                  })
                }
              >
                <div className="flex items-center gap-2 mb-2">
                  {/* Slightly different color for icons in grid mode */}
                  <Folder size={20} className="text-[hsl(var(--accent-700))]" />
                  <span className="font-medium">{dir.name}</span>
                </div>
                <p className="text-sm opacity-80">Folder</p>
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
          <div className="flex justify-end p-2 bg-surface1">
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
            <PDFViewer
              pdfData={selectedPdfData}
              onClose={() => {
                setShowPdfModal(false);
                setSelectedPdfData(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   SUBCOMPONENTS
--------------------------------------------------------------------------- */

interface ListViewProps {
  files: FileMetadata[];
  onFileOpen: (item: FileMetadata) => void;
  onDelete: (path: string) => void;
  onRename: (file: FileMetadata) => void;
}

function ListView({ files, onFileOpen, onDelete, onRename }: ListViewProps) {
  return (
    <div
      className="rounded-lg p-2"
      style={{
        // Subtle accent border
        border: "1px solid hsl(var(--accent-700))",
        // Use normal body text color (black in light, near-white in dark)
        color: "var(--body-foreground)",
      }}
    >
      <Table className="w-full">
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
              className="hover:bg-accent-1 cursor-pointer"
              onClick={() => onFileOpen(file)}
              style={{
                // If you want a subtle row hover in light/dark:
                // (You can also rely on a Tailwind class, but here's an inline fallback.)
                transition: "background 0.15s",
              }}
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
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="solid"
                      size="sm"
                      style={{
                        backgroundColor: "hsl(var(--accent-600))",
                        color: "#fff",
                      }}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(file.path);
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onRename(file);
                      }}
                    >
                      Rename
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

interface GridViewProps {
  files: FileMetadata[];
  onFileOpen: (item: FileMetadata) => void;
}

/**
 * GridView: Use an accent background with white text for each Card
 */
function GridView({ files, onFileOpen }: GridViewProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {files.map((file) => (
        <Card
          key={file.path}
          className="cursor-pointer p-4 hover:opacity-90 transition"
          style={{
            backgroundColor: "var(--grid-card-background)",
            borderColor: "var(--grid-card-border)",
            color: "var(--grid-card-text)",
            boxShadow: "var(--grid-card-shadow)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onClick={() => onFileOpen(file)}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "var(--grid-card-shadow-hover)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "var(--grid-card-shadow)";
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            {renderIcon(file, 24, true)}
            <span className="font-medium truncate">{file.name}</span>
          </div>
          <p className="text-sm opacity-90">
            {file.isDirectory ? "Folder" : file.type?.toUpperCase() || "File"}
          </p>
        </Card>
      ))}
    </div>
  );
}

/**
 * renderIcon: If in Grid mode, we may want white icons;
 * otherwise, we can do a normal accent color.
 */
function renderIcon(
  file: FileMetadata,
  iconSize = 16,
  forceWhite = false
): JSX.Element {
  const iconClass = forceWhite ? "text-white" : "text-[hsl(var(--accent-600))]"; // or whichever accent step you prefer

  if (file.isDirectory) {
    return <Folder size={iconSize} className={iconClass} />;
  }
  if (file.name.toLowerCase().endsWith(".pdf")) {
    return <FileText size={iconSize} className="text-red-400" />;
  }
  if (/\.(png|jpe?g|gif)$/i.test(file.name)) {
    return <FileImage size={iconSize} className="text-green-400" />;
  }
  return <FileIcon size={iconSize} className={iconClass} />;
}
