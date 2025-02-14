// File: src/components/Files/ViewerSwitcher.tsx
import React, { useEffect, useState } from "react";
import { FileMetadata } from "../../store/slices/fileSlice";
import { PDFViewer } from "../PDFViewer/PDFViewer";
import { SimplePDFViewer } from "../PDFViewer/SimplePDFViewer";
import { Box, Button, Text, Flex } from "@radix-ui/themes";
import {
  ZoomInIcon,
  ZoomOutIcon,
  DownloadIcon,
  ExternalLinkIcon,
} from "@radix-ui/react-icons";
import FileService from "../../services/fileService";

interface ViewerSwitcherProps {
  file: FileMetadata;
  content: string;
}

export const ViewerSwitcher: React.FC<ViewerSwitcherProps> = ({
  file,
  content,
}) => {
  const [viewerError, setViewerError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setViewerError(null);
  }, [file]);

  const handleOpenInSystemApp = async () => {
    try {
      if (typeof FileService.openFile === "function") {
        await FileService.openFile(file.path);
      } else {
        throw new Error("Open in system app not implemented");
      }
    } catch (error) {
      setViewerError("Failed to open file in system application");
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

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

    const ViewerControls = () => (
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

    switch (fileExtension) {
      case "pdf":
        try {
          return (
            <Box
              style={{ width: "100vw", height: "100vh", overflow: "hidden" }}
            >
              <ViewerControls />
              <PDFViewer filePath={file.path} />
            </Box>
          );
        } catch (pdfError) {
          console.warn(
            "PDFViewer failed, falling back to simple viewer:",
            pdfError
          );
          return (
            <Box
              style={{ width: "100vw", height: "100vh", overflow: "hidden" }}
            >
              <ViewerControls />
              <SimplePDFViewer url={content} />
            </Box>
          );
        }

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
            <ViewerControls />
            <img
              src={content}
              alt={file.name}
              style={{
                maxWidth: "none",
                maxHeight: "none",
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
            <ViewerControls />
            <Box
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
                padding: "20px",
                background: "var(--gray-2)",
                borderRadius: "8px",
              }}
            >
              {content}
            </Box>
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

  return (
    <Box style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      {viewerError ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          style={{
            width: "100%",
            height: "100%",
            background: "#525659",
            color: "#fff",
            padding: "20px",
            textAlign: "center",
            gap: "20px",
          }}
        >
          <Text color="red" size="5">
            Error: {viewerError}
          </Text>
          <Button size="3" onClick={handleOpenInSystemApp}>
            <ExternalLinkIcon />
            Open in System Application
          </Button>
        </Flex>
      ) : (
        renderViewer()
      )}
    </Box>
  );
};

export default ViewerSwitcher;
