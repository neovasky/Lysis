import React from "react";
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

export interface FilesGridProps {
  files: FileMetadata[];
  onFileOpen?: (file: FileMetadata) => void;
  onDelete?: (folderPath: string) => Promise<void>;
}

export const FilesGrid: React.FC<FilesGridProps> = ({
  files,
  onFileOpen,
  onDelete,
}) => {
  // Return a file icon based on the file type.
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

  // Handler to open a file.
  const handleFileOpen = (file: FileMetadata) => {
    if (onFileOpen) {
      onFileOpen(file);
    }
  };

  // Handler to delete a file or folder.
  const handleFileDelete = async (file: FileMetadata) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${file.name}?`
    );
    if (confirmed && onDelete) {
      await onDelete(file.path);
    }
  };

  // Dropdown for file actions.
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
            <FileIcon width="16" height="16" />
            <Text>Open</Text>
          </Flex>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <Flex gap="2" align="center">
            <DownloadIcon width="16" height="16" />
            <Text>Download</Text>
          </Flex>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <Flex gap="2" align="center">
            <Pencil1Icon width="16" height="16" />
            <Text>Rename</Text>
          </Flex>
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item color="red" onClick={() => handleFileDelete(file)}>
          <Flex gap="2" align="center">
            <TrashIcon width="16" height="16" />
            <Text>Delete</Text>
          </Flex>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );

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
          </Flex>
        </Card>
      ))}
    </Grid>
  );
};

export default FilesGrid;
