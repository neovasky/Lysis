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
  path?: string;
}

export const FileUploadDialog = ({
  open,
  onOpenChange,
  onUploadComplete,
  currentFolderPath,
}: FileUploadDialogProps) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Adds selected files to the state with status "pending"
  const addFiles = useCallback((files: File[]) => {
    const newFiles: UploadingFile[] = files.map((file) => ({
      id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      file,
      progress: 0,
      status: "pending",
      path: "", // Will be set when the file is uploaded.
    }));
    setUploadingFiles((prev) => [...prev, ...newFiles]);
  }, []);

  // Processes all files with status "pending" and then closes the dialog.
  const handleUpload = useCallback(async () => {
    setIsProcessing(true);
    try {
      // Determine target directory once
      const targetPath =
        currentFolderPath || (await FileService.getCurrentDirectory());
      if (!targetPath) {
        throw new Error("No folder selected for upload");
      }

      // Filter out pending files
      const pendingFiles = uploadingFiles.filter((f) => f.status === "pending");

      for (const uploadFile of pendingFiles) {
        // Build file path based on the target folder
        const filePath = `${targetPath}/${uploadFile.file.name}`;

        // Mark file as uploading with an initial progress and store the file path
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: "uploading", progress: 10, path: filePath }
              : f
          )
        );

        try {
          const arrayBuffer = await uploadFile.file.arrayBuffer();
          const buffer = new Uint8Array(arrayBuffer);

          // Increase progress periodically until near completion
          const progressInterval = setInterval(() => {
            setUploadingFiles((prev) =>
              prev.map((f) => {
                if (f.id === uploadFile.id && f.progress < 90) {
                  return { ...f, progress: f.progress + 10 };
                }
                return f;
              })
            );
          }, 200);

          // Write the file using FileService
          if (filePath) {
            await FileService.writeFile(filePath, buffer);
          }

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
      // After processing all files, trigger the upload complete callback,
      // clear the file list and close the dialog.
      onUploadComplete?.();
      setUploadingFiles([]);
      onOpenChange(false);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [currentFolderPath, uploadingFiles, onUploadComplete, onOpenChange]);

  // Removes a file from the list
  const removeFile = useCallback((fileId: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  // Handle manual close via the header "X" button
  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="DialogOverlay" />
        <Dialog.Content className="DialogContent">
          <form onSubmit={(e) => e.preventDefault()}>
            <Flex direction="column" gap="4">
              {/* Header with title and "X" button */}
              <Flex justify="between" align="center">
                <Flex className="DialogTitle">
                  <UploadIcon width="24" height="24" />
                  <Text>Upload Files</Text>
                </Flex>
                <Dialog.Close asChild>
                  <Button asChild onClick={handleClose} disabled={isProcessing}>
                    <button className="DialogCloseButton">
                      <Cross2Icon />
                    </button>
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
                  if (files.length > 0) {
                    addFiles(files);
                  }
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
                      addFiles(Array.from(e.target.files));
                      e.target.value = "";
                    }
                  }}
                  style={{ display: "none" }}
                  multiple
                />

                <Flex direction="column" align="center" gap="2">
                  <UploadIcon width="32" height="32" />
                  <Text size="3" weight="bold">
                    Drag and drop files here
                  </Text>
                  <Text size="2" color="gray">
                    or
                  </Text>
                  <Button
                    variant="soft"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Add Files
                  </Button>
                </Flex>
              </Box>

              {/* File List */}
              {uploadingFiles.length > 0 && (
                <Box style={{ maxHeight: "240px", overflowY: "auto" }}>
                  <Flex direction="column" gap="2">
                    {uploadingFiles.map((file) => (
                      <Card key={file.id} variant="surface">
                        <Text weight="bold" mb="1">
                          {file.file.name}
                        </Text>
                        <Flex direction="column" gap="1">
                          <Progress
                            value={file.progress}
                            style={{
                              height: "6px",
                              backgroundColor: "var(--gray-4)",
                            }}
                          />
                          <Flex justify="between" align="center">
                            <Text
                              size="1"
                              color={file.status === "error" ? "red" : "gray"}
                            >
                              {file.status === "error"
                                ? file.error
                                : file.status}
                            </Text>
                            <Flex align="center" gap="2">
                              <Text size="1" color="gray">
                                {(file.file.size / 1024 / 1024).toFixed(1)} MB
                              </Text>
                              {file.status !== "uploading" && (
                                <Button
                                  variant="ghost"
                                  size="1"
                                  onClick={() => removeFile(file.id)}
                                  style={{ padding: "2px" }}
                                >
                                  <TrashIcon />
                                </Button>
                              )}
                            </Flex>
                          </Flex>
                        </Flex>
                      </Card>
                    ))}
                  </Flex>
                </Box>
              )}

              {/* Dialog Actions: "Upload" and "Add More Files" */}
              <Flex gap="3" mt="4" justify="end">
                <Button
                  onClick={handleUpload}
                  disabled={
                    isProcessing ||
                    uploadingFiles.filter((f) => f.status === "pending")
                      .length === 0
                  }
                >
                  Upload
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  Add More Files
                </Button>
              </Flex>
            </Flex>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
