import React, { useState, useCallback } from "react";
import {
  FileText,
  Table,
  File,
  Trash,
  Download,
  Pencil,
  MoreVertical,
} from "lucide-react";
import { formatDistance } from "date-fns";
import { FileMetadata } from "../../store/slices/fileSlice";
import { useFiles } from "./hooks/useFiles";

export interface FilesListProps {
  files: FileMetadata[];
  onFileOpen?: (file: FileMetadata) => void;
  onDelete?: (folderPath: string) => Promise<void>;
}

const FilesList: React.FC<FilesListProps> = ({
  files,
  onFileOpen,
  onDelete,
}) => {
  const { deleteFile } = useFiles();

  // Return file icon based on type
  const getFileIcon = (type: FileMetadata["type"]) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-4 h-4" />;
      case "excel":
        return <Table className="w-4 h-4" />;
      case "word":
        return <File className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  // Handle file deletion
  const handleDelete = useCallback(
    async (file: FileMetadata) => {
      const confirmed = window.confirm(
        `Are you sure you want to delete ${file.name}?`
      );
      if (confirmed) {
        if (onDelete) {
          await onDelete(file.path);
        } else {
          await deleteFile(file.id, file.path);
        }
      }
    },
    [deleteFile, onDelete]
  );

  const handleFileOpen = useCallback(
    (file: FileMetadata) => {
      if (onFileOpen) {
        onFileOpen(file);
      }
    },
    [onFileOpen]
  );

  // Custom dropdown for file actions
  const FileActions = ({ file }: { file: FileMetadata }) => {
    const [open, setOpen] = useState(false);
    return (
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
          className="p-1 rounded hover:bg-gray-100"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleFileOpen(file);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm"
            >
              <File className="w-4 h-4" />
              Open
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log("Downloading", file.name);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log("Renaming", file.name);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm"
            >
              <Pencil className="w-4 h-4" />
              Rename
            </button>
            <div className="border-t border-gray-200"></div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(file);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm text-red-600"
            >
              <Trash className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <table className="min-w-full border-collapse">
      <thead>
        <tr className="bg-gray-100">
          <th className="border px-4 py-2 text-left text-sm font-bold">Name</th>
          <th className="border px-4 py-2 text-left text-sm font-bold">
            Modified
          </th>
          <th className="border px-4 py-2 text-left text-sm font-bold">Type</th>
          <th className="border px-4 py-2 text-left text-sm font-bold">Size</th>
          <th className="border px-4 py-2 text-left text-sm font-bold">Tags</th>
          <th className="border px-4 py-2"></th>
        </tr>
      </thead>
      <tbody>
        {files.length === 0 ? (
          <tr>
            <td colSpan={6} className="border px-4 py-2">
              <div className="p-4">
                <p className="text-center text-sm text-gray-600">
                  No files found
                </p>
              </div>
            </td>
          </tr>
        ) : (
          files.map((file) => (
            <tr
              key={file.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => handleFileOpen(file)}
            >
              <td className="border px-4 py-2">
                <div className="flex items-center gap-2">
                  {getFileIcon(file.type)}
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
              </td>
              <td className="border px-4 py-2">
                <span className="text-xs text-gray-500">
                  {formatDistance(file.lastModified, new Date(), {
                    addSuffix: true,
                  })}
                </span>
              </td>
              <td className="border px-4 py-2">
                <span className="text-xs uppercase">{file.type}</span>
              </td>
              <td className="border px-4 py-2">
                <span className="text-xs text-gray-500">
                  {/* Size formatting here */}
                </span>
              </td>
              <td className="border px-4 py-2">
                <div className="flex flex-wrap gap-1">
                  {file.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-200 text-xs px-2 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </td>
              <td
                className="border px-4 py-2"
                onClick={(e) => e.stopPropagation()}
              >
                <FileActions file={file} />
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default FilesList;
