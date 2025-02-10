import { useCallback } from "react";
import {
  Grid,
  Card,
  Text,
  Box,
  Flex,
  Button,
  DropdownMenu,
} from "@radix-ui/themes";
import {
  DotsVerticalIcon,
  FileIcon,
  FileTextIcon,
  TableIcon,
  Component1Icon,
  TrashIcon,
  DownloadIcon,
  Pencil1Icon,
} from "@radix-ui/react-icons";
import { formatDistance } from "date-fns";
import { FileMetadata } from "../../store/slices/fileSlice";
import { useFiles } from "./hooks/useFiles";

interface FilesGridProps {
  files: FileMetadata[];
  onFileOpen?: (file: FileMetadata) => void;
}

export const FilesGrid = ({ files, onFileOpen }: FilesGridProps) => {
  const { deleteFile } = useFiles();

  // Get file icon based on type
  const getFileIcon = (type: FileMetadata["type"]) => {
    switch (type) {
      case "pdf":
        return <FileTextIcon width="24" height="24" />;
      case "excel":
        return <TableIcon width="24" height="24" />;
      case "word":
        return <Component1Icon width="24" height="24" />;
      default:
        return <FileIcon width="24" height="24" />;
    }
  };

  // Handle file operations
  const handleFileDelete = useCallback(
    async (file: FileMetadata) => {
      const confirmed = window.confirm(
        `Are you sure you want to delete ${file.name}?`
      );
      if (confirmed) {
        await deleteFile(file.id, file.path);
      }
    },
    [deleteFile]
  );

  const handleFileOpen = useCallback(
    (file: FileMetadata) => {
      if (onFileOpen) {
        onFileOpen(file);
      }
    },
    [onFileOpen]
  );

  const FileActions = ({ file }: { file: FileMetadata }) => (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button variant="ghost" size="1">
          <DotsVerticalIcon />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onClick={() => handleFileOpen(file)}>
          <Flex gap="2" align="center">
            <FileIcon />
            Open
          </Flex>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <Flex gap="2" align="center">
            <DownloadIcon />
            Download
          </Flex>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <Flex gap="2" align="center">
            <Pencil1Icon />
            Rename
          </Flex>
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item color="red" onClick={() => handleFileDelete(file)}>
          <Flex gap="2" align="center">
            <TrashIcon />
            Delete
          </Flex>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );

  if (files.length === 0) {
    return (
      <Box p="6">
        <Text align="center" color="gray">
          No files found
        </Text>
      </Box>
    );
  }

  return (
    <Grid columns="4" gap="4" p="4">
      {files.map((file) => (
        <Card
          key={file.id}
          style={{ cursor: "pointer" }}
          onClick={() => handleFileOpen(file)}
        >
          {/* Preview Section */}
          <Box
            style={{
              height: "140px",
              backgroundColor: "var(--gray-3)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "12px",
            }}
          >
            {getFileIcon(file.type)}
          </Box>

          {/* File Info Section */}
          <Flex direction="column" gap="1">
            <Flex justify="between" align="center">
              <Text weight="bold" size="2" style={{ flex: 1 }}>
                {file.name}
              </Text>
              <Box onClick={(e) => e.stopPropagation()}>
                <FileActions file={file} />
              </Box>
            </Flex>

            <Text size="1" color="gray">
              {formatDistance(file.lastModified, new Date(), {
                addSuffix: true,
              })}
            </Text>

            {file.tags && file.tags.length > 0 && (
              <Flex gap="1" wrap="wrap" mt="1">
                {file.tags.slice(0, 2).map((tag) => (
                  <Text
                    key={tag}
                    size="1"
                    style={{
                      padding: "2px 6px",
                      backgroundColor: "var(--gray-3)",
                      borderRadius: "4px",
                    }}
                  >
                    {tag}
                  </Text>
                ))}
                {file.tags.length > 2 && (
                  <Text
                    size="1"
                    style={{
                      padding: "2px 6px",
                      backgroundColor: "var(--gray-3)",
                      borderRadius: "4px",
                    }}
                  >
                    +{file.tags.length - 2} more
                  </Text>
                )}
              </Flex>
            )}
          </Flex>
        </Card>
      ))}
    </Grid>
  );
};
