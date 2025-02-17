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
import { TextLayerBuilder } from "pdfjs-dist/web/pdf_viewer";

// Extend PdfTextContent to include streamTextContent property
interface ExtendedPdfTextContent extends PdfTextContent {
  streamTextContent?: () => Promise<PdfTextContent>;
}

// Using lucide-react icons (only the ones used)
import {
  Minus as MinusIcon,
  Plus as PlusIcon,
  Search as MagnifyingGlassIcon,
  Sidebar as ViewVerticalIcon,
  Pencil as PencilIcon,
  Pin as DrawingPinIcon,
  X as CrossIcon,
} from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

// Minimal button styles for icon buttons
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
  // PDF and UI state
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [tool, setTool] = useState<AnnotationTool>("highlight");
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [globalScale, setGlobalScale] = useState(1.2);
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [editPageInput, setEditPageInput] = useState(false);
  const [pageInputValue, setPageInputValue] = useState("");

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Load & save annotations from localStorage
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

  // Load PDF document
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
    let textContent: PdfTextContent;
    try {
      textContent = await page.getTextContent();
    } catch (error) {
      console.error(
        "Error fetching text content for page",
        pageIndex + 1,
        error
      );
      return;
    }
    // Create an extended text content object with a streamTextContent property
    const extendedTextContent: ExtendedPdfTextContent = {
      ...textContent,
      streamTextContent: () => Promise.resolve(textContent),
    };

    container.innerHTML = "";
    const textLayer = new TextLayerBuilder({
      textLayerDiv: container,
      pageIndex,
      viewport,
      enhanceTextSelection: true,
    });
    textLayer.textContent = extendedTextContent;
    textLayer.render();
    container.style.userSelect = "text";
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
      pageDiv.className = "relative my-5 mx-auto border bg-white";
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
      thumbDiv.className = "m-2 cursor-pointer border p-1 bg-gray-100";
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
      sidebarRef.current.appendChild(thumbDiv);
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
    const newHighlight = {
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
    const newNote = {
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

  // Overlay for annotations
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

  return (
    <div
      className="flex w-full h-full flex-row overflow-hidden relative"
      onMouseUp={handleMouseUp}
      onClick={handleClick}
    >
      {/* Sidebar for thumbnails */}
      {sidebarOpen && (
        <div
          ref={sidebarRef}
          className="w-[150px] border-r border-gray-300 overflow-y-auto bg-gray-100"
        />
      )}

      {/* Main PDF content area */}
      <div className="flex-1 flex flex-col">
        {/* Top toolbar */}
        <div className="flex items-center justify-between px-2 py-1 bg-[#3f4042] border-b border-gray-300 text-white">
          {/* Left group: sidebar toggle + optional close */}
          <div className="flex items-center gap-2">
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
              <ViewVerticalIcon className="w-5 h-5" />
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
                <CrossIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Center group: highlight vs. sticky */}
          <div className="flex items-center gap-4">
            <button
              style={{
                ...iconButtonStyle,
                background: tool === "highlight" ? "#ffe87c" : "transparent",
                color: tool === "highlight" ? "#000" : "#fff",
              }}
              onClick={() => setTool("highlight")}
            >
              <PencilIcon className="w-5 h-5" />
            </button>
            <button
              style={{
                ...iconButtonStyle,
                background: tool === "sticky" ? "#ffe87c" : "transparent",
                color: tool === "sticky" ? "#000" : "#fff",
              }}
              onClick={() => setTool("sticky")}
            >
              <DrawingPinIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Right group: zoom, page nav, search */}
          <div className="flex items-center gap-2">
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
              <MinusIcon className="w-5 h-5" />
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
              <PlusIcon className="w-5 h-5" />
            </button>
            <div
              className="flex items-center justify-center bg-transparent text-white px-2 py-1 rounded cursor-pointer transition-colors"
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
                  className="w-12 text-center border-none outline-none"
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
              className="flex items-center bg-transparent rounded px-1 text-white"
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
                className="w-20 bg-transparent border-none outline-none text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Container for full-size PDF pages */}
        <div ref={containerRef} className="flex-1 overflow-auto bg-gray-200" />

        {/* Loading Overlay */}
        {isLoading && !error && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-100 p-4 rounded">
            Loading PDF...
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-200 p-4 rounded">
            <strong className="text-red-600">{error}</strong>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContinuousPDFViewerWithSidebar;
