import React, { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocumentProxy } from "pdfjs-dist";
import { Box, Button, Flex, Text } from "@radix-ui/themes";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FileIcon,
} from "@radix-ui/react-icons";
import "pdfjs-dist/web/pdf_viewer.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PDFViewerProps {
  filePath: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ filePath }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.5);

  const calculateScale = () => {
    const canvasContainerWidth = window.innerWidth;
    const baseWidth = 600;
    return canvasContainerWidth / baseWidth; // yields a bigger factor
  };
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

        await page.render({ canvasContext: context, viewport }).promise;
        setIsLoading(false);
      } catch (error) {
        console.error("Error rendering page:", error);
        setError("Failed to render page");
        setIsLoading(false);
      }
    },
    [pdfDoc]
  );

  useEffect(() => {
    const handleResize = () => {
      const newScale = calculateScale();
      setScale(newScale);
      if (pdfDoc) renderPage(currentPage, newScale);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [pdfDoc, currentPage, renderPage]);

  useEffect(() => {
    const loadPDF = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const loadingTask = pdfjsLib.getDocument(filePath);
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setCurrentPage(1);
      } catch (error) {
        console.error("Error loading PDF:", error);
        setError("Failed to load PDF");
      } finally {
        setIsLoading(false);
      }
    };
    loadPDF();
  }, [filePath]);

  useEffect(() => {
    if (pdfDoc) renderPage(currentPage, scale);
  }, [pdfDoc, currentPage, renderPage, scale]);

  const handlePrevPage = () =>
    currentPage > 1 && setCurrentPage((prev) => prev - 1);
  const handleNextPage = () =>
    currentPage < numPages && setCurrentPage((prev) => prev + 1);

  return (
    <Box
      style={{
        width: "100vw",
        height: "100vh",
        background: "var(--gray-1)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Flex
        justify="between"
        align="center"
        px="4"
        py="2"
        style={{
          background: "var(--gray-2)",
          borderBottom: "1px solid var(--gray-5)",
        }}
      >
        <Flex align="center" gap="2">
          <FileIcon />
          <Text size="2" weight="medium">
            PDF Viewer
          </Text>
        </Flex>
      </Flex>
      <Box style={{ flex: 1, overflow: "auto", position: "relative" }}>
        {isLoading && (
          <Flex
            justify="center"
            align="center"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "var(--gray-2)",
              padding: "12px 24px",
              borderRadius: "8px",
              zIndex: 1000,
            }}
          >
            <Text>Loading PDF...</Text>
          </Flex>
        )}
        {error && (
          <Flex
            justify="center"
            align="center"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "var(--red-3)",
              padding: "12px 24px",
              borderRadius: "8px",
              zIndex: 1000,
            }}
          >
            <Text color="red">{error}</Text>
          </Flex>
        )}
        <canvas ref={canvasRef} style={{}} />
      </Box>
      <Flex
        justify="center"
        align="center"
        gap="4"
        py="2"
        style={{
          background: "var(--gray-2)",
          borderTop: "1px solid var(--gray-5)",
        }}
      >
        <Button
          size="2"
          variant="soft"
          onClick={handlePrevPage}
          disabled={currentPage <= 1 || isLoading}
        >
          <ChevronLeftIcon />
        </Button>
        <Text size="2">
          Page {currentPage} of {numPages}
        </Text>
        <Button
          size="2"
          variant="soft"
          onClick={handleNextPage}
          disabled={currentPage >= numPages || isLoading}
        >
          <ChevronRightIcon />
        </Button>
      </Flex>
    </Box>
  );
};

export default PDFViewer;
