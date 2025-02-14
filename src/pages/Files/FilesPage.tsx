// File: src/pages/Files/FilesPage.tsx
import { useState, useCallback, useMemo, useEffect } from "react";
import { Box, Text, Grid, Flex, Button, Badge } from "@radix-ui/themes";
import {
  UploadIcon,
  PlusIcon,
  GridIcon,
  ListBulletIcon,
  ReloadIcon,
  ChevronLeftIcon,
  FileIcon,
} from "@radix-ui/react-icons";
import * as Tooltip from "@radix-ui/react-tooltip";
import { FileUploadDialog } from "../../components/Files/FileUploadDialog";
import { CreateFolderDialog } from "../../components/Files/CreateFolderDialog";
import { FilesList } from "../../components/Files/FilesList";
import { FilesGrid } from "../../components/Files/FilesGrid";
import { useFiles } from "../../components/Files/hooks/useFiles";
import { FileMetadata, FileType } from "../../store/slices/fileSlice";
import FileService from "../../services/fileService";
import { FILE_CONSTANTS } from "../../services/constants";
import ContinuousPDFViewerWithSidebar from "../../components/PDFViewer/ContinuousPDFViewerWithSidebar";

// Import our custom CSS last so that its rules have higher priority
import "../../components/Files/dialogstyles.css";

type ViewMode = "list" | "grid";
type FileFilter = "all" | "recent" | "pdf" | "excel" | "word";

interface DirectoryInfo {
  path: string;
  name: string;
  fileCount: number;
}

const { DEFAULT_BASE_DIRECTORY, LAST_DIRECTORY_KEY } = FILE_CONSTANTS;

function dataURLtoBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(",");
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export const FilesPage = () => {
  const { loading, error } = useFiles();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [currentDirectory, setCurrentDirectory] =
    useState<DirectoryInfo | null>(null);
  const [directories, setDirectories] = useState<DirectoryInfo[]>([]);
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FileFilter>("all");
  const [isOpening, setIsOpening] = useState<boolean>(false);

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
      setDirectories(
        dirs.map((dir) => ({
          path: dir.path,
          name: dir.name,
          fileCount: dirs.length,
        }))
      );
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

  const handleNewFolderClick = () => {
    setIsNewFolderOpen(true);
  };

  const handleCreateFolder = async (name: string) => {
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
      alert(err instanceof Error ? err.message : "Failed to create folder");
    }
  };

  const handleFolderOpen = async (folder: FileMetadata) => {
    try {
      if (!folder.isDirectory) return;
      const newDir = { path: folder.path, name: folder.name, fileCount: 0 };
      setCurrentDirectory(newDir);
      FileService.setCurrentDirectory(folder.path);
      localStorage.setItem(LAST_DIRECTORY_KEY, folder.path);
      await loadDirectories(folder.path);
    } catch (err) {
      console.error("Error opening folder:", err);
    }
  };

  const handleFileOpen = async (file: FileMetadata) => {
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
              <meta http-equiv="Content-Security-Policy" content="default-src 'self' data: blob:; object-src 'self' data: blob:;">
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
    } finally {
      setIsOpening(false);
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

  const displayItems: FileMetadata[] = useMemo(() => {
    const dirItems = directories.map((dir) => ({
      id: dir.path,
      name: dir.name,
      path: dir.path,
      type: "folder" as FileType,
      size: 0,
      lastModified: 0,
      isDirectory: true,
      tags: [],
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
    <Box style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Toolbar */}
      <Flex
        align="center"
        px="4"
        py="3"
        style={{
          borderBottom: "1px solid var(--gray-5)",
          backgroundColor: "var(--gray-1)",
          position: "sticky",
          top: 0,
          zIndex: 10,
          flexWrap: "wrap",
        }}
      >
        {currentDirectory &&
          currentDirectory.path !== DEFAULT_BASE_DIRECTORY && (
            <Button
              variant="ghost"
              onClick={handleBackToRoot}
              style={{ marginRight: "16px" }}
            >
              <ChevronLeftIcon />
            </Button>
          )}
        <Flex align="center" gap="2">
          <Button variant="solid" size="2" onClick={handleNewFolderClick}>
            <PlusIcon /> New Folder
          </Button>
          <Button
            variant="solid"
            size="2"
            onClick={() => setIsUploadOpen(true)}
          >
            <UploadIcon /> Upload Files
          </Button>
        </Flex>
        <Box
          style={{
            width: "1px",
            height: "24px",
            backgroundColor: "var(--gray-5)",
            margin: "0 24px",
          }}
        />
        <Flex align="center" gap="2">
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger>
                <Button
                  variant={viewMode === "grid" ? "solid" : "ghost"}
                  onClick={() => setViewMode("grid")}
                  size="2"
                >
                  <GridIcon />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content side="top" align="center">
                <Text size="2">Grid View</Text>
                <Tooltip.Arrow />
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger>
                <Button
                  variant={viewMode === "list" ? "solid" : "ghost"}
                  onClick={() => setViewMode("list")}
                  size="2"
                >
                  <ListBulletIcon />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content side="top" align="center">
                <Text size="2">List View</Text>
                <Tooltip.Arrow />
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
        </Flex>
      </Flex>

      {error && (
        <Box p="2" style={{ backgroundColor: "var(--red-2)" }}>
          <Text color="red" size="2">
            Error: {error}
          </Text>
        </Box>
      )}

      {/* File Listing */}
      <Box style={{ flex: 1, overflow: "auto", padding: "16px" }}>
        {currentDirectory ? (
          <Box>
            <Flex gap="2" mb="4" style={{ flexWrap: "wrap" }}>
              {["all", "recent", "pdf", "excel", "word"].map((filter) => (
                <Badge
                  key={filter}
                  variant={activeFilter === filter ? "solid" : "surface"}
                  onClick={() => setActiveFilter(filter as FileFilter)}
                  style={{ cursor: "pointer" }}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Badge>
              ))}
            </Flex>
            {loading ? (
              <Flex align="center" justify="center" p="6">
                <Text size="2" color="gray">
                  Loading files...
                </Text>
              </Flex>
            ) : viewMode === "list" ? (
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
            )}
          </Box>
        ) : (
          <Grid columns="4" gap="4">
            {directories.map((dir) => (
              <Box
                key={dir.path}
                style={{
                  cursor: "pointer",
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid var(--gray-5)",
                  backgroundColor: "var(--gray-2)",
                }}
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
                <Flex align="center" gap="3" mb="2">
                  <FileIcon
                    width="24"
                    height="24"
                    style={{ color: "var(--accent-9)" }}
                  />
                  <Text weight="medium">{dir.name}</Text>
                </Flex>
                <Text size="2" color="gray">
                  {dir.fileCount} {dir.fileCount === 1 ? "file" : "files"}
                </Text>
              </Box>
            ))}
          </Grid>
        )}
      </Box>

      {/* Refresh Button */}
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger>
            <Box style={{ position: "fixed", bottom: "16px", right: "16px" }}>
              <Button
                variant="solid"
                size="2"
                disabled={loading}
                onClick={() => loadDirectories(currentDirectory?.path)}
                style={{ width: "48px", height: "48px", borderRadius: "8px" }}
              >
                <ReloadIcon width="16" height="16" />
              </Button>
            </Box>
          </Tooltip.Trigger>
          <Tooltip.Content side="top" align="center">
            <Text size="2">Refresh Files</Text>
            <Tooltip.Arrow />
          </Tooltip.Content>
        </Tooltip.Root>
      </Tooltip.Provider>

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

      {/* PDF Modal for annotation overlay */}
      {showPdfModal && selectedPdfData && (
        <Box
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.8)",
            zIndex: 2000,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Flex justify="end" p="2" style={{ background: "#333" }}>
            <Button
              variant="ghost"
              onClick={() => {
                setShowPdfModal(false);
                setSelectedPdfData(null);
              }}
            >
              Close
            </Button>
          </Flex>
          <Box style={{ flex: 1, overflow: "auto" }}>
            <ContinuousPDFViewerWithSidebar pdfData={selectedPdfData} />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default FilesPage;
