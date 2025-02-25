import React, { useState } from "react";
import { useTheme } from "@/theme/hooks/useTheme";
import {
  StickyNote,
  Highlighter,
  Trash2,
  Edit3,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import { PostItNote, TextHighlight } from "./PDFAnnotations";
import { Button } from "@/components/ui/button";

interface PDFNotesProps {
  postItNotes: PostItNote[];
  textHighlights: TextHighlight[];
  currentPage: number;
  totalPages: number;
  onDeletePostItNote: (id: string) => void;
  onDeleteHighlight: (id: string) => void;
  onEditPostItNote: (id: string, content: string) => void;
  onEditHighlightNote: (id: string, note: string) => void;
  onJumpToAnnotation: (pageIndex: number, id: string) => void;
}

type AnnotationFilter = "all" | "postit" | "highlight";
type SortOption = "newest" | "oldest" | "page";

const PDFNotes: React.FC<PDFNotesProps> = ({
  postItNotes,
  textHighlights,
  currentPage,
  totalPages,
  onDeletePostItNote,
  onDeleteHighlight,
  onEditPostItNote,
  onEditHighlightNote,
  onJumpToAnnotation,
}) => {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  const [filter, setFilter] = useState<AnnotationFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({
    postit: true,
    highlight: true,
  });
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  // Toggle section expansion
  const toggleSection = (section: "postit" | "highlight") => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Filter annotations based on search and filter type
  const filteredPostItNotes = postItNotes.filter(
    (note) =>
      (filter === "all" || filter === "postit") &&
      (searchQuery === "" ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredTextHighlights = textHighlights.filter(
    (highlight) =>
      (filter === "all" || filter === "highlight") &&
      (searchQuery === "" ||
        highlight.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        highlight.note.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sort annotations based on selected sort option
  const sortedPostItNotes = [...filteredPostItNotes].sort((a, b) => {
    if (sortBy === "newest") return b.updatedAt - a.updatedAt;
    if (sortBy === "oldest") return a.updatedAt - b.updatedAt;
    return a.pageIndex - b.pageIndex;
  });

  const sortedTextHighlights = [...filteredTextHighlights].sort((a, b) => {
    if (sortBy === "newest") return b.updatedAt - a.updatedAt;
    if (sortBy === "oldest") return a.updatedAt - b.updatedAt;
    return a.pageIndex - b.pageIndex;
  });

  // Start editing a note
  const startEditing = (
    id: string,
    content: string,
    type: "postit" | "highlight"
  ) => {
    setEditingNoteId(id);
    setEditingContent(content);
  };

  // Save edited content
  const saveEditedContent = (id: string, type: "postit" | "highlight") => {
    if (type === "postit") {
      onEditPostItNote(id, editingContent);
    } else {
      onEditHighlightNote(id, editingContent);
    }
    setEditingNoteId(null);
    setEditingContent("");
  };

  // Format date from timestamp
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`h-full flex flex-col ${isDark ? "text-white" : "text-black"}`}
    >
      {/* Search and filter controls */}
      <div className="p-2 border-b border-gray-700">
        <div className="flex items-center mb-2 relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search in notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-8 pr-2 py-1 text-sm rounded ${
              isDark
                ? "bg-gray-800 border-gray-700 placeholder-gray-500"
                : "bg-white border-gray-300 placeholder-gray-400"
            } border`}
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <Button
              variant={filter === "all" ? "solid" : "ghost"}
              size="sm"
              onClick={() => setFilter("all")}
              className="px-2 py-1 text-xs"
            >
              All
            </Button>
            <Button
              variant={filter === "postit" ? "solid" : "ghost"}
              size="sm"
              onClick={() => setFilter("postit")}
              className="px-2 py-1 text-xs"
            >
              Post-its
            </Button>
            <Button
              variant={filter === "highlight" ? "solid" : "ghost"}
              size="sm"
              onClick={() => setFilter("highlight")}
              className="px-2 py-1 text-xs"
            >
              Highlights
            </Button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className={`text-xs px-1 py-1 rounded ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-300"
            } border`}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="page">Page</option>
          </select>
        </div>
      </div>

      {/* Notes content - scrollable area */}
      <div className="flex-1 overflow-y-auto">
        {/* Post-it notes section */}
        {(filter === "all" || filter === "postit") && (
          <div className="border-b border-gray-700">
            <div
              className="flex items-center justify-between p-2 cursor-pointer"
              onClick={() => toggleSection("postit")}
            >
              <div className="flex items-center gap-1">
                <StickyNote className="w-4 h-4 text-yellow-500" />
                <h3 className="text-sm font-medium">
                  Post-it Notes ({sortedPostItNotes.length})
                </h3>
              </div>
              {expandedSections.postit ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </div>

            {expandedSections.postit && (
              <div className="px-2 pb-2">
                {sortedPostItNotes.length === 0 && (
                  <p className="text-sm text-gray-500 p-2">
                    No post-it notes found
                  </p>
                )}

                {sortedPostItNotes.map((note) => (
                  <div
                    key={note.id}
                    className={`mb-2 p-2 rounded ${
                      isDark
                        ? "bg-gray-800 hover:bg-gray-700"
                        : "bg-gray-100 hover:bg-gray-200"
                    } relative group`}
                  >
                    <div className="flex justify-between items-start">
                      <div
                        className="mb-1 flex items-center gap-1 cursor-pointer"
                        onClick={() =>
                          onJumpToAnnotation(note.pageIndex, note.id)
                        }
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: note.color }}
                        ></div>
                        <span className="text-xs font-medium">
                          Page {note.pageIndex + 1} of {totalPages}
                        </span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() =>
                            startEditing(note.id, note.content, "postit")
                          }
                          className="p-1 rounded hover:bg-gray-600"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={() => onDeletePostItNote(note.id)}
                          className="p-1 rounded hover:bg-gray-600"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {editingNoteId === note.id ? (
                      <div className="mt-1">
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className={`w-full p-2 text-xs rounded mb-1 ${
                            isDark
                              ? "bg-gray-700 border-gray-600"
                              : "bg-white border-gray-300"
                          } border`}
                          rows={3}
                          autoFocus
                        />
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className={`px-2 py-1 text-xs rounded ${
                              isDark
                                ? "bg-gray-700 hover:bg-gray-600"
                                : "bg-gray-200 hover:bg-gray-300"
                            }`}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => saveEditedContent(note.id, "postit")}
                            className="px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          className="text-xs whitespace-pre-wrap mb-1 cursor-pointer"
                          onClick={() =>
                            startEditing(note.id, note.content, "postit")
                          }
                        >
                          {note.content || (
                            <span className="text-gray-500 italic">
                              No content
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(note.updatedAt)}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Highlight notes section */}
        {(filter === "all" || filter === "highlight") && (
          <div>
            <div
              className="flex items-center justify-between p-2 cursor-pointer"
              onClick={() => toggleSection("highlight")}
            >
              <div className="flex items-center gap-1">
                <Highlighter className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-medium">
                  Highlights ({sortedTextHighlights.length})
                </h3>
              </div>
              {expandedSections.highlight ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </div>

            {expandedSections.highlight && (
              <div className="px-2 pb-2">
                {sortedTextHighlights.length === 0 && (
                  <p className="text-sm text-gray-500 p-2">
                    No highlights found
                  </p>
                )}

                {sortedTextHighlights.map((highlight) => (
                  <div
                    key={highlight.id}
                    className={`mb-2 p-2 rounded ${
                      isDark
                        ? "bg-gray-800 hover:bg-gray-700"
                        : "bg-gray-100 hover:bg-gray-200"
                    } relative group`}
                  >
                    <div className="flex justify-between items-start">
                      <div
                        className="mb-1 flex items-center gap-1 cursor-pointer"
                        onClick={() =>
                          onJumpToAnnotation(highlight.pageIndex, highlight.id)
                        }
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: highlight.color.replace(
                              /[\d.]+\)$/,
                              "1)"
                            ),
                          }}
                        ></div>
                        <span className="text-xs font-medium">
                          Page {highlight.pageIndex + 1} of {totalPages}
                        </span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() =>
                            startEditing(
                              highlight.id,
                              highlight.note,
                              "highlight"
                            )
                          }
                          className="p-1 rounded hover:bg-gray-600"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={() => onDeleteHighlight(highlight.id)}
                          className="p-1 rounded hover:bg-gray-600"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    <div
                      className="text-xs whitespace-pre-wrap border-l-2 pl-2 mb-1"
                      style={{
                        borderColor: highlight.color.replace(/[\d.]+\)$/, "1)"),
                      }}
                    >
                      {highlight.content}
                    </div>

                    {editingNoteId === highlight.id ? (
                      <div className="mt-2">
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className={`w-full p-2 text-xs rounded mb-1 ${
                            isDark
                              ? "bg-gray-700 border-gray-600"
                              : "bg-white border-gray-300"
                          } border`}
                          rows={3}
                          autoFocus
                          placeholder="Add note..."
                        />
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className={`px-2 py-1 text-xs rounded ${
                              isDark
                                ? "bg-gray-700 hover:bg-gray-600"
                                : "bg-gray-200 hover:bg-gray-300"
                            }`}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() =>
                              saveEditedContent(highlight.id, "highlight")
                            }
                            className="px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {highlight.note ? (
                          <div className="mt-1 flex items-start gap-1">
                            <MessageSquare
                              size={12}
                              className="flex-shrink-0 mt-0.5 text-gray-500"
                            />
                            <div
                              className="text-xs whitespace-pre-wrap cursor-pointer"
                              onClick={() =>
                                startEditing(
                                  highlight.id,
                                  highlight.note,
                                  "highlight"
                                )
                              }
                            >
                              {highlight.note}
                            </div>
                          </div>
                        ) : (
                          <div
                            className="text-xs text-gray-500 italic mt-1 cursor-pointer"
                            onClick={() =>
                              startEditing(highlight.id, "", "highlight")
                            }
                          >
                            <span className="flex items-center gap-1">
                              <MessageSquare size={12} />
                              Add note...
                            </span>
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(highlight.updatedAt)}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFNotes;
