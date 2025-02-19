"use client";

import React, { useState, useRef, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

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
  onClose?: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfData, onClose }) => {
  // Main PDF state
  const [numPages, setNumPages] = useState<number>(0);

  // Thumbnails state
  const [thumbNumPages, setThumbNumPages] = useState<number>(0);
  const [pageDimensions, setPageDimensions] = useState<
    { width: number; height: number }[]
  >([]);

  // Zoom state
  const [scale, setScale] = useState<number>(1.0);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("thumbnails");

  // Search / Page navigation state
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

  // Selected style for sidebar tabs
  const selectedStyle = "border border-accent-7";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white text-black">
      {/* PDF Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-300 bg-white">
        {/* Left: Sidebar Toggle, Zoom, Page Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="icon"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <SidebarIcon
              className="h-5 w-5 text-black stroke-current"
              stroke="currentColor"
              fill="none"
              style={{ display: "block" }}
            />
          </Button>
          <Button variant="icon" size="icon" onClick={handleZoomOut}>
            <ZoomOut
              className="h-4 w-4 text-black stroke-current"
              stroke="currentColor"
              fill="none"
              style={{ display: "block" }}
            />
          </Button>
          <Button variant="icon" size="icon" onClick={handleZoomIn}>
            <ZoomIn
              className="h-4 w-4 text-black stroke-current"
              stroke="currentColor"
              fill="none"
              style={{ display: "block" }}
            />
          </Button>
          <div
            className="cursor-pointer px-2 py-1"
            onClick={handlePageNumberClick}
          >
            {editPageInput ? (
              <input
                type="number"
                className="w-14 text-center border border-gray-300 bg-transparent outline-none text-black"
                value={pageInputValue}
                onChange={handlePageInputChange}
                onBlur={handlePageInputBlur}
                autoFocus
              />
            ) : (
              <span className="text-black">
                {currentPage} / {numPages}
              </span>
            )}
          </div>
        </div>
        {/* Right: Search and Close Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded">
            <input
              type="text"
              placeholder="Search"
              className="w-20 bg-transparent border border-gray-300 outline-none px-1 py-0.5 text-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="icon" size="icon" onClick={handleSearch}>
              <SearchIcon
                className="h-4 w-4 text-black stroke-current"
                stroke="currentColor"
                fill="none"
                style={{ display: "block" }}
              />
            </Button>
          </div>
          <Button variant="icon" size="icon" onClick={onClose}>
            <XIcon
              className="h-5 w-5 text-black stroke-current"
              stroke="currentColor"
              fill="none"
              style={{ display: "block" }}
            />
          </Button>
        </div>
      </div>

      {/* PDF Viewer Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <div
          className="transition-all flex flex-col border-r border-gray-300"
          style={{
            width: sidebarOpen ? "240px" : "0px",
            backgroundColor: "#fff",
            overflowY: sidebarOpen ? "auto" : "hidden",
          }}
        >
          {/* Sidebar Tabs */}
          <div className="flex justify-around border-b border-gray-300 p-2">
            <Button
              variant="icon"
              size="icon"
              onClick={() => setSidebarTab("thumbnails")}
              className={sidebarTab === "thumbnails" ? selectedStyle : ""}
            >
              <LayoutGrid
                className="h-4 w-4 text-black stroke-current"
                stroke="currentColor"
                fill="none"
                style={{ display: "block" }}
              />
            </Button>
            <Button
              variant="icon"
              size="icon"
              onClick={() => setSidebarTab("notes")}
              className={sidebarTab === "notes" ? selectedStyle : ""}
            >
              <FileText
                className="h-4 w-4 text-black stroke-current"
                stroke="currentColor"
                fill="none"
                style={{ display: "block" }}
              />
            </Button>
            <Button
              variant="icon"
              size="icon"
              onClick={() => setSidebarTab("outline")}
              className={sidebarTab === "outline" ? selectedStyle : ""}
            >
              <BookOpen
                className="h-4 w-4 text-black stroke-current"
                stroke="currentColor"
                fill="none"
                style={{ display: "block" }}
              />
            </Button>
          </div>

          {/* Sidebar Content */}
          <div className="relative flex-1 text-black">
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
                      className="m-2 cursor-pointer border border-transparent hover:border-blue-500 p-1 bg-gray-100 text-black"
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
          className="relative flex-1 overflow-auto bg-white text-black"
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
                className="my-4 mx-auto border border-gray-300 bg-white"
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
