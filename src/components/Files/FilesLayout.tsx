import { useState, useEffect } from "react";
import {
  Box,
  Card,
  Text,
  Heading,
  Flex,
  Button,
  Badge,
} from "@radix-ui/themes";
import {
  GridIcon,
  ListBulletIcon,
  UploadIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import { FilesList } from "./FilesList";
import { FilesGrid } from "./FilesGrid";
import { FileUploadDialog } from "./FileUploadDialog";
import { useFiles } from "./hooks/useFiles";

type ViewMode = "list" | "grid";
type FileFilter = "all" | "recent" | "pdf" | "excel" | "word";

export const FilesLayout = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FileFilter>("all");
  const { files, loading, error, loadFiles, refreshFiles, currentDirectory } =
    useFiles();

  // Load initial files
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Filter files based on active filter
  const filteredFiles = files.filter((file) => {
    switch (activeFilter) {
      case "recent":
        // Show files from last 24 hours
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

  const handleRefresh = () => {
    refreshFiles();
  };

  return (
    <Box p="4">
      {/* Header */}
      <Card size="3" mb="4">
        <Flex justify="between" align="center">
          <Box>
            <Heading size="5" weight="bold" mb="2">
              Files
            </Heading>
            <Text color="gray" size="2">
              {currentDirectory ? (
                <>Current directory: {currentDirectory}</>
              ) : (
                "Select a directory to view files"
              )}
            </Text>
            {error && (
              <Text color="red" size="2" mt="2">
                Error: {error}
              </Text>
            )}
          </Box>
          <Flex gap="2">
            {/* Refresh Button */}
            <Button
              variant="soft"
              onClick={handleRefresh}
              disabled={loading || !currentDirectory}
            >
              <ReloadIcon />
              Refresh
            </Button>

            {/* View Toggle */}
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

            {/* Upload Button */}
            <Button onClick={() => setIsUploadOpen(true)}>
              <UploadIcon />
              Upload Files
            </Button>
          </Flex>
        </Flex>
      </Card>

      {/* Quick Filters */}
      <Card mb="4">
        <Flex gap="2" p="2">
          <Badge
            variant={activeFilter === "all" ? "solid" : "surface"}
            onClick={() => setActiveFilter("all")}
            style={{ cursor: "pointer" }}
          >
            All Files
          </Badge>
          <Badge
            variant={activeFilter === "recent" ? "solid" : "surface"}
            onClick={() => setActiveFilter("recent")}
            style={{ cursor: "pointer" }}
          >
            Recent
          </Badge>
          <Badge
            variant={activeFilter === "pdf" ? "solid" : "surface"}
            onClick={() => setActiveFilter("pdf")}
            style={{ cursor: "pointer" }}
          >
            PDF
          </Badge>
          <Badge
            variant={activeFilter === "excel" ? "solid" : "surface"}
            onClick={() => setActiveFilter("excel")}
            style={{ cursor: "pointer" }}
          >
            Excel
          </Badge>
          <Badge
            variant={activeFilter === "word" ? "solid" : "surface"}
            onClick={() => setActiveFilter("word")}
            style={{ cursor: "pointer" }}
          >
            Word
          </Badge>
        </Flex>
      </Card>

      {/* Files Display */}
      <Card>
        {loading ? (
          <Flex align="center" justify="center" p="6">
            <Text size="2" color="gray">
              Loading files...
            </Text>
          </Flex>
        ) : viewMode === "list" ? (
          <FilesList files={filteredFiles} />
        ) : (
          <FilesGrid files={filteredFiles} />
        )}
      </Card>

      {/* Upload Dialog */}
      <FileUploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onUploadComplete={refreshFiles}
      />
    </Box>
  );
};
