import { useEffect, useState } from "react";
import { ZoomIn, ZoomOut, Download, ExternalLink } from "lucide-react";
import PDFViewer from "../PDFViewer/PDFViewer";
import { FileMetadata } from "../../store/slices/fileSlice";
import FileService from "../../services/fileService";
import { Button } from "@/components/ui/button";

// Helper function to convert base64 string to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    arr[i] = raw.charCodeAt(i);
  }
  return arr;
}

interface ViewerSwitcherProps {
  file: FileMetadata;
  content: string; // Data URL (e.g. "data:application/pdf;base64,...")
  onClose: () => void;
}

const ViewerSwitcher: React.FC<ViewerSwitcherProps> = ({
  file,
  content,
  onClose,
}) => {
  const [viewerError, setViewerError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);

  useEffect(() => {
    setViewerError(null);
    setPdfData(null);
    if (file.name.toLowerCase().endsWith(".pdf")) {
      try {
        const parts = content.split(",");
        const base64 = parts.length > 1 ? parts[1] : parts[0];
        setPdfData(base64ToUint8Array(base64));
      } catch (err) {
        console.error("Error converting PDF content:", err);
        setViewerError("Failed to load PDF data");
      }
    }
  }, [file, content]);

  const handleOpenInSystemApp = async () => {
    try {
      if (typeof FileService.openFile === "function") {
        await FileService.openFile(file.path);
      } else {
        throw new Error("Not implemented");
      }
    } catch (error) {
      setViewerError("Failed to open file in system application");
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = content;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderViewer = () => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        if (!pdfData && !viewerError) {
          return (
            <div className="w-full h-screen flex items-center justify-center bg-gray-800">
              <p className="text-gray-300 text-lg">Loading PDF data...</p>
            </div>
          );
        }
        if (viewerError) {
          return (
            <div className="w-full h-screen overflow-hidden">
              <p className="text-red-500">{viewerError}</p>
            </div>
          );
        }
        return (
          <div className="w-full h-screen overflow-hidden">
            <PDFViewer pdfData={pdfData as Uint8Array} onClose={onClose} />
          </div>
        );
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
        return (
          <div className="w-full h-screen flex items-center justify-center bg-gray-800">
            <img
              src={content}
              alt={file.name}
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "center",
                transition: "transform 0.2s ease",
              }}
            />
          </div>
        );
      case "txt":
      case "md":
        return (
          <div className="w-full h-screen p-10 bg-gray-800 text-white font-mono whitespace-pre-wrap overflow-auto">
            {content}
          </div>
        );
      default:
        return (
          <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-800 text-white p-5 text-center gap-5">
            <p className="text-xl">
              No preview available for this file type ({ext})
            </p>
            <Button
              variant="default"
              onClick={handleOpenInSystemApp}
              className="flex items-center gap-2"
            >
              <ExternalLink size={20} />
              Open in System Application
            </Button>
          </div>
        );
    }
  };

  const controls = (
    <div className="fixed top-4 right-4 z-50 bg-gray-200 p-2 rounded shadow flex gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleZoomOut}
        className="p-2 bg-white rounded hover:bg-gray-100"
      >
        <ZoomOut size={16} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleZoomIn}
        className="p-2 bg-white rounded hover:bg-gray-100"
      >
        <ZoomIn size={16} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDownload}
        className="p-2 bg-white rounded hover:bg-gray-100"
      >
        <Download size={16} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleOpenInSystemApp}
        className="p-2 bg-white rounded hover:bg-gray-100"
      >
        <ExternalLink size={16} />
      </Button>
    </div>
  );

  return (
    <div className="w-full h-screen overflow-hidden relative">
      {controls}
      {renderViewer()}
    </div>
  );
};

export default ViewerSwitcher;
