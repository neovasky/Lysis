import React, {
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
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
import PDFAnnotations, { PostItNote, TextHighlight } from "./PDFAnnotations";
import PDFNotes from "./PDFNotes";

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
  onClose: () => void; // onClose is required
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

// Adding TextMarkedContent interface to fix type incompatibility
interface TextMarkedContent {
  type: string;
  items: (TextItem | TextMarkedContent)[];
}

// Updated TextContent interface to include TextMarkedContent
interface TextContent {
  items: (TextItem | TextMarkedContent)[];
  styles: Record<string, unknown>;
}

// Type guard to check if an item is a TextItem
function isTextItem(item: TextItem | TextMarkedContent): item is TextItem {
  return "str" in item;
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
  const [textItems, setTextItems] = useState<{
    [key: number]: (TextItem | TextMarkedContent)[];
  }>({});

  // Annotations state
  const [postItNotes, setPostItNotes] = useState<PostItNote[]>([]);
  const [textHighlights, setTextHighlights] = useState<TextHighlight[]>([]);

  // Annotation mode and help states
  const [isAddingPostIt, setIsAddingPostIt] = useState(false);
  const [isAddingTextHighlight, setIsAddingTextHighlight] = useState(false);
  const [showAnnotationHelp, setShowAnnotationHelp] = useState(false);
  const [showOnboardingTip, setShowOnboardingTip] = useState(true);

  // Main container ref (for scrolling and positioning annotations)
  const mainContainerRef = useRef<HTMLDivElement>(null);

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
  const handleMainLoad = (pdf: pdfjs.PDFDocumentProxy) => {
    setNumPages(pdf.numPages);
  };

  // Handle page render
  const handlePageRender = useCallback(
    (pageIndex: number, textContent: TextContent) => {
      setTextItems((prev) => ({
        ...prev,
        [pageIndex]: textContent.items,
      }));
    },
    []
  );

  // Zoom handlers
  const handleZoomIn = () => setScale((s) => s + 0.2);
  const handleZoomOut = () => setScale((s) => Math.max(0.2, s - 0.2));

  // Handle annotations update
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

  // Toggle annotation modes
  const togglePostItMode = () => {
    setIsAddingPostIt(!isAddingPostIt);
    setIsAddingTextHighlight(false);

    // Show the onboarding tip
    if (!isAddingPostIt && showOnboardingTip) {
      setTimeout(() => {
        const tip = document.getElementById("annotation-tip");
        if (tip) {
          tip.style.opacity = "1";
          setTimeout(() => {
            tip.style.opacity = "0";
          }, 5000);
        }
      }, 500);
    }
  };

  const toggleHighlightMode = () => {
    setIsAddingTextHighlight(!isAddingTextHighlight);
    setIsAddingPostIt(false);

    // Show the onboarding tip
    if (!isAddingTextHighlight && showOnboardingTip) {
      setTimeout(() => {
        const tip = document.getElementById("annotation-tip");
        if (tip) {
          tip.style.opacity = "1";
          setTimeout(() => {
            tip.style.opacity = "0";
          }, 5000);
        }
      }, 500);
    }
  };

  // Navigate to search result function
  const navigateToSearchResult = useCallback((result: SearchResult) => {
    const pageDiv = mainContainerRef.current?.querySelector(
      `[data-page-index="${result.pageIndex}"]`
    ) as HTMLDivElement | null;

    if (pageDiv) {
      pageDiv.scrollIntoView({ behavior: "smooth" });
      setCurrentPage(result.pageIndex + 1);

      // Highlight the search result (optional)
      setTimeout(() => {
        try {
          const textLayers = pageDiv.querySelectorAll(
            ".react-pdf__Page__textContent"
          );
          if (textLayers.length > 0) {
            textLayers[0].classList.add("highlight-animation");
            setTimeout(() => {
              textLayers[0].classList.remove("highlight-animation");
            }, 2000);
          }
        } catch (e) {
          console.error("Error highlighting text", e);
        }
      }, 500);
    }
  }, []);

  // Search handlers
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
      Object.entries(textItems).forEach(([pageIdxStr, items]) => {
        const pageIndex = parseInt(pageIdxStr, 10);

        // Combine text items to find matches that might span multiple items
        const textStrings = items.filter(isTextItem).map((item) => item.str);

        const fullText = textStrings.join(" ");

        let startIndex = 0;
        let matchIndex = fullText.toLowerCase().indexOf(term, startIndex);

        while (matchIndex !== -1) {
          // Get surrounding context for the match (up to 40 chars)
          const contextStart = Math.max(0, matchIndex - 20);
          const contextEnd = Math.min(
            fullText.length,
            matchIndex + term.length + 20
          );
          const context = fullText.substring(contextStart, contextEnd);

          results.push({
            pageIndex,
            text: context,
            matchIndex,
          });

          startIndex = matchIndex + term.length;
          matchIndex = fullText.toLowerCase().indexOf(term, startIndex);
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
  }, [searchTerm, textItems, navigateToSearchResult]);

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
  const handlePageNumberClick = () => {
    setEditPageInput(true);
    setPageInputValue(String(currentPage));
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInputValue(e.target.value);
  };

  const handlePageInputBlur = () => {
    setEditPageInput(false);
    const pageNum = parseInt(pageInputValue, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= numPages) {
      const pageDiv = mainContainerRef.current?.querySelector(
        `[data-page-index="${pageNum - 1}"]`
      ) as HTMLDivElement | null;
      if (pageDiv) {
        pageDiv.scrollIntoView({ behavior: "smooth" });
        setCurrentPage(pageNum);
      }
    }
  };

  // Thumbnails load handler
  const handleThumbDocLoad = async (pdf: pdfjs.PDFDocumentProxy) => {
    setThumbNumPages(pdf.numPages);
    const dims: { width: number; height: number }[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const { width, height } = page.getViewport({ scale: 1 });
      dims.push({ width, height });
    }
    setPageDimensions(dims);
  };

  // Thumbnail click handler
  const handleThumbClick = (pageIndex: number) => {
    const pageDiv = mainContainerRef.current?.querySelector(
      `[data-page-index="${pageIndex}"]`
    ) as HTMLDivElement | null;
    if (pageDiv) {
      pageDiv.scrollIntoView({ behavior: "smooth" });
      setCurrentPage(pageIndex + 1);
    }
  };

  // Jump to annotation
  const handleJumpToAnnotation = (pageIndex: number, id: string) => {
    // First, navigate to the correct page
    const pageDiv = mainContainerRef.current?.querySelector(
      `[data-page-index="${pageIndex}"]`
    ) as HTMLDivElement | null;

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
  };

  // Handle post-it note deletion from sidebar
  const handleDeletePostItNote = (id: string) => {
    setPostItNotes((prev) => prev.filter((note) => note.id !== id));
  };

  // Handle highlight deletion from sidebar
  const handleDeleteHighlight = (id: string) => {
    setTextHighlights((prev) =>
      prev.filter((highlight) => highlight.id !== id)
    );
  };

  // Handle post-it note editing from sidebar
  const handleEditPostItNote = (id: string, content: string) => {
    setPostItNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, content, updatedAt: Date.now() } : note
      )
    );
  };

  // Handle highlight note editing from sidebar
  const handleEditHighlightNote = (id: string, note: string) => {
    setTextHighlights((prev) =>
      prev.map((highlight) =>
        highlight.id === id
          ? { ...highlight, note, updatedAt: Date.now() }
          : highlight
      )
    );
  };

  // Disable annotation tips after they've been shown
  const disableOnboardingTips = () => {
    setShowOnboardingTip(false);
    localStorage.setItem("pdf-annotation-tips-shown", "true");
  };

  // Add event listener to detect when user scrolls to update current page
  useEffect(() => {
    const handleScroll = () => {
      if (!mainContainerRef.current) return;

      // Find which page is most visible in the viewport
      const container = mainContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      const containerMiddle = containerRect.top + containerRect.height / 2;

      let bestVisiblePage = 1;
      let bestVisibleArea = 0;

      for (let i = 0; i < numPages; i++) {
        const pageElement = container.querySelector(
          `[data-page-index="${i}"]`
        ) as HTMLElement;

        if (pageElement) {
          const pageRect = pageElement.getBoundingClientRect();

          // Calculate how much of the page is visible
          const visibleTop = Math.max(pageRect.top, containerRect.top);
          const visibleBottom = Math.min(pageRect.bottom, containerRect.bottom);
          const visibleHeight = Math.max(0, visibleBottom - visibleTop);

          // If this page is more visible than our previous best, update
          if (visibleHeight > bestVisibleArea) {
            bestVisibleArea = visibleHeight;
            bestVisiblePage = i + 1;
          }

          // Alternative: use distance from center to determine current page
          const distance = Math.abs(
            pageRect.top + pageRect.height / 2 - containerMiddle
          );
          if (distance < containerRect.height / 2 && visibleHeight > 0) {
            bestVisiblePage = i + 1;
          }
        }
      }

      if (bestVisiblePage !== currentPage) {
        setCurrentPage(bestVisiblePage);
      }
    };

    const container = mainContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [currentPage, numPages]);

  // CSS for search result highlighting
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      /* Search result highlighting */
      @keyframes highlight-pulse {
        0% { background-color: rgba(255, 255, 0, 0.2); }
        50% { background-color: rgba(255, 255, 0, 0.5); }
        100% { background-color: rgba(255, 255, 0, 0.2); }
      }
      
      .highlight-animation {
        animation: highlight-pulse 1.5s ease-in-out;
      }
      
      .search-highlight {
        background-color: rgba(255, 255, 0, 0.3);
        border-radius: 2px;
      }
      
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

      /* Fix pointer events for annotations */
      .react-pdf__Page__textLayer {
        pointer-events: ${isAddingTextHighlight ? "auto" : "none"} !important;
      }
    `;
    document.head.appendChild(style);

    // Check if we've shown tips before
    const tipsShown = localStorage.getItem("pdf-annotation-tips-shown");
    setShowOnboardingTip(tipsShown !== "true");

    return () => {
      document.head.removeChild(style);
    };
  }, [isAddingTextHighlight]);

  // Add a class to the PDF container for better text selection when highlighting
  useEffect(() => {
    if (mainContainerRef.current) {
      if (isAddingTextHighlight) {
        mainContainerRef.current.classList.add("text-selection-mode");
      } else {
        mainContainerRef.current.classList.remove("text-selection-mode");
      }
    }
  }, [isAddingTextHighlight]);

  return (
    <div
      className={`w-full h-full z-0 flex flex-col ${
        isDark ? "bg-background text-foreground" : "bg-white text-black"
      }`}
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
              variant={isAddingPostIt ? "solid" : "ghost"}
              size="sm"
              onClick={togglePostItMode}
              className={`p-2 rounded flex items-center gap-1 ${
                isAddingPostIt
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
              variant={isAddingTextHighlight ? "solid" : "ghost"}
              size="sm"
              onClick={toggleHighlightMode}
              className={`p-2 rounded flex items-center gap-1 ${
                isAddingTextHighlight
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
            onClick={() => {
              onClose();
            }}
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
                  <li>Select text on the PDF page by clicking and dragging</li>
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
          } ${isAddingTextHighlight ? "text-selection-mode" : ""}`}
          ref={mainContainerRef}
        >
          <Document
            file={fileForMain}
            onLoadSuccess={handleMainLoad}
            onLoadError={(err) => console.error("Main doc error:", err)}
            loading={<p className="p-4">Loading PDF...</p>}
          >
            {Array.from({ length: numPages }, (_, i) => (
              <div
                key={`page-${i}`}
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
                    handlePageRender(i, textContent as TextContent)
                  }
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              </div>
            ))}
          </Document>

          {/* PDF Annotations component - passing the annotation mode states */}
          <PDFAnnotations
            pdfContainerRef={mainContainerRef}
            currentPage={currentPage}
            scale={scale}
            onAnnotationUpdate={handleAnnotationsUpdate}
            isAddingPostIt={isAddingPostIt}
            isAddingTextHighlight={isAddingTextHighlight}
          />

          {/* Annotation Tips */}
          {(isAddingPostIt || isAddingTextHighlight) && showOnboardingTip && (
            <div
              id="annotation-tip"
              className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-lg shadow-lg ${
                isDark ? "bg-blue-900" : "bg-blue-100"
              } flex items-center gap-2 z-40 max-w-md`}
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-500" />
              <div>
                <p className="text-sm font-medium">
                  {isAddingPostIt
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
