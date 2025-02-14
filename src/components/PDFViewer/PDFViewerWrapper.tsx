// File: src/components/PDFViewer/PDFViewerWrapper.tsx
import React, { useEffect, useState } from "react";
import { Box, Text } from "@radix-ui/themes";
import { PDFViewer } from "./PDFViewer";
import FileService from "../../services/fileService";

interface PDFViewerWrapperProps {
  filePath?: string;
  onClose?: () => void;
}

export const PDFViewerWrapper: React.FC<PDFViewerWrapperProps> = ({
  filePath,
}) => {
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPDF = async () => {
      if (!filePath) {
        setError("No file path provided");
        return;
      }

      try {
        const response = await FileService.readFile(filePath);
        setPdfData(response.content);
      } catch (err) {
        console.error("Failed to load PDF:", err);
        setError("Failed to load PDF file");
      }
    };

    loadPDF();
  }, [filePath]);

  if (!filePath) {
    return (
      <Box
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "var(--gray-1)",
        }}
      >
        <Text color="red" size="3">
          No file path provided
        </Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "var(--gray-1)",
        }}
      >
        <Text color="red" size="3">
          {error}
        </Text>
      </Box>
    );
  }

  if (!pdfData) {
    return (
      <Box
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "var(--gray-1)",
        }}
      >
        <Text size="3">Loading PDF...</Text>
      </Box>
    );
  }

  // At this point, we know filePath is defined
  return <PDFViewer filePath={filePath} />;
};

export default PDFViewerWrapper;
