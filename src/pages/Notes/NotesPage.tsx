import React, { useState, useCallback } from "react";
import {
  Box,
  Card,
  Text,
  Heading,
  Button,
  TextArea,
  Flex,
  IconButton,
  Badge,
  ScrollArea,
} from "@radix-ui/themes";
import {
  FileTextIcon,
  PlusIcon,
  Pencil2Icon,
  TrashIcon,
  Cross2Icon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [newTagInput, setNewTagInput] = useState("");

  // Save notes to localStorage whenever they change
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
      }
    }
  };

  // Add tag to note
  const handleAddTag = (noteId: string, tag: string) => {
    if (!tag.trim()) return;
    setNotes((prev) =>
      prev.map((note) => {
        if (note.id === noteId && !note.tags.includes(tag)) {
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

  // Format date
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
    <Box p="4">
      {/* Header Card */}
      <Card size="3" style={{ marginBottom: "24px" }}>
        <Heading size="5" weight="bold" mb="2">
          Research Notes
        </Heading>
        <Text color="gray" size="2">
          Create and manage your investment research notes
        </Text>
      </Card>

      <Flex gap="4" style={{ height: "calc(100vh - 200px)" }}>
        {/* Notes List Panel */}
        <Card style={{ width: "300px" }}>
          <Flex direction="column" gap="3">
            {/* Search and New Note */}
            <Flex gap="2">
              <Box style={{ position: "relative", flex: 1 }}>
                <MagnifyingGlassIcon
                  style={{
                    position: "absolute",
                    left: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--gray-9)",
                  }}
                />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 8px 8px 32px",
                    border: "1px solid var(--gray-5)",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                />
              </Box>
              <Button onClick={handleCreateNote}>
                <PlusIcon /> New
              </Button>
            </Flex>

            {/* Notes List */}
            <ScrollArea style={{ height: "calc(100vh - 280px)" }}>
              <Flex direction="column" gap="2">
                {filteredNotes.map((note) => (
                  <Card
                    key={note.id}
                    style={{
                      cursor: "pointer",
                      backgroundColor:
                        selectedNote?.id === note.id
                          ? "var(--accent-3)"
                          : undefined,
                    }}
                    onClick={() => {
                      setSelectedNote(note);
                      setIsEditing(false);
                    }}
                  >
                    <Flex justify="between" align="start">
                      <Box style={{ flex: 1 }}>
                        <Text weight="bold">{note.title}</Text>
                        <Text size="1" color="gray">
                          {formatDate(note.lastModified)}
                        </Text>
                        <Flex gap="1" mt="1" style={{ flexWrap: "wrap" }}>
                          {note.tags.map((tag) => (
                            <Badge key={tag} size="1">
                              {tag}
                            </Badge>
                          ))}
                        </Flex>
                      </Box>
                      <IconButton
                        size="1"
                        variant="ghost"
                        color="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }}
                      >
                        <TrashIcon />
                      </IconButton>
                    </Flex>
                  </Card>
                ))}
              </Flex>
            </ScrollArea>
          </Flex>
        </Card>

        {/* Note Editor/Viewer Panel */}
        <Card style={{ flex: 1 }}>
          {selectedNote ? (
            <Flex direction="column" gap="3" style={{ height: "100%" }}>
              <Flex justify="between" align="center">
                {isEditing ? (
                  <input
                    type="text"
                    value={selectedNote.title}
                    onChange={(e) =>
                      handleUpdateNote({ title: e.target.value })
                    }
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      padding: "4px 8px",
                      border: "1px solid var(--gray-5)",
                      borderRadius: "4px",
                      width: "100%",
                    }}
                  />
                ) : (
                  <Heading size="4">{selectedNote.title}</Heading>
                )}
                <Flex gap="2">
                  <Button
                    variant={isEditing ? "solid" : "outline"}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? (
                      <>
                        <Cross2Icon /> Cancel
                      </>
                    ) : (
                      <>
                        <Pencil2Icon /> Edit
                      </>
                    )}
                  </Button>
                </Flex>
              </Flex>

              {/* Tags Section */}
              <Flex gap="2" align="center" style={{ flexWrap: "wrap" }}>
                {selectedNote.tags.map((tag) => (
                  <Badge key={tag}>
                    {tag}
                    {isEditing && (
                      <Button
                        size="1"
                        variant="ghost"
                        onClick={() => handleRemoveTag(selectedNote.id, tag)}
                        style={{ marginLeft: "4px", padding: "0" }}
                      >
                        <Cross2Icon />
                      </Button>
                    )}
                  </Badge>
                ))}
                {isEditing && (
                  <Flex gap="2" align="center">
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      placeholder="Add tag..."
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleAddTag(selectedNote.id, newTagInput);
                        }
                      }}
                      style={{
                        padding: "4px 8px",
                        border: "1px solid var(--gray-5)",
                        borderRadius: "4px",
                        fontSize: "14px",
                      }}
                    />
                    <Button
                      size="1"
                      onClick={() => handleAddTag(selectedNote.id, newTagInput)}
                    >
                      Add
                    </Button>
                  </Flex>
                )}
              </Flex>

              {/* Content */}
              <Box style={{ flex: 1 }}>
                {isEditing ? (
                  <TextArea
                    value={selectedNote.content}
                    onChange={(e) =>
                      handleUpdateNote({ content: e.target.value })
                    }
                    style={{
                      height: "100%",
                      resize: "none",
                      padding: "12px",
                      fontSize: "14px",
                      lineHeight: "1.5",
                    }}
                  />
                ) : (
                  <ScrollArea style={{ height: "100%" }}>
                    <Box p="3" style={{ whiteSpace: "pre-wrap" }}>
                      {selectedNote.content || "No content yet..."}
                    </Box>
                  </ScrollArea>
                )}
              </Box>
            </Flex>
          ) : (
            <Flex
              direction="column"
              align="center"
              justify="center"
              gap="4"
              style={{ height: "100%" }}
            >
              <FileTextIcon
                width={48}
                height={48}
                style={{ color: "var(--gray-8)" }}
              />
              <Text size="3" color="gray">
                Select a note or create a new one
              </Text>
              <Button onClick={handleCreateNote}>
                <PlusIcon /> Create New Note
              </Button>
            </Flex>
          )}
        </Card>
      </Flex>
    </Box>
  );
};

export default NotesPage;
