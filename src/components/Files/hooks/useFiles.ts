// File: src/components/Files/hooks/useFiles.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  selectAllFiles,
  addFile,
  removeFile,
  updateFile,
  FileMetadata,
} from "../../../store/slices/fileSlice";
import FileService from "../../../services/fileService";
import { FILE_CONSTANTS } from "../../../services/constants";

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

  // Use ref for loadFiles to avoid dependency cycles
  const loadFilesRef = useRef<(dirPath?: string) => Promise<void>>();

  // Setup file watching
  const setupFileWatching = useCallback(
    (dirPath: string) => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }

      const interval = setInterval(async () => {
        if (!dirPath) return;

        try {
          const currentFiles = await FileService.getFiles(dirPath);

          // Check for new or modified files
          currentFiles.forEach((newFile: FileMetadata) => {
            const existingFile = files.find((f) => f.path === newFile.path);

            if (!existingFile) {
              dispatch(addFile(newFile));
            } else if (existingFile.lastModified !== newFile.lastModified) {
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
      }, 5000);

      setCheckInterval(interval);

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
        // Store the current directory
        localStorage.setItem("lastUsedDirectory", targetDir);

        const fileList = await FileService.getFiles(targetDir);

        // Clear existing files before adding new ones
        const existingFiles = files.map((file) => file.id);
        existingFiles.forEach((id) => dispatch(removeFile(id)));

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
    [dispatch, setupFileWatching, files]
  );

  // Store loadFiles in ref to avoid dependency cycles
  useEffect(() => {
    loadFilesRef.current = loadFiles;
  }, [loadFiles]);

  // Initialize stored folders on mount
  useEffect(() => {
    const initializeStoredFolders = async () => {
      try {
        // Access DEFAULT_BASE_DIRECTORY through the FileService class directly
        const lastDirectory =
          localStorage.getItem("lastUsedDirectory") ||
          FILE_CONSTANTS.DEFAULT_BASE_DIRECTORY;
        if (lastDirectory && loadFilesRef.current) {
          await loadFilesRef.current(lastDirectory);
        }
      } catch (error) {
        console.error("Error initializing stored folders:", error);
      }
    };

    initializeStoredFolders();
  }, []);

  // Delete a file
  const deleteFile = useCallback(
    async (fileId: string, filePath: string) => {
      try {
        setError(null);
        await FileService.deleteItem(filePath); // Changed from deleteFile to deleteItem
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
