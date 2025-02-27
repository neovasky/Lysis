import { useState, useRef, useCallback } from "react";
import { X, Upload, Trash } from "lucide-react";
import FileService from "../../services/fileService";
import "./dialogStyles.css";
import React from "react";
import { Button } from "../ui/button";

export interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
  path?: string;
}

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete?: () => void;
  currentFolderPath?: string;
}

const ProgressBar = ({ value }: { value: number }) => (
  <div className="w-full h-2 bg-gray-200 rounded">
    <div
      className="h-full bg-blue-500 rounded"
      style={{ width: `${value}%` }}
    ></div>
  </div>
);

const FileUploadDialogComponent = ({
  open,
  onOpenChange,
  onUploadComplete,
  currentFolderPath,
}: FileUploadDialogProps) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [cancelUpload, setCancelUpload] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: File[]) => {
    const newFiles: UploadingFile[] = files.map((file) => ({
      id: `upload_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      file,
      progress: 0,
      status: "pending",
      path: "",
    }));
    setUploadingFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleCancelUpload = () => {
    setCancelUpload(true);
  };

  const handleUpload = useCallback(async () => {
    setIsProcessing(true);
    setCancelUpload(false);
    try {
      const targetPath =
        currentFolderPath || (await FileService.getCurrentDirectory());
      if (!targetPath) throw new Error("No folder selected for upload");

      const pendingFiles = uploadingFiles.filter((f) => f.status === "pending");

      for (const uploadFile of pendingFiles) {
        // If the user cancelled, break out of the loop
        if (cancelUpload) break;

        const filePath = `${targetPath}/${uploadFile.file.name}`;
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

          // Yield control before starting the file write to allow re-renders.
          await new Promise<void>((resolve, reject) =>
            setTimeout(() => {
              FileService.writeFile(filePath, buffer)
                .then(() => resolve())
                .catch(reject);
            }, 0)
          );

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
      } // End of for-loop

      // If the upload was cancelled, optionally notify the user here.
      if (!cancelUpload) {
        onUploadComplete?.();
      }
      // Delay closing the dialog so that users see the final progress and status.
      setTimeout(() => {
        setUploadingFiles([]);
        onOpenChange(false);
      }, 1000);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsProcessing(false);
    }
  }, [
    currentFolderPath,
    uploadingFiles,
    onUploadComplete,
    onOpenChange,
    cancelUpload,
  ]);

  const removeFile = useCallback((fileId: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay - using our new glassy style */}
      <div className="dialogOverlay" onClick={() => onOpenChange(false)}></div>
      {/* Modal Content */}
      <div className="dialogContent">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Upload className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold">Upload Files</h2>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-600 hover:text-gray-800"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded p-4 text-center ${
                isDragging ? "bg-gray-100" : "bg-white"
              }`}
              onDragEnter={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const filesArray = Array.from(e.dataTransfer.files);
                if (filesArray.length > 0) addFiles(filesArray);
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                multiple
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    addFiles(Array.from(e.target.files));
                    e.target.value = "";
                  }
                }}
              />
              <div className="space-y-2">
                <Upload className="w-8 h-8 mx-auto text-blue-500" />
                <p className="text-gray-600">Drag &amp; drop files here</p>
                <p className="text-sm text-gray-500">or</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Files
                </button>
              </div>
            </div>

            {uploadingFiles.length > 0 && (
              <div className="space-y-2">
                {uploadingFiles.map((file) => (
                  <div key={file.id} className="border p-2 rounded">
                    <p className="text-sm font-medium">{file.file.name}</p>
                    <ProgressBar value={file.progress} />
                    <div className="flex items-center justify-between mt-2">
                      <p
                        className={`text-xs ${
                          file.status === "error"
                            ? "text-red-500"
                            : "text-gray-500"
                        }`}
                      >
                        {file.status === "error" ? file.error : file.status}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500">
                          {(file.file.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                        {file.status !== "uploading" && (
                          <button
                            type="button"
                            onClick={() => removeFile(file.id)}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-4">
              {/* Show cancel button if processing */}
              {isProcessing && (
                <Button
                  variant="solid"
                  type="button"
                  onClick={handleCancelUpload}
                  className="px-4 py-2 rounded"
                >
                  Cancel Upload
                </Button>
              )}

              <Button
                variant="icon"
                type="button"
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
                variant="solid"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="px-4 py-2 rounded"
              >
                Add More Files
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(FileUploadDialogComponent);
