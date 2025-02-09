/**
 * File: src/components/Files/FilesLayout.tsx
 * Description: Main layout component for the files page with view toggle
 */

import { useState } from "react";
import { Box, Card, Flex, Button, Text, Badge } from "@radix-ui/themes";
import { GridIcon, ListBulletIcon, UploadIcon } from "@radix-ui/react-icons";
import { FilesList } from "./FilesList";
import { FilesGrid } from "./FilesGrid";
import { FileUploadDialog } from "./FileUploadDialog";
import { useAppSelector } from "../../store/hooks";
import { selectAllFiles } from "../../store/slices/fileSlice";

type ViewMode = "list" | "grid";

export const FilesLayout = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const files = useAppSelector(selectAllFiles);

  return (
    <Box p="4">
      {/* Header */}
      <Card size="3" mb="4">
        <Flex justify="between" align="center">
          <Box>
            <Text size="5" weight="bold" mb="2">
              Files
            </Text>
            <Text color="gray" size="2">
              {files.length} files
            </Text>
          </Box>
          <Flex gap="2">
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
            variant="surface"
            onClick={() => {}}
            style={{ cursor: "pointer" }}
          >
            All Files
          </Badge>
          <Badge
            variant="surface"
            onClick={() => {}}
            style={{ cursor: "pointer" }}
          >
            Recent
          </Badge>
          <Badge
            variant="surface"
            onClick={() => {}}
            style={{ cursor: "pointer" }}
          >
            PDF
          </Badge>
          <Badge
            variant="surface"
            onClick={() => {}}
            style={{ cursor: "pointer" }}
          >
            Excel
          </Badge>
          <Badge
            variant="surface"
            onClick={() => {}}
            style={{ cursor: "pointer" }}
          >
            Word
          </Badge>
        </Flex>
      </Card>

      {/* Files Display */}
      <Card>
        {viewMode === "list" ? (
          <FilesList files={files} />
        ) : (
          <FilesGrid files={files} />
        )}
      </Card>

      {/* Upload Dialog */}
      <FileUploadDialog open={isUploadOpen} onOpenChange={setIsUploadOpen} />
    </Box>
  );
};
