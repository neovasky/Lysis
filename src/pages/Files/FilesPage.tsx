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
} from "@radix-ui/themes";
import {
  UploadIcon,
  PlusIcon,
  FileTextIcon,
  GridIcon,
  ListBulletIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import { FileUploadDialog } from "../../components/Files/FileUploadDialog";
import { FilesList } from "../../components/Files/FilesList";
import { FilesGrid } from "../../components/Files/FilesGrid";
import { useFiles } from "../../components/Files/hooks/useFiles";
import { FileMetadata } from "../../store/slices/fileSlice";

// Types
type ViewMode = "list" | "grid";
type FileFilter = "all" | "recent" | "pdf" | "excel" | "word";

interface Folder {
  id: string;
  name: string;
  fileCount: number;
  path: string;
}

export const FilesPage = () => {
  console.log("FilesPage rendering"); // Debug log

  // State management
  const { files, loading, error, loadFiles, refreshFiles } = useFiles();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FileFilter>("all");

  // Debug log when files change
  useEffect(() => {
    console.log("Files state updated:", files);
  }, [files]);

  // Initial folders - In real app, this would come from backend/storage
  const [folders] = useState<Folder[]>([
    {
      id: "1",
      name: "Research Reports",
      fileCount: 3,
      path: "/Research Reports",
    },
    {
      id: "2",
      name: "Financial Statements",
      fileCount: 5,
      path: "/Financial Statements",
    },
    {
      id: "3",
      name: "Market Analysis",
      fileCount: 2,
      path: "/Market Analysis",
    },
  ]);

  // Safe file filtering with error handling
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

  // Event Handlers with error handling
  const handleCreateFolder = useCallback(() => {
    try {
      const name = prompt("Enter folder name:");
      if (!name) return;

      const newFolder: Folder = {
        id: Date.now().toString(),
        name,
        fileCount: 0,
        path: `/${name}`,
      };

      folders.push(newFolder);
    } catch (err) {
      console.error("Error creating folder:", err);
    }
  }, [folders]);

  const handleFolderSelect = useCallback(
    async (folder: Folder) => {
      try {
        setSelectedFolder(folder);
        await loadFiles(folder.path);
      } catch (err) {
        console.error("Error selecting folder:", err);
      }
    },
    [loadFiles]
  );

  const handleRefresh = useCallback(() => {
    try {
      if (selectedFolder) {
        refreshFiles();
      }
    } catch (err) {
      console.error("Error refreshing files:", err);
    }
  }, [refreshFiles, selectedFolder]);

  // UI Components with error boundaries
  const FolderGrid = () => (
    <Grid columns="3" gap="4">
      {folders.map((folder) => (
        <Card
          key={folder.id}
          size="2"
          style={{ cursor: "pointer" }}
          onClick={() => handleFolderSelect(folder)}
        >
          <Flex align="center" gap="2" mb="3">
            <FileTextIcon
              width="20"
              height="20"
              style={{ color: "var(--accent-9)" }}
            />
            <Heading size="3">{folder.name}</Heading>
          </Flex>
          <Text color="gray" size="2">
            {folder.fileCount} {folder.fileCount === 1 ? "file" : "files"}
          </Text>
        </Card>
      ))}
    </Grid>
  );

  const FileFilters = () => (
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
  );

  const FileView = () => (
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
  );

  // Render with error boundary
  try {
    return (
      <Box p="4">
        {/* Header */}
        <Card size="3" mb="4">
          <Flex justify="between" align="center">
            <Box>
              <Heading size="6" weight="bold" mb="2">
                Files
              </Heading>
              <Text color="gray" size="2">
                {selectedFolder
                  ? `Current folder: ${selectedFolder.name}`
                  : "Select a folder to view files"}
              </Text>
              {error && (
                <Text color="red" size="2" mt="2">
                  Error: {error}
                </Text>
              )}
            </Box>
            <Flex gap="2">
              {selectedFolder && (
                <>
                  <Button
                    variant="soft"
                    onClick={handleRefresh}
                    disabled={loading}
                  >
                    <ReloadIcon />
                    Refresh
                  </Button>
                  <Flex gap="1">
                    <Button
                      variant={viewMode === "list" ? "solid" : "surface"}
                      onClick={() => setViewMode("list")}
                    >
                      <ListBulletIcon />
                      List
                    </Button>
                    <Button
                      variant={viewMode === "grid" ? "solid" : "surface"}
                      onClick={() => setViewMode("grid")}
                    >
                      <GridIcon />
                      Grid
                    </Button>
                  </Flex>
                </>
              )}
              <Button onClick={handleCreateFolder}>
                <PlusIcon />
                New Folder
              </Button>
              <Button onClick={() => setIsUploadOpen(true)}>
                <UploadIcon />
                Upload File
              </Button>
            </Flex>
          </Flex>
        </Card>

        {/* Main Content */}
        {selectedFolder ? (
          <>
            <FileFilters />
            <FileView />
          </>
        ) : (
          <FolderGrid />
        )}

        {/* Upload Dialog */}
        <FileUploadDialog
          open={isUploadOpen}
          onOpenChange={setIsUploadOpen}
          onUploadComplete={refreshFiles}
          currentFolderPath={selectedFolder?.path}
        />
      </Box>
    );
  } catch (err) {
    console.error("Error rendering FilesPage:", err);
    return (
      <Box p="4">
        <Card size="3">
          <Heading size="6" weight="bold" mb="2">
            Error
          </Heading>
          <Text color="red">
            An error occurred while loading the Files page. Please try
            refreshing.
          </Text>
        </Card>
      </Box>
    );
  }
};
