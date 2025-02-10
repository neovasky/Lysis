import { useState, useCallback } from "react";
import { Box, Card, Text, Heading, Grid, Flex, Button } from "@radix-ui/themes";
import { UploadIcon, PlusIcon, FileTextIcon } from "@radix-ui/react-icons";
import { FileUploadDialog } from "./FileUploadDialog";
import { useFiles } from "./hooks/useFiles";

interface FolderData {
  id: string;
  name: string;
  fileCount: number;
  path: string;
}

export const FilesPage = () => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { loadFiles } = useFiles();
  const [folders, setFolders] = useState<FolderData[]>([
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
  const [currentFolder, setCurrentFolder] = useState<FolderData | null>(null);

  const handleFolderClick = useCallback(
    async (folderId: string) => {
      const folder = folders.find((f) => f.id === folderId);
      if (!folder) return;

      try {
        setCurrentFolder(folder);
        // Try to load files from the folder's path
        await loadFiles(folder.path);
      } catch (error) {
        console.error(`Error opening folder ${folder.name}:`, error);
        // Could add error handling UI here
      }
    },
    [folders, loadFiles]
  );

  const handleCreateFolder = useCallback(async () => {
    const name = prompt("Enter folder name:");
    if (!name) return;

    try {
      // Use the FileService to create a directory
      const newFolder: FolderData = {
        id: Date.now().toString(),
        name,
        fileCount: 0,
        path: `/${name}`, // This is simplified; we'd need proper path handling
      };

      setFolders((prev) => [...prev, newFolder]);
    } catch (error) {
      console.error("Error creating folder:", error);
      // Could add error handling UI here
    }
  }, []);

  const handleUploadComplete = useCallback(() => {
    // If we're in a folder, refresh its contents
    if (currentFolder) {
      handleFolderClick(currentFolder.id);
    }
  }, [currentFolder, handleFolderClick]);

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
              {currentFolder
                ? `Current folder: ${currentFolder.name}`
                : "Select a folder to view files"}
            </Text>
          </Box>
          <Flex gap="2">
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

      {/* Folders Grid */}
      <Grid columns="3" gap="4">
        {folders.map((folder) => (
          <Card
            key={folder.id}
            size="2"
            style={{
              cursor: "pointer",
              backgroundColor:
                currentFolder?.id === folder.id ? "var(--accent-3)" : undefined,
            }}
            onClick={() => handleFolderClick(folder.id)}
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

      {/* Upload Dialog */}
      <FileUploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onUploadComplete={handleUploadComplete}
      />
    </Box>
  );
};
