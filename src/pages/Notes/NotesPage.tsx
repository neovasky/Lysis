import React, { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText, Plus, Pencil, Trash, X, Search } from "lucide-react";

// Note type definition
interface Note {
  id: string;
  title: string;
  content: string;
  lastModified: number;
  tags: string[];
}

const defaultNote: Note = {
  id: "",
  title: "Untitled Note",
  content: "",
  lastModified: Date.now(),
  tags: [],
};

export const NotesPage = () => {
  // State
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem("research_notes");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newTagInput, setNewTagInput] = useState("");

  // Persist notes to localStorage on change
  React.useEffect(() => {
    localStorage.setItem("research_notes", JSON.stringify(notes));
  }, [notes]);

  // Create new note
  const handleCreateNote = () => {
    const newNote: Note = {
      ...defaultNote,
      id: Date.now().toString(),
      lastModified: Date.now(),
    };
    setNotes((prev) => [...prev, newNote]);
    setSelectedNote(newNote);
    setIsEditing(true);
    setPreviewMode(false);
  };

  // Update note
  const handleUpdateNote = useCallback(
    (updates: Partial<Note>) => {
      if (!selectedNote) return;
      const updatedNote = {
        ...selectedNote,
        ...updates,
        lastModified: Date.now(),
      };
      setNotes((prev) =>
        prev.map((note) => (note.id === selectedNote.id ? updatedNote : note))
      );
      setSelectedNote(updatedNote);
    },
    [selectedNote]
  );

  // Delete note
  const handleDeleteNote = (noteId: string) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      setNotes((prev) => prev.filter((note) => note.id !== noteId));
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
        setIsEditing(false);
        setPreviewMode(false);
      }
    }
  };

  // Add tag to note
  const handleAddTag = (noteId: string, tag: string) => {
    if (!tag.trim()) return;
    setNotes((prev) =>
      prev.map((note) => {
        if (note.id === noteId && !note.tags.includes(tag.trim())) {
          return {
            ...note,
            tags: [...note.tags, tag.trim()],
            lastModified: Date.now(),
          };
        }
        return note;
      })
    );
    setNewTagInput("");
  };

  // Remove tag from note
  const handleRemoveTag = (noteId: string, tagToRemove: string) => {
    setNotes((prev) =>
      prev.map((note) => {
        if (note.id === noteId) {
          return {
            ...note,
            tags: note.tags.filter((tag) => tag !== tagToRemove),
            lastModified: Date.now(),
          };
        }
        return note;
      })
    );
  };

  // Filter notes based on search query
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="bg-white shadow rounded p-6 mb-6">
        <h2 className="text-xl font-bold mb-2">Research Notes</h2>
        <p className="text-gray-600 text-sm">
          Create and manage your investment research notes
        </p>
      </div>

      <div className="flex gap-4 h-[calc(100vh-200px)]">
        {/* Notes List Panel */}
        <div className="bg-white shadow rounded w-72 flex flex-col">
          <div className="p-4 flex flex-col gap-3">
            {/* Search and New Note */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <button
                onClick={handleCreateNote}
                className="flex items-center gap-1 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
              >
                <Plus className="w-4 h-4" /> New
              </button>
            </div>

            {/* Notes List */}
            <div
              className="overflow-y-auto"
              style={{ height: "calc(100vh - 280px)" }}
            >
              <div className="flex flex-col gap-2">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-2 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                      selectedNote?.id === note.id ? "bg-blue-100" : ""
                    }`}
                    onClick={() => {
                      setSelectedNote(note);
                      setIsEditing(false);
                      setPreviewMode(false);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-bold">{note.title}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(note.lastModified)}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {note.tags.map((tag) => (
                            <span
                              key={tag}
                              className="bg-gray-200 text-xs px-2 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Note Editor/Viewer Panel */}
        <div className="flex-1 bg-white shadow rounded p-6">
          {selectedNote ? (
            <div className="flex flex-col gap-3 h-full">
              <div className="flex justify-between items-center">
                {isEditing ? (
                  <input
                    type="text"
                    value={selectedNote.title}
                    onChange={(e) =>
                      handleUpdateNote({ title: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded px-2 py-1 text-lg font-bold"
                  />
                ) : (
                  <h2 className="text-lg font-bold">{selectedNote.title}</h2>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(!isEditing);
                      if (isEditing) setPreviewMode(false);
                    }}
                    className="flex items-center gap-1 border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    {isEditing ? (
                      <>
                        <X className="w-4 h-4" /> Cancel
                      </>
                    ) : (
                      <>
                        <Pencil className="w-4 h-4" /> Edit
                      </>
                    )}
                  </button>
                  {isEditing && (
                    <button
                      onClick={() => setPreviewMode((prev) => !prev)}
                      className="flex items-center gap-1 border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      {previewMode ? "Edit Mode" : "Preview Mode"}
                    </button>
                  )}
                </div>
              </div>

              {/* Tags Section */}
              <div className="flex flex-wrap gap-2 items-center">
                {selectedNote.tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center bg-gray-200 text-xs px-2 py-0.5 rounded"
                  >
                    {tag}
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveTag(selectedNote.id, tag)}
                        className="ml-1 text-red-500 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      placeholder="Add tag..."
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag(selectedNote.id, newTagInput);
                        }
                      }}
                      className="border border-gray-300 rounded px-2 py-1 text-xs"
                    />
                    <button
                      onClick={() => handleAddTag(selectedNote.id, newTagInput)}
                      className="border border-gray-300 rounded px-2 py-1 text-xs"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                {isEditing ? (
                  previewMode ? (
                    <div className="overflow-auto h-full p-3 border border-gray-300 rounded">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {selectedNote.content || "Nothing to preview."}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <textarea
                      value={selectedNote.content}
                      onChange={(e) =>
                        handleUpdateNote({ content: e.target.value })
                      }
                      className="w-full h-full p-3 border border-gray-300 rounded resize-none text-sm"
                    />
                  )
                ) : (
                  <div className="overflow-auto h-full p-3 border border-gray-300 rounded whitespace-pre-wrap">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {selectedNote.content || "No content yet..."}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <FileText className="w-12 h-12 text-gray-500" />
              <p className="text-gray-600 text-lg">
                Select a note or create a new one
              </p>
              <button
                onClick={handleCreateNote}
                className="flex items-center gap-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                <Plus className="w-4 h-4" /> Create New Note
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesPage;
