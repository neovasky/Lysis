import { useState, useEffect } from "react";
import {
  Upload,
  LayoutGrid,
  List as ListIcon,
  RefreshCw,
  ChevronLeft,
} from "lucide-react";
import FileUploadDialog from "../../components/Files/FileUploadDialog";
import FilesList from "../../components/Files/FilesList";
import FilesGrid from "../../components/Files/FilesGrid";
import { useFiles } from "../../components/Files/hooks/useFiles";
import FileService from "../../services/fileService";
import { FILE_CONSTANTS } from "../../services/constants";

// Import custom CSS if needed
import "../../components/Files/dialogstyles.css";

type ViewMode = "list" | "grid";
type FileFilter = "all" | "recent" | "pdf" | "excel" | "word";

const { DEFAULT_BASE_DIRECTORY, LAST_DIRECTORY_KEY } = FILE_CONSTANTS;

export const FilesLayout = () => {
  const { files, loading, error, loadFiles, refreshFiles, currentDirectory } =
    useFiles();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FileFilter>("all");

  // Load initial files
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Filter files based on active filter
  const filteredFiles = files.filter((file) => {
    switch (activeFilter) {
      case "recent":
        // Show files from last 24 hours
        return Date.now() - file.lastModified < 24 * 60 * 60 * 1000;
      case "pdf":
        return file.type === "pdf";
      case "excel":
        return file.type === "excel";
      case "word":
        return file.type === "word";
      default:
        return true;
    }
  });

  const handleRefresh = () => {
    refreshFiles();
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="bg-white shadow rounded p-6 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Files</h2>
            <p className="text-sm text-gray-600">
              {currentDirectory
                ? `Current directory: ${currentDirectory}`
                : "Select a directory to view files"}
            </p>
            {error && (
              <p className="mt-2 text-sm text-red-600">Error: {error}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading || !currentDirectory}
              className="flex items-center gap-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="bg-white shadow rounded p-4 mb-4">
        <div className="flex gap-2">
          {(["all", "recent", "pdf", "excel", "word"] as FileFilter[]).map(
            (filter) => (
              <span
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`cursor-pointer px-3 py-1 rounded ${
                  activeFilter === filter
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </span>
            )
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-gray-300 bg-gray-100 sticky top-0 z-10 mb-4">
        {currentDirectory && (
          <button
            onClick={() => {
              FileService.setCurrentDirectory(DEFAULT_BASE_DIRECTORY);
              localStorage.setItem(LAST_DIRECTORY_KEY, DEFAULT_BASE_DIRECTORY);
              loadFiles();
            }}
            className="mr-4 p-2 rounded hover:bg-gray-200"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
          >
            <Upload size={16} />
            Upload Files
          </button>
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded ${
                viewMode === "list"
                  ? "bg-blue-500 text-white"
                  : "bg-transparent text-gray-600 hover:bg-gray-200"
              }`}
            >
              <ListIcon size={20} />
              List
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded ${
                viewMode === "grid"
                  ? "bg-blue-500 text-white"
                  : "bg-transparent text-gray-600 hover:bg-gray-200"
              }`}
            >
              <LayoutGrid size={20} />
              Grid
            </button>
          </div>
        </div>
      </div>

      {/* Files Display */}
      <div className="bg-white shadow rounded p-4">
        {loading ? (
          <div className="flex items-center justify-center p-6">
            <p className="text-sm text-gray-600">Loading files...</p>
          </div>
        ) : viewMode === "list" ? (
          <FilesList
            files={filteredFiles}
            onDelete={undefined}
            onFileOpen={undefined}
          />
        ) : (
          <FilesGrid
            files={filteredFiles}
            onDelete={undefined}
            onFileOpen={undefined}
          />
        )}
      </div>

      {/* Upload Dialog */}
      <FileUploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onUploadComplete={refreshFiles}
      />
    </div>
  );
};

export default FilesLayout;
