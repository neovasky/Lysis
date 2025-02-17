import React, { useState, useEffect } from "react";
import { FileMetadata } from "../../store/slices/fileSlice";
import ViewerSwitcher from "./ViewerSwitcher";
import FileService from "../../services/fileService";

export const FileViewer: React.FC<{ file: FileMetadata }> = ({ file }) => {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFileContent = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await FileService.readFile(file.path);
        const blob = new Blob([response.content], {
          type: getContentType(file.name),
        });
        const reader = new FileReader();
        reader.onloadend = () => {
          setContent(reader.result as string);
          setLoading(false);
        };
        reader.onerror = () => {
          setError("Failed to read file content");
          setLoading(false);
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error("Error loading file:", err);
        setError(err instanceof Error ? err.message : "Failed to load file");
        setLoading(false);
      }
    };

    loadFileContent();
  }, [file]);

  const getContentType = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return "application/pdf";
      case "png":
        return "image/png";
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "gif":
        return "image/gif";
      case "txt":
        return "text/plain";
      default:
        return "application/octet-stream";
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-[#525659] text-white">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-[#525659] text-white p-5 text-center">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-[#525659] text-white p-5 text-center">
        <p>No content available</p>
      </div>
    );
  }

  return <ViewerSwitcher file={file} content={content} />;
};

export default FileViewer;
