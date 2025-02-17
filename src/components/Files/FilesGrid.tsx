import React, { useState } from "react";
import {
  FileText,
  MoreVertical,
  Table,
  File,
  Trash,
  Download,
  Pencil,
} from "lucide-react";
import { formatDistance } from "date-fns";
import { FileMetadata } from "../../store/slices/fileSlice";

export interface FilesGridProps {
  files: FileMetadata[];
  onFileOpen?: (file: FileMetadata) => void;
  onDelete?: (folderPath: string) => Promise<void>;
}

const FilesGrid: React.FC<FilesGridProps> = ({
  files,
  onFileOpen,
  onDelete,
}) => {
  // Return a file icon based on the file type.
  const getFileIcon = (type: FileMetadata["type"]) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-6 h-6" />;
      case "excel":
        return <Table className="w-6 h-6" />;
      case "word":
        return <File className="w-6 h-6" />;
      default:
        return <File className="w-6 h-6" />;
    }
  };

  // Handler to open a file.
  const handleFileOpen = (file: FileMetadata) => {
    if (onFileOpen) {
      onFileOpen(file);
    }
  };

  // Handler to delete a file or folder.
  const handleFileDelete = async (file: FileMetadata) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${file.name}?`
    );
    if (confirmed && onDelete) {
      await onDelete(file.path);
    }
  };

  // Minimal custom dropdown for file actions.
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
                handleFileDelete(file);
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
    <div className="grid grid-cols-4 gap-4 p-4">
      {files.map((file) => (
        <div
          key={file.id}
          className="bg-white rounded shadow p-4 cursor-pointer hover:shadow-lg"
          onClick={() => handleFileOpen(file)}
        >
          {/* Preview Section */}
          <div className="h-36 bg-gray-200 rounded flex items-center justify-center mb-3">
            {getFileIcon(file.type)}
          </div>
          {/* File Info Section */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <p className="font-bold text-sm flex-1">{file.name}</p>
              <div onClick={(e) => e.stopPropagation()}>
                <FileActions file={file} />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {formatDistance(file.lastModified, new Date(), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FilesGrid;
