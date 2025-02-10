import { useState, useRef, useCallback } from "react";
import "./styles.css";
import * as Dialog from "@radix-ui/react-dialog";
import { Button, Flex, Text, Box, Progress, Card } from "@radix-ui/themes";
import { UploadIcon, TrashIcon, Cross2Icon } from "@radix-ui/react-icons";
import { useFileUpload, type UploadingFile } from "./hooks/useFileUpload";

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete?: () => void;
}

export const FileUploadDialog = ({
  open,
  onOpenChange,
  onUploadComplete,
}: FileUploadDialogProps) => {
  const { uploadingFiles, processFiles, removeFile } = useFileUpload();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag & Drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        await processFiles(files);
      }
    },
    [processFiles]
  );

  // File input change handler
  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const files = Array.from(e.target.files);
        await processFiles(files);
        e.target.value = ""; // Reset input so the same file can be re-selected if needed.
      }
    },
    [processFiles]
  );

  // Dialog close handler
  const handleClose = useCallback(() => {
    const hasUploading = uploadingFiles.some((f) => f.status === "uploading");
    if (!hasUploading) {
      const hasCompleted = uploadingFiles.some((f) => f.status === "completed");
      if (hasCompleted && onUploadComplete) {
        onUploadComplete();
      }
      onOpenChange(false);
    }
  }, [uploadingFiles, onOpenChange, onUploadComplete]);

  // Render upload status text
  const renderStatusText = (file: UploadingFile) => {
    switch (file.status) {
      case "completed":
        return "Completed";
      case "error":
        return file.error;
      case "uploading":
        return `${file.progress}%`;
      default:
        return "Pending";
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="DialogOverlay" />
        <Dialog.Content className="DialogContent">
          <Flex justify="between" align="center" mb="4">
            <Text size="5">Upload Files</Text>
            <Dialog.Close asChild>
              <Button variant="ghost" onClick={handleClose}>
                <Cross2Icon />
              </Button>
            </Dialog.Close>
          </Flex>

          {/* Upload Area */}
          <Box
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${
                isDragging ? "var(--accent-9)" : "var(--gray-6)"
              }`,
              borderRadius: "8px",
              backgroundColor: isDragging ? "var(--accent-2)" : "var(--gray-2)",
              padding: "32px",
              textAlign: "center",
              transition: "all 0.2s ease",
              marginBottom: "16px",
            }}
          >
            {/* Hidden file input placed off-screen */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              style={{
                position: "absolute",
                width: "1px",
                height: "1px",
                padding: "0",
                margin: "-1px",
                overflow: "hidden",
                clip: "rect(0,0,0,0)",
                border: "0",
              }}
              multiple
            />

            <Flex direction="column" align="center" gap="2">
              <UploadIcon width="32" height="32" />
              <Text size="2" weight="bold">
                Drag and drop files here
              </Text>
              <Text size="2" color="gray">
                or
              </Text>
              <Button
                variant="soft"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse Files
              </Button>
            </Flex>
          </Box>

          {/* File List */}
          {uploadingFiles.length > 0 && (
            <Box style={{ maxHeight: "240px", overflowY: "auto" }}>
              <Flex direction="column" gap="2">
                {uploadingFiles.map((file) => (
                  <Card key={file.id} style={{ padding: "12px" }}>
                    <Flex justify="between" align="center" mb="2">
                      <Text size="2" weight="medium">
                        {file.file.name}
                      </Text>
                      {file.status !== "uploading" && (
                        <Button
                          variant="ghost"
                          color="red"
                          size="1"
                          onClick={() => removeFile(file.id)}
                        >
                          <TrashIcon />
                        </Button>
                      )}
                    </Flex>

                    <Flex direction="column" gap="1">
                      <Progress
                        value={file.progress}
                        color={
                          file.status === "error"
                            ? "red"
                            : file.status === "completed"
                            ? "green"
                            : "blue"
                        }
                      />
                      <Flex justify="between">
                        <Text
                          size="1"
                          color={file.status === "error" ? "red" : "gray"}
                        >
                          {renderStatusText(file)}
                        </Text>
                        <Text size="1" color="gray">
                          {(file.file.size / 1024 / 1024).toFixed(1)} MB
                        </Text>
                      </Flex>
                    </Flex>
                  </Card>
                ))}
              </Flex>
            </Box>
          )}

          {/* Dialog Actions */}
          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close asChild>
              <Button
                variant="soft"
                color="gray"
                onClick={handleClose}
                disabled={uploadingFiles.some((f) => f.status === "uploading")}
              >
                {uploadingFiles.some((f) => f.status === "uploading")
                  ? "Uploading..."
                  : "Close"}
              </Button>
            </Dialog.Close>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFiles.some((f) => f.status === "uploading")}
            >
              Add More Files
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
