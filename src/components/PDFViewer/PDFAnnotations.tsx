import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTheme } from "@/theme/hooks/useTheme";
import {
  StickyNote,
  X,
  Edit3,
  Trash2,
  Check,
  MessageSquare,
} from "lucide-react";

// PostIt note interface
export interface PostItNote {
  id: string;
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  color: string;
  minimized: boolean;
  createdAt: number;
  updatedAt: number;
}

// Text highlight interface
export interface TextHighlight {
  id: string;
  pageIndex: number;
  rects: { x: number; y: number; width: number; height: number }[];
  content: string; // The highlighted text
  note: string; // Optional note attached to the highlight
  color: string;
  createdAt: number;
  updatedAt: number;
}

// Props for the annotation manager component
interface PDFAnnotationsProps {
  pdfContainerRef: React.RefObject<HTMLDivElement>;
  currentPage: number;
  scale: number;
  onAnnotationUpdate?: (annotations: {
    postItNotes: PostItNote[];
    textHighlights: TextHighlight[];
  }) => void;
  isAddingPostIt?: boolean;
  isAddingTextHighlight?: boolean;
}

// Available post-it note colors
const POST_IT_COLORS = [
  "#ffeb3b", // Yellow
  "#ff9800", // Orange
  "#e91e63", // Pink
  "#2196f3", // Blue
  "#4caf50", // Green
];

// Available highlight colors
const HIGHLIGHT_COLORS = [
  "rgba(255, 235, 59, 0.3)", // Yellow
  "rgba(255, 152, 0, 0.3)", // Orange
  "rgba(233, 30, 99, 0.3)", // Pink
  "rgba(33, 150, 243, 0.3)", // Blue
  "rgba(76, 175, 80, 0.3)", // Green
];

const PDFAnnotations: React.FC<PDFAnnotationsProps> = ({
  pdfContainerRef,
  currentPage,
  scale,
  onAnnotationUpdate,
  isAddingPostIt = false,
  isAddingTextHighlight = false,
}) => {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  // State for post-it notes and text highlights
  const [postItNotes, setPostItNotes] = useState<PostItNote[]>([]);
  const [textHighlights, setTextHighlights] = useState<TextHighlight[]>([]);
  const [isAddingPostItState, setIsAddingPostIt] = useState(isAddingPostIt);
  const [selectedPostIt, setSelectedPostIt] = useState<string | null>(null);
  const [editingPostItId, setEditingPostItId] = useState<string | null>(null);
  const [selectedColor] = useState(POST_IT_COLORS[0]);
  const [isAddingTextHighlightState, setIsAddingTextHighlight] = useState(
    isAddingTextHighlight
  );
  const [selectedHighlight, setSelectedHighlight] = useState<string | null>(
    null
  );
  const [newNoteContent, setNewNoteContent] = useState("");
  const [highlightColor, setHighlightColor] = useState(HIGHLIGHT_COLORS[0]);
  const [editingHighlightId, setEditingHighlightId] = useState<string | null>(
    null
  );
  const [showHighlightToolbar, setShowHighlightToolbar] = useState(false);
  const [highlightToolbarPosition, setHighlightToolbarPosition] = useState({
    x: 0,
    y: 0,
  });

  // Update internal state when props change
  useEffect(() => {
    setIsAddingPostIt(isAddingPostIt);
  }, [isAddingPostIt]);

  useEffect(() => {
    setIsAddingTextHighlight(isAddingTextHighlight);
  }, [isAddingTextHighlight]);

  // References
  const postItDragRef = useRef<{
    isDragging: boolean;
    offsetX: number;
    offsetY: number;
  }>({
    isDragging: false,
    offsetX: 0,
    offsetY: 0,
  });

  const pdfAnnotationsRef = useRef<HTMLDivElement>(null);

  // Check parent props
  useEffect(() => {
    if (onAnnotationUpdate) {
      onAnnotationUpdate({ postItNotes, textHighlights });
    }
  }, [postItNotes, textHighlights, onAnnotationUpdate]);

  // Load annotations from localStorage on component mount
  useEffect(() => {
    const savedPostIts = localStorage.getItem("pdf-post-it-notes");
    const savedHighlights = localStorage.getItem("pdf-text-highlights");

    if (savedPostIts) {
      try {
        setPostItNotes(JSON.parse(savedPostIts));
      } catch (error) {
        console.error("Error loading post-it notes:", error);
      }
    }

    if (savedHighlights) {
      try {
        setTextHighlights(JSON.parse(savedHighlights));
      } catch (error) {
        console.error("Error loading text highlights:", error);
      }
    }
  }, []);

  // Save annotations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("pdf-post-it-notes", JSON.stringify(postItNotes));
  }, [postItNotes]);

  useEffect(() => {
    localStorage.setItem("pdf-text-highlights", JSON.stringify(textHighlights));
  }, [textHighlights]);

  // Handle text selection for highlighting
  useEffect(() => {
    if (!isAddingTextHighlightState || !pdfContainerRef.current) return;

    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        setShowHighlightToolbar(false);
        return;
      }

      // Get the current page element
      const currentPageElement = pdfContainerRef.current?.querySelector(
        `[data-page-index="${currentPage - 1}"]`
      );

      if (!currentPageElement) return;

      // Check if selection is within the current page
      let isWithinPage = false;
      for (let i = 0; i < selection.rangeCount; i++) {
        const range = selection.getRangeAt(i);
        if (currentPageElement.contains(range.commonAncestorContainer)) {
          isWithinPage = true;
          break;
        }
      }

      if (!isWithinPage) {
        setShowHighlightToolbar(false);
        return;
      }

      // Calculate position for the toolbar
      const rect = selection.getRangeAt(0).getBoundingClientRect();
      const pageRect = currentPageElement.getBoundingClientRect();

      setHighlightToolbarPosition({
        x: rect.left + rect.width / 2 - pageRect.left,
        y: rect.top - pageRect.top - 40, // Position above the selection
      });

      setShowHighlightToolbar(true);
    };

    document.addEventListener("selectionchange", handleSelection);
    return () =>
      document.removeEventListener("selectionchange", handleSelection);
  }, [isAddingTextHighlightState, currentPage, pdfContainerRef]);

  // Create a new post-it note
  const createPostIt = (event: React.MouseEvent) => {
    if (!pdfContainerRef.current) return;

    // Find which page we're on
    const pageElement = pdfContainerRef.current.querySelector(
      `[data-page-index="${currentPage - 1}"]`
    ) as HTMLDivElement | null;

    if (!pageElement) return;

    const rect = pageElement.getBoundingClientRect();
    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;

    const timestamp = Date.now();
    const newPostIt: PostItNote = {
      id: `postit-${timestamp}`,
      pageIndex: currentPage - 1,
      x,
      y,
      width: 200,
      height: 150,
      content: "",
      color: selectedColor,
      minimized: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setPostItNotes((prev) => [...prev, newPostIt]);
    setEditingPostItId(newPostIt.id);
    setIsAddingPostIt(false);
  };

  // Delete a post-it note
  const deletePostIt = (id: string) => {
    setPostItNotes((prev) => prev.filter((note) => note.id !== id));
    setSelectedPostIt(null);
    setEditingPostItId(null);
  };

  // Toggle a post-it note's minimized state
  const toggleMinimize = (id: string) => {
    setPostItNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? { ...note, minimized: !note.minimized, updatedAt: Date.now() }
          : note
      )
    );
  };

  // Start editing a post-it note
  const startEditing = (id: string) => {
    setEditingPostItId(id);
  };

  // Save edited post-it note content
  const savePostItContent = (id: string, content: string) => {
    setPostItNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, content, updatedAt: Date.now() } : note
      )
    );
    setEditingPostItId(null);
  };

  // Handle post-it note drag start
  const handlePostItDragStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (editingPostItId === id) return;

    const note = postItNotes.find((n) => n.id === id);
    if (!note) return;

    const postItElement = document.getElementById(id);
    if (!postItElement) return;

    const rect = postItElement.getBoundingClientRect();

    postItDragRef.current = {
      isDragging: true,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };

    setSelectedPostIt(id);

    // Add mousemove and mouseup event listeners
    document.addEventListener("mousemove", handlePostItDragMove);
    document.addEventListener("mouseup", handlePostItDragEnd);
  };

  // Handle post-it note drag move
  const handlePostItDragMove = useCallback(
    (e: MouseEvent) => {
      if (
        !postItDragRef.current.isDragging ||
        !selectedPostIt ||
        !pdfContainerRef.current
      )
        return;

      const pageElement = pdfContainerRef.current.querySelector(
        `[data-page-index="${currentPage - 1}"]`
      );
      if (!pageElement) return;

      const containerRect = pageElement.getBoundingClientRect();

      // Calculate new position relative to the PDF page
      const x =
        (e.clientX - containerRect.left - postItDragRef.current.offsetX) /
        scale;
      const y =
        (e.clientY - containerRect.top - postItDragRef.current.offsetY) / scale;

      // Update post-it position
      setPostItNotes((prev) =>
        prev.map((note) =>
          note.id === selectedPostIt
            ? { ...note, x, y, updatedAt: Date.now() }
            : note
        )
      );
    },
    [currentPage, pdfContainerRef, scale, selectedPostIt]
  );

  // Handle post-it note drag end
  const handlePostItDragEnd = useCallback(() => {
    postItDragRef.current.isDragging = false;

    // Remove event listeners
    document.removeEventListener("mousemove", handlePostItDragMove);
    document.removeEventListener("mouseup", handlePostItDragEnd);
  }, [handlePostItDragMove]);

  // Create a new text highlight
  const createTextHighlight = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed)
      return;

    // Get all the client rects of the selection
    const rects: { x: number; y: number; width: number; height: number }[] = [];
    for (let i = 0; i < selection.rangeCount; i++) {
      const clientRects = selection.getRangeAt(i).getClientRects();

      for (let j = 0; j < clientRects.length; j++) {
        const clientRect = clientRects[j];

        // Convert client rect coordinates to be relative to the PDF page
        if (pdfContainerRef.current) {
          const pageElement = pdfContainerRef.current.querySelector(
            `[data-page-index="${currentPage - 1}"]`
          );
          if (pageElement) {
            const pageRect = pageElement.getBoundingClientRect();

            rects.push({
              x: (clientRect.left - pageRect.left) / scale,
              y: (clientRect.top - pageRect.top) / scale,
              width: clientRect.width / scale,
              height: clientRect.height / scale,
            });
          }
        }
      }
    }

    const timestamp = Date.now();
    // Create new highlight
    const newHighlight: TextHighlight = {
      id: `highlight-${timestamp}`,
      pageIndex: currentPage - 1,
      rects,
      content: selection.toString(),
      note: "",
      color: highlightColor,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setTextHighlights((prev) => [...prev, newHighlight]);
    setSelectedHighlight(newHighlight.id);
    setNewNoteContent("");
    setEditingHighlightId(newHighlight.id); // Automatically open note editor for new highlights

    // Clear the selection and hide the toolbar
    selection.removeAllRanges();
    setShowHighlightToolbar(false);
  }, [currentPage, highlightColor, pdfContainerRef, scale]);

  // Save a note to a text highlight
  const saveHighlightNote = (id: string, note: string) => {
    setTextHighlights((prev) =>
      prev.map((highlight) =>
        highlight.id === id
          ? { ...highlight, note, updatedAt: Date.now() }
          : highlight
      )
    );
    setEditingHighlightId(null);
  };

  // Delete a text highlight
  const deleteHighlight = (id: string) => {
    setTextHighlights((prev) =>
      prev.filter((highlight) => highlight.id !== id)
    );
    setSelectedHighlight(null);
    setEditingHighlightId(null);
  };

  // Render post-it notes for the current page
  const renderPostItNotes = () => {
    return postItNotes
      .filter((note) => note.pageIndex === currentPage - 1)
      .map((note) => (
        <div
          id={note.id}
          key={note.id}
          className="absolute shadow-md transition-all"
          style={{
            left: `${note.x * scale}px`,
            top: `${note.y * scale}px`,
            width: note.minimized ? "30px" : `${note.width * scale}px`,
            height: note.minimized ? "30px" : `${note.height * scale}px`,
            backgroundColor: note.color,
            borderRadius: "4px",
            zIndex: selectedPostIt === note.id ? 1000 : 999,
            transform: selectedPostIt === note.id ? "scale(1.02)" : "scale(1)",
            cursor: editingPostItId === note.id ? "default" : "move",
          }}
          onMouseDown={(e) => handlePostItDragStart(e, note.id)}
        >
          {note.minimized ? (
            <div
              className="w-full h-full flex items-center justify-center"
              onClick={() => toggleMinimize(note.id)}
            >
              <StickyNote size={16} />
            </div>
          ) : (
            <>
              <div
                className="flex justify-between items-center p-1 border-b"
                style={{ backgroundColor: `${note.color}dd` }}
              >
                <div className="flex gap-1">
                  {editingPostItId !== note.id && (
                    <button
                      className="p-1 rounded hover:bg-white/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(note.id);
                      }}
                    >
                      <Edit3 size={14} />
                    </button>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    className="p-1 rounded hover:bg-white/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMinimize(note.id);
                    }}
                  >
                    <X size={14} />
                  </button>
                  <button
                    className="p-1 rounded hover:bg-white/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePostIt(note.id);
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="p-2 h-[calc(100%-28px)] overflow-auto">
                {editingPostItId === note.id ? (
                  <div className="flex flex-col h-full">
                    <textarea
                      className="w-full h-full flex-1 p-1 resize-none bg-transparent"
                      style={{ color: "black", outline: "none" }}
                      value={note.content}
                      onChange={(e) => {
                        const updatedContent = e.target.value;
                        setPostItNotes((prev) =>
                          prev.map((n) =>
                            n.id === note.id
                              ? { ...n, content: updatedContent }
                              : n
                          )
                        );
                      }}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      placeholder="Add note..."
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        className="px-2 py-1 rounded bg-white/30 text-black text-xs flex items-center gap-1 hover:bg-white/40"
                        onClick={(e) => {
                          e.stopPropagation();
                          savePostItContent(note.id, note.content);
                        }}
                      >
                        <Check size={12} />
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="whitespace-pre-wrap text-black text-sm"
                    style={{ wordBreak: "break-word" }}
                    onClick={() => startEditing(note.id)}
                  >
                    {note.content || (
                      <span className="opacity-50">Add note...</span>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ));
  };

  // Render text highlights for the current page
  const renderTextHighlights = () => {
    return textHighlights
      .filter((highlight) => highlight.pageIndex === currentPage - 1)
      .map((highlight) => (
        <React.Fragment key={highlight.id}>
          {/* Render highlight rectangles */}
          {highlight.rects.map((rect, i) => (
            <div
              key={`${highlight.id}-${i}`}
              className="absolute"
              style={{
                left: `${rect.x * scale}px`,
                top: `${rect.y * scale}px`,
                width: `${rect.width * scale}px`,
                height: `${rect.height * scale}px`,
                backgroundColor: highlight.color,
                pointerEvents: "all",
                cursor: "pointer",
                zIndex: 998,
                borderRadius: "2px",
              }}
              onClick={() => {
                if (selectedHighlight === highlight.id) {
                  setSelectedHighlight(null);
                  setEditingHighlightId(null);
                } else {
                  setSelectedHighlight(highlight.id);
                  setNewNoteContent(highlight.note);
                }
              }}
            />
          ))}

          {/* Render note popup if highlight is selected */}
          {selectedHighlight === highlight.id && highlight.rects.length > 0 && (
            <div
              className={`absolute p-3 rounded shadow-lg z-[1001] ${
                isDark ? "bg-gray-800 text-white" : "bg-white text-black"
              }`}
              style={{
                left: `${highlight.rects[0].x * scale}px`,
                top: `${
                  (highlight.rects[0].y + highlight.rects[0].height) * scale + 8
                }px`,
                minWidth: "200px",
                maxWidth: "300px",
              }}
            >
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-sm flex items-center gap-1">
                    <MessageSquare size={14} />
                    Highlight Note
                  </h4>
                  <button
                    className="p-1 rounded hover:bg-gray-200"
                    onClick={() => {
                      setSelectedHighlight(null);
                      setEditingHighlightId(null);
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="bg-yellow-100 text-black p-2 rounded text-xs">
                  {highlight.content}
                </div>
                {editingHighlightId === highlight.id ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      className={`w-full p-2 rounded border ${
                        isDark
                          ? "bg-gray-700 border-gray-600"
                          : "bg-white border-gray-300"
                      }`}
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      rows={3}
                      placeholder="Add a note..."
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        className={`px-2 py-1 rounded text-xs ${
                          isDark
                            ? "bg-gray-700 hover:bg-gray-600"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                        onClick={() => {
                          setEditingHighlightId(null);
                          setNewNoteContent(highlight.note);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-2 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-600"
                        onClick={() =>
                          saveHighlightNote(highlight.id, newNoteContent)
                        }
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {highlight.note ? (
                      <p className="text-sm">{highlight.note}</p>
                    ) : (
                      <p className="text-sm text-gray-500">No note added</p>
                    )}
                    <div className="flex justify-end gap-2">
                      <button
                        className="px-2 py-1 rounded bg-blue-500 text-white text-xs hover:bg-blue-600"
                        onClick={() => {
                          setEditingHighlightId(highlight.id);
                          setNewNoteContent(highlight.note);
                        }}
                      >
                        {highlight.note ? "Edit Note" : "Add Note"}
                      </button>
                      <button
                        className="px-2 py-1 rounded bg-red-500 text-white text-xs hover:bg-red-600"
                        onClick={() => deleteHighlight(highlight.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </React.Fragment>
      ));
  };

  // Render the highlight toolbar
  const renderHighlightToolbar = () => {
    if (!showHighlightToolbar) return null;

    return (
      <div
        className={`absolute z-[1001] rounded shadow-lg ${
          isDark ? "bg-gray-800" : "bg-white"
        }`}
        style={{
          left: `${highlightToolbarPosition.x}px`,
          top: `${highlightToolbarPosition.y}px`,
          transform: "translateX(-50%)",
        }}
      >
        <div className="flex items-center p-1">
          <div className="flex gap-1 mr-2">
            {HIGHLIGHT_COLORS.map((color, index) => (
              <button
                key={index}
                className={`w-4 h-4 rounded-full ${
                  highlightColor === color ? "ring-2 ring-offset-1" : ""
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setHighlightColor(color)}
              />
            ))}
          </div>
          <button
            className={`px-2 py-1 text-xs rounded ${
              isDark
                ? "bg-blue-700 text-white hover:bg-blue-600"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            onClick={createTextHighlight}
          >
            Highlight
          </button>
        </div>
      </div>
    );
  };

  const pdfContainerParent = pdfContainerRef.current;

  // Only render the annotations container if we have a parent container to position within
  if (!pdfContainerParent) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      ref={pdfAnnotationsRef}
    >
      {/* Container for rendering annotations on top of PDF */}
      <div
        className={`absolute inset-0 ${
          isAddingPostItState ? "pointer-events-auto" : "pointer-events-none"
        }`}
        onClick={(e) => {
          if (isAddingPostItState) {
            createPostIt(e);
          }
        }}
        style={{ cursor: isAddingPostItState ? "crosshair" : "default" }}
      >
        {/* Post-it notes */}
        <div className="pointer-events-auto z-[999]">{renderPostItNotes()}</div>

        {/* Text highlights */}
        <div className="pointer-events-auto z-[998]">
          {renderTextHighlights()}
        </div>

        {/* Highlight toolbar */}
        <div className="pointer-events-auto z-[1001]">
          {renderHighlightToolbar()}
        </div>
      </div>
    </div>
  );
};

export default PDFAnnotations;
