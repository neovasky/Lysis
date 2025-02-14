import React, { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocumentProxy } from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";

// Configure the worker (ensure this path is correct)
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const PDFViewer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pdfPath, setPdfPath] = useState<string>(""); // Store PDF Path
  const scale = 1.5;

  const renderPage = useCallback(
    async (pageNumber: number) => {
      if (!pdfDoc || !canvasRef.current) return;
      try {
        const page = await pdfDoc.getPage(pageNumber);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (!canvas || !context) return;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
      } catch (error) {
        console.error("Error rendering page:", error);
      }
    },
    [pdfDoc]
  );

  useEffect(() => {
    const fetchPDFPath = async () => {
      try {
        const path = await window.electronAPI.getPDFPath(); // ✅ Ensure this is typed correctly
        setPdfPath(path);
      } catch (error) {
        console.error("Failed to load PDF path:", error);
      }
    };

    fetchPDFPath();
  }, []);

  useEffect(() => {
    if (!pdfPath) return;
    const loadPDF = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(pdfPath);
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        renderPage(1);
      } catch (error) {
        console.error("Error loading PDF:", error);
      }
    };
    loadPDF();
  }, [pdfPath, renderPage]);

  return (
    <div style={{ width: "100%", height: "100vh", background: "#525659" }}>
      <canvas ref={canvasRef} style={{ display: "block", margin: "auto" }} />
    </div>
  );
};
