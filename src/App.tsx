import { useState, useEffect, useRef } from 'react';
import { NavPage, NoteItem, DrawingTool, EraserType, DrawingStroke, AppSettings } from './types';
import { Sidebar } from './components/Sidebar';
import { NotesHeader } from './components/NotesHeader';
import { SubjectTopicBar } from './components/SubjectTopicBar';
import { FormattingToolbar } from './components/FormattingToolbar';
import { DrawingToolbar } from './components/DrawingToolbar';
import { NoteCanvas } from './components/NoteCanvas';
import { DashboardView } from './components/DashboardView';
import { SubjectsView } from './components/SubjectsView';
import { RecentView } from './components/RecentView';
import { FavoritesView } from './components/FavoritesView';
import { SettingsView } from './components/SettingsView';
import { ExportModal } from './components/ExportModal';
import { renderPdfPages, createSamplePdfData } from './utils/pdfLoader';
import { saveNotesToStorage, loadNotesFromStorage } from './utils/storage';

const INITIAL_NOTE: NoteItem = {
  id: 'note_1',
  title: 'lets go',
  subject: 'dbms',
  topic: 'Week 6',
  content: '<p><br></p>',
  strokes: [],
  created: Date.now() - 3600000,
  updated: Date.now(),
  favorite: false,
  type: 'written',
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  compact: false,
  animations: true,
  defaultView: 'grid',
  defaultSort: 'recent',
  rememberLastSubject: true,
  confirmDelete: true,
  lastSubject: 'dbms',
};

export default function App() {
  // Navigation
  const [currentPage, setCurrentPage] = useState<NavPage>('notes');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('ns_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Notes state
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const saved = localStorage.getItem('ns_notes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [
      INITIAL_NOTE,
      {
        id: 'note_2',
        title: 'Relational Algebra & Normalization',
        subject: 'dbms',
        topic: 'Week 5',
        content: '<h2>Relational Algebra Basics</h2><p>Selection, Projection, Cartesian Product, Union, Set Difference.</p>',
        strokes: [],
        created: Date.now() - 86400000,
        updated: Date.now() - 86400000,
        favorite: true,
        type: 'written',
      },
      {
        id: 'note_3',
        title: 'Concurrency Control & ACID',
        subject: 'dbms',
        topic: 'Week 7',
        content: '<h2>ACID Properties</h2><ul><li><b>Atomicity</b></li><li><b>Consistency</b></li><li><b>Isolation</b></li><li><b>Durability</b></li></ul>',
        strokes: [],
        created: Date.now() - 172800000,
        updated: Date.now() - 172800000,
        favorite: false,
        type: 'written',
      },
    ];
  });

  const [activeNoteId, setActiveNoteId] = useState<string>(INITIAL_NOTE.id);
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Drawing state
  const [isDrawingToolbarOpen, setIsDrawingToolbarOpen] = useState<boolean>(true);
  const [currentTool, setCurrentTool] = useState<DrawingTool>('pen');
  const [eraserType, setEraserType] = useState<EraserType>('stroke-eraser');
  const [thickness, setThickness] = useState<number>(4);
  const [color, setColor] = useState<string>('#111111');

  // Drawing Undo/Redo stacks for active note
  const undoStackRef = useRef<DrawingStroke[][]>([]);
  const redoStackRef = useRef<DrawingStroke[][]>([]);
  const [, setStackTick] = useState(0);

  const activeNote = notes.find((n) => n.id === activeNoteId) || notes[0] || INITIAL_NOTE;

  // Load notes on mount from IndexedDB (with localStorage fallback)
  useEffect(() => {
    loadNotesFromStorage().then((saved) => {
      if (saved && saved.length > 0) {
        setNotes(saved);
      }
    });
  }, []);

  // Persist notes using IndexedDB (for large PDF data) & settings to localStorage
  useEffect(() => {
    saveNotesToStorage(notes);
  }, [notes]);

  useEffect(() => {
    try {
      localStorage.setItem('ns_settings', JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.removeAttribute('data-theme');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    setSettings((prev) => ({ ...prev, theme: next ? 'dark' : 'light' }));
  };

  // Update active note
  const updateActiveNote = (updates: Partial<NoteItem>) => {
    setIsSaved(false);
    setNotes((prevNotes) =>
      prevNotes.map((n) =>
        n.id === activeNote.id
          ? { ...n, ...updates, updated: Date.now() }
          : n
      )
    );
    // Simulate instantaneous saved state
    setTimeout(() => {
      setIsSaved(true);
    }, 400);
  };

  // Note creation
  const handleCreateNote = (presetSubject?: string, presetTopic?: string) => {
    const subject = presetSubject || (settings.rememberLastSubject ? settings.lastSubject : 'dbms');
    const topic = presetTopic || 'Week 6';
    const newNote: NoteItem = {
      id: `note_${Date.now()}`,
      title: 'Untitled note',
      subject,
      topic,
      content: '<p><br></p>',
      strokes: [],
      created: Date.now(),
      updated: Date.now(),
      favorite: false,
      type: 'written',
    };

    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    setCurrentPage('notes');
    undoStackRef.current = [];
    redoStackRef.current = [];
  };

  // Note deletion
  const handleDeleteActiveNote = () => {
    if (settings.confirmDelete && !window.confirm(`Delete "${activeNote.title}"?`)) {
      return;
    }

    const remaining = notes.filter((n) => n.id !== activeNote.id);
    if (remaining.length === 0) {
      const fallback = { ...INITIAL_NOTE, id: `note_${Date.now()}`, title: 'New note' };
      setNotes([fallback]);
      setActiveNoteId(fallback.id);
    } else {
      setNotes(remaining);
      setActiveNoteId(remaining[0].id);
    }
  };

  // Toggle favorite
  const handleToggleFavorite = (noteId: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, favorite: !n.favorite } : n))
    );
  };

  // Drawing strokes handling with undo/redo
  const handleStrokesChange = (newStrokes: DrawingStroke[]) => {
    undoStackRef.current.push([...activeNote.strokes]);
    redoStackRef.current = [];
    setStackTick((t) => t + 1);
    updateActiveNote({ strokes: newStrokes });
  };

  const handleUndo = () => {
    if (undoStackRef.current.length === 0) return;
    const previous = undoStackRef.current.pop()!;
    redoStackRef.current.push([...activeNote.strokes]);
    setStackTick((t) => t + 1);
    updateActiveNote({ strokes: previous });
  };

  const handleRedo = () => {
    if (redoStackRef.current.length === 0) return;
    const next = redoStackRef.current.pop()!;
    undoStackRef.current.push([...activeNote.strokes]);
    setStackTick((t) => t + 1);
    updateActiveNote({ strokes: next });
  };

  const handleClearDrawing = () => {
    if (activeNote.strokes.length === 0) return;
    if (window.confirm('Clear all drawing strokes on this note?')) {
      undoStackRef.current.push([...activeNote.strokes]);
      redoStackRef.current = [];
      setStackTick((t) => t + 1);
      updateActiveNote({ strokes: [] });
    }
  };

  // Formatting commands for rich text
  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    const editor = document.getElementById('note-editor-content');
    if (editor) {
      updateActiveNote({ content: editor.innerHTML });
    }
  };

  // List style indexing options handler
  const handleApplyListStyle = (
    command: 'insertOrderedList' | 'insertUnorderedList',
    styleType?: string
  ) => {
    const editor = document.getElementById('note-editor-content');
    if (!editor) return;

    editor.focus();

    const targetTag = command === 'insertOrderedList' ? 'OL' : 'UL';
    const sel = window.getSelection();
    let currentList: HTMLElement | null = null;

    if (sel && sel.anchorNode) {
      let curr: Node | null = sel.anchorNode;
      while (curr && curr !== editor && curr !== document.body) {
        if (curr.nodeName === 'OL' || curr.nodeName === 'UL') {
          currentList = curr as HTMLElement;
          break;
        }
        curr = curr.parentNode;
      }
    }

    if (currentList && currentList.tagName === targetTag) {
      if (styleType) {
        currentList.style.listStyleType = styleType;
      } else {
        document.execCommand(command, false);
      }
    } else {
      document.execCommand(command, false);

      const updatedSel = window.getSelection();
      if (updatedSel && updatedSel.anchorNode) {
        let node: Node | null = updatedSel.anchorNode;
        while (node && node !== editor && node !== document.body) {
          if (node.nodeName === 'OL' || node.nodeName === 'UL') {
            if (styleType) {
              (node as HTMLElement).style.listStyleType = styleType;
            }
            break;
          }
          node = node.parentNode;
        }
      }
    }

    updateActiveNote({ content: editor.innerHTML });
  };

  const handleInsertChecklist = () => {
    const html = `<div class="check-item flex items-center gap-2 my-1.5"><input type="checkbox" class="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer" /><span contenteditable="true" class="outline-none">Checklist item</span></div><p><br></p>`;
    document.execCommand('insertHTML', false, html);
    const editor = document.getElementById('note-editor-content');
    if (editor) {
      updateActiveNote({ content: editor.innerHTML });
    }
  };

  const handleInsertImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const html = `<img src="${dataUrl}" alt="Inserted image" class="note-image max-w-full rounded-xl my-3 cursor-pointer shadow-xs" style="width: 100%; height: auto;" /><p><br></p>`;
      document.execCommand('insertHTML', false, html);
      const editor = document.getElementById('note-editor-content');
      if (editor) {
        updateActiveNote({ content: editor.innerHTML });
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePasteImage = async () => {
    try {
      if (!navigator.clipboard?.read) {
        alert('Click inside the document and press Ctrl+V (or ⌘V) to paste an image.');
        return;
      }
      const items = await navigator.clipboard.read();
      let found = false;
      for (const item of items) {
        const imageType = item.types.find((t) => t.startsWith('image/'));
        if (imageType) {
          found = true;
          const blob = await item.getType(imageType);
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            const html = `<img src="${dataUrl}" alt="Pasted image" class="note-image max-w-full rounded-xl my-3 cursor-pointer shadow-xs" style="width: 100%; height: auto;" /><p><br></p>`;
            document.execCommand('insertHTML', false, html);
            const editor = document.getElementById('note-editor-content');
            if (editor) {
              updateActiveNote({ content: editor.innerHTML });
            }
          };
          reader.readAsDataURL(blob);
          break;
        }
      }
      if (!found) {
        alert('No image found on clipboard. Copy an image first, then click Paste image.');
      }
    } catch {
      alert('Press Ctrl+V (or ⌘V) directly in the note to paste your image.');
    }
  };

  // PDF Handlers
  const handleInsertPdfFile = async (file: File) => {
    try {
      const pdfData = await renderPdfPages(file);
      updateActiveNote({ pdfData });
      setIsSaved(false);
      setTimeout(() => setIsSaved(true), 500);
    } catch (err) {
      console.error('Error rendering PDF:', err);
      alert('Failed to parse PDF file. Please ensure it is a valid PDF document.');
    }
  };

  const handleInsertSamplePdf = () => {
    const pdfData = createSamplePdfData();
    updateActiveNote({ pdfData });
    setIsSaved(false);
    setTimeout(() => setIsSaved(true), 500);
  };

  // Collect unique subjects and topics for pickers
  const allSubjects = Array.from(new Set(notes.map((n) => n.subject).filter(Boolean))).sort();
  if (!allSubjects.includes('dbms')) allSubjects.unshift('dbms');

  const allTopicsForSubject = Array.from(
    new Set(
      notes
        .filter((n) => n.subject === (activeNote.subject || 'dbms'))
        .map((n) => n.topic)
        .filter(Boolean)
    )
  ).sort();
  if (!allTopicsForSubject.includes('Week 6')) allTopicsForSubject.unshift('Week 6');

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden ${
        darkMode ? 'bg-[#121214] text-zinc-100' : 'bg-[#FAFAFA] text-gray-900'
      }`}
    >
      {/* Left Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={(page) => setCurrentPage(page)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {currentPage === 'notes' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden px-8 py-5">
            {/* Top Header Row */}
            <NotesHeader
              title={activeNote.title}
              onTitleChange={(newTitle) => updateActiveNote({ title: newTitle })}
              onBack={() => setCurrentPage('dashboard')}
              onExport={() => setIsExportOpen(true)}
              onDelete={handleDeleteActiveNote}
              isSaved={isSaved}
              darkMode={darkMode}
            />

            {/* Subject & Topic Selector Row */}
            <SubjectTopicBar
              subject={activeNote.subject || 'dbms'}
              topic={activeNote.topic || 'Week 6'}
              subjectsList={allSubjects}
              topicsList={allTopicsForSubject}
              onSubjectChange={(newSubject) => {
                updateActiveNote({ subject: newSubject });
                setSettings((s) => ({ ...s, lastSubject: newSubject }));
              }}
              onTopicChange={(newTopic) => updateActiveNote({ topic: newTopic })}
              darkMode={darkMode}
            />

            {/* First Toolbar: Rich Text & Insertion Formatting */}
            <div className="mb-2">
              <FormattingToolbar
                onFormat={handleFormat}
                onApplyListStyle={handleApplyListStyle}
                onInsertChecklist={handleInsertChecklist}
                onInsertImageFile={handleInsertImageFile}
                onPasteImage={handlePasteImage}
                onInsertPdfFile={handleInsertPdfFile}
                onInsertSamplePdf={handleInsertSamplePdf}
                hasPdf={Boolean(activeNote.pdfData && activeNote.pdfData.pages.length > 0)}
                drawingOpen={isDrawingToolbarOpen}
                onToggleDrawing={() => setIsDrawingToolbarOpen(!isDrawingToolbarOpen)}
                darkMode={darkMode}
              />
            </div>

            {/* Second Toolbar: Drawing Canvas Tools (visible when drawing is active) */}
            {isDrawingToolbarOpen && (
              <div className="mb-3">
                <DrawingToolbar
                  currentTool={currentTool}
                  onSelectTool={(tool) => setCurrentTool(tool)}
                  eraserType={eraserType}
                  onSelectEraserType={(type) => setEraserType(type)}
                  thickness={thickness}
                  onThicknessChange={(t) => setThickness(t)}
                  color={color}
                  onColorChange={(c) => setColor(c)}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  onClear={handleClearDrawing}
                  onDone={() => setIsDrawingToolbarOpen(false)}
                  canUndo={undoStackRef.current.length > 0}
                  canRedo={redoStackRef.current.length > 0}
                  darkMode={darkMode}
                />
              </div>
            )}

            {/* Canvas / Note Surface */}
            <div
              className={`flex-1 rounded-2xl border overflow-hidden flex flex-col shadow-xs ${
                darkMode ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-[#EAECF0]'
              }`}
            >
              <NoteCanvas
                contentHtml={activeNote.content}
                onContentChange={(html) => updateActiveNote({ content: html })}
                strokes={activeNote.strokes}
                onStrokesChange={handleStrokesChange}
                isDrawingMode={isDrawingToolbarOpen}
                onToggleDrawing={() => setIsDrawingToolbarOpen(!isDrawingToolbarOpen)}
                currentTool={currentTool}
                eraserType={eraserType}
                thickness={thickness}
                color={color}
                pdfData={activeNote.pdfData}
                onPdfDataChange={(pdfData) => updateActiveNote({ pdfData })}
                darkMode={darkMode}
              />
            </div>
          </div>
        )}

        {currentPage === 'dashboard' && (
          <DashboardView
            notes={notes}
            onSelectNote={(id) => {
              setActiveNoteId(id);
              setCurrentPage('notes');
            }}
            onCreateNote={handleCreateNote}
            darkMode={darkMode}
          />
        )}

        {currentPage === 'subjects' && (
          <SubjectsView
            notes={notes}
            onSelectNote={(id) => {
              setActiveNoteId(id);
              setCurrentPage('notes');
            }}
            onCreateNote={handleCreateNote}
            darkMode={darkMode}
          />
        )}

        {currentPage === 'recent' && (
          <RecentView
            notes={notes}
            onSelectNote={(id) => {
              setActiveNoteId(id);
              setCurrentPage('notes');
            }}
            onToggleFavorite={handleToggleFavorite}
            darkMode={darkMode}
          />
        )}

        {currentPage === 'favorites' && (
          <FavoritesView
            notes={notes}
            onSelectNote={(id) => {
              setActiveNoteId(id);
              setCurrentPage('notes');
            }}
            onToggleFavorite={handleToggleFavorite}
            darkMode={darkMode}
          />
        )}

        {currentPage === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={(newSettings) => setSettings((s) => ({ ...s, ...newSettings }))}
            notes={notes}
            onImportNotes={(imported) => {
              setNotes(imported);
              if (imported[0]) setActiveNoteId(imported[0].id);
            }}
            onDeleteAllNotes={() => {
              if (window.confirm('Are you absolutely sure? This will delete ALL notes!')) {
                const fresh = [{ ...INITIAL_NOTE, id: `note_${Date.now()}` }];
                setNotes(fresh);
                setActiveNoteId(fresh[0].id);
              }
            }}
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
          />
        )}
      </main>

      {/* Export Modal */}
      <ExportModal
        note={activeNote}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        darkMode={darkMode}
      />
    </div>
  );
}
