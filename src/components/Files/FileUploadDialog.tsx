/**
 * File: src/components/Files/FileUploadDialog.tsx
 * Description: Dialog component for file uploads with drag & drop support
 */

import { useState, useRef, useCallback } from "react";
import {
  Dialog,
  Button,
  Flex,
  Text,
  Box,
  Progress,
  Card,
} from "@radix-ui/themes";
import { UploadIcon, TrashIcon, Cross2Icon } from "@radix-ui/react-icons";
import { useAppDispatch } from "../../store/hooks";
import { addFile } from "../../store/slices/fileSlice";
import FileService from "../../services/fileService";

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type UploadStatus = "pending" | "uploading" | "completed" | "error";

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  error?: string;
  status: UploadStatus;
}

export const FileUploadDialog = ({
  open,
  onOpenChange,
}: FileUploadDialogProps) => {
  const dispatch = useAppDispatch();
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to update file status
  const updateFileStatus = useCallback(
    (fileId: string, updates: Partial<UploadingFile>) => {
      setUploadingFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, ...updates } : f))
      );
    },
    []
  );

  // Process single file upload
  const uploadFile = useCallback(
    async (uploadFile: UploadingFile) => {
      try {
        // Update status to uploading
        updateFileStatus(uploadFile.id, { status: "uploading" });

        // Get file metadata
        const metadata = await FileService.getFileMetadata(
          uploadFile.file.path
        );

        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          updateFileStatus(uploadFile.id, { progress });
          await new Promise((resolve) => setTimeout(resolve, 200));
        }

        // Add file to store
        dispatch(addFile(metadata));

        // Update status to completed
        updateFileStatus(uploadFile.id, {
          status: "completed",
          progress: 100,
        });
      } catch (error) {
        // Update status to error
        updateFileStatus(uploadFile.id, {
          status: "error",
          error: error instanceof Error ? error.message : "Upload failed",
          progress: 0,
        });
      }
    },
    [dispatch, updateFileStatus]
  );

  // Process multiple files
  const processFiles = useCallback(
    async (files: File[]) => {
      // Create upload entries
      const newFiles = files.map((file) => ({
        id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        file,
        progress: 0,
        status: "pending" as UploadStatus,
      }));

      // Add new files to state
      setUploadingFiles((prev) => [...prev, ...newFiles]);

      // Process each file
      await Promise.all(newFiles.map(uploadFile));
    },
    [uploadFile]
  );

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
        e.target.value = ""; // Reset input
      }
    },
    [processFiles]
  );

  // Remove file handler
  const handleRemoveFile = useCallback((id: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // Dialog close handler
  const handleClose = useCallback(() => {
    const hasUploading = uploadingFiles.some((f) => f.status === "uploading");
    if (!hasUploading) {
      setUploadingFiles([]);
      onOpenChange(false);
    }
  }, [uploadingFiles, onOpenChange]);

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
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Content style={{ maxWidth: 560 }}>
        <Dialog.Title>
          <Flex justify="between" align="center">
            <Text size="5">Upload Files</Text>
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={uploadingFiles.some((f) => f.status === "uploading")}
            >
              <Cross2Icon />
            </Button>
          </Flex>
        </Dialog.Title>

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
            marginTop: "16px",
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: "none" }}
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
                <Card
                  key={file.id}
                  style={{
                    padding: "12px",
                    backgroundColor: "var(--gray-2)",
                    borderRadius: "6px",
                  }}
                >
                  <Flex justify="between" align="center" mb="2">
                    <Text size="2" weight="medium">
                      {file.file.name}
                    </Text>
                    {file.status !== "uploading" && (
                      <Button
                        variant="ghost"
                        color="red"
                        size="1"
                        onClick={() => handleRemoveFile(file.id)}
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
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingFiles.some((f) => f.status === "uploading")}
          >
            Add More Files
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
