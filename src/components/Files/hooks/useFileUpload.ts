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
    async (uploadingFile: UploadingFile, destinationPath: string) => {
      try {
        // Update status to uploading
        updateFileStatus(uploadingFile.id, { status: "uploading" });

        // Convert File to Buffer
        const arrayBuffer = await uploadingFile.file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Create full file path
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
    async (files: File[], destinationPath: string) => {
      // Create upload entries
      const newFiles: UploadingFile[] = files.map((file) => ({
        id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        file,
        progress: 0,
        status: "pending",
      }));

      // Add new files to state
      setUploadingFiles((prev) => [...prev, ...newFiles]);

      // Process each file
      await Promise.all(
        newFiles.map((file) => uploadFile(file, destinationPath))
      );
    },
    [uploadFile]
  );

  const removeFile = useCallback((id: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  return {
    uploadingFiles,
    processFiles,
    removeFile,
  };
}
