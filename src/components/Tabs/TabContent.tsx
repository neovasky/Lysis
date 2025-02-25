import React from "react";
import { useTabContext } from "@/contexts/TabContext";
import PDFViewer from "@/components/PDFViewer/PDFViewer";

const TabContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tabs, activeTabId, closeTab } = useTabContext();

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  if (!activeTab) {
    return <div>No active tab</div>;
  }

  // If the active tab is the main app tab, show the children (main app content)
  if (activeTab.type === "main") {
    return <>{children}</>;
  }

  // Otherwise, show the file content based on its type
  if (!activeTab.fileData || !activeTab.fileData.content) {
    return <div className="p-4">No content available</div>;
  }

  const fileName = activeTab.fileData.metadata.name.toLowerCase();

  // Handle PDF files
  if (
    fileName.endsWith(".pdf") &&
    activeTab.fileData.content instanceof Uint8Array
  ) {
    return (
      <div className="h-full">
        <PDFViewer
          pdfData={activeTab.fileData.content}
          onClose={() => closeTab(activeTab.id)}
        />
      </div>
    );
  }

  // Handle image files
  if (
    (fileName.endsWith(".jpg") ||
      fileName.endsWith(".jpeg") ||
      fileName.endsWith(".png") ||
      fileName.endsWith(".gif")) &&
    typeof activeTab.fileData.content === "string"
  ) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <img
          src={activeTab.fileData.content}
          alt={activeTab.title}
          className="max-w-full max-h-full"
        />
      </div>
    );
  }

  // Handle text and other files
  if (typeof activeTab.fileData.content === "string") {
    return (
      <div className="h-full bg-gray-800 text-white p-4 overflow-auto">
        <pre className="whitespace-pre-wrap font-mono">
          {activeTab.fileData.content}
        </pre>
      </div>
    );
  }

  return <div className="p-4">Unsupported file type</div>;
};

export default TabContent;
