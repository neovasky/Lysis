import React, { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocumentProxy } from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";

// Configure the worker (ensure this path is correct)
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  url: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ url }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const scale = 1.5; // constant scale value

  const renderPage = useCallback(
    async (pageNumber: number) => {
      if (!pdfDoc || !canvasRef.current) return;
      try {
        const page = await pdfDoc.getPage(pageNumber);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context!, viewport }).promise;
      } catch (error) {
        console.error("Error rendering page:", error);
      }
    },
    [pdfDoc]
  );

  useEffect(() => {
    const loadPDF = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        renderPage(1);
      } catch (error) {
        console.error("Error loading PDF:", error);
      }
    };
    loadPDF();
  }, [url, renderPage]);

  return (
    <div style={{ width: "100%", height: "100vh", background: "#525659" }}>
      <canvas ref={canvasRef} style={{ display: "block", margin: "auto" }} />
    </div>
  );
};
