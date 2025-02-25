import React from "react";
import { useTabContext, Tab } from "@/contexts/TabContext";
import { FileText, X, Home } from "lucide-react";

const TabBar: React.FC = () => {
  const { tabs, activeTabId, activateTab, closeTab } = useTabContext();

  const getFileIcon = (tab: Tab) => {
    if (tab.type === "main") {
      return <Home className="w-4 h-4" />;
    }

    if (!tab.fileData) return <FileText className="w-4 h-4" />;

    const fileName = tab.fileData.metadata.name.toLowerCase();

    if (fileName.endsWith(".pdf")) {
      return <FileText className="w-4 h-4 text-red-500" />;
    } else if (
      fileName.endsWith(".jpg") ||
      fileName.endsWith(".png") ||
      fileName.endsWith(".jpeg")
    ) {
      return <FileText className="w-4 h-4 text-green-500" />;
    } else {
      return <FileText className="w-4 h-4" />;
    }
  };

  if (tabs.length <= 1) {
    // If only the main tab exists, don't show the tab bar
    return null;
  }

  return (
    <div
      className="flex overflow-x-auto border-b border-gray-200"
      style={{
        backgroundColor: "var(--color-pageBackground)",
        height: "40px",
      }}
    >
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`
            flex items-center min-w-[140px] max-w-[200px] h-[40px] px-3 py-1 
            border-r border-gray-300 cursor-pointer select-none
            ${tab.isActive ? "bg-blue-500 text-white" : "hover:bg-gray-100"}
          `}
          onClick={() => activateTab(tab.id)}
        >
          <div className="flex items-center gap-2 flex-1 overflow-hidden">
            {getFileIcon(tab)}
            <span className="truncate text-sm">{tab.title}</span>
          </div>

          {tab.type !== "main" && (
            <button
              className={`p-1 rounded-full ${
                tab.isActive ? "hover:bg-blue-600" : "hover:bg-gray-200"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default TabBar;
