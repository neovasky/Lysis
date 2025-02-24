import React, { useState } from "react";
import {
  FileText,
  MoreVertical,
  Table as TableIcon,
  File as FileIcon,
  Trash,
  Download,
  Pencil,
} from "lucide-react";
import { formatDistance } from "date-fns";
import { FileMetadata } from "../../store/slices/fileSlice";
import { Button } from "../ui/button";

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
        return <TableIcon className="w-6 h-6" />;
      case "word":
        return <FileIcon className="w-6 h-6" />;
      default:
        return <FileIcon className="w-6 h-6" />;
    }
  };

  // Handler to open a file.
  const handleFileOpen = (file: FileMetadata) => {
    onFileOpen?.(file);
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

  // Custom dropdown for file actions, using Button components.
  const FileActions = ({ file }: { file: FileMetadata }) => {
    const [open, setOpen] = useState(false);

    return (
      <div className="relative">
        {/* Icon button trigger */}
        <Button
          variant="icon"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
        >
          <MoreVertical className="w-4 h-4" />
        </Button>

        {open && (
          <div
            className="absolute right-0 mt-2 w-40 rounded shadow
                       bg-popover text-popover-foreground border border-border z-10"
          >
            {/* Open Action */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start px-4 py-2 text-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleFileOpen(file);
                setOpen(false);
              }}
            >
              <FileIcon className="w-4 h-4" />
              Open
            </Button>

            {/* Download Action */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start px-4 py-2 text-sm"
              onClick={(e) => {
                e.stopPropagation();
                console.log("Downloading", file.name);
                setOpen(false);
              }}
            >
              <Download className="w-4 h-4" />
              Download
            </Button>

            {/* Rename Action */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start px-4 py-2 text-sm"
              onClick={(e) => {
                e.stopPropagation();
                console.log("Renaming", file.name);
                setOpen(false);
              }}
            >
              <Pencil className="w-4 h-4" />
              Rename
            </Button>

            <div className="border-t border-border my-1" />

            {/* Delete Action */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start px-4 py-2 text-sm text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleFileDelete(file);
                setOpen(false);
              }}
            >
              <Trash className="w-4 h-4" />
              Delete
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {files.map((file) => (
        <Button
          key={file.id}
          variant="solid"
          className="p-4 w-full text-left flex flex-col items-start hover:shadow-lg transition"
          onClick={() => handleFileOpen(file)}
        >
          {/* Preview Section */}
          <div className="h-36 rounded flex items-center justify-center mb-3">
            {getFileIcon(file.type)}
          </div>

          {/* File Info Section */}
          <div className="flex flex-col gap-1 w-full">
            <div className="flex justify-between items-center w-full">
              <p className="font-medium text-sm flex-1 truncate">{file.name}</p>
              <div onClick={(e) => e.stopPropagation()}>
                <FileActions file={file} />
              </div>
            </div>
            <p className="text-xs">
              {formatDistance(file.lastModified, new Date(), {
                addSuffix: true,
              })}
            </p>
          </div>
        </Button>
      ))}
    </div>
  );
};

export default FilesGrid;
