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
import { Button } from "../ui/button";

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
      <div className="bg-card shadow rounded p-6 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2 text-card-foreground">
              Files
            </h2>
            <p className="text-sm text-muted-foreground">
              {currentDirectory
                ? `Current directory: ${currentDirectory}`
                : "Select a directory to view files"}
            </p>
            {error && (
              <p className="mt-2 text-sm text-destructive">Error: {error}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading || !currentDirectory}
              className="flex items-center gap-1 bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 disabled:opacity-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="bg-card shadow rounded p-4 mb-4">
        <div className="flex gap-2">
          {(["all", "recent", "pdf", "excel", "word"] as FileFilter[]).map(
            (filter) => (
              <span
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`cursor-pointer px-3 py-1 rounded ${
                  activeFilter === filter
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </span>
            )
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-border bg-muted/50 sticky top-0 z-10 mb-4">
        {currentDirectory && (
          <button
            onClick={() => {
              FileService.setCurrentDirectory(DEFAULT_BASE_DIRECTORY);
              localStorage.setItem(LAST_DIRECTORY_KEY, DEFAULT_BASE_DIRECTORY);
              loadFiles();
            }}
            className="mr-4 p-2 rounded hover:bg-muted"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <div className="flex items-center gap-2">
          {/* Upload Files Button */}
          <Button
            variant="solid"
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1"
          >
            <Upload size={16} />
            Upload Files
          </Button>

          {/* View Mode Toggle Buttons */}
          <div className="flex gap-1">
            <Button
              variant={viewMode === "list" ? "solid" : "ghost"}
              onClick={() => setViewMode("list")}
              className="flex items-center gap-1"
            >
              <ListIcon size={20} />
              List
            </Button>
            <Button
              variant={viewMode === "grid" ? "solid" : "ghost"}
              onClick={() => setViewMode("grid")}
              className="flex items-center gap-1"
            >
              <LayoutGrid size={20} />
              Grid
            </Button>
          </div>
        </div>
      </div>

      {/* Files Display */}
      <div className="bg-card shadow rounded p-4">
        {loading ? (
          <div className="flex items-center justify-center p-6">
            <p className="text-sm text-muted-foreground">Loading files...</p>
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
