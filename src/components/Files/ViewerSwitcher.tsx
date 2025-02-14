// File: src/components/Files/ViewerSwitcher.tsx
import React, { useEffect, useState } from "react";
import { FileMetadata } from "../../store/slices/fileSlice";
import ContinuousPDFViewerWithSidebar from "../PDFViewer/ContinuousPDFViewerWithSidebar";
import { Box, Button, Text, Flex } from "@radix-ui/themes";
import {
  ZoomInIcon,
  ZoomOutIcon,
  DownloadIcon,
  ExternalLinkIcon,
} from "@radix-ui/react-icons";
import FileService from "../../services/fileService";

// Helper function to convert base64 to Uint8Array
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
  content: string; // Data URL for images/text or PDFs (with "data:" prefix)
}

const ViewerSwitcher: React.FC<ViewerSwitcherProps> = ({ file, content }) => {
  const [viewerError, setViewerError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);

  useEffect(() => {
    setViewerError(null);
    setPdfData(null);
    // Only process PDF if the filename ends with .pdf
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
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    switch (fileExtension) {
      case "pdf":
        if (!pdfData && !viewerError) {
          return (
            <Box
              style={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#333",
              }}
            >
              <Text color="gray" size="3">
                Loading PDF data...
              </Text>
            </Box>
          );
        }
        if (viewerError) {
          return (
            <Box
              style={{ width: "100vw", height: "100vh", overflow: "hidden" }}
            >
              <Text color="red">{viewerError}</Text>
            </Box>
          );
        }
        return (
          <Box style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
            <ContinuousPDFViewerWithSidebar pdfData={pdfData as Uint8Array} />
          </Box>
        );
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
        return (
          <Box
            style={{
              width: "100vw",
              height: "100vh",
              overflow: "auto",
              background: "#525659",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src={content}
              alt={file.name}
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "center",
                transition: "transform 0.2s ease",
              }}
            />
          </Box>
        );
      case "txt":
      case "md":
        return (
          <Box
            style={{
              width: "100vw",
              height: "100vh",
              padding: "40px",
              background: "#525659",
              color: "#fff",
              fontFamily: "monospace",
              whiteSpace: "pre-wrap",
              overflow: "auto",
            }}
          >
            {content}
          </Box>
        );
      default:
        return (
          <Flex
            direction="column"
            align="center"
            justify="center"
            style={{
              width: "100vw",
              height: "100vh",
              background: "#525659",
              color: "#fff",
              padding: "20px",
              textAlign: "center",
              gap: "20px",
            }}
          >
            <Text size="5">
              No preview available for this file type ({fileExtension})
            </Text>
            <Button size="3" onClick={handleOpenInSystemApp}>
              <ExternalLinkIcon />
              Open in System Application
            </Button>
          </Flex>
        );
    }
  };

  const controls = (
    <Flex
      gap="2"
      style={{
        position: "fixed",
        top: "16px",
        right: "16px",
        zIndex: 1000,
        background: "var(--gray-2)",
        padding: "8px",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <Button size="2" variant="soft" onClick={handleZoomOut}>
        <ZoomOutIcon />
      </Button>
      <Button size="2" variant="soft" onClick={handleZoomIn}>
        <ZoomInIcon />
      </Button>
      <Button size="2" variant="soft" onClick={handleDownload}>
        <DownloadIcon />
      </Button>
      <Button size="2" variant="soft" onClick={handleOpenInSystemApp}>
        <ExternalLinkIcon />
      </Button>
    </Flex>
  );

  return (
    <Box style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      {controls}
      {renderViewer()}
    </Box>
  );
};

export default ViewerSwitcher;
