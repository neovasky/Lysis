import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { useTheme } from "@/theme/hooks/useTheme";

import {
  Sidebar as SidebarIcon,
  ZoomIn,
  ZoomOut,
  Search as SearchIcon,
  X as XIcon,
  LayoutGrid,
  FileText,
  BookOpen,
  ChevronUp,
  ChevronDown,
  StickyNote,
  Edit3,
  HelpCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PDFAnnotations from "./PDFAnnotations";
import PDFNotes from "./PDFNotes";
import { PostItNote, TextHighlight } from "./types";

// Ensure pdf.worker.min.mjs is in your public folder
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

type SidebarTab = "thumbnails" | "notes" | "outline" | "search";

interface SearchResult {
  pageIndex: number;
  text: string;
  matchIndex: number;
}

interface PDFViewerProps {
  pdfData: Uint8Array;
  onClose: () => void;
}

// Define types for PDF text content
interface TextItem {
  str: string;
  dir: string;
  width: number;
  height: number;
  transform: number[];
  fontName: string;
}

// TextMarkedContent interface to fix type incompatibility
interface TextMarkedContent {
  type: string;
  items: (TextItem | TextMarkedContent)[];
}

// Updated TextContent interface to include TextMarkedContent
interface TextContent {
  items: (TextItem | TextMarkedContent)[];
  styles: Record<string, unknown>;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfData, onClose }) => {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  // Main PDF state
  const [numPages, setNumPages] = useState<number>(0);
  const [thumbNumPages, setThumbNumPages] = useState<number>(0);
  const [pageDimensions, setPageDimensions] = useState<
    { width: number; height: number }[]
  >([]);
  const [scale, setScale] = useState<number>(1.0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("thumbnails");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [editPageInput, setEditPageInput] = useState(false);
  const [pageInputValue, setPageInputValue] = useState("");
  const [pdfTextContent, setPdfTextContent] = useState<Record<number, string>>(
    {}
  );

  // Keep track of rendered pages for annotation positioning
  const [renderedPages, setRenderedPages] = useState<number[]>([]);
  const [pageRefs, setPageRefs] = useState<
    Record<number, HTMLDivElement | null>
  >({});

  // Annotation state - now centralized
  const [annotationMode, setAnnotationMode] = useState<
    "none" | "postit" | "highlight"
  >("none");
  const [postItNotes, setPostItNotes] = useState<PostItNote[]>([]);
  const [textHighlights, setTextHighlights] = useState<TextHighlight[]>([]);
  const [showAnnotationHelp, setShowAnnotationHelp] = useState(false);
  const [showOnboardingTip, setShowOnboardingTip] = useState(true);

  // Main container ref (for scrolling and positioning annotations)
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<HTMLDivElement>(null);

  // Prepare PDF files
  const fileForMain = useMemo(() => {
    const copy = pdfData.slice(0);
    return { data: new Uint8Array(copy) };
  }, [pdfData]);

  const fileForThumbnails = useMemo(() => {
    const copy = pdfData.slice(0);
    return { data: new Uint8Array(copy) };
  }, [pdfData]);

  // Main document load handler
  const handleMainLoad = useCallback((pdf: pdfjs.PDFDocumentProxy) => {
    setNumPages(pdf.numPages);
  }, []);

  // Record page ref when a page is rendered
  const handlePageRef = useCallback(
    (pageIndex: number, ref: HTMLDivElement | null) => {
      if (ref) {
        setPageRefs((prev) => ({
          ...prev,
          [pageIndex]: ref,
        }));

        // Immediately add to rendered pages to prevent multiple additions
        setRenderedPages((prev) => {
          if (!prev.includes(pageIndex)) {
            return [...prev, pageIndex].sort((a, b) => a - b);
          }
          return prev;
        });
      }
    },
    []
  );

  // Zoom handlers
  const handleZoomIn = useCallback(
    () => setScale((s) => Math.min(s + 0.2, 3)),
    []
  );
  const handleZoomOut = useCallback(
    () => setScale((s) => Math.max(0.2, s - 0.2)),
    []
  );

  // Handle page text content
  const handleTextContent = useCallback(
    (pageIndex: number, textContent: TextContent) => {
      // Extract text strings from the content
      const extractText = (items: (TextItem | TextMarkedContent)[]): string => {
        let text = "";
        for (const item of items) {
          if ("str" in item) {
            text += item.str + " ";
          } else if (item.items) {
            text += extractText(item.items);
          }
        }
        return text;
      };

      const pageText = extractText(textContent.items);
      setPdfTextContent((prev) => ({
        ...prev,
        [pageIndex]: pageText,
      }));
    },
    []
  );

  // Toggle annotation modes
  const togglePostItMode = useCallback(() => {
    setAnnotationMode((prev) => (prev === "postit" ? "none" : "postit"));
  }, []);

  const toggleHighlightMode = useCallback(() => {
    setAnnotationMode((prev) => (prev === "highlight" ? "none" : "highlight"));
  }, []);

  // Function to update annotations from annotation layer
  const handleAnnotationsUpdate = useCallback(
    (annotations: {
      postItNotes: PostItNote[];
      textHighlights: TextHighlight[];
    }) => {
      setPostItNotes(annotations.postItNotes);
      setTextHighlights(annotations.textHighlights);
    },
    []
  );

  // Load annotations from localStorage on component mount
  useEffect(() => {
    const savedPostIts = localStorage.getItem("pdf-post-it-notes");
    const savedHighlights = localStorage.getItem("pdf-text-highlights");

    if (savedPostIts) {
      try {
        setPostItNotes(JSON.parse(savedPostIts));
      } catch (error) {
        console.error("Error loading post-it notes:", error);
      }
    }

    if (savedHighlights) {
      try {
        setTextHighlights(JSON.parse(savedHighlights));
      } catch (error) {
        console.error("Error loading text highlights:", error);
      }
    }
  }, []);

  // Save annotations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("pdf-post-it-notes", JSON.stringify(postItNotes));
  }, [postItNotes]);

  useEffect(() => {
    localStorage.setItem("pdf-text-highlights", JSON.stringify(textHighlights));
  }, [textHighlights]);

  // Thumbnails load handler
  const handleThumbDocLoad = useCallback(
    async (pdf: pdfjs.PDFDocumentProxy) => {
      setThumbNumPages(pdf.numPages);
      const dims: { width: number; height: number }[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const { width, height } = page.getViewport({ scale: 1 });
          dims.push({ width, height });
        } catch (error) {
          console.error(`Error loading page ${i}:`, error);
          dims.push({ width: 0, height: 0 });
        }
      }
      setPageDimensions(dims);
    },
    []
  );

  // Thumbnail click handler
  const handleThumbClick = useCallback(
    (pageIndex: number) => {
      const pageDiv = pageRefs[pageIndex];
      if (pageDiv) {
        pageDiv.scrollIntoView({ behavior: "smooth" });
        setCurrentPage(pageIndex + 1);
      }
    },
    [pageRefs]
  );

  // Function to get current visible page
  const updateCurrentPageFromScroll = useCallback(() => {
    if (!mainContainerRef.current) return;

    const container = mainContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerMiddle = containerRect.top + containerRect.height / 2;

    let bestVisiblePage = 1;
    let bestVisibility = 0;

    Object.entries(pageRefs).forEach(([pageIndex, pageDiv]) => {
      if (!pageDiv) return;

      const pageRect = pageDiv.getBoundingClientRect();
      const visibleHeight =
        Math.min(containerRect.bottom, pageRect.bottom) -
        Math.max(containerRect.top, pageRect.top);

      // Only consider pages that are actually visible
      if (visibleHeight <= 0) return;

      // Calculate how centered the page is
      const pageCenterY = pageRect.top + pageRect.height / 2;
      const distanceFromCenter = Math.abs(pageCenterY - containerMiddle);

      // Combine visibility and centeredness for ranking
      const visibility =
        visibleHeight * (1 - distanceFromCenter / containerRect.height);

      if (visibility > bestVisibility) {
        bestVisibility = visibility;
        bestVisiblePage = parseInt(pageIndex) + 1;
      }
    });

    if (bestVisiblePage !== currentPage) {
      setCurrentPage(bestVisiblePage);
    }
  }, [pageRefs, currentPage]);

  // Handle scroll events to update current page
  useEffect(() => {
    const container = mainContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      requestAnimationFrame(updateCurrentPageFromScroll);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [updateCurrentPageFromScroll]);

  // Navigate to search result
  const navigateToSearchResult = useCallback(
    (result: SearchResult) => {
      const pageDiv = pageRefs[result.pageIndex];
      if (pageDiv) {
        pageDiv.scrollIntoView({ behavior: "smooth" });
        setCurrentPage(result.pageIndex + 1);
      }
    },
    [pageRefs]
  );

  // Search functionality
  const performSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
      return;
    }

    setIsSearching(true);
    setSidebarTab("search");

    try {
      const results: SearchResult[] = [];
      const term = searchTerm.toLowerCase();

      // Search through all pages' text content
      Object.entries(pdfTextContent).forEach(([pageIdxStr, pageText]) => {
        const pageIndex = parseInt(pageIdxStr, 10);
        const pageTextLower = pageText.toLowerCase();

        let startIndex = 0;
        let matchIndex = pageTextLower.indexOf(term, startIndex);

        while (matchIndex !== -1) {
          // Get surrounding context for the match (up to 40 chars)
          const contextStart = Math.max(0, matchIndex - 20);
          const contextEnd = Math.min(
            pageText.length,
            matchIndex + term.length + 20
          );
          const context = pageText.substring(contextStart, contextEnd);

          results.push({
            pageIndex,
            text: context,
            matchIndex,
          });

          startIndex = matchIndex + term.length;
          matchIndex = pageTextLower.indexOf(term, startIndex);
        }
      });

      setSearchResults(results);
      if (results.length > 0) {
        setCurrentSearchIndex(0);
        navigateToSearchResult(results[0]);
      } else {
        setCurrentSearchIndex(-1);
      }
    } finally {
      setIsSearching(false);
    }
  }, [searchTerm, pdfTextContent, navigateToSearchResult]);

  // Navigation through search results
  const handleNextSearchResult = useCallback(() => {
    if (searchResults.length === 0 || currentSearchIndex === -1) return;

    const nextIndex = (currentSearchIndex + 1) % searchResults.length;
    setCurrentSearchIndex(nextIndex);
    navigateToSearchResult(searchResults[nextIndex]);
  }, [currentSearchIndex, navigateToSearchResult, searchResults]);

  const handlePrevSearchResult = useCallback(() => {
    if (searchResults.length === 0 || currentSearchIndex === -1) return;

    const prevIndex =
      (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
    setCurrentSearchIndex(prevIndex);
    navigateToSearchResult(searchResults[prevIndex]);
  }, [currentSearchIndex, navigateToSearchResult, searchResults]);

  // Handle search when enter key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "Enter" &&
        document.activeElement?.id === "pdf-search-input"
      ) {
        performSearch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [performSearch]);

  // Page navigation handlers
  const handlePageNumberClick = useCallback(() => {
    setEditPageInput(true);
    setPageInputValue(String(currentPage));
  }, [currentPage]);

  const handlePageInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPageInputValue(e.target.value);
    },
    []
  );

  const handlePageInputBlur = useCallback(() => {
    setEditPageInput(false);
    const pageNum = parseInt(pageInputValue, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= numPages) {
      const pageDiv = pageRefs[pageNum - 1];
      if (pageDiv) {
        pageDiv.scrollIntoView({ behavior: "smooth" });
        setCurrentPage(pageNum);
      }
    }
  }, [pageInputValue, numPages, pageRefs]);

  // Jump to annotation
  const handleJumpToAnnotation = useCallback(
    (pageIndex: number, id: string) => {
      // Navigate to the correct page
      const pageDiv = pageRefs[pageIndex];
      if (pageDiv) {
        pageDiv.scrollIntoView({ behavior: "smooth" });
        setCurrentPage(pageIndex + 1);

        // Briefly highlight the element (if it can be found)
        setTimeout(() => {
          const annotationElement = document.getElementById(id);
          if (annotationElement) {
            // Add a temporary highlight class
            annotationElement.classList.add("annotation-highlight-pulse");
            setTimeout(() => {
              annotationElement.classList.remove("annotation-highlight-pulse");
            }, 2000);
          }
        }, 300);
      }
    },
    [pageRefs]
  );

  // Handle post-it note deletion from sidebar
  const handleDeletePostItNote = useCallback((id: string) => {
    setPostItNotes((prev) => prev.filter((note) => note.id !== id));
  }, []);

  // Handle highlight deletion from sidebar
  const handleDeleteHighlight = useCallback((id: string) => {
    setTextHighlights((prev) =>
      prev.filter((highlight) => highlight.id !== id)
    );
  }, []);

  // Handle post-it note editing from sidebar
  const handleEditPostItNote = useCallback((id: string, content: string) => {
    setPostItNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, content, updatedAt: Date.now() } : note
      )
    );
  }, []);

  // Handle highlight note editing from sidebar
  const handleEditHighlightNote = useCallback((id: string, note: string) => {
    setTextHighlights((prev) =>
      prev.map((highlight) =>
        highlight.id === id
          ? { ...highlight, note, updatedAt: Date.now() }
          : highlight
      )
    );
  }, []);

  // Disable annotation tips after they've been shown
  const disableOnboardingTips = useCallback(() => {
    setShowOnboardingTip(false);
    localStorage.setItem("pdf-annotation-tips-shown", "true");
  }, []);

  // Setup CSS styles for annotations
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      /* Annotation highlighting */
      @keyframes annotation-pulse {
        0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); }
        50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
        100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
      }
      
      .annotation-highlight-pulse {
        animation: annotation-pulse 1s cubic-bezier(0.4, 0, 0.6, 1) forwards;
        z-index: 1010 !important;
      }
      
      /* Annotation tip */
      #annotation-tip {
        opacity: 0;
        transition: opacity 0.5s ease-in-out;
      }
  
      /* Enable text selection in the PDF viewer when in highlight mode */
      .highlight-mode .react-pdf__Page__textLayer {
        pointer-events: auto !important;
        user-select: text !important;
        -webkit-user-select: text !important;
        cursor: text !important;
      }

      /* Make sure text layers are always behind other elements but can receive events */
      .react-pdf__Page__textLayer {
        z-index: 1 !important;
      }

      /* Make annotations appear above text */
      .pdf-annotation-layer {
        z-index: 2 !important;
      }

      /* Search highlight styling */
      .search-highlight {
        background-color: rgba(255, 255, 0, 0.3);
        border-radius: 2px;
      }
    `;
    document.head.appendChild(style);

    // Check if we've shown tips before
    const tipsShown = localStorage.getItem("pdf-annotation-tips-shown");
    setShowOnboardingTip(tipsShown !== "true");

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div
      className={`w-full h-full z-0 flex flex-col ${
        isDark ? "bg-background text-foreground" : "bg-white text-black"
      } ${annotationMode === "highlight" ? "highlight-mode" : ""}`}
    >
      {/* PDF Top Bar */}
      <div
        className={`flex items-center justify-between px-4 py-2 border-b ${
          isDark ? "border-gray-700 bg-background" : "border-gray-300 bg-white"
        }`}
      >
        {/* Left: Sidebar Toggle, Search, Zoom, Page Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded ${
              isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
            }`}
          >
            <SidebarIcon className="h-5 w-5" />
          </Button>

          {/* Search bar */}
          <div className="flex items-center rounded">
            <input
              id="pdf-search-input"
              type="text"
              placeholder="Search"
              className={`w-32 border rounded-l px-2 py-1 text-sm ${
                isDark
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-black placeholder-gray-500"
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  performSearch();
                }
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={performSearch}
              className={`p-2 rounded-r ${
                isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}
              disabled={isSearching}
            >
              <SearchIcon className="h-4 w-4" />
            </Button>

            {/* Search navigation buttons */}
            {searchResults.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevSearchResult}
                  className={`p-2 ${
                    isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                  }`}
                  disabled={searchResults.length === 0}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextSearchResult}
                  className={`p-2 ${
                    isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                  }`}
                  disabled={searchResults.length === 0}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <span className="text-xs ml-1">
                  {searchResults.length > 0
                    ? `${currentSearchIndex + 1}/${searchResults.length}`
                    : "No results"}
                </span>
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            className={`p-2 rounded ${
              isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
            }`}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            className={`p-2 rounded ${
              isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
            }`}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div
            className="cursor-pointer px-2 py-1"
            onClick={handlePageNumberClick}
          >
            {editPageInput ? (
              <input
                type="number"
                className={`w-14 text-center border rounded ${
                  isDark
                    ? "border-gray-700 bg-gray-800 text-white"
                    : "border-gray-300 bg-white text-black"
                }`}
                value={pageInputValue}
                onChange={handlePageInputChange}
                onBlur={handlePageInputBlur}
                autoFocus
              />
            ) : (
              <span>
                {currentPage} / {numPages}
              </span>
            )}
          </div>
        </div>

        {/* Right: Annotation Tools and Close Button */}
        <div className="flex items-center gap-2">
          {/* Enhanced Annotation Tools */}
          <div className="flex items-center gap-1 border rounded-md p-1 mr-2">
            <Button
              variant={annotationMode === "postit" ? "solid" : "ghost"}
              size="sm"
              onClick={togglePostItMode}
              className={`p-2 rounded flex items-center gap-1 ${
                annotationMode === "postit"
                  ? isDark
                    ? "bg-blue-700 text-white"
                    : "bg-blue-500 text-white"
                  : ""
              }`}
            >
              <StickyNote className="h-4 w-4" />
              <span className="text-xs">Note</span>
            </Button>
            <Button
              variant={annotationMode === "highlight" ? "solid" : "ghost"}
              size="sm"
              onClick={toggleHighlightMode}
              className={`p-2 rounded flex items-center gap-1 ${
                annotationMode === "highlight"
                  ? isDark
                    ? "bg-blue-700 text-white"
                    : "bg-blue-500 text-white"
                  : ""
              }`}
            >
              <Edit3 className="h-4 w-4" />
              <span className="text-xs">Highlight</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAnnotationHelp(!showAnnotationHelp)}
              className="p-2 rounded"
              title="Annotation Help"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-800 hover:bg-opacity-50"
          >
            <XIcon className="h-5 w-5 text-current" strokeWidth={2} />
          </Button>
        </div>
      </div>

      {/* Annotation Help Modal */}
      {showAnnotationHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className={`relative w-full max-w-lg p-6 rounded-lg shadow-xl ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <button
              onClick={() => setShowAnnotationHelp(false)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200"
            >
              <XIcon className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold mb-4">How to Add Annotations</h3>

            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-3">
                <h4 className="font-bold flex items-center gap-2">
                  <StickyNote className="h-5 w-5 text-yellow-500" />
                  Adding Post-it Notes
                </h4>
                <ol className="list-decimal ml-5 space-y-1 mt-2">
                  <li>Click the "Note" button in the toolbar</li>
                  <li>Click anywhere on the PDF page to place your note</li>
                  <li>Type your note content</li>
                  <li>Click the checkmark to save</li>
                </ol>
              </div>

              <div className="border-l-4 border-green-500 pl-3">
                <h4 className="font-bold flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-green-500" />
                  Adding Text Highlights
                </h4>
                <ol className="list-decimal ml-5 space-y-1 mt-2">
                  <li>Click the "Highlight" button in the toolbar</li>
                  <li>Select text on any PDF page by clicking and dragging</li>
                  <li>Choose a highlight color from the popup toolbar</li>
                  <li>Click "Highlight" to confirm</li>
                  <li>Optionally add a note to your highlight later</li>
                </ol>
              </div>

              <div className="border-l-4 border-purple-500 pl-3">
                <h4 className="font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-500" />
                  Managing Annotations
                </h4>
                <p className="mt-2">
                  View, edit and manage all your annotations in the "Notes"
                  panel in the sidebar. You can jump to any annotation by
                  clicking on it in the list.
                </p>
              </div>
            </div>

            <div className="mt-6 text-right">
              <Button
                variant="solid"
                onClick={() => {
                  setShowAnnotationHelp(false);
                  disableOnboardingTips();
                }}
              >
                Got it!
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <div
          className={`transition-all flex flex-col border-r ${
            isDark
              ? "border-gray-700 bg-background"
              : "border-gray-300 bg-white"
          }`}
          style={{
            width: sidebarOpen ? "240px" : "0px",
            overflowY: sidebarOpen ? "auto" : "hidden",
          }}
        >
          {/* Sidebar Tabs */}
          <div
            className={`flex justify-around border-b p-2 ${
              isDark ? "border-gray-700" : "border-gray-300"
            }`}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarTab("thumbnails")}
              className={`p-2 rounded transition-all ${
                sidebarTab === "thumbnails"
                  ? isDark
                    ? "bg-gray-800 text-blue-400"
                    : "bg-blue-100 text-blue-600"
                  : isDark
                  ? "hover:bg-gray-800 text-gray-300"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
              title="Thumbnails"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarTab("notes")}
              className={`p-2 rounded transition-all ${
                sidebarTab === "notes"
                  ? isDark
                    ? "bg-gray-800 text-blue-400"
                    : "bg-blue-100 text-blue-600"
                  : isDark
                  ? "hover:bg-gray-800 text-gray-300"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
              title="Notes"
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarTab("outline")}
              className={`p-2 rounded transition-all ${
                sidebarTab === "outline"
                  ? isDark
                    ? "bg-gray-800 text-blue-400"
                    : "bg-blue-100 text-blue-600"
                  : isDark
                  ? "hover:bg-gray-800 text-gray-300"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
              title="Outline"
            >
              <BookOpen className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarTab("search")}
              className={`p-2 rounded transition-all ${
                sidebarTab === "search"
                  ? isDark
                    ? "bg-gray-800 text-blue-400"
                    : "bg-blue-100 text-blue-600"
                  : isDark
                  ? "hover:bg-gray-800 text-gray-300"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
              title="Search Results"
            >
              <SearchIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Sidebar Content */}
          <div className="relative flex-1">
            {/* Thumbnails */}
            <div
              className={`absolute inset-0 overflow-y-auto p-2 ${
                sidebarTab === "thumbnails" ? "" : "hidden"
              }`}
            >
              <Document
                file={fileForThumbnails}
                onLoadSuccess={handleThumbDocLoad}
                onLoadError={(err) => console.error("Thumb doc error:", err)}
                loading={<p className="p-2">Loading thumbnails...</p>}
              >
                {Array.from({ length: thumbNumPages }, (_, i) => {
                  const dims = pageDimensions[i] || { width: 0, height: 0 };
                  const isLandscape = dims.width > dims.height;
                  return (
                    <div
                      key={`thumb-${i}`}
                      className={`m-2 cursor-pointer border-2 ${
                        currentPage === i + 1
                          ? "border-blue-500"
                          : "border-transparent hover:border-blue-300"
                      } p-1 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}
                      onClick={() => handleThumbClick(i)}
                    >
                      <div className="relative">
                        <Page
                          pageNumber={i + 1}
                          width={isLandscape ? 160 : 120}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />
                        <div className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-tl">
                          {i + 1}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </Document>
            </div>

            {/* Notes */}
            <div
              className={`absolute inset-0 overflow-y-auto ${
                sidebarTab === "notes" ? "" : "hidden"
              }`}
            >
              <PDFNotes
                postItNotes={postItNotes}
                textHighlights={textHighlights}
                currentPage={currentPage}
                totalPages={numPages}
                onDeletePostItNote={handleDeletePostItNote}
                onDeleteHighlight={handleDeleteHighlight}
                onEditPostItNote={handleEditPostItNote}
                onEditHighlightNote={handleEditHighlightNote}
                onJumpToAnnotation={handleJumpToAnnotation}
              />
            </div>

            {/* Outline */}
            <div
              className={`absolute inset-0 overflow-y-auto p-2 ${
                sidebarTab === "outline" ? "" : "hidden"
              }`}
            >
              <p className="text-sm">Outline placeholder...</p>
            </div>

            {/* Search Results */}
            <div
              className={`absolute inset-0 overflow-y-auto p-2 ${
                sidebarTab === "search" ? "" : "hidden"
              }`}
            >
              <div className="mb-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Search Results</h3>
                  <span className="text-xs">
                    {searchResults.length} matches
                  </span>
                </div>
                {isSearching && <p className="text-xs">Searching...</p>}
              </div>

              {searchResults.length === 0 && !isSearching && searchTerm && (
                <p className="text-sm text-gray-500">No results found</p>
              )}

              <div className="space-y-2">
                {searchResults.map((result, index) => (
                  <div
                    key={`search-${index}`}
                    className={`p-2 rounded text-sm cursor-pointer ${
                      currentSearchIndex === index
                        ? isDark
                          ? "bg-blue-900"
                          : "bg-blue-100"
                        : isDark
                        ? "hover:bg-gray-800"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => {
                      setCurrentSearchIndex(index);
                      navigateToSearchResult(result);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-semibold">
                        Page {result.pageIndex + 1}
                      </span>
                    </div>
                    <p className="text-xs mt-1">
                      {/* Highlight the search term in the context */}
                      {(() => {
                        const termRegex = new RegExp(
                          searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                          "gi"
                        );
                        const parts = result.text.split(termRegex);

                        if (parts.length <= 1) {
                          return result.text;
                        }

                        return (
                          <>
                            {parts.map((part, i) => (
                              <React.Fragment key={i}>
                                {part}
                                {i < parts.length - 1 && (
                                  <span className="bg-yellow-200 text-gray-800 rounded px-0.5">
                                    {result.text.match(termRegex)?.[i] ||
                                      searchTerm}
                                  </span>
                                )}
                              </React.Fragment>
                            ))}
                          </>
                        );
                      })()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main PDF Content */}
        <div
          className={`relative flex-1 overflow-auto ${
            isDark ? "bg-gray-900" : "bg-gray-100"
          }`}
          ref={mainContainerRef}
        >
          <div ref={documentRef}>
            <Document
              file={fileForMain}
              onLoadSuccess={handleMainLoad}
              onLoadError={(err) => console.error("Main doc error:", err)}
              loading={<p className="p-4">Loading PDF...</p>}
            >
              {Array.from({ length: numPages }, (_, i) => (
                <div
                  key={`page-${i}`}
                  ref={(ref) => handlePageRef(i, ref)}
                  data-page-index={i}
                  className={`my-4 mx-auto border ${
                    isDark ? "border-gray-700" : "border-gray-300"
                  } bg-white relative`}
                  style={{ width: "fit-content" }}
                >
                  <Page
                    pageNumber={i + 1}
                    scale={scale}
                    onGetTextSuccess={(textContent) =>
                      handleTextContent(i, textContent as TextContent)
                    }
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="pdf-page"
                  />
                </div>
              ))}
            </Document>
          </div>

          {/* PDF Annotation Layer - positioned absolutely over the PDF */}
          <PDFAnnotations
            postItNotes={postItNotes}
            textHighlights={textHighlights}
            annotationMode={annotationMode}
            pageRefs={pageRefs}
            scale={scale}
            currentPage={currentPage - 1}
            renderedPages={renderedPages}
            onAnnotationsChange={handleAnnotationsUpdate}
          />

          {/* Annotation Tips */}
          {annotationMode !== "none" && showOnboardingTip && (
            <div
              id="annotation-tip"
              className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-lg shadow-lg ${
                isDark ? "bg-blue-900" : "bg-blue-100"
              } flex items-center gap-2 z-40 max-w-md`}
              style={{ opacity: 1 }}
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-500" />
              <div>
                <p className="text-sm font-medium">
                  {annotationMode === "postit"
                    ? "Click anywhere on the document to add a note"
                    : "Select text on the document to highlight it"}
                </p>
                <p className="text-xs mt-1 opacity-75">
                  You can view and edit all annotations in the Notes panel
                </p>
              </div>
              <button
                onClick={disableOnboardingTips}
                className="ml-2 text-xs underline"
              >
                Don't show again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
