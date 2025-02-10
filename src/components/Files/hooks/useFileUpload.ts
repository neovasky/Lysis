import { useState, useCallback } from "react";
import { useAppDispatch } from "../../../store/hooks";
import { addFile } from "../../../store/slices/fileSlice";
import FileService from "../../../services/fileService";

export type UploadStatus = "pending" | "uploading" | "completed" | "error";

export interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  error?: string;
  status: UploadStatus;
}

export function useFileUpload() {
  const dispatch = useAppDispatch();
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const updateFileStatus = useCallback(
    (fileId: string, updates: Partial<UploadingFile>) => {
      setUploadingFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, ...updates } : f))
      );
    },
    []
  );

  const uploadFile = useCallback(
    async (uploadingFile: UploadingFile) => {
      try {
        // Update status to uploading
        updateFileStatus(uploadingFile.id, { status: "uploading" });

        // Select the destination using electron's file dialog
        const paths = await FileService.selectFiles({
          directory: true,
          multiple: false,
        });

        if (!paths || paths.length === 0) {
          throw new Error("No destination selected");
        }

        const destinationPath = paths[0];

        // Convert File to Buffer
        const arrayBuffer = await uploadingFile.file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Create a unique filename in case of duplicates
        const filePath = `${destinationPath}/${uploadingFile.file.name}`;

        // Simulate progress updates
        const interval = setInterval(() => {
          updateFileStatus(uploadingFile.id, {
            progress: Math.min((uploadingFile.progress || 0) + 10, 90),
          });
        }, 200);

        // Write file to filesystem
        const metadata = await FileService.writeFile(filePath, buffer);

        // Clear interval
        clearInterval(interval);

        // Add file to store
        dispatch(addFile(metadata));

        // Update status to completed
        updateFileStatus(uploadingFile.id, {
          status: "completed",
          progress: 100,
        });
      } catch (error) {
        // Update status to error
        updateFileStatus(uploadingFile.id, {
          status: "error",
          error: error instanceof Error ? error.message : "Upload failed",
          progress: 0,
        });
      }
    },
    [dispatch, updateFileStatus]
  );

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

  const removeFile = useCallback((id: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setUploadingFiles((prev) =>
      prev.filter((f) => f.status !== "completed" && f.status !== "error")
    );
  }, []);

  return {
    uploadingFiles,
    processFiles,
    removeFile,
    clearCompleted,
  };
}
