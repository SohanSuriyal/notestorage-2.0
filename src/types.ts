export type NavPage = 'dashboard' | 'subjects' | 'notes' | 'recent' | 'favorites' | 'settings';

export type DrawingTool = 'pen' | 'highlighter' | 'eraser';
export type EraserType = 'stroke-eraser' | 'eraser';

export interface DrawingPoint {
  x: number;
  y: number;
}

export interface DrawingStroke {
  id: string;
  tool: DrawingTool;
  eraserType?: EraserType;
  color: string;
  size: number;
  points: DrawingPoint[];
}

export interface PdfDocumentPage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

export interface PdfDocumentData {
  fileName: string;
  fileSize: number;
  totalPages: number;
  pages: PdfDocumentPage[];
  uploadedAt?: number;
}

export interface NoteItem {
  id: string;
  title: string;
  subject: string;
  topic: string;
  content: string; // rich text HTML or free text
  strokes: DrawingStroke[];
  created: number;
  updated: number;
  favorite: boolean;
  type: 'written' | 'pdf' | 'image';
  fileName?: string;
  fileDataUrl?: string;
  pdfData?: PdfDocumentData;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  compact: boolean;
  animations: boolean;
  defaultView: 'grid' | 'list';
  defaultSort: 'recent' | 'name' | 'name-desc';
  rememberLastSubject: boolean;
  confirmDelete: boolean;
  lastSubject: string;
}
