// File: src/components/PDFViewer/PDFViewerWithAnnotations.tsx
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  MouseEvent,
} from "react";
import * as pdfjsLib from "pdfjs-dist";
// Use the local worker from the public folder.
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
import { PDFDocumentProxy } from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";

// Helper type for storing highlights
interface Highlight {
  id: string;
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  comment?: string; // optional note
}

interface PDFViewerWithAnnotationsProps {
  /** The raw PDF data as a typed array. */
  pdfData: Uint8Array;
}

/**
 * A PDF viewer component that supports click-to-annotate "sticky notes."
 * It loads PDF data from a typed array (pdfData) rather than a file path.
 */
export const PDFViewerWithAnnotations: React.FC<
  PDFViewerWithAnnotationsProps
> = ({ pdfData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const annotationLayerRef = useRef<HTMLDivElement>(null);

  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For demonstration, store highlights in local state.
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  // A scale factor for PDF rendering
  const [scale, setScale] = useState(1.5);

  // --------------------------
  // LOAD THE PDF FROM pdfData
  // --------------------------
  useEffect(() => {
    if (!pdfData) return;
    setIsLoading(true);
    setError(null);

    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
    loadingTask.promise
      .then((pdf: PDFDocumentProxy) => {
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setCurrentPage(1);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error loading PDF:", err);
        setError("Failed to load PDF");
        setIsLoading(false);
      });
  }, [pdfData]);

  // --------------------------
  // RENDER PAGE
  // --------------------------
  const renderPage = useCallback(
    async (pageNumber: number, scaleValue: number) => {
      if (!pdfDoc || !canvasRef.current) return;
      try {
        setIsLoading(true);
        const page = await pdfDoc.getPage(pageNumber);
        const viewport = page.getViewport({ scale: scaleValue });

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!canvas || !context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render the PDF page into <canvas>
        await page.render({ canvasContext: context, viewport }).promise;

        setIsLoading(false);
      } catch (err) {
        console.error("Error rendering page:", err);
        setError("Failed to render page");
        setIsLoading(false);
      }
    },
    [pdfDoc]
  );

  useEffect(() => {
    if (pdfDoc) {
      renderPage(currentPage, scale);
    }
  }, [pdfDoc, currentPage, scale, renderPage]);

  // --------------------------
  // ANNOTATION LOGIC
  // --------------------------
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleCanvasClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const boundingRect = annotationLayerRef.current?.getBoundingClientRect();
    if (!boundingRect) return;

    const clickX = e.clientX - boundingRect.left;
    const clickY = e.clientY - boundingRect.top;

    // Create a small sticky note highlight
    const highlightWidth = 100;
    const highlightHeight = 60;

    const newHighlight: Highlight = {
      id: generateId(),
      pageNumber: currentPage,
      x: clickX,
      y: clickY,
      width: highlightWidth,
      height: highlightHeight,
      color: "rgba(255, 255, 0, 0.3)",
    };

    setHighlights((prev) => [...prev, newHighlight]);
  };

  const handleAddComment = (highlightId: string) => {
    const comment = prompt("Enter a note for this highlight:");
    if (comment) {
      setHighlights((prev) =>
        prev.map((h) => (h.id === highlightId ? { ...h, comment } : h))
      );
    }
  };

  const currentPageHighlights = highlights.filter(
    (h) => h.pageNumber === currentPage
  );

  // --------------------------
  // RENDER
  // --------------------------
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "8px",
          background: "#f2f2f2",
        }}
      >
        <button
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage <= 1}
        >
          Prev
        </button>
        <span style={{ margin: "0 12px" }}>
          Page {currentPage} of {numPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(numPages, prev + 1))}
          disabled={currentPage >= numPages}
        >
          Next
        </button>

        <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
          <button onClick={() => setScale((prev) => prev - 0.25)}>-</button>
          <span>Zoom: {scale.toFixed(2)}</span>
          <button onClick={() => setScale((prev) => prev + 0.25)}>+</button>
        </div>
      </div>

      {/* PDF Canvas + Annotation Layer */}
      <div
        style={{
          position: "relative",
          flex: 1,
          overflow: "auto",
          background: "#ccc",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            margin: "0 auto",
            background: "#fff",
          }}
        />

        {/* Annotation overlay */}
        <div
          ref={annotationLayerRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            margin: "0 auto",
            pointerEvents: "auto",
          }}
          onClick={handleCanvasClick}
        >
          {currentPageHighlights.map((hl) => (
            <div
              key={hl.id}
              style={{
                position: "absolute",
                left: hl.x,
                top: hl.y,
                width: hl.width,
                height: hl.height,
                backgroundColor: hl.color,
                cursor: "pointer",
                border: "1px solid #999",
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleAddComment(hl.id);
              }}
              title={hl.comment || "Click to add note"}
            >
              {hl.comment && (
                <div
                  style={{
                    position: "absolute",
                    top: hl.height + 2,
                    left: 0,
                    backgroundColor: "#fffacd",
                    padding: "4px",
                    border: "1px solid #ccc",
                    fontSize: "0.8em",
                    zIndex: 999,
                  }}
                >
                  {hl.comment}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {isLoading && !error && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#eee",
            padding: "16px",
            borderRadius: "8px",
          }}
        >
          Loading PDF...
        </div>
      )}
      {error && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#fdd",
            padding: "16px",
            borderRadius: "8px",
          }}
        >
          <strong style={{ color: "red" }}>{error}</strong>
        </div>
      )}
    </div>
  );
};

export default PDFViewerWithAnnotations;
