"use client";

import React, { useState, useRef, useMemo } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Ensure pdf.worker.min.mjs is in your public folder
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

type SidebarTab = "thumbnails" | "notes" | "outline";

interface PDFViewerProps {
  pdfData: Uint8Array;
  onClose: () => void; // onClose is required
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [editPageInput, setEditPageInput] = useState(false);
  const [pageInputValue, setPageInputValue] = useState("");

  // Main container ref (for scrolling)
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

  // Zoom handlers
  const handleZoomIn = () => setScale((s) => s + 0.2);
  const handleZoomOut = () => setScale((s) => Math.max(0.2, s - 0.2));

  // Search handler
  const handleSearch = () => {
    alert(`Search for "${searchTerm}" not implemented yet.`);
  };

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

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col ${
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

          {/* Search moved to left */}
          <div className="flex items-center rounded">
            <input
              type="text"
              placeholder="Search"
              className={`w-32 border rounded-l px-2 py-1 text-sm ${
                isDark
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-black placeholder-gray-500"
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSearch}
              className={`p-2 rounded-r ${
                isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}
            >
              <SearchIcon className="h-4 w-4" />
            </Button>
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

        {/* Right: Close Button */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log("Close button clicked");
              onClose();
            }}
            className="p-2 rounded hover:bg-gray-800 hover:bg-opacity-50"
          >
            <XIcon className="h-5 w-5 text-current" strokeWidth={2} />
          </Button>
        </div>
      </div>

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
            >
              <BookOpen className="h-4 w-4" />
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
                      className={`m-2 cursor-pointer border border-transparent hover:border-blue-500 p-1 ${
                        isDark ? "bg-gray-800" : "bg-gray-100"
                      }`}
                      onClick={() => handleThumbClick(i)}
                    >
                      <Page
                        pageNumber={i + 1}
                        width={isLandscape ? 160 : 120}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                      />
                    </div>
                  );
                })}
              </Document>
            </div>

            {/* Notes */}
            <div
              className={`absolute inset-0 overflow-y-auto p-2 ${
                sidebarTab === "notes" ? "" : "hidden"
              }`}
            >
              <p className="text-sm">Notes placeholder...</p>
            </div>

            {/* Outline */}
            <div
              className={`absolute inset-0 overflow-y-auto p-2 ${
                sidebarTab === "outline" ? "" : "hidden"
              }`}
            >
              <p className="text-sm">Outline placeholder...</p>
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
                } bg-white`}
                style={{ width: "fit-content" }}
              >
                <Page pageNumber={i + 1} scale={scale} />
              </div>
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
