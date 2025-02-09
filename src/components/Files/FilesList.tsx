/**
 * File: src/components/Files/FilesList.tsx
 * Description: List view component for displaying files
 */

import { Table, Button, Text, Box, Flex } from "@radix-ui/themes";
import {
  DotsVerticalIcon,
  FileIcon,
  FileTextIcon,
  ExcelIcon,
  ComponentIcon,
} from "@radix-ui/react-icons";
import { formatDistance } from "date-fns";
import { FileMetadata } from "../../store/slices/fileSlice";

interface FilesListProps {
  files: FileMetadata[];
}

export const FilesList = ({ files }: FilesListProps) => {
  // Get file icon based on type
  const getFileIcon = (type: FileMetadata["type"]) => {
    switch (type) {
      case "pdf":
        return <FileTextIcon width="16" height="16" />;
      case "excel":
        return <ExcelIcon width="16" height="16" />;
      case "word":
        return <ComponentIcon width="16" height="16" />;
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
            <Table.Row key={file.id}>
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
                <Text transform="uppercase" size="2">
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
                  {file.tags.map((tag) => (
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
              <Table.Cell>
                <Button variant="ghost" size="1">
                  <DotsVerticalIcon />
                </Button>
              </Table.Cell>
            </Table.Row>
          ))
        )}
      </Table.Body>
    </Table.Root>
  );
};
