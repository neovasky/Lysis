import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  CSSProperties,
} from "react";
import * as pdfjsLib from "pdfjs-dist";
import {
  PDFDocumentProxy,
  PDFPageProxy,
  TextContent as PdfTextContent,
} from "pdfjs-dist/types/src/display/api";
import "pdfjs-dist/web/pdf_viewer.css";

// Import TextLayerBuilder from pdfjs-dist/web/pdf_viewer
import { TextLayerBuilder } from "pdfjs-dist/web/pdf_viewer";

// Radix UI icons
import {
  MinusIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ViewVerticalIcon,
  Pencil2Icon,
  DrawingPinIcon,
} from "@radix-ui/react-icons";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

// Minimal button styles for icons
const iconButtonStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  border: "none",
  color: "#fff",
  cursor: "pointer",
  padding: "6px",
  borderRadius: "4px",
  transition: "background 0.2s ease",
};

const iconButtonHoverStyle: CSSProperties = {
  background: "rgba(255, 255, 255, 0.1)",
};

// Types
interface Highlight {
  id: string;
  pageNumber: number;
  text: string;
  rects: { x: number; y: number; width: number; height: number }[];
  color: string;
  comment?: string;
}

interface StickyNote {
  id: string;
  pageNumber: number;
  x: number;
  y: number;
  comment: string;
}

type AnnotationTool = "highlight" | "sticky";

interface PageInfo {
  pageIndex: number;
  scale: number;
}

interface ContinuousPDFViewerWithSidebarProps {
  pdfData: Uint8Array;
  onClose?: () => void;
}

const ContinuousPDFViewerWithSidebar: React.FC<
  ContinuousPDFViewerWithSidebarProps
> = ({ pdfData, onClose }) => {
  // State
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [tool, setTool] = useState<AnnotationTool>("highlight");
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [globalScale, setGlobalScale] = useState(1.2);
  const [searchTerm, setSearchTerm] = useState("");

  // Page navigation
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [editPageInput, setEditPageInput] = useState(false);
  const [pageInputValue, setPageInputValue] = useState("");

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Load & Save Annotations (localStorage)
  useEffect(() => {
    const savedHighlights = localStorage.getItem("pdfHighlights");
    const savedSticky = localStorage.getItem("pdfStickyNotes");
    if (savedHighlights) setHighlights(JSON.parse(savedHighlights));
    if (savedSticky) setStickyNotes(JSON.parse(savedSticky));
  }, []);

  useEffect(() => {
    localStorage.setItem("pdfHighlights", JSON.stringify(highlights));
  }, [highlights]);

  useEffect(() => {
    localStorage.setItem("pdfStickyNotes", JSON.stringify(stickyNotes));
  }, [stickyNotes]);

  // Load PDF (using a copy of pdfData)
  useEffect(() => {
    if (!pdfData) return;
    setIsLoading(true);
    setError(null);
    const pdfDataCopy = pdfData.slice();
    const loadingTask = pdfjsLib.getDocument({ data: pdfDataCopy });
    loadingTask.promise
      .then((pdf: PDFDocumentProxy) => {
        setPdfDoc(pdf);
        const initialPages = Array.from({ length: pdf.numPages }, (_, i) => ({
          pageIndex: i,
          scale: globalScale,
        }));
        setPages(initialPages);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error loading PDF:", err);
        setError("Failed to load PDF");
        setIsLoading(false);
      });
  }, [pdfData, globalScale]);

  // Render text layer using TextLayerBuilder
  const renderTextLayer = async (
    page: PDFPageProxy,
    viewport: pdfjsLib.PageViewport,
    container: HTMLDivElement,
    pageIndex: number
  ) => {
    // Retrieve the text content from the PDF page.
    const textContent: PdfTextContent = await page.getTextContent();

    container.innerHTML = "";
    const textLayer = new TextLayerBuilder({
      textLayerDiv: container,
      pageIndex: pageIndex,
      viewport: viewport,
      enhanceTextSelection: true,
    });
    // Assign the text content to the text layer.
    textLayer.textContent = textContent;
    textLayer.render();
  };

  // Render a single page (canvas + text layer)
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
          textLayerDiv.style.zIndex = "10";
          pageContainer.appendChild(textLayerDiv);
        }
        textLayerDiv.style.width = `${viewport.width}px`;
        textLayerDiv.style.height = `${viewport.height}px`;
        await renderTextLayer(page, viewport, textLayerDiv, pageIndex);
      } catch (err) {
        console.error(`Error rendering page ${pageIndex + 1}:`, err);
      }
    },
    [pdfDoc]
  );

  // Render all pages
  useEffect(() => {
    if (!pdfDoc || !containerRef.current) return;
    containerRef.current.innerHTML = "";
    pages.forEach((pageInfo) => {
      const pageDiv = document.createElement("div");
      pageDiv.style.position = "relative";
      pageDiv.style.margin = "20px auto";
      pageDiv.style.border = "1px solid #ccc";
      pageDiv.style.background = "#fff";
      pageDiv.style.width = "fit-content";
      pageDiv.dataset.pageIndex = pageInfo.pageIndex.toString();
      containerRef.current?.appendChild(pageDiv);
      renderPage(pageDiv, pageInfo.pageIndex, pageInfo.scale);
    });
  }, [pdfDoc, pages, renderPage]);

  // Thumbnails
  const renderThumbnail = useCallback(
    async (
      pageIndex: number,
      scale: number
    ): Promise<HTMLCanvasElement | null> => {
      if (!pdfDoc) return null;
      try {
        const page: PDFPageProxy = await pdfDoc.getPage(pageIndex + 1);
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
    sidebarRef.current.innerHTML = "";
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
            setCurrentPage(i + 1);
          }
        });
      }
      sidebarRef.current?.appendChild(thumbDiv);
    }
  }, [pdfDoc, renderThumbnail]);

  useEffect(() => {
    if (sidebarOpen && pdfDoc) {
      renderThumbnails();
    }
  }, [sidebarOpen, pdfDoc, renderThumbnails]);

  // Annotations
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleMouseUp = () => {
    if (tool !== "highlight" || !pdfDoc) return;
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

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (tool !== "sticky" || !pdfDoc) return;
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

  // Overlay for highlights/sticky notes
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

      // Render highlights
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
          hlDiv.style.cursor = "pointer";
          hlDiv.addEventListener("dblclick", () => {
            if (window.confirm("Delete this highlight?")) {
              setHighlights((prev) => prev.filter((h) => h.id !== hl.id));
            } else {
              const newComment = prompt("Edit comment:", hl.comment);
              if (newComment !== null) {
                setHighlights((prev) =>
                  prev.map((h) =>
                    h.id === hl.id ? { ...h, comment: newComment } : h
                  )
                );
              }
            }
          });
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

      // Render sticky notes
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
        noteDiv.style.cursor = "pointer";
        noteDiv.addEventListener("dblclick", () => {
          if (window.confirm("Delete this sticky note?")) {
            setStickyNotes((prev) => prev.filter((sn) => sn.id !== note.id));
          } else {
            const newComment = prompt("Edit sticky note text:", note.comment);
            if (newComment !== null) {
              setStickyNotes((prev) =>
                prev.map((sn) =>
                  sn.id === note.id ? { ...sn, comment: newComment } : sn
                )
              );
            }
          }
        });
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

  // Toolbar Handlers
  const handleZoomIn = () => {
    const newScale = globalScale + 0.2;
    setGlobalScale(newScale);
    if (pdfDoc) {
      const updatedPages = Array.from({ length: pdfDoc.numPages }, (_, i) => ({
        pageIndex: i,
        scale: newScale,
      }));
      setPages(updatedPages);
    }
  };

  const handleZoomOut = () => {
    const newScale = globalScale - 0.2;
    if (newScale <= 0.2) return;
    setGlobalScale(newScale);
    if (pdfDoc) {
      const updatedPages = Array.from({ length: pdfDoc.numPages }, (_, i) => ({
        pageIndex: i,
        scale: newScale,
      }));
      setPages(updatedPages);
    }
  };

  const handleSearch = () => {
    alert(`Search for "${searchTerm}" not implemented yet.`);
  };

  // Page navigation
  const totalPages = pdfDoc?.numPages ?? 1;
  const handlePageNumberClick = () => {
    if (!pdfDoc) return;
    setEditPageInput(true);
    setPageInputValue(String(currentPage));
  };
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInputValue(e.target.value);
  };
  const handlePageInputBlur = () => {
    setEditPageInput(false);
    const pageNum = parseInt(pageInputValue, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      const targetPageDiv = containerRef.current?.querySelector(
        `div[data-page-index="${pageNum - 1}"]`
      ) as HTMLDivElement | null;
      if (targetPageDiv) {
        targetPageDiv.scrollIntoView({ behavior: "smooth" });
        setCurrentPage(pageNum);
      }
    }
  };

  // Render
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        flexDirection: "row",
        overflow: "hidden",
        position: "relative",
      }}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
    >
      {/* Sidebar for thumbnails */}
      {sidebarOpen && (
        <div
          ref={sidebarRef}
          style={{
            width: "150px",
            borderRight: "1px solid #ccc",
            overflowY: "auto",
            backgroundColor: "#f8f8f8",
          }}
        />
      )}

      {/* Main PDF content area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top toolbar with a dark background */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "4px 8px",
            background: "#3f4042",
            borderBottom: "1px solid #ccc",
            justifyContent: "space-between",
            color: "#fff",
          }}
        >
          {/* Left group: sidebar toggle + optional close */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <button
              style={iconButtonStyle}
              onMouseEnter={(e) =>
                Object.assign(e.currentTarget.style, iconButtonHoverStyle)
              }
              onMouseLeave={(e) =>
                Object.assign(e.currentTarget.style, iconButtonStyle)
              }
              onClick={() => setSidebarOpen((prev) => !prev)}
              title={sidebarOpen ? "Hide Thumbnails" : "Show Thumbnails"}
            >
              <ViewVerticalIcon />
            </button>
            {onClose && (
              <button
                style={iconButtonStyle}
                onMouseEnter={(e) =>
                  Object.assign(e.currentTarget.style, iconButtonHoverStyle)
                }
                onMouseLeave={(e) =>
                  Object.assign(e.currentTarget.style, iconButtonStyle)
                }
                onClick={onClose}
              >
                Close
              </button>
            )}
          </div>

          {/* Center group: highlight vs. sticky (icons only) */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="tool"
                value="highlight"
                checked={tool === "highlight"}
                onChange={() => setTool("highlight")}
                style={{ display: "none" }}
              />
              <button
                style={{
                  ...iconButtonStyle,
                  background: tool === "highlight" ? "#ffe87c" : "transparent",
                  color: tool === "highlight" ? "#000" : "#fff",
                }}
                onClick={() => setTool("highlight")}
                onMouseEnter={(e) =>
                  !tool.includes("highlight") &&
                  Object.assign(e.currentTarget.style, iconButtonHoverStyle)
                }
                onMouseLeave={(e) =>
                  !tool.includes("highlight") &&
                  Object.assign(e.currentTarget.style, iconButtonStyle)
                }
              >
                <Pencil2Icon />
              </button>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="tool"
                value="sticky"
                checked={tool === "sticky"}
                onChange={() => setTool("sticky")}
                style={{ display: "none" }}
              />
              <button
                style={{
                  ...iconButtonStyle,
                  background: tool === "sticky" ? "#ffe87c" : "transparent",
                  color: tool === "sticky" ? "#000" : "#fff",
                }}
                onClick={() => setTool("sticky")}
                onMouseEnter={(e) =>
                  !tool.includes("sticky") &&
                  Object.assign(e.currentTarget.style, iconButtonHoverStyle)
                }
                onMouseLeave={(e) =>
                  !tool.includes("sticky") &&
                  Object.assign(e.currentTarget.style, iconButtonStyle)
                }
              >
                <DrawingPinIcon />
              </button>
            </label>
          </div>

          {/* Right group: zoom, page nav, search */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <button
              style={iconButtonStyle}
              onMouseEnter={(e) =>
                Object.assign(e.currentTarget.style, iconButtonHoverStyle)
              }
              onMouseLeave={(e) =>
                Object.assign(e.currentTarget.style, iconButtonStyle)
              }
              onClick={handleZoomOut}
            >
              <MinusIcon />
            </button>
            <button
              style={iconButtonStyle}
              onMouseEnter={(e) =>
                Object.assign(e.currentTarget.style, iconButtonHoverStyle)
              }
              onMouseLeave={(e) =>
                Object.assign(e.currentTarget.style, iconButtonStyle)
              }
              onClick={handleZoomIn}
            >
              <PlusIcon />
            </button>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                color: "#fff",
                padding: "4px 8px",
                borderRadius: "4px",
                cursor: "pointer",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
              onClick={handlePageNumberClick}
            >
              {editPageInput ? (
                <input
                  type="number"
                  style={{
                    width: "50px",
                    textAlign: "center",
                    border: "none",
                    outline: "none",
                  }}
                  value={pageInputValue}
                  onChange={handlePageInputChange}
                  onBlur={handlePageInputBlur}
                  autoFocus
                />
              ) : (
                <span>
                  {currentPage} / {pdfDoc?.numPages ?? 1}
                </span>
              )}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "transparent",
                borderRadius: "4px",
                padding: "0 4px",
                color: "#fff",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "80px",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#fff",
                }}
              />
              <button
                style={{ ...iconButtonStyle, padding: "0" }}
                onMouseEnter={(e) =>
                  Object.assign(e.currentTarget.style, iconButtonHoverStyle)
                }
                onMouseLeave={(e) =>
                  Object.assign(e.currentTarget.style, iconButtonStyle)
                }
                onClick={handleSearch}
              >
                <MagnifyingGlassIcon />
              </button>
            </div>
          </div>
        </div>

        {/* Container for full-size PDF pages */}
        <div
          ref={containerRef}
          style={{ flex: 1, overflow: "auto", background: "#e0e0e0" }}
        />

        {/* Loading Overlay */}
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

        {/* Error Overlay */}
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
    </div>
  );
};

export default ContinuousPDFViewerWithSidebar;
