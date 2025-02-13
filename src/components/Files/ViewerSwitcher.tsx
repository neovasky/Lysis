// File: src/components/Files/ViewerSwitcher.tsx

import React, { useEffect, useState } from "react";
import { FileMetadata } from "../../store/slices/fileSlice";
import { PDFViewer } from "../PDFViewer/PDFViewer";
import { SimplePDFViewer } from "../PDFViewer/SimplePDFViewer";
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

  useEffect(() => {
    // Clear any previous errors when file changes
    setViewerError(null);
  }, [file]);

  const handleOpenInSystemApp = async () => {
    try {
      // If FileService provides an openFile method, use it.
      if (typeof FileService.openFile === "function") {
        await FileService.openFile(file.path);
      } else {
        throw new Error("Open in system app not implemented");
      }
    } catch (error) {
      setViewerError("Failed to open file in system application");
    }
  };

  const renderViewer = () => {
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    switch (fileExtension) {
      case "pdf":
        try {
          return (
            <div
              style={{
                width: "100%",
                height: "100vh",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  zIndex: 1000,
                  background: "#1e1e1e",
                  padding: "8px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                onClick={handleOpenInSystemApp}
              >
                Open in System Viewer
              </div>
              <PDFViewer url={content} />
            </div>
          );
        } catch (pdfError) {
          console.warn(
            "PDFViewer failed, falling back to simple viewer:",
            pdfError
          );
          return <SimplePDFViewer url={content} />;
        }

      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
        return (
          <div
            style={{
              width: "100%",
              height: "100vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: "#525659",
              position: "relative",
            }}
          >
            <img
              src={content}
              alt={file.name}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "#1e1e1e",
                padding: "8px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              onClick={handleOpenInSystemApp}
            >
              Open in System Viewer
            </div>
          </div>
        );

      case "txt":
      case "md":
        return (
          <div
            style={{
              width: "100%",
              height: "100vh",
              padding: "20px",
              background: "#525659",
              color: "#fff",
              fontFamily: "monospace",
              whiteSpace: "pre-wrap",
              overflow: "auto",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "#1e1e1e",
                padding: "8px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              onClick={handleOpenInSystemApp}
            >
              Open in System Viewer
            </div>
            {content}
          </div>
        );

      default:
        return (
          <div
            style={{
              width: "100%",
              height: "100vh",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              background: "#525659",
              color: "#fff",
              padding: "20px",
              textAlign: "center",
              gap: "20px",
            }}
          >
            <p>No preview available for this file type ({fileExtension})</p>
            <button
              onClick={handleOpenInSystemApp}
              style={{
                padding: "10px 20px",
                background: "#1e1e1e",
                border: "none",
                borderRadius: "4px",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Open in System Application
            </button>
          </div>
        );
    }
  };

  return (
    <div style={{ width: "100%", height: "100vh", overflow: "hidden" }}>
      {viewerError ? (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background: "#525659",
            color: "#fff",
            padding: "20px",
            textAlign: "center",
            gap: "20px",
          }}
        >
          <p>Error: {viewerError}</p>
          <button
            onClick={handleOpenInSystemApp}
            style={{
              padding: "10px 20px",
              background: "#1e1e1e",
              border: "none",
              borderRadius: "4px",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Open in System Application
          </button>
        </div>
      ) : (
        renderViewer()
      )}
    </div>
  );
};

export default ViewerSwitcher;
