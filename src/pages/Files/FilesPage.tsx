import { useState, useEffect, useCallback, useMemo } from "react";
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
import { FileMetadata } from "../../store/slices/fileSlice";
import FileService from "../../services/fileService";

// Use the same default base directory as FileService.
const DEFAULT_BASE_DIRECTORY = "BaseDirectory";
const simulated =
  !window.fileAPI || typeof window.fileAPI.getFiles !== "function";

type ViewMode = "list" | "grid";
type FileFilter = "all" | "recent" | "pdf" | "excel" | "word";

interface DirectoryInfo {
  path: string;
  name: string;
  fileCount: number;
}

export const FilesPage = () => {
  const { loading, error } = useFiles();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [currentDirectory, setCurrentDirectory] =
    useState<DirectoryInfo | null>(null);
  const [directories, setDirectories] = useState<DirectoryInfo[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FileFilter>("all");

  // loadDirectories loads folder data for the given directory (or defaults)
  const loadDirectories = async (dirPath?: string) => {
    try {
      let targetDir: string;
      if (dirPath) {
        targetDir = dirPath;
      } else {
        targetDir =
          (await FileService.getCurrentDirectory()) || DEFAULT_BASE_DIRECTORY;
        FileService.setCurrentDirectory(targetDir);
      }
      const filesList = await FileService.getFiles(targetDir);
      const dirInfos = filesList
        .filter((f) => f.isDirectory)
        .map((d) => ({
          path: d.path,
          name: d.name,
          fileCount: 0,
        }));
      setDirectories(dirInfos);
      setCurrentDirectory({
        path: targetDir,
        name:
          targetDir === DEFAULT_BASE_DIRECTORY
            ? "Base"
            : targetDir.split("/").pop() || targetDir,
        fileCount: dirInfos.length,
      });
    } catch (err) {
      console.error("Error loading directories:", err);
    }
  };

  useEffect(() => {
    loadDirectories();
  }, []);

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

  const handleDirectorySelect = async (dir: DirectoryInfo) => {
    try {
      setCurrentDirectory(dir);
      FileService.setCurrentDirectory(dir.path);
      await loadDirectories(dir.path);
    } catch (err) {
      console.error("Error selecting directory:", err);
    }
  };

  const handleBackToRoot = async () => {
    try {
      FileService.setCurrentDirectory(DEFAULT_BASE_DIRECTORY);
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

  // Wrap displayFolders in useMemo so it remains stable.
  const displayFolders: FileMetadata[] = useMemo(() => {
    return simulated
      ? directories.map((dir) => ({
          id: dir.path,
          name: dir.name,
          path: dir.path,
          type: "folder",
          size: 0,
          lastModified: 0,
          isDirectory: true,
          tags: [],
        }))
      : [];
  }, [directories]);

  const filteredFiles = useCallback(() => {
    if (simulated) {
      return displayFolders;
    }
    return [];
  }, [displayFolders]);

  return (
    <Box style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
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
            <PlusIcon />
            New Folder
          </Button>
          <Button
            variant="solid"
            size="2"
            onClick={() => setIsUploadOpen(true)}
          >
            <UploadIcon />
            Upload Files
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
                files={filteredFiles()}
                onDelete={handleDeleteFolder}
              />
            ) : (
              <FilesGrid
                files={filteredFiles()}
                onDelete={handleDeleteFolder}
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
                onClick={() => handleDirectorySelect(dir)}
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

      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger>
            <Box style={{ position: "fixed", bottom: "16px", right: "16px" }}>
              <Button
                variant="solid"
                size="2"
                disabled={loading}
                onClick={() => loadDirectories(currentDirectory?.path)}
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "8px",
                }}
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
    </Box>
  );
};
