import { useState, useRef, useCallback } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Box, Card, Flex, Text, Button, Progress } from "@radix-ui/themes";
import { Cross2Icon, UploadIcon, TrashIcon } from "@radix-ui/react-icons";
import FileService from "../../services/fileService";
import "./styles.css";

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete?: () => void;
  currentFolderPath?: string;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
}

export const FileUploadDialog = ({
  open,
  onOpenChange,
  onUploadComplete,
  currentFolderPath,
}: FileUploadDialogProps) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (!currentFolderPath) {
        const rootPath = await FileService.getCurrentDirectory();
        if (!rootPath) {
          throw new Error("No folder selected for upload");
        }
      }

      const targetPath =
        currentFolderPath || (await FileService.getCurrentDirectory());

      const newFiles: UploadingFile[] = files.map((file) => ({
        id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        file,
        progress: 0,
        status: "pending",
      }));

      setUploadingFiles((prev) => [...prev, ...newFiles]);

      for (const uploadFile of newFiles) {
        try {
          // Set initial uploading state
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? { ...f, status: "uploading", progress: 10 }
                : f
            )
          );

          // Prepare file data
          const arrayBuffer = await uploadFile.file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const filePath = `${targetPath}/${uploadFile.file.name}`;

          // Set up progress simulation
          const progressInterval = setInterval(() => {
            setUploadingFiles((prev) =>
              prev.map((f) =>
                f.id === uploadFile.id && f.progress < 90
                  ? { ...f, progress: f.progress + 10 }
                  : f
              )
            );
          }, 200);

          // Perform actual file write
          await FileService.writeFile(filePath, buffer);

          // Clear interval and set complete
          clearInterval(progressInterval);
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? { ...f, status: "completed", progress: 100 }
                : f
            )
          );
        } catch (error) {
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? {
                    ...f,
                    status: "error",
                    error:
                      error instanceof Error ? error.message : "Upload failed",
                  }
                : f
            )
          );
        }
      }
    },
    [currentFolderPath]
  );

  const handleClose = useCallback(() => {
    const hasUploading = uploadingFiles.some((f) => f.status === "uploading");
    if (!hasUploading) {
      const hasCompleted = uploadingFiles.some((f) => f.status === "completed");
      if (hasCompleted && onUploadComplete) {
        onUploadComplete();
      }
      setUploadingFiles([]);
      onOpenChange(false);
    }
  }, [uploadingFiles, onUploadComplete, onOpenChange]);

  const removeFile = useCallback((fileId: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="DialogOverlay" />
        <Dialog.Content className="DialogContent">
          <Card size="3">
            <Flex justify="between" align="center" mb="4">
              <Text size="5" weight="bold">
                Upload Files
              </Text>
              <Dialog.Close asChild>
                <Button variant="ghost" onClick={handleClose}>
                  <Cross2Icon />
                </Button>
              </Dialog.Close>
            </Flex>

            {/* Drop Zone */}
            <Box
              onDragEnter={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
                const files = Array.from(e.dataTransfer.files);
                if (files.length > 0) handleFiles(files);
              }}
              style={{
                border: `2px dashed ${
                  isDragging ? "var(--accent-9)" : "var(--gray-6)"
                }`,
                borderRadius: "8px",
                backgroundColor: isDragging
                  ? "var(--accent-2)"
                  : "var(--gray-2)",
                padding: "32px",
                textAlign: "center",
                marginBottom: "16px",
                transition: "all 0.2s ease",
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFiles(Array.from(e.target.files));
                    e.target.value = "";
                  }
                }}
                style={{ display: "none" }}
                multiple
              />

              <Flex direction="column" align="center" gap="2">
                <UploadIcon width="32" height="32" />
                <Text size="3" weight="bold" color="gray">
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
                    <Card key={file.id} variant="surface">
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
                            {file.status === "error" ? file.error : file.status}
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
                  disabled={uploadingFiles.some(
                    (f) => f.status === "uploading"
                  )}
                >
                  Close
                </Button>
              </Dialog.Close>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFiles.some((f) => f.status === "uploading")}
              >
                Add More Files
              </Button>
            </Flex>
          </Card>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
