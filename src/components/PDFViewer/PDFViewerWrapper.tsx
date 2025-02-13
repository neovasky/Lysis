// File: src/components/PDFViewer/PDFViewerWrapper.tsx
import React from "react";
import { PDFViewer } from "./PDFViewer";

export const PDFViewerWrapper: React.FC = () => {
  // Retrieve the PDF data URL stored in localStorage (set by FilesPage.tsx)
  const pdfDataUrl = localStorage.getItem("pdfDataUrl");

  if (!pdfDataUrl) {
    return <div>No PDF data available.</div>;
  }

  return <PDFViewer url={pdfDataUrl} />;
};
