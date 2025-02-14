// File: src/components/PDFViewer/ContinuousPDFViewerWithSidebar.tsx

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import {
  PDFDocumentProxy,
  PDFPageProxy,
  TextContent as PdfTextContent,
} from "pdfjs-dist/types/src/display/api";
import "pdfjs-dist/web/pdf_viewer.css";

// Make sure pdf.worker.min.mjs is in your public folder.
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

/** Types **/
interface Highlight {
  id: string;
  pageNumber: number; // 1-based
  text: string; // the selected text snippet
  rects: { x: number; y: number; width: number; height: number }[];
  color: string;
  comment?: string;
}

interface StickyNote {
  id: string;
  pageNumber: number; // 1-based
  x: number;
  y: number;
  comment: string;
}

type AnnotationTool = "highlight" | "sticky";

interface PageInfo {
  pageIndex: number; // 0-based
  scale: number;
}

type TextContent = PdfTextContent;

interface RenderTextLayerParams {
  textContent: TextContent;
  container: HTMLDivElement;
  viewport: pdfjsLib.PageViewport;
  textDivs: HTMLDivElement[];
  enhanceTextSelection?: boolean;
}

interface PdfjsTextLayer {
  renderTextLayer(params: RenderTextLayerParams): Promise<void>;
}

interface ContinuousPDFViewerWithSidebarProps {
  /** The raw PDF data as a typed array. */
  pdfData: Uint8Array;
  /** Optional callback for a "Close" button in the top bar. */
  onClose?: () => void;
}

/** ContinuousPDFViewerWithSidebar:
 * Renders a continuous (scrollable) PDF with annotation support (highlight & sticky notes),
 * a left sidebar with thumbnails, and a top toolbar for tool selection.
 */
export const ContinuousPDFViewerWithSidebar: React.FC<
  ContinuousPDFViewerWithSidebarProps
> = ({ pdfData, onClose }) => {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [tool, setTool] = useState<AnnotationTool>("highlight");
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Main container for full-size pages and sidebar container for thumbnails
  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // ----------------------------------------------------------------
  // Load PDF from pdfData
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!pdfData) return;
    setIsLoading(true);
    setError(null);

    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
    loadingTask.promise
      .then((pdf: PDFDocumentProxy) => {
        setPdfDoc(pdf);
        const initialPages = Array.from({ length: pdf.numPages }, (_, i) => ({
          pageIndex: i,
          scale: 1.2,
        }));
        setPages(initialPages);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        console.error("Error loading PDF:", err);
        // Remove or comment out the following line to prevent the popup:
        // setError("Failed to load PDF");
        setIsLoading(false);
      });
  }, [pdfData]);

  // ----------------------------------------------------------------
  // Helper: Render the text layer for a page
  // ----------------------------------------------------------------
  const renderTextLayer = async (
    page: PDFPageProxy,
    viewport: pdfjsLib.PageViewport,
    container: HTMLDivElement
  ) => {
    const textContent: TextContent = await page.getTextContent();
    container.innerHTML = "";
    // Cast pdfjsLib to our PdfjsTextLayer interface
    const pdfjsWithTextLayer = pdfjsLib as unknown as PdfjsTextLayer;
    return pdfjsWithTextLayer.renderTextLayer({
      textContent,
      container,
      viewport,
      textDivs: [],
      enhanceTextSelection: true,
    });
  };

  // ----------------------------------------------------------------
  // Render a single page (canvas + text layer)
  // ----------------------------------------------------------------
  const renderPage = useCallback(
    async (pageContainer: HTMLDivElement, pageIndex: number, scale: number) => {
      if (!pdfDoc) return;
      try {
        const page: PDFPageProxy = await pdfDoc.getPage(pageIndex + 1);
        const viewport = page.getViewport({ scale });
        let canvas = pageContainer.querySelector(
          "canvas"
        ) as HTMLCanvasElement | null;
        if (!canvas) {
          canvas = document.createElement("canvas");
          pageContainer.appendChild(canvas);
        }
        const context = canvas.getContext("2d");
        if (!canvas || !context) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: context, viewport }).promise;

        let textLayerDiv = pageContainer.querySelector(
          ".textLayer"
        ) as HTMLDivElement | null;
        if (!textLayerDiv) {
          textLayerDiv = document.createElement("div");
          textLayerDiv.className = "textLayer";
          textLayerDiv.style.position = "absolute";
          textLayerDiv.style.top = "0";
          textLayerDiv.style.left = "0";
          textLayerDiv.style.pointerEvents = "auto";
          pageContainer.appendChild(textLayerDiv);
        }
        textLayerDiv.style.width = `${viewport.width}px`;
        textLayerDiv.style.height = `${viewport.height}px`;
        await renderTextLayer(page, viewport, textLayerDiv);
      } catch (err: unknown) {
        console.error(`Error rendering page ${pageIndex + 1}:`, err);
      }
    },
    [pdfDoc]
  );

  // ----------------------------------------------------------------
  // Render all pages continuously in the main container
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!pdfDoc || !containerRef.current) return;
    const container = containerRef.current;
    container.innerHTML = "";
    pages.forEach((pageInfo) => {
      const pageDiv = document.createElement("div");
      pageDiv.style.position = "relative";
      pageDiv.style.margin = "20px auto";
      pageDiv.style.border = "1px solid #ccc";
      pageDiv.style.background = "#fff";
      pageDiv.style.width = "fit-content";
      pageDiv.dataset.pageIndex = pageInfo.pageIndex.toString();
      container.appendChild(pageDiv);
      renderPage(pageDiv, pageInfo.pageIndex, pageInfo.scale);
    });
  }, [pdfDoc, pages, renderPage]);

  // ----------------------------------------------------------------
  // Render thumbnails in the sidebar
  // ----------------------------------------------------------------
  const renderThumbnail = useCallback(
    async (
      pageIndex: number,
      scale: number
    ): Promise<HTMLCanvasElement | null> => {
      if (!pdfDoc) return null;
      try {
        const page = await pdfDoc.getPage(pageIndex + 1);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext("2d");
        if (!context) return null;
        await page.render({ canvasContext: context, viewport }).promise;
        return canvas;
      } catch (err) {
        console.error("Error rendering thumbnail for page", pageIndex + 1, err);
        return null;
      }
    },
    [pdfDoc]
  );

  const renderThumbnails = useCallback(async () => {
    if (!pdfDoc || !sidebarRef.current) return;
    const sidebar = sidebarRef.current;
    sidebar.innerHTML = "";
    for (let i = 0; i < pdfDoc.numPages; i++) {
      const thumbDiv = document.createElement("div");
      thumbDiv.style.margin = "8px";
      thumbDiv.style.cursor = "pointer";
      thumbDiv.style.border = "1px solid #aaa";
      thumbDiv.style.padding = "2px";
      thumbDiv.style.backgroundColor = "#f5f5f5";
      const canvas = await renderThumbnail(i, 0.2);
      if (canvas) {
        thumbDiv.appendChild(canvas);
        thumbDiv.addEventListener("click", () => {
          const targetPageDiv = containerRef.current?.querySelector(
            `div[data-page-index="${i}"]`
          ) as HTMLDivElement | null;
          if (targetPageDiv) {
            targetPageDiv.scrollIntoView({ behavior: "smooth" });
          }
        });
      }
      sidebar.appendChild(thumbDiv);
    }
  }, [pdfDoc, renderThumbnail]);

  useEffect(() => {
    if (pdfDoc) {
      renderThumbnails();
    }
  }, [pdfDoc, renderThumbnails]);

  // ----------------------------------------------------------------
  // Generate a unique ID
  // ----------------------------------------------------------------
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // ----------------------------------------------------------------
  // Handle text selection for highlights (highlight mode)
  // ----------------------------------------------------------------
  const handleMouseUp = () => {
    if (tool !== "highlight") return;
    const selection = document.getSelection();
    if (!selection || selection.isCollapsed) return;
    const selectedText = selection.toString().trim();
    if (!selectedText) return;
    const range = selection.getRangeAt(0);
    const clientRects = Array.from(range.getClientRects());
    const pageDiv = findPageDiv(selection.anchorNode as Node);
    if (!pageDiv) {
      selection.removeAllRanges();
      return;
    }
    const pageIndex = parseInt(pageDiv.dataset.pageIndex || "0", 10);
    const textLayerEl = pageDiv.querySelector(
      ".textLayer"
    ) as HTMLDivElement | null;
    if (!textLayerEl) {
      selection.removeAllRanges();
      return;
    }
    const box = textLayerEl.getBoundingClientRect();
    const highlightRects = clientRects.map((rect) => ({
      x: rect.left - box.left,
      y: rect.top - box.top,
      width: rect.width,
      height: rect.height,
    }));
    const newHighlight: Highlight = {
      id: generateId(),
      pageNumber: pageIndex + 1,
      text: selectedText,
      rects: highlightRects,
      color: "rgba(255, 255, 0, 0.3)",
    };
    setHighlights((prev) => [...prev, newHighlight]);
    selection.removeAllRanges();
    const comment = prompt("Add a note to this highlight?");
    if (comment) {
      setHighlights((prev) =>
        prev.map((hl) => (hl.id === newHighlight.id ? { ...hl, comment } : hl))
      );
    }
  };

  // ----------------------------------------------------------------
  // Handle click for sticky notes (sticky mode)
  // ----------------------------------------------------------------
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (tool !== "sticky") return;
    const pageDiv = findPageDiv(e.target as Node);
    if (!pageDiv) return;
    const pageIndex = parseInt(pageDiv.dataset.pageIndex || "0", 10);
    const textLayerEl = pageDiv.querySelector(
      ".textLayer"
    ) as HTMLDivElement | null;
    if (!textLayerEl) return;
    const box = textLayerEl.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const noteComment = prompt("Enter sticky note text");
    if (!noteComment) return;
    const newNote: StickyNote = {
      id: generateId(),
      pageNumber: pageIndex + 1,
      x,
      y,
      comment: noteComment,
    };
    setStickyNotes((prev) => [...prev, newNote]);
  };

  // ----------------------------------------------------------------
  // Helper: Find page container from a DOM node
  // ----------------------------------------------------------------
  const findPageDiv = (node: Node): HTMLDivElement | null => {
    let current = node instanceof HTMLElement ? node : node.parentElement;
    while (current) {
      if (current.dataset && current.dataset.pageIndex) {
        return current as HTMLDivElement;
      }
      current = current.parentElement;
    }
    return null;
  };

  // ----------------------------------------------------------------
  // Render overlays (highlights and sticky notes) for each page
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!pdfDoc || !containerRef.current) return;
    pages.forEach((pageInfo) => {
      const pageDiv = containerRef.current?.querySelector(
        `div[data-page-index="${pageInfo.pageIndex}"]`
      ) as HTMLDivElement | null;
      if (!pageDiv) return;
      let overlay = pageDiv.querySelector(
        ".overlayLayer"
      ) as HTMLDivElement | null;
      if (overlay) overlay.remove();
      overlay = document.createElement("div");
      overlay.className = "overlayLayer";
      overlay.style.position = "absolute";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.pointerEvents = "none";
      pageDiv.appendChild(overlay);
      const pageHighlights = highlights.filter(
        (hl) => hl.pageNumber === pageInfo.pageIndex + 1
      );
      pageHighlights.forEach((hl) => {
        hl.rects.forEach((r) => {
          const hlDiv = document.createElement("div");
          hlDiv.style.position = "absolute";
          hlDiv.style.left = `${r.x}px`;
          hlDiv.style.top = `${r.y}px`;
          hlDiv.style.width = `${r.width}px`;
          hlDiv.style.height = `${r.height}px`;
          hlDiv.style.backgroundColor = hl.color;
          hlDiv.title = hl.comment || "No comment";
          overlay!.appendChild(hlDiv);
          if (hl.comment) {
            const commentDiv = document.createElement("div");
            commentDiv.style.position = "absolute";
            commentDiv.style.top = `${r.height + 2}px`;
            commentDiv.style.left = "0px";
            commentDiv.style.backgroundColor = "#fffacd";
            commentDiv.style.padding = "4px";
            commentDiv.style.border = "1px solid #ccc";
            commentDiv.style.fontSize = "0.8em";
            commentDiv.style.zIndex = "999";
            commentDiv.textContent = hl.comment;
            hlDiv.appendChild(commentDiv);
          }
        });
      });
      const pageNotes = stickyNotes.filter(
        (n) => n.pageNumber === pageInfo.pageIndex + 1
      );
      pageNotes.forEach((note) => {
        const noteDiv = document.createElement("div");
        noteDiv.style.position = "absolute";
        noteDiv.style.left = `${note.x}px`;
        noteDiv.style.top = `${note.y}px`;
        noteDiv.style.width = "20px";
        noteDiv.style.height = "20px";
        noteDiv.style.backgroundColor = "yellow";
        noteDiv.style.border = "1px solid #999";
        noteDiv.title = note.comment;
        overlay!.appendChild(noteDiv);
        const labelDiv = document.createElement("div");
        labelDiv.style.position = "absolute";
        labelDiv.style.top = "20px";
        labelDiv.style.left = "0px";
        labelDiv.style.backgroundColor = "#fffacd";
        labelDiv.style.padding = "4px";
        labelDiv.style.border = "1px solid #ccc";
        labelDiv.style.fontSize = "0.8em";
        labelDiv.style.zIndex = "999";
        labelDiv.textContent = note.comment;
        noteDiv.appendChild(labelDiv);
      });
    });
  }, [highlights, stickyNotes, pages, pdfDoc]);

  // ----------------------------------------------------------------
  // UI Rendering
  // ----------------------------------------------------------------
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        flexDirection: "row",
        overflow: "hidden",
      }}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
    >
      {/* Sidebar for thumbnails */}
      <div
        ref={sidebarRef}
        style={{
          width: "150px",
          borderRight: "1px solid #ccc",
          overflowY: "auto",
          backgroundColor: "#f8f8f8",
        }}
      >
        {/* Thumbnails will be rendered dynamically */}
      </div>

      {/* Main PDF content area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top toolbar with tool selection and optional close button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px",
            background: "#f2f2f2",
            borderBottom: "1px solid #ccc",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {onClose && (
              <button
                style={{
                  padding: "4px 8px",
                  border: "1px solid #ccc",
                  backgroundColor: "#eee",
                  cursor: "pointer",
                }}
                onClick={onClose}
              >
                Close
              </button>
            )}
            <label style={{ marginRight: "16px" }}>
              <input
                type="radio"
                name="tool"
                value="highlight"
                checked={tool === "highlight"}
                onChange={() => setTool("highlight")}
              />
              Highlight
            </label>
            <label style={{ marginRight: "16px" }}>
              <input
                type="radio"
                name="tool"
                value="sticky"
                checked={tool === "sticky"}
                onChange={() => setTool("sticky")}
              />
              Sticky Note
            </label>
            <span style={{ fontWeight: "bold" }}>Mode: {tool}</span>
          </div>
        </div>

        {/* Container for full-size PDF pages */}
        <div
          ref={containerRef}
          style={{ flex: 1, overflow: "auto", background: "#e0e0e0" }}
        >
          {/* Pages are rendered dynamically */}
        </div>
      </div>

      {/* Overlay for loading or error messages */}
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

export default ContinuousPDFViewerWithSidebar;
