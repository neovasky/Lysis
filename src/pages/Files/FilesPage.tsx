import { useState, useCallback, useEffect } from "react";
import { Box, Text, Grid, Flex, Button, Badge } from "@radix-ui/themes";
import {
  UploadIcon,
  PlusIcon,
  GridIcon,
  ListBulletIcon,
  ReloadIcon,
  ChevronLeftIcon,
  FileTextIcon,
} from "@radix-ui/react-icons";
import * as Tooltip from "@radix-ui/react-tooltip";
import { FileUploadDialog } from "../../components/Files/FileUploadDialog";
import { CreateFolderDialog } from "../../components/Files/CreateFolderDialog";
import { FilesList } from "../../components/Files/FilesList";
import { FilesGrid } from "../../components/Files/FilesGrid";
import { useFiles } from "../../components/Files/hooks/useFiles";
import { FileMetadata } from "../../store/slices/fileSlice";
import FileService from "../../services/fileService";

type ViewMode = "list" | "grid";
type FileFilter = "all" | "recent" | "pdf" | "excel" | "word";

interface DirectoryInfo {
  path: string;
  name: string;
  fileCount: number;
}

export const FilesPage = () => {
  const { files, loading, error, loadFiles, refreshFiles } = useFiles();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [currentDirectory, setCurrentDirectory] =
    useState<DirectoryInfo | null>(null);
  const [directories, setDirectories] = useState<DirectoryInfo[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FileFilter>("all");

  // Load initial root directory
  useEffect(() => {
    loadDirectories();
  }, []);

  const loadDirectories = async () => {
    try {
      const rootPath = await FileService.getCurrentDirectory();
      if (!rootPath) {
        const paths = await FileService.selectFiles({
          directory: true,
          multiple: false,
        });
        if (!paths || paths.length === 0) return;
        FileService.setCurrentDirectory(paths[0]);
      }
      const files = await FileService.getFiles(rootPath || "");
      const dirInfos = files
        .filter((f) => f.isDirectory)
        .map((d) => ({
          path: d.path,
          name: d.name,
          fileCount: 0,
        }));
      setDirectories(dirInfos);
    } catch (err) {
      console.error("Error loading directories:", err);
    }
  };

  const handleCreateFolder = async (name: string) => {
    try {
      const parentPath =
        currentDirectory?.path || (await FileService.getCurrentDirectory());
      if (!parentPath) return;
      const result = await FileService.createDirectory(name);
      if (result.success) {
        if (currentDirectory) {
          await loadFiles(currentDirectory.path);
        } else {
          await loadDirectories();
        }
      }
    } catch (err) {
      console.error("Error creating folder:", err);
    }
  };

  const handleDirectorySelect = async (dir: DirectoryInfo) => {
    try {
      setCurrentDirectory(dir);
      FileService.setCurrentDirectory(dir.path);
      await loadFiles(dir.path);
    } catch (err) {
      console.error("Error selecting directory:", err);
    }
  };

  const handleBackToRoot = async () => {
    try {
      const rootPath = await FileService.getCurrentDirectory();
      if (rootPath) {
        setCurrentDirectory(null);
        FileService.setCurrentDirectory(rootPath);
        await loadDirectories();
      }
    } catch (err) {
      console.error("Error going back to root:", err);
    }
  };

  const filteredFiles = useCallback(() => {
    try {
      return files.filter((file: FileMetadata) => {
        switch (activeFilter) {
          case "recent":
            return Date.now() - file.lastModified < 24 * 60 * 60 * 1000;
          case "pdf":
            return file.type === "pdf";
          case "excel":
            return file.type === "excel";
          case "word":
            return file.type === "word";
          default:
            return true;
        }
      });
    } catch (err) {
      console.error("Error filtering files:", err);
      return [];
    }
  }, [files, activeFilter]);

  return (
    <Box style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header Bar without the large "Files" text */}
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
        {/* Optional Back Button */}
        {currentDirectory && (
          <Button
            variant="ghost"
            onClick={handleBackToRoot}
            style={{ marginRight: "16px" }}
          >
            <ChevronLeftIcon />
          </Button>
        )}

        {/* Primary Actions: New Folder and Upload Files */}
        <Flex align="center" gap="2">
          <Button
            variant="solid"
            size="2"
            onClick={() => setIsNewFolderOpen(true)}
          >
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

        {/* Separator between Primary Actions and View Controls */}
        <Box
          style={{
            width: "1px",
            height: "24px",
            backgroundColor: "var(--gray-5)",
            margin: "0 24px",
          }}
        />

        {/* View Controls: Grid and List */}
        <Flex align="center" gap="2">
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
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
              <Tooltip.Trigger asChild>
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

      {/* Optional Error Message */}
      {error && (
        <Box p="2" style={{ backgroundColor: "var(--red-2)" }}>
          <Text color="red" size="2">
            Error: {error}
          </Text>
        </Box>
      )}

      {/* Main Content Container */}
      <Box style={{ flex: 1, overflow: "auto", padding: "16px" }}>
        {currentDirectory ? (
          <Box>
            {/* File Filters */}
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

            {/* Files View */}
            {loading ? (
              <Flex align="center" justify="center" p="6">
                <Text size="2" color="gray">
                  Loading files...
                </Text>
              </Flex>
            ) : viewMode === "list" ? (
              <FilesList files={filteredFiles()} />
            ) : (
              <FilesGrid files={filteredFiles()} />
            )}
          </Box>
        ) : (
          // Directory Grid
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
                  <FileTextIcon
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

      {/* Fixed Refresh Button at Bottom Right with Adjusted Boundary and Matching Color */}
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Box style={{ position: "fixed", bottom: "16px", right: "16px" }}>
              <Button
                variant="solid"
                size="2"
                disabled={loading}
                onClick={refreshFiles}
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

      {/* Dialog Components */}
      <FileUploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onUploadComplete={refreshFiles}
        currentFolderPath={currentDirectory?.path}
      />
      <CreateFolderDialog
        open={isNewFolderOpen}
        onOpenChange={setIsNewFolderOpen}
        onConfirm={handleCreateFolder}
      />
    </Box>
  );
};
