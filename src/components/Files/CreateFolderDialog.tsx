import React, { useState } from "react";
import { File, X } from "lucide-react";
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

  // Disable ESLint rule for this regex because it intentionally matches control characters
  // eslint-disable-next-line no-control-regex
  const invalidChars = /[<>:"/\\|?*\u0000-\u001F]/u;

  const validateFolderName = (name: string): string | null => {
    if (!name.trim()) return "Please enter a folder name";
    if (invalidChars.test(name))
      return "Folder name contains invalid characters";
    if (name.length > 255) return "Folder name is too long";
    if (name.startsWith(" ") || name.endsWith(" ") || name.endsWith("."))
      return "Folder name cannot start or end with spaces or end with periods";
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

  // Extract the last folder name from currentPath
  const folderLocation = currentPath
    ? currentPath.split("/").pop() || currentPath
    : "Unknown";

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={() => onOpenChange(false)}
      ></div>
      {/* Modal Content */}
      <div className="relative bg-white rounded shadow p-6 w-96">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <File className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold">Create New Folder</h2>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-600 hover:text-gray-800"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <p className="text-sm text-gray-700 mb-2">
            Location: {folderLocation}
          </p>
          <label
            htmlFor="folderNameInput"
            className="block text-sm font-medium text-gray-700"
          >
            Folder Name
          </label>
          <input
            id="folderNameInput"
            type="text"
            placeholder="Enter folder name"
            value={folderName}
            onChange={(e) => {
              setFolderName(e.target.value);
              setError(null);
            }}
            disabled={isLoading}
            autoFocus
            className="mt-1 block w-full p-2 border border-gray-300 rounded"
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !folderName.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Create Folder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
