/**
 * File: src/components/PDFViewer/types.ts
 * Description: Type definitions for PDF annotations
 */

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
export interface PDFAnnotationsProps {
  postItNotes: PostItNote[];
  textHighlights: TextHighlight[];
  annotationMode: "none" | "postit" | "highlight";
  pageRefs: Record<number, HTMLDivElement | null>;
  scale: number;
  currentPage: number;
  renderedPages: number[];
  onAnnotationsChange: (annotations: {
    postItNotes: PostItNote[];
    textHighlights: TextHighlight[];
  }) => void;
}

// Props for the PDF notes sidebar component
export interface PDFNotesProps {
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
