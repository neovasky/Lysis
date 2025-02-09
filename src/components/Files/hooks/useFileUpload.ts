/**
 * File: src/components/Files/hooks/useFileUpload.ts
 * Description: Hook for handling file uploads
 */

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
    async (uploadFile: UploadingFile) => {
      try {
        // Update status to uploading
        updateFileStatus(uploadFile.id, { status: "uploading" });

        // Get temporary progress updates
        const interval = setInterval(() => {
          updateFileStatus(uploadFile.id, {
            progress: Math.min((uploadFile.progress || 0) + 10, 90),
          });
        }, 200);

        // Convert File to Buffer
        const buffer = Buffer.from(await uploadFile.file.arrayBuffer());

        // Write file to filesystem
        const filePath = uploadFile.file.path || uploadFile.file.name; // Use path if available
        const metadata = await FileService.writeFile(filePath, buffer);

        // Clear interval
        clearInterval(interval);

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
