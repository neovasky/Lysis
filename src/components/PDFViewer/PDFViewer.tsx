import React, { useState, useRef, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// 1) Copy pdf.worker.min.mjs from react-pdf’s pdfjs-dist@4.8.69 into your public folder.
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface ContinuousPDFViewerWithSidebarProps {
  pdfData: Uint8Array; // The original typed array from your FilesPage
  onClose?: () => void;
}

const ContinuousPDFViewerWithSidebar: React.FC<
  ContinuousPDFViewerWithSidebarProps
> = ({ pdfData, onClose }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.0);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  /**
   * 2) We create two new ArrayBuffer copies:
   *    - one for thumbnails
   *    - one for the main PDF
   * This prevents the buffer from getting detached
   * because each Document has its own copy.
   */
  const fileForThumbnails = useMemo(() => {
    // Make a new copy of the underlying ArrayBuffer
    const bufferCopy = pdfData.buffer.slice(0);
    // Convert to a new typed array
    const typedArray = new Uint8Array(bufferCopy);
    return { data: typedArray };
  }, [pdfData]);

  const fileForMain = useMemo(() => {
    const bufferCopy = pdfData.buffer.slice(0);
    const typedArray = new Uint8Array(bufferCopy);
    return { data: typedArray };
  }, [pdfData]);

  const onDocumentLoadSuccess: React.ComponentProps<
    typeof Document
  >["onLoadSuccess"] = (pdf) => {
    setNumPages(pdf.numPages);
    pageRefs.current = Array(pdf.numPages).fill(null);
  };

  const handleZoomIn = () => setScale((s) => s + 0.2);
  const handleZoomOut = () => setScale((s) => Math.max(0.2, s - 0.2));

  const handleThumbClick = (pageIndex: number) => {
    const ref = pageRefs.current[pageIndex];
    if (ref) {
      ref.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card className="max-w-5xl mx-auto w-full">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>PDF Viewer</CardTitle>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex gap-4">
            {/* Sidebar Thumbnails */}
            <div className="w-[150px] shrink-0 border-r border-gray-300 overflow-y-auto bg-gray-100 p-2">
              <Document
                file={fileForThumbnails}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={(err) =>
                  console.error("Thumbnail load error:", err)
                }
                loading={<p className="p-2">Loading thumbnails...</p>}
              >
                {Array.from({ length: numPages }, (_, i) => (
                  <div
                    key={`thumb-${i}`}
                    className="cursor-pointer mb-4 border"
                    onClick={() => handleThumbClick(i)}
                  >
                    <Page
                      pageNumber={i + 1}
                      scale={0.2}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </div>
                ))}
              </Document>
            </div>

            {/* Main PDF area: continuous scroll */}
            <div
              className="flex-1 overflow-auto border rounded p-2"
              style={{ maxHeight: "80vh" }}
            >
              <Document
                file={fileForMain}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={(err) =>
                  console.error("Main doc load error:", err)
                }
                loading={<p>Loading PDF...</p>}
              >
                {Array.from({ length: numPages }, (_, i) => (
                  <div
                    key={`page-${i}`}
                    ref={(el) => (pageRefs.current[i] = el)}
                    className="mb-8"
                  >
                    <Page pageNumber={i + 1} scale={scale} />
                  </div>
                ))}
              </Document>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" onClick={handleZoomOut}>
              Zoom Out
            </Button>
            <Button variant="outline" onClick={handleZoomIn}>
              Zoom In
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContinuousPDFViewerWithSidebar;
