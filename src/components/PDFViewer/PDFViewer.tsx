import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { Button } from "@/components/ui/button";
import Label from "../ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

// Use Vite to bundle the worker dynamically
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).href;

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

function App() {
  const [pdfFile, setPdfFile] = useState<string>("");
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFile(URL.createObjectURL(file));
      setPageNumber(1);
    }
  }

  const onDocumentLoadSuccess: React.ComponentProps<
    typeof Document
  >["onLoadSuccess"] = (pdf) => {
    setNumPages(pdf.numPages);
  };

  const goToPrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () =>
    setPageNumber((prev) => Math.min(prev + 1, numPages));

  return (
    <div className="min-h-screen p-6 flex flex-col gap-4 bg-gray-50">
      <Card className="max-w-lg mx-auto w-full">
        <CardHeader>
          <CardTitle>PDF Runner</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <Label htmlFor="pdfInput" className="mb-2 block">
              Upload a PDF
            </Label>
            <input
              id="pdfInput"
              type="file"
              accept="application/pdf"
              onChange={onFileChange}
              className="border p-2 rounded w-full"
            />
          </div>
          {pdfFile ? (
            <>
              <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
                <Page pageNumber={pageNumber} />
              </Document>
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={goToPrevPage}
                  disabled={pageNumber <= 1}
                >
                  Prev
                </Button>
                <p>
                  Page {pageNumber} of {numPages}
                </p>
                <Button
                  variant="outline"
                  onClick={goToNextPage}
                  disabled={pageNumber >= numPages}
                >
                  Next
                </Button>
              </div>
            </>
          ) : (
            <p>No PDF selected.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
