/**
 * File: src/store/slices/fileSlice.ts
 * Description: Redux slice for managing files and their relationships
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// File types that can be handled
export type FileType = "pdf" | "excel" | "word" | "text" | "other";

// Relationship types between files
export type RelationType = "reference" | "source" | "derivative" | "annotation";

// File metadata interface
export interface FileMetadata {
  id: string;
  name: string;
  type: FileType;
  path: string;
  lastModified: number;
  size: number;
  tags: string[];
  notes?: string;
}

// File relationship interface
export interface FileRelationship {
  id: string;
  sourceFileId: string;
  targetFileId: string;
  type: RelationType;
  description?: string;
  createdAt: number;
}

// File version interface
export interface FileVersion {
  id: string;
  fileId: string;
  version: number;
  path: string;
  createdAt: number;
  changes: string;
}

// File state interface
interface FileState {
  files: Record<string, FileMetadata>;
  relationships: FileRelationship[];
  versions: Record<string, FileVersion[]>;
  loading: boolean;
  error: string | null;
  selectedFileId: string | null;
}

// Initial state
const initialState: FileState = {
  files: {},
  relationships: [],
  versions: {},
  loading: false,
  error: null,
  selectedFileId: null,
};

// Create the slice
const fileSlice = createSlice({
  name: "files",
  initialState,
  reducers: {
    // Add a new file
    addFile(state: FileState, action: PayloadAction<FileMetadata>) {
      state.files[action.payload.id] = action.payload;
    },

    // Update file metadata
    updateFile(
      state: FileState,
      action: PayloadAction<{ id: string; updates: Partial<FileMetadata> }>
    ) {
      const { id, updates } = action.payload;
      if (state.files[id]) {
        state.files[id] = { ...state.files[id], ...updates };
      }
    },

    // Remove a file
    removeFile(state: FileState, action: PayloadAction<string>) {
      const fileId = action.payload;
      delete state.files[fileId];
      state.relationships = state.relationships.filter(
        (rel: FileRelationship) =>
          rel.sourceFileId !== fileId && rel.targetFileId !== fileId
      );
      delete state.versions[fileId];
    },

    // Add a relationship between files
    addRelationship(state: FileState, action: PayloadAction<FileRelationship>) {
      state.relationships.push(action.payload);
    },

    // Remove a relationship
    removeRelationship(state: FileState, action: PayloadAction<string>) {
      state.relationships = state.relationships.filter(
        (rel: FileRelationship) => rel.id !== action.payload
      );
    },

    // Add a new version of a file
    addVersion(state: FileState, action: PayloadAction<FileVersion>) {
      const { fileId } = action.payload;
      if (!state.versions[fileId]) {
        state.versions[fileId] = [];
      }
      state.versions[fileId].push(action.payload);
    },

    // Set selected file
    setSelectedFile(state: FileState, action: PayloadAction<string | null>) {
      state.selectedFileId = action.payload;
    },

    // Set loading state
    setLoading(state: FileState, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },

    // Set error state
    setError(state: FileState, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },

    // Update file tags
    updateFileTags(
      state: FileState,
      action: PayloadAction<{ fileId: string; tags: string[] }>
    ) {
      const { fileId, tags } = action.payload;
      if (state.files[fileId]) {
        state.files[fileId].tags = tags;
      }
    },

    // Add note to file
    addFileNote(
      state: FileState,
      action: PayloadAction<{ fileId: string; note: string }>
    ) {
      const { fileId, note } = action.payload;
      if (state.files[fileId]) {
        state.files[fileId].notes = note;
      }
    },
  },
});

// Export actions
export const {
  addFile,
  updateFile,
  removeFile,
  addRelationship,
  removeRelationship,
  addVersion,
  setSelectedFile,
  setLoading,
  setError,
  updateFileTags,
  addFileNote,
} = fileSlice.actions;

// Export reducer
export default fileSlice.reducer;

// Selectors
export const selectAllFiles = (state: { files: FileState }) =>
  Object.values(state.files.files);
export const selectFileById = (state: { files: FileState }, id: string) =>
  state.files.files[id];
export const selectFileRelationships = (state: { files: FileState }) =>
  state.files.relationships;
export const selectFileVersions = (
  state: { files: FileState },
  fileId: string
) => state.files.versions[fileId] || [];
export const selectSelectedFile = (state: { files: FileState }) => {
  const { selectedFileId, files } = state.files;
  return selectedFileId ? files[selectedFileId] : null;
};
