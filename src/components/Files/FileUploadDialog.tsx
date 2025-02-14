import { useState, useRef, useCallback } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon, UploadIcon, TrashIcon } from "@radix-ui/react-icons";
import FileService from "../../services/fileService";
import "./dialogStyles.css";

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
  <div className="progressBar">
    <div className="progressFill" style={{ width: `${value}%` }}></div>
  </div>
);

export const FileUploadDialog = ({
  open,
  onOpenChange,
  onUploadComplete,
  currentFolderPath,
}: FileUploadDialogProps) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  console.log("Rendering FileUploadDialog");

  const addFiles = useCallback((files: File[]) => {
    const newFiles: UploadingFile[] = files.map((file) => ({
      id: `upload_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      file,
      progress: 0,
      status: "pending",
      path: "",
    }));
    setUploadingFiles((prev: UploadingFile[]) => [...prev, ...newFiles]);
  }, []);

  const handleUpload = useCallback(async () => {
    setIsProcessing(true);
    try {
      const targetPath =
        currentFolderPath || (await FileService.getCurrentDirectory());
      if (!targetPath) throw new Error("No folder selected for upload");

      const pendingFiles = uploadingFiles.filter(
        (f: UploadingFile) => f.status === "pending"
      );

      for (const uploadFile of pendingFiles) {
        const filePath = `${targetPath}/${uploadFile.file.name}`;
        setUploadingFiles((prev: UploadingFile[]) =>
          prev.map((f: UploadingFile) =>
            f.id === uploadFile.id
              ? ({
                  ...f,
                  status: "uploading",
                  progress: 10,
                  path: filePath,
                } as UploadingFile)
              : f
          )
        );

        try {
          const arrayBuffer = await uploadFile.file.arrayBuffer();
          const buffer = new Uint8Array(arrayBuffer);

          const progressInterval = setInterval(() => {
            setUploadingFiles((prev: UploadingFile[]) =>
              prev.map((f: UploadingFile) => {
                if (f.id === uploadFile.id && f.progress < 90) {
                  return { ...f, progress: f.progress + 10 } as UploadingFile;
                }
                return f;
              })
            );
          }, 200);

          await FileService.writeFile(filePath, buffer);
          clearInterval(progressInterval);
          setUploadingFiles((prev: UploadingFile[]) =>
            prev.map((f: UploadingFile) =>
              f.id === uploadFile.id
                ? ({
                    ...f,
                    status: "completed",
                    progress: 100,
                  } as UploadingFile)
                : f
            )
          );
        } catch (error) {
          setUploadingFiles((prev: UploadingFile[]) =>
            prev.map((f: UploadingFile) =>
              f.id === uploadFile.id
                ? ({
                    ...f,
                    status: "error",
                    error:
                      error instanceof Error ? error.message : "Upload failed",
                  } as UploadingFile)
                : f
            )
          );
        }
      }

      onUploadComplete?.();
      setUploadingFiles([]);
      onOpenChange(false);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsProcessing(false);
    }
  }, [currentFolderPath, uploadingFiles, onUploadComplete, onOpenChange]);

  const removeFile = useCallback((fileId: string) => {
    setUploadingFiles((prev: UploadingFile[]) =>
      prev.filter((f: UploadingFile) => f.id !== fileId)
    );
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialogOverlay" />
        <Dialog.Content className="dialogContent">
          <Dialog.Title className="dialogTitle">
            <UploadIcon className="dialogIcon" />
            <span>Upload Files</span>
          </Dialog.Title>
          <Dialog.Description className="srOnly">
            Add files to upload them.
          </Dialog.Description>
          <Dialog.Close className="dialogClose" aria-label="Close dialog">
            <Cross2Icon />
          </Dialog.Close>

          <form onSubmit={(e) => e.preventDefault()}>
            <div className="formContainer">
              <div
                className={`dropZone ${isDragging ? "dropZoneActive" : ""}`}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const files: File[] = Array.from(e.dataTransfer.files);
                  if (files.length > 0) addFiles(files);
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
                <div className="dropZoneContent">
                  <UploadIcon className="dropZoneIcon" />
                  <p className="dropZoneText">Drag &amp; drop files here</p>
                  <p className="smallText">or</p>
                  <button
                    type="button"
                    className="softButton"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Add Files
                  </button>
                </div>
              </div>

              {uploadingFiles.length > 0 && (
                <div className="fileList">
                  {uploadingFiles.map((file: UploadingFile) => (
                    <div key={file.id} className="fileItem">
                      <p className="fileName">{file.file.name}</p>
                      <ProgressBar value={file.progress} />
                      <div className="fileFooter">
                        <p
                          className={
                            file.status === "error" ? "fileError" : "fileStatus"
                          }
                        >
                          {file.status === "error" ? file.error : file.status}
                        </p>
                        <div className="fileDetails">
                          <p className="smallText">
                            {(file.file.size / 1024 / 1024).toFixed(1)} MB
                          </p>
                          {file.status !== "uploading" && (
                            <button
                              type="button"
                              className="ghostButton"
                              onClick={() => removeFile(file.id)}
                            >
                              <TrashIcon />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="actionButtons">
                <button
                  type="button"
                  className="actionButton"
                  onClick={handleUpload}
                  disabled={
                    isProcessing ||
                    uploadingFiles.filter(
                      (f: UploadingFile) => f.status === "pending"
                    ).length === 0
                  }
                >
                  Upload
                </button>
                <button
                  type="button"
                  className="actionButton"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  Add More Files
                </button>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
