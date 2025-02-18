import React, { useState, useEffect } from "react";
import {
  Upload,
  Plus,
  LayoutGrid,
  List as ListIcon,
  RefreshCw,
  ChevronLeft,
  File as FileIcon,
} from "lucide-react";
import { CreateFolderDialog } from "../../components/Files/CreateFolderDialog";
import FilesList from "../../components/Files/FilesList";
import FilesGrid from "../../components/Files/FilesGrid";
import { useFiles } from "../../components/Files/hooks/useFiles";
import { FileMetadata, FileType } from "../../store/slices/fileSlice";
import FileService from "../../services/fileService";
import { FILE_CONSTANTS } from "../../services/constants";
import ContinuousPDFViewerWithSidebar from "@/components/PDFViewer/PDFViewer";
import FileUploadDialog from "@/components/Files/FileUploadDialog";

const { DEFAULT_BASE_DIRECTORY, LAST_DIRECTORY_KEY } = FILE_CONSTANTS;

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

export const FilesPage: React.FC = () => {
  const { loading, error } = useFiles();
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [currentDirectory, setCurrentDirectory] = useState<{
    path: string;
    name: string;
    fileCount: number;
  } | null>(null);
  const [directories, setDirectories] = useState<FileMetadata[]>([]);
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);

  // PDF Modal state
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

  const loadDirectories = async (dirPath?: string) => {
    try {
      const targetDir =
        dirPath ||
        localStorage.getItem(LAST_DIRECTORY_KEY) ||
        DEFAULT_BASE_DIRECTORY;
      FileService.setCurrentDirectory(targetDir);
      localStorage.setItem(LAST_DIRECTORY_KEY, targetDir);
      const items = await FileService.getFiles(targetDir);
      const dirs = items.filter((f) => f.isDirectory);
      const fs = items.filter((f) => !f.isDirectory);
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
  };

  const handleNewFolderClick = () => setIsNewFolderOpen(true);

  const handleCreateFolder = async (name: string) => {
    try {
      const targetDir = currentDirectory?.path || DEFAULT_BASE_DIRECTORY;
      FileService.setCurrentDirectory(targetDir);
      const result = await FileService.createDirectory(name);
      if (!result.success)
        throw new Error(result.error || "Folder creation failed");
      await loadDirectories(targetDir);
      setIsNewFolderOpen(false);
    } catch (err: unknown) {
      console.error("Error creating folder:", err);
      alert(err instanceof Error ? err.message : "Failed to create folder");
    }
  };

  const handleFolderOpen = async (folder: FileMetadata) => {
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
  };

  const handleFileOpen = async (file: FileMetadata) => {
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
                html, body { margin: 0; padding: 0; width: 100%; height: 100vh; overflow: hidden; background: #525659; }
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
      alert("Failed to open file. Please try again.");
    }
  };

  const handleOpenItem = async (item: FileMetadata) => {
    if (item.isDirectory) {
      await handleFolderOpen(item);
    } else {
      await handleFileOpen(item);
    }
  };

  const handleBackToRoot = async () => {
    try {
      FileService.setCurrentDirectory(DEFAULT_BASE_DIRECTORY);
      localStorage.setItem(LAST_DIRECTORY_KEY, DEFAULT_BASE_DIRECTORY);
      await loadDirectories(DEFAULT_BASE_DIRECTORY);
    } catch (err) {
      console.error("Error going back to root:", err);
    }
  };

  const handleDeleteFolder = async (folderPath: string) => {
    try {
      const result = await FileService.deleteItem(folderPath);
      if (result.success) {
        await loadDirectories(currentDirectory?.path);
      } else {
        alert(result.error);
      }
    } catch (err) {
      console.error("Error deleting folder:", err);
      alert("Error deleting folder");
    }
  };

  const filteredItems = (): FileMetadata[] => files;

  return (
    <div className="h-screen flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center px-4 py-3 border-b border-gray-300 bg-gray-100 sticky top-0 z-10">
        {currentDirectory &&
          currentDirectory.path !== DEFAULT_BASE_DIRECTORY && (
            <button
              onClick={handleBackToRoot}
              className="mr-4 p-2 rounded hover:bg-gray-200"
            >
              <ChevronLeft size={20} />
            </button>
          )}
        <div className="flex items-center gap-2">
          <button
            onClick={handleNewFolderClick}
            className="flex items-center gap-1 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
          >
            <Plus size={16} />
            New Folder
          </button>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
          >
            <Upload size={16} />
            Upload Files
          </button>
        </div>
        <div className="w-px h-6 bg-gray-300 mx-6"></div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded ${
              viewMode === "grid"
                ? "bg-blue-500 text-white"
                : "bg-transparent text-gray-600 hover:bg-gray-200"
            }`}
          >
            <LayoutGrid size={20} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded ${
              viewMode === "list"
                ? "bg-blue-500 text-white"
                : "bg-transparent text-gray-600 hover:bg-gray-200"
            }`}
          >
            <ListIcon size={20} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-2 bg-red-200">
          <p className="text-red-600 text-sm">Error: {error}</p>
        </div>
      )}

      {/* File Listing */}
      <div className="flex-1 overflow-auto p-4">
        {currentDirectory ? (
          viewMode === "list" ? (
            <FilesList
              files={filteredItems()}
              onDelete={handleDeleteFolder}
              onFileOpen={handleOpenItem}
            />
          ) : (
            <FilesGrid
              files={filteredItems()}
              onDelete={handleDeleteFolder}
              onFileOpen={handleOpenItem}
            />
          )
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {directories.map((dir: FileMetadata) => (
              <div
                key={dir.path}
                className="cursor-pointer p-4 rounded border border-gray-300 bg-gray-200"
                onClick={() =>
                  handleFolderOpen({
                    id: dir.path,
                    name: dir.name,
                    path: dir.path,
                    type: "folder" as FileType,
                    size: 0,
                    lastModified: 0,
                    isDirectory: true,
                    tags: [],
                  })
                }
              >
                <div className="flex items-center gap-3 mb-2">
                  <FileIcon size={24} className="text-blue-500" />
                  <p className="font-medium">{dir.name}</p>
                </div>
                <p className="text-sm text-gray-600">0 files</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => loadDirectories(currentDirectory?.path)}
          disabled={loading}
          className="w-12 h-12 rounded bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 disabled:opacity-50"
        >
          <RefreshCw size={16} />
        </button>
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
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col">
          <div className="flex justify-end p-2 bg-gray-800">
            <button
              onClick={() => {
                setShowPdfModal(false);
                setSelectedPdfData(null);
              }}
              className="text-white hover:underline"
            >
              Close
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            <ContinuousPDFViewerWithSidebar pdfData={selectedPdfData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default FilesPage;
