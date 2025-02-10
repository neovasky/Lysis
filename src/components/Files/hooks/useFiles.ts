import { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  selectAllFiles,
  addFile,
  removeFile,
  updateFile,
  FileMetadata,
} from "../../../store/slices/fileSlice";
import FileService from "../../../services/fileService";

export interface UseFilesReturn {
  files: FileMetadata[];
  loading: boolean;
  error: string | null;
  currentDirectory: string | null;
  loadFiles: (dirPath?: string) => Promise<void>;
  deleteFile: (fileId: string, filePath: string) => Promise<void>;
  refreshFiles: () => Promise<void>;
  setCurrentDirectory: (path: string | null) => void;
}

export function useFiles(): UseFilesReturn {
  const dispatch = useAppDispatch();
  const files = useAppSelector(selectAllFiles);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDirectory, setCurrentDirectory] = useState<string | null>(null);
  const [checkInterval, setCheckInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  // Setup file watching
  const setupFileWatching = useCallback(
    (dirPath: string) => {
      // Clear existing interval if any
      if (checkInterval) {
        clearInterval(checkInterval);
      }

      // Set up new interval to check for file changes
      const interval = setInterval(async () => {
        if (!dirPath) return;

        try {
          const currentFiles = await FileService.getFiles(dirPath);

          // Check for new or modified files
          currentFiles.forEach((newFile: FileMetadata) => {
            const existingFile = files.find((f) => f.path === newFile.path);

            if (!existingFile) {
              // New file
              dispatch(addFile(newFile));
            } else if (existingFile.lastModified !== newFile.lastModified) {
              // Modified file
              dispatch(updateFile({ id: existingFile.id, updates: newFile }));
            }
          });

          // Check for deleted files
          files.forEach((existingFile) => {
            if (
              !currentFiles.some(
                (newFile) => newFile.path === existingFile.path
              )
            ) {
              dispatch(removeFile(existingFile.id));
            }
          });
        } catch (err) {
          console.error("Error checking for file changes:", err);
        }
      }, 5000); // Check every 5 seconds

      setCheckInterval(interval);

      // Cleanup function
      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    },
    [dispatch, files, checkInterval]
  );

  // Load files from a directory
  const loadFiles = useCallback(
    async (dirPath?: string) => {
      try {
        setLoading(true);
        setError(null);

        let targetDir = dirPath;

        // If no directory provided, show file picker
        if (!targetDir) {
          const selected = await FileService.selectFiles({
            directory: true,
            multiple: false,
          });

          if (selected && selected.length > 0) {
            targetDir = selected[0];
          } else {
            setLoading(false);
            return;
          }
        }

        setCurrentDirectory(targetDir);
        const fileList = await FileService.getFiles(targetDir);

        // Update store with files
        fileList.forEach((file: FileMetadata) => {
          dispatch(addFile(file));
        });

        // Setup file watching
        setupFileWatching(targetDir);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load files");
        console.error("Error loading files:", err);
      } finally {
        setLoading(false);
      }
    },
    [dispatch, setupFileWatching]
  );

  // Delete a file
  const deleteFile = useCallback(
    async (fileId: string, filePath: string) => {
      try {
        setError(null);
        await FileService.deleteFile(filePath);
        dispatch(removeFile(fileId));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete file");
        console.error("Error deleting file:", err);
      }
    },
    [dispatch]
  );

  // Refresh current directory
  const refreshFiles = useCallback(async () => {
    if (currentDirectory) {
      await loadFiles(currentDirectory);
    }
  }, [currentDirectory, loadFiles]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [checkInterval]);

  return {
    files,
    loading,
    error,
    currentDirectory,
    loadFiles,
    deleteFile,
    refreshFiles,
    setCurrentDirectory,
  };
}
