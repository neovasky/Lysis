import { useState, useCallback, useEffect } from "react";
import {
  Box,
  Card,
  Text,
  Heading,
  Grid,
  Flex,
  Button,
  Badge,
  Separator,
} from "@radix-ui/themes";
import {
  UploadIcon,
  PlusIcon,
  GridIcon,
  ListBulletIcon,
  ReloadIcon,
  ChevronLeftIcon,
  FileTextIcon,
} from "@radix-ui/react-icons";
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
      // Get current root directory or let user select one
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
    <Box p="4">
      {/* Header */}
      <Card size="3" mb="4">
        <Flex direction="column" gap="3">
          <Flex justify="between" align="center">
            <Box>
              <Heading size="6" weight="bold">
                Files
              </Heading>
              <Text color="gray" size="2">
                {currentDirectory ? currentDirectory.name : "Root Directory"}
              </Text>
            </Box>
            <Flex gap="4">
              <Flex gap="2">
                <Button
                  variant="surface"
                  onClick={() => setIsNewFolderOpen(true)}
                >
                  <PlusIcon />
                  New Folder
                </Button>
                <Separator orientation="vertical" />
                <Button onClick={() => setIsUploadOpen(true)}>
                  <UploadIcon />
                  Upload
                </Button>
              </Flex>
            </Flex>
          </Flex>

          {error && (
            <Text color="red" size="2">
              Error: {error}
            </Text>
          )}
        </Flex>
      </Card>

      {/* Action Bar */}
      <Card mb="4">
        <Flex justify="between" align="center" p="2">
          <Flex gap="2" align="center">
            {currentDirectory && (
              <Button variant="surface" onClick={handleBackToRoot}>
                <ChevronLeftIcon />
                Back to Root
              </Button>
            )}
          </Flex>

          <Flex gap="2">
            <Button
              variant="surface"
              disabled={loading}
              onClick={currentDirectory ? refreshFiles : loadDirectories}
            >
              <ReloadIcon />
              Refresh
            </Button>
            <Separator orientation="vertical" />
            <Button
              variant={viewMode === "list" ? "solid" : "surface"}
              onClick={() => setViewMode("list")}
            >
              <ListBulletIcon />
            </Button>
            <Button
              variant={viewMode === "grid" ? "solid" : "surface"}
              onClick={() => setViewMode("grid")}
            >
              <GridIcon />
            </Button>
          </Flex>
        </Flex>
      </Card>

      {/* Content */}
      {currentDirectory ? (
        <>
          {/* File Filters */}
          <Card mb="4">
            <Flex gap="2" p="2">
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
          </Card>

          {/* Files View */}
          <Card>
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
          </Card>
        </>
      ) : (
        // Directory Grid
        <Grid columns="3" gap="4">
          {directories.map((dir) => (
            <Card
              key={dir.path}
              size="2"
              style={{ cursor: "pointer" }}
              onClick={() => handleDirectorySelect(dir)}
            >
              <Flex align="center" gap="2" mb="3">
                <FileTextIcon
                  width="20"
                  height="20"
                  style={{ color: "var(--accent-9)" }}
                />
                <Heading size="3">{dir.name}</Heading>
              </Flex>
              <Text color="gray" size="2">
                {dir.fileCount} {dir.fileCount === 1 ? "file" : "files"}
              </Text>
            </Card>
          ))}
        </Grid>
      )}

      {/* Dialogs */}
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
