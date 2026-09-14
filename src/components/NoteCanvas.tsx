import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  DrawingStroke,
  DrawingTool,
  EraserType,
  DrawingPoint,
  PdfDocumentData,
} from '../types';
import {
  FileText,
  Upload,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Trash2,
  PenTool,
  Check,
} from 'lucide-react';
import { renderPdfPages, createSamplePdfData } from '../utils/pdfLoader';

interface NoteCanvasProps {
  contentHtml: string;
  onContentChange: (newHtml: string) => void;
  strokes: DrawingStroke[];
  onStrokesChange: (newStrokes: DrawingStroke[]) => void;
  isDrawingMode: boolean;
  onToggleDrawing?: () => void;
  currentTool: DrawingTool;
  eraserType: EraserType;
  thickness: number;
  color: string;
  pdfData?: PdfDocumentData;
  onPdfDataChange?: (newPdf: PdfDocumentData | undefined) => void;
  darkMode?: boolean;
}

export const NoteCanvas: React.FC<NoteCanvasProps> = ({
  contentHtml,
  onContentChange,
  strokes,
  onStrokesChange,
  isDrawingMode,
  onToggleDrawing,
  currentTool,
  eraserType,
  thickness,
  color,
  pdfData,
  onPdfDataChange,
  darkMode = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPointerDown, setIsPointerDown] = useState(false);
  const currentStrokeRef = useRef<DrawingStroke | null>(null);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);

  // PDF Viewer state
  const [pdfZoom, setPdfZoom] = useState<number>(100);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);
  const [pdfProgress, setPdfProgress] = useState<{ current: number; total: number } | null>(null);

  // Redraw all strokes onto canvas
  const redrawAllStrokes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    strokes.forEach((stroke) => {
      if (!stroke.points || stroke.points.length === 0) return;

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.tool === 'highlighter') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
        ctx.globalAlpha = 0.32;
        ctx.lineWidth = Math.max(stroke.size * 3, 14);
      } else if (stroke.tool === 'pen') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = stroke.color;
        ctx.globalAlpha = 1.0;
        ctx.lineWidth = stroke.size;
      }

      const pts = stroke.points;
      if (pts.length === 1) {
        ctx.beginPath();
        ctx.arc(pts[0].x, pts[0].y, stroke.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = stroke.color;
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);

        for (let i = 1; i < pts.length - 1; i++) {
          const xc = (pts[i].x + pts[i + 1].x) / 2;
          const yc = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
        }
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.stroke();
      }

      ctx.restore();
    });
  }, [strokes]);

  // Resize canvas to match the content wrapper dimensions
  const updateCanvasDimensions = useCallback(() => {
    const wrapper = contentWrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const width = wrapper.clientWidth;
    const height = Math.max(wrapper.scrollHeight, 800);

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
    redrawAllStrokes();
  }, [redrawAllStrokes]);

  // Observe wrapper resize (e.g. PDF loaded, zoomed, or window resized)
  useEffect(() => {
    updateCanvasDimensions();
    const wrapper = contentWrapperRef.current;
    if (!wrapper) return;

    const ro = new ResizeObserver(() => {
      updateCanvasDimensions();
    });
    ro.observe(wrapper);

    window.addEventListener('resize', updateCanvasDimensions);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateCanvasDimensions);
    };
  }, [updateCanvasDimensions, pdfData, pdfZoom]);

  useEffect(() => {
    redrawAllStrokes();
  }, [strokes, redrawAllStrokes]);

  // Handle editor HTML initialization
  useEffect(() => {
    if (editorRef.current && contentHtml !== undefined) {
      if (editorRef.current.innerHTML !== contentHtml) {
        editorRef.current.innerHTML = contentHtml;
      }
    }
  }, [contentHtml]);

  // Handle pointer down for drawing
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsPointerDown(true);
    canvas.setPointerCapture(e.pointerId);

    if (currentTool === 'eraser') {
      if (eraserType === 'stroke-eraser') {
        eraseStrokeAt(x, y);
      } else {
        eraseSegmentAt(x, y);
      }
      return;
    }

    const newStroke: DrawingStroke = {
      id: `stroke_${Date.now()}_${Math.random()}`,
      tool: currentTool,
      color,
      size: thickness,
      points: [{ x, y }],
    };

    currentStrokeRef.current = newStroke;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (currentTool === 'highlighter') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.32;
        ctx.lineWidth = Math.max(thickness * 3, 14);
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = color;
        ctx.globalAlpha = 1.0;
        ctx.lineWidth = thickness;
      }
      ctx.beginPath();
      ctx.arc(x, y, (currentTool === 'highlighter' ? Math.max(thickness * 3, 14) : thickness) / 2, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode || !isPointerDown) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'eraser') {
      if (eraserType === 'stroke-eraser') {
        eraseStrokeAt(x, y);
      } else {
        eraseSegmentAt(x, y);
      }
      return;
    }

    if (!currentStrokeRef.current) return;
    const stroke = currentStrokeRef.current;
    const prevPoint = stroke.points[stroke.points.length - 1];

    if (!prevPoint || Math.hypot(x - prevPoint.x, y - prevPoint.y) > 2) {
      stroke.points.push({ x, y });

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (currentTool === 'highlighter') {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = color;
          ctx.globalAlpha = 0.32;
          ctx.lineWidth = Math.max(thickness * 3, 14);
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = color;
          ctx.globalAlpha = 1.0;
          ctx.lineWidth = thickness;
        }

        ctx.beginPath();
        ctx.moveTo(prevPoint.x, prevPoint.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.restore();
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode || !isPointerDown) return;
    setIsPointerDown(false);

    try {
      canvasRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }

    if (currentStrokeRef.current && currentStrokeRef.current.points.length > 0) {
      onStrokesChange([...strokes, currentStrokeRef.current]);
      currentStrokeRef.current = null;
    }
  };

  // Erase whole stroke if distance to any segment is within radius
  const eraseStrokeAt = (x: number, y: number) => {
    const radius = Math.max(16, thickness * 2);
    let hitIndex = -1;

    for (let i = strokes.length - 1; i >= 0; i--) {
      const stroke = strokes[i];
      for (const pt of stroke.points) {
        if (Math.hypot(pt.x - x, pt.y - y) <= radius) {
          hitIndex = i;
          break;
        }
      }
      if (hitIndex !== -1) break;
    }

    if (hitIndex !== -1) {
      const updated = [...strokes];
      updated.splice(hitIndex, 1);
      onStrokesChange(updated);
    }
  };

  // Erase points near cursor
  const eraseSegmentAt = (x: number, y: number) => {
    const radius = Math.max(10, thickness * 1.5);
    let changed = false;
    const nextStrokes: DrawingStroke[] = [];

    strokes.forEach((stroke) => {
      let currentSegment: DrawingPoint[] = [];

      stroke.points.forEach((pt) => {
        if (Math.hypot(pt.x - x, pt.y - y) <= radius) {
          if (currentSegment.length > 0) {
            nextStrokes.push({ ...stroke, id: `${stroke.id}_seg_${Math.random()}`, points: currentSegment });
            currentSegment = [];
          }
          changed = true;
        } else {
          currentSegment.push(pt);
        }
      });

      if (currentSegment.length > 0) {
        nextStrokes.push({ ...stroke, points: currentSegment });
      }
    });

    if (changed) {
      onStrokesChange(nextStrokes);
    }
  };

  // Sync contenteditable input back
  const handleEditorInput = () => {
    if (editorRef.current) {
      onContentChange(editorRef.current.innerHTML);
    }
  };

  // Image resizing listener
  const handleEditorClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG' && !target.closest('.pdf-pages-stack')) {
      setSelectedImage(target as HTMLImageElement);
    } else {
      setSelectedImage(null);
    }

    // Toggle checklist checkbox
    if (target.matches('input[type="checkbox"]')) {
      const input = target as HTMLInputElement;
      input.setAttribute('checked', input.checked ? 'true' : 'false');
      handleEditorInput();
    }
  };

  const handleResizeImage = (percent: number) => {
    if (selectedImage) {
      selectedImage.style.width = `${percent}%`;
      selectedImage.style.height = 'auto';
      selectedImage.style.maxWidth = '100%';
      handleEditorInput();
    }
  };

  // Process uploaded PDF file
  const processPdfFile = async (file: File) => {
    try {
      setIsLoadingPdf(true);
      setPdfProgress({ current: 0, total: 1 });
      const processed = await renderPdfPages(file, (current, total) => {
        setPdfProgress({ current, total });
      });
      if (onPdfDataChange) {
        onPdfDataChange(processed);
      }
    } catch (err) {
      console.error('Failed to parse PDF file:', err);
      alert('Could not render PDF. Please ensure this is a valid PDF document.');
    } finally {
      setIsLoadingPdf(false);
      setPdfProgress(null);
    }
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('Files')) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        processPdfFile(file);
      }
    }
  };

  // Load sample DBMS PDF
  const handleLoadSamplePdf = () => {
    setIsLoadingPdf(true);
    setTimeout(() => {
      const sample = createSamplePdfData();
      if (onPdfDataChange) {
        onPdfDataChange(sample);
      }
      setIsLoadingPdf(false);
    }, 150);
  };

  // Remove PDF
  const handleRemovePdf = () => {
    if (window.confirm('Remove this PDF from the note? Your written notes and drawings will remain.')) {
      if (onPdfDataChange) {
        onPdfDataChange(undefined);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative flex-1 w-full overflow-y-auto min-h-[500px] transition-colors ${
        darkMode ? 'bg-[#18181b] text-zinc-100' : 'bg-white text-gray-900'
      }`}
    >
      {/* Drag & Drop Visual Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-purple-500/15 dark:bg-purple-950/60 backdrop-blur-xs border-2 border-dashed border-purple-500 rounded-2xl pointer-events-none m-3">
          <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 mb-2 animate-bounce">
            <Upload className="w-8 h-8" />
          </div>
          <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
            Drop PDF here to embed into note
          </p>
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            Pages will be rendered and ready to draw on
          </p>
        </div>
      )}

      {/* PDF Loading State */}
      {isLoadingPdf && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xs">
          <div className="w-12 h-12 border-4 border-purple-200 dark:border-zinc-700 border-t-purple-600 rounded-full animate-spin mb-3" />
          <h4 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Processing PDF Document...
          </h4>
          {pdfProgress && (
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
              Rendering page {pdfProgress.current} of {pdfProgress.total}
            </p>
          )}
        </div>
      )}

      {/* Image Resizer Overlay Bar */}
      {selectedImage && (
        <div className="fixed z-40 top-32 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-lg">
          <span className="text-xs font-semibold text-gray-500 mr-1">Image Size:</span>
          {[25, 50, 75, 100].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => handleResizeImage(size)}
              className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 dark:bg-zinc-700 hover:bg-purple-100 hover:text-purple-700 text-gray-700 dark:text-zinc-200"
            >
              {size}%
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="ml-2 text-xs text-gray-400 hover:text-gray-600 px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Document Column Wrapper */}
      <div ref={contentWrapperRef} className="relative w-full max-w-4xl mx-auto px-6 py-6 min-h-full">
        
        {/* PDF Document Viewer Layer (When PDF is loaded) */}
        {pdfData && pdfData.pages.length > 0 ? (
          <div className="pdf-container mb-8 select-none">
            {/* PDF Header Controls */}
            <div
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 mb-5 rounded-2xl border transition-colors shadow-2xs gap-3 ${
                darkMode
                  ? 'bg-zinc-800/80 border-zinc-700 text-zinc-100'
                  : 'bg-gray-50/90 border-gray-200 text-gray-800'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <div className={`text-sm font-bold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {pdfData.fileName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-zinc-400 flex items-center gap-2">
                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                      {pdfData.totalPages} pages
                    </span>
                    <span>•</span>
                    <span>{(pdfData.fileSize / 1024).toFixed(0)} KB</span>
                    <span>•</span>
                    <span>Ready for drawing</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Quick Toggle Draw on PDF */}
                <button
                  type="button"
                  onClick={() => {
                    if (onToggleDrawing) {
                      onToggleDrawing();
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-2xs ${
                    isDrawingMode
                      ? 'bg-[#7F56D9] text-white'
                      : darkMode
                      ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-200'
                      : 'bg-white hover:bg-purple-50 text-[#7F56D9] border border-purple-200'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>{isDrawingMode ? 'Drawing On' : 'Draw on PDF'}</span>
                </button>

                {/* PDF Zoom Controls */}
                <div className="flex items-center rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-0.5">
                  <button
                    type="button"
                    onClick={() => setPdfZoom((z) => Math.max(60, z - 15))}
                    title="Zoom out PDF"
                    className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded text-gray-600 dark:text-zinc-300"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-bold px-1.5 min-w-[38px] text-center text-gray-700 dark:text-zinc-300">
                    {pdfZoom}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setPdfZoom((z) => Math.min(140, z + 15))}
                    title="Zoom in PDF"
                    className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded text-gray-600 dark:text-zinc-300"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Remove PDF Button */}
                <button
                  type="button"
                  onClick={handleRemovePdf}
                  title="Remove PDF from note"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Rendered High-Res PDF Pages Stack */}
            <div className="pdf-pages-stack flex flex-col items-center gap-6">
              {pdfData.pages.map((page) => (
                <div
                  key={page.pageNumber}
                  className="relative rounded-2xl overflow-hidden shadow-md border border-gray-200 dark:border-zinc-700 bg-white transition-all"
                  style={{ width: `${pdfZoom}%`, maxWidth: '100%' }}
                >
                  <img
                    src={page.dataUrl}
                    alt={`Page ${page.pageNumber}`}
                    className="w-full h-auto block select-none pointer-events-none"
                    draggable={false}
                  />
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/65 backdrop-blur-xs text-white text-[11px] font-medium shadow-xs">
                    Page {page.pageNumber} of {pdfData.totalPages}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Embed PDF Prompt Banner (When NO PDF is present) */
          <div
            className={`p-4 mb-6 rounded-2xl border border-dashed flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors ${
              darkMode
                ? 'border-zinc-700/80 bg-zinc-800/30 text-zinc-300'
                : 'border-purple-200 bg-purple-50/30 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-[#7F56D9] flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className={`text-xs font-bold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Embed PDF inside this note to draw and annotate
                </div>
                <div className="text-[11px] text-gray-500 dark:text-zinc-400">
                  Drag & drop any lecture handout or choose sample DBMS PDF
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700 shadow-2xs transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-gray-500" />
                <span>Upload PDF</span>
              </button>
              <button
                type="button"
                onClick={handleLoadSamplePdf}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7F56D9] text-white text-xs font-semibold hover:bg-[#6941C6] shadow-2xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sample DBMS PDF</span>
              </button>
            </div>
          </div>
        )}

        {/* Section Divider between PDF and Text Notes */}
        {pdfData && pdfData.pages.length > 0 && (
          <div className="flex items-center gap-3 my-7 select-none">
            <div className="h-px bg-gray-200 dark:bg-zinc-800 flex-1" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
              Written Notes & Summary
            </span>
            <div className="h-px bg-gray-200 dark:bg-zinc-800 flex-1" />
          </div>
        )}

        {/* Rich Text Editor Content Layer */}
        <div
          ref={editorRef}
          id="note-editor-content"
          contentEditable={!isDrawingMode}
          suppressContentEditableWarning
          onInput={handleEditorInput}
          onClick={handleEditorClick}
          className={`w-full min-h-[350px] outline-none text-base leading-relaxed ${
            isDrawingMode ? 'pointer-events-none select-none' : 'pointer-events-auto'
          }`}
        />

        {/* Drawing Canvas Overlay (Overlays PDF + Text notes) */}
        <canvas
          ref={canvasRef}
          id="note-drawing-canvas"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`absolute inset-0 w-full h-full ${
            isDrawingMode ? 'pointer-events-auto cursor-crosshair z-20' : 'pointer-events-none z-0'
          }`}
        />
      </div>

      {/* Drawing Mode Active Status Floating Pill */}
      {isDrawingMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/90 dark:bg-zinc-100/90 text-white dark:text-zinc-900 shadow-xl backdrop-blur-xs border border-white/10 text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Drawing Mode Active — Draw anywhere over PDF pages and notes</span>
          {onToggleDrawing && (
            <button
              type="button"
              onClick={onToggleDrawing}
              className="ml-2 px-2.5 py-0.5 rounded-full bg-white/20 dark:bg-black/20 hover:bg-white/30 text-xs font-bold transition-colors"
            >
              Done
            </button>
          )}
        </div>
      )}

      {/* Hidden File Input for PDF Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            processPdfFile(e.target.files[0]);
            e.target.value = '';
          }
        }}
        className="hidden"
      />
    </div>
  );
};
