/**
 * File: src/components/Files/FilesGrid.tsx
 * Description: Grid view component for displaying files
 */

import { Grid, Card, Text, Box, Flex, Button } from "@radix-ui/themes";
import {
  DotsVerticalIcon,
  FileIcon,
  FileTextIcon,
  TableIcon, // Changed from ExcelIcon
  Component1Icon, // Changed from ComponentIcon
} from "@radix-ui/react-icons";
import { formatDistance } from "date-fns";
import { FileMetadata } from "../../store/slices/fileSlice";

interface FilesGridProps {
  files: FileMetadata[];
}

export const FilesGrid = ({ files }: FilesGridProps) => {
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
        <Card key={file.id} style={{ cursor: "pointer" }}>
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
              <Button variant="ghost" size="1">
                <DotsVerticalIcon />
              </Button>
            </Flex>

            <Text size="1" color="gray">
              {formatDistance(file.lastModified, new Date(), {
                addSuffix: true,
              })}
            </Text>

            {file.tags.length > 0 && (
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
