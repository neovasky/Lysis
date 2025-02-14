// File: src/components/PDFViewer/SimplePDFViewer.tsx
import React from "react";
import { Box } from "@radix-ui/themes";

interface SimplePDFViewerProps {
  url: string;
}

export const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({ url }) => {
  return (
    <Box
      style={{
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        background: "var(--gray-1)",
      }}
    >
      <embed
        src={url}
        type="application/pdf"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
      />
    </Box>
  );
};

export default SimplePDFViewer;
