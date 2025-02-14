import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon, FileIcon } from "@radix-ui/react-icons";
import "./dialogStyles.css";

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (name: string) => Promise<void>;
  isLoading?: boolean;
  currentPath?: string | null;
}

export const CreateFolderDialog = ({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  currentPath,
}: CreateFolderDialogProps) => {
  const [folderName, setFolderName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const invalidCharsPattern = '[<>:"/\\\\|?*\\u0000-\\u001F]';
  const invalidChars = new RegExp(invalidCharsPattern, "u");

  const validateFolderName = (name: string): string | null => {
    if (!name.trim()) return "Please enter a folder name";
    if (invalidChars.test(name))
      return "Folder name contains invalid characters";
    if (name.length > 255) return "Folder name is too long";
    if (name.startsWith(" ") || name.endsWith(" ") || name.endsWith(".")) {
      return "Folder name cannot start or end with spaces or end with periods";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateFolderName(folderName);
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      setError(null);
      await onConfirm(folderName.trim());
      setFolderName("");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create folder");
    }
  };

  console.log("Rendering CreateFolderDialog");

  // Extract the last folder name from currentPath
  const folderLocation = (() => {
    if (!currentPath) return "Unknown";
    const parts = currentPath.split("/");
    const lastPart = parts[parts.length - 1] || currentPath;
    return lastPart || "Unknown";
  })();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialogOverlay" />
        {/* Additional class for narrower styling + more padding */}
        <Dialog.Content className="dialogContent createFolderDialog">
          <Dialog.Title className="dialogTitle">
            <FileIcon className="dialogIcon" />
            <span>Create New Folder</span>
          </Dialog.Title>
          <Dialog.Description className="srOnly">
            Specify a name for the new folder.
          </Dialog.Description>
          <Dialog.Close className="dialogClose" aria-label="Close dialog">
            <Cross2Icon />
          </Dialog.Close>

          <form onSubmit={handleSubmit}>
            <div className="formContainer">
              <p className="locationText">Location: {folderLocation}</p>

              <label htmlFor="folderNameInput" className="formLabel">
                Folder Name
              </label>
              <input
                id="folderNameInput"
                className="formInput"
                placeholder="Enter folder name"
                value={folderName}
                onChange={(e) => {
                  setFolderName(e.target.value);
                  setError(null);
                }}
                disabled={isLoading}
                autoFocus
              />
              {error && <p className="errorText">{error}</p>}

              <div className="actionButtons">
                <button
                  type="submit"
                  className="actionButton"
                  disabled={isLoading || !folderName.trim()}
                >
                  {isLoading ? "Creating..." : "Create Folder"}
                </button>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
