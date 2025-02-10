import { useCallback } from "react";
import { Table, Button, Text, Box, Flex, DropdownMenu } from "@radix-ui/themes";
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

interface FilesListProps {
  files: FileMetadata[];
  onFileOpen?: (file: FileMetadata) => void;
}

export const FilesList = ({ files, onFileOpen }: FilesListProps) => {
  const { deleteFile } = useFiles();

  // Get file icon based on type
  const getFileIcon = (type: FileMetadata["type"]) => {
    switch (type) {
      case "pdf":
        return <FileTextIcon width="16" height="16" />;
      case "excel":
        return <TableIcon width="16" height="16" />;
      case "word":
        return <Component1Icon width="16" height="16" />;
      default:
        return <FileIcon width="16" height="16" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
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

  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Modified</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Size</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Tags</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {files.length === 0 ? (
          <Table.Row>
            <Table.Cell colSpan={6}>
              <Box p="4">
                <Text align="center" color="gray">
                  No files found
                </Text>
              </Box>
            </Table.Cell>
          </Table.Row>
        ) : (
          files.map((file) => (
            <Table.Row
              key={file.id}
              style={{ cursor: "pointer" }}
              onClick={() => handleFileOpen(file)}
            >
              <Table.Cell>
                <Flex align="center" gap="2">
                  {getFileIcon(file.type)}
                  <Text>{file.name}</Text>
                </Flex>
              </Table.Cell>
              <Table.Cell>
                <Text color="gray" size="2">
                  {formatDistance(file.lastModified, new Date(), {
                    addSuffix: true,
                  })}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <Text size="2" style={{ textTransform: "uppercase" }}>
                  {file.type}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <Text color="gray" size="2">
                  {formatFileSize(file.size)}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <Flex gap="1" wrap="wrap">
                  {file.tags?.map((tag) => (
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
                </Flex>
              </Table.Cell>
              <Table.Cell onClick={(e) => e.stopPropagation()}>
                <FileActions file={file} />
              </Table.Cell>
            </Table.Row>
          ))
        )}
      </Table.Body>
    </Table.Root>
  );
};
