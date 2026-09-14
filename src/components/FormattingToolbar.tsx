import React, { useRef, useState, useEffect } from 'react';
import {
  ChevronDown,
  List,
  ListOrdered,
  CheckSquare,
  Image as ImageIcon,
  Clipboard,
  PenTool,
  MoreHorizontal,
  Check,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  FileText,
  Sparkles,
  Upload,
} from 'lucide-react';

export interface IndexingStyleOption {
  id: string;
  name: string;
  styleType: string;
  badge: string;
  examples: string[];
  description: string;
}

export const NUMBERED_INDEXING_OPTIONS: IndexingStyleOption[] = [
  {
    id: 'decimal',
    name: '1, 2, 3',
    styleType: 'decimal',
    badge: '1.',
    examples: ['1. First item', '2. Second item', '3. Third item'],
    description: 'Standard numbers',
  },
  {
    id: 'lower-alpha',
    name: 'a, b, c',
    styleType: 'lower-alpha',
    badge: 'a.',
    examples: ['a. First item', 'b. Second item', 'c. Third item'],
    description: 'Lowercase alphabet',
  },
  {
    id: 'upper-alpha',
    name: 'A, B, C',
    styleType: 'upper-alpha',
    badge: 'A.',
    examples: ['A. First item', 'B. Second item', 'C. Third item'],
    description: 'Uppercase alphabet',
  },
  {
    id: 'lower-roman',
    name: 'i, ii, iii',
    styleType: 'lower-roman',
    badge: 'i.',
    examples: ['i. First item', 'ii. Second item', 'iii. Third item'],
    description: 'Lowercase Roman numerals',
  },
  {
    id: 'upper-roman',
    name: 'I, II, III',
    styleType: 'upper-roman',
    badge: 'I.',
    examples: ['I. First item', 'II. Second item', 'III. Third item'],
    description: 'Uppercase Roman numerals',
  },
  {
    id: 'decimal-leading-zero',
    name: '01, 02, 03',
    styleType: 'decimal-leading-zero',
    badge: '01.',
    examples: ['01. First item', '02. Second item', '03. Third item'],
    description: 'Leading zero numbers',
  },
  {
    id: 'lower-greek',
    name: 'α, β, γ',
    styleType: 'lower-greek',
    badge: 'α.',
    examples: ['α. First item', 'β. Second item', 'γ. Third item'],
    description: 'Lowercase Greek letters',
  },
];

export const BULLET_INDEXING_OPTIONS: IndexingStyleOption[] = [
  {
    id: 'disc',
    name: 'Disc',
    styleType: 'disc',
    badge: '•',
    examples: ['• First item', '• Second item'],
    description: 'Solid circular bullet',
  },
  {
    id: 'circle',
    name: 'Circle',
    styleType: 'circle',
    badge: '◦',
    examples: ['◦ First item', '◦ Second item'],
    description: 'Hollow round ring',
  },
  {
    id: 'square',
    name: 'Square',
    styleType: 'square',
    badge: '▪',
    examples: ['▪ First item', '▪ Second item'],
    description: 'Solid square marker',
  },
  {
    id: 'diamond',
    name: 'Diamond',
    styleType: "'◆  '",
    badge: '◆',
    examples: ['◆ First item', '◆ Second item'],
    description: 'Diamond symbol',
  },
  {
    id: 'arrow',
    name: 'Arrow',
    styleType: "'➢  '",
    badge: '➢',
    examples: ['➢ First item', '➢ Second item'],
    description: 'Pointer arrow',
  },
  {
    id: 'dash',
    name: 'Dash',
    styleType: "'–  '",
    badge: '–',
    examples: ['– First item', '– Second item'],
    description: 'Minimalist hyphen dash',
  },
  {
    id: 'star',
    name: 'Star',
    styleType: "'★  '",
    badge: '★',
    examples: ['★ First item', '★ Second item'],
    description: 'Highlight star',
  },
  {
    id: 'check',
    name: 'Check',
    styleType: "'✓  '",
    badge: '✓',
    examples: ['✓ First item', '✓ Second item'],
    description: 'Checkmark bullet',
  },
];

interface FormattingToolbarProps {
  onFormat: (command: string, value?: string) => void;
  onApplyListStyle?: (command: 'insertOrderedList' | 'insertUnorderedList', styleType?: string) => void;
  onInsertChecklist: () => void;
  onInsertImageFile: (file: File) => void;
  onPasteImage: () => void;
  onInsertPdfFile?: (file: File) => void;
  onInsertSamplePdf?: () => void;
  hasPdf?: boolean;
  drawingOpen: boolean;
  onToggleDrawing: () => void;
  darkMode?: boolean;
}

export const FormattingToolbar: React.FC<FormattingToolbarProps> = ({
  onFormat,
  onApplyListStyle,
  onInsertChecklist,
  onInsertImageFile,
  onPasteImage,
  onInsertPdfFile,
  onInsertSamplePdf,
  hasPdf = false,
  drawingOpen,
  onToggleDrawing,
  darkMode = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfFileInputRef = useRef<HTMLInputElement>(null);

  // Dropdown states
  const [showNumberMenu, setShowNumberMenu] = useState(false);
  const [showBulletMenu, setShowBulletMenu] = useState(false);
  const [showParagraphMenu, setShowParagraphMenu] = useState(false);
  const [showPdfMenu, setShowPdfMenu] = useState(false);

  // Selected styles
  const [selectedNumberStyle, setSelectedNumberStyle] = useState('decimal');
  const [selectedBulletStyle, setSelectedBulletStyle] = useState('disc');

  const numberMenuRef = useRef<HTMLDivElement>(null);
  const bulletMenuRef = useRef<HTMLDivElement>(null);
  const paragraphMenuRef = useRef<HTMLDivElement>(null);
  const pdfMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (numberMenuRef.current && !numberMenuRef.current.contains(target)) {
        setShowNumberMenu(false);
      }
      if (bulletMenuRef.current && !bulletMenuRef.current.contains(target)) {
        setShowBulletMenu(false);
      }
      if (paragraphMenuRef.current && !paragraphMenuRef.current.contains(target)) {
        setShowParagraphMenu(false);
      }
      if (pdfMenuRef.current && !pdfMenuRef.current.contains(target)) {
        setShowPdfMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onInsertPdfFile) {
      onInsertPdfFile(e.target.files[0]);
      e.target.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onInsertImageFile(e.target.files[0]);
      e.target.value = '';
    }
  };

  const handleNumberedOptionClick = (styleType: string) => {
    setSelectedNumberStyle(styleType);
    if (onApplyListStyle) {
      onApplyListStyle('insertOrderedList', styleType);
    } else {
      onFormat('insertOrderedList');
    }
    setShowNumberMenu(false);
  };

  const handleBulletOptionClick = (styleType: string) => {
    setSelectedBulletStyle(styleType);
    if (onApplyListStyle) {
      onApplyListStyle('insertUnorderedList', styleType);
    } else {
      onFormat('insertUnorderedList');
    }
    setShowBulletMenu(false);
  };

  return (
    <div
      className={`rounded-xl border px-3 py-1.5 flex items-center gap-1.5 flex-wrap transition-colors select-none ${
        darkMode
          ? 'bg-zinc-800/90 border-zinc-700/80 text-zinc-200 shadow-xs'
          : 'bg-white border-[#EAECF0] text-gray-700 shadow-xs'
      }`}
    >
      {/* B (Bold) */}
      <button
        id="format-bold-btn"
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onFormat('bold')}
        title="Bold (Ctrl+B)"
        className={`w-7 h-7 flex items-center justify-center rounded text-sm font-bold transition-colors ${
          darkMode ? 'hover:bg-zinc-700 text-zinc-100' : 'hover:bg-gray-100 text-gray-900'
        }`}
      >
        B
      </button>

      {/* I (Italic) */}
      <button
        id="format-italic-btn"
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onFormat('italic')}
        title="Italic (Ctrl+I)"
        className={`w-7 h-7 flex items-center justify-center rounded text-sm italic font-serif transition-colors ${
          darkMode ? 'hover:bg-zinc-700 text-zinc-100' : 'hover:bg-gray-100 text-gray-900'
        }`}
      >
        I
      </button>

      {/* U (Underline) */}
      <button
        id="format-underline-btn"
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onFormat('underline')}
        title="Underline (Ctrl+U)"
        className={`w-7 h-7 flex items-center justify-center rounded text-sm underline font-medium transition-colors ${
          darkMode ? 'hover:bg-zinc-700 text-zinc-100' : 'hover:bg-gray-100 text-gray-900'
        }`}
      >
        U
      </button>

      {/* H1 */}
      <button
        id="format-h1-btn"
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onFormat('formatBlock', 'H1')}
        title="Heading 1"
        className={`px-2 h-7 flex items-center justify-center rounded text-sm font-semibold transition-colors ${
          darkMode ? 'hover:bg-zinc-700 text-zinc-200' : 'hover:bg-gray-100 text-gray-700'
        }`}
      >
        H1
      </button>

      {/* H2 */}
      <button
        id="format-h2-btn"
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onFormat('formatBlock', 'H2')}
        title="Heading 2"
        className={`px-2 h-7 flex items-center justify-center rounded text-sm font-semibold transition-colors ${
          darkMode ? 'hover:bg-zinc-700 text-zinc-200' : 'hover:bg-gray-100 text-gray-700'
        }`}
      >
        H2
      </button>

      {/* ¶ ▾ (Paragraph & Block Options) */}
      <div className="relative inline-flex items-center" ref={paragraphMenuRef}>
        <div
          className={`h-7 flex items-center rounded-lg border transition-colors ${
            showParagraphMenu
              ? darkMode
                ? 'bg-purple-950/40 border-purple-700 text-purple-300'
                : 'bg-purple-50 border-purple-300 text-purple-700'
              : darkMode
              ? 'border-transparent hover:bg-zinc-700 text-zinc-200'
              : 'border-transparent hover:bg-gray-100 text-gray-700'
          }`}
        >
          <button
            id="format-p-btn"
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onFormat('formatBlock', 'P')}
            title="Normal Paragraph"
            className="px-1.5 h-full flex items-center justify-center rounded-l-lg hover:bg-black/5 dark:hover:bg-white/5 font-medium text-sm"
          >
            <span>¶</span>
          </button>
          <button
            id="format-p-menu-btn"
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setShowParagraphMenu(!showParagraphMenu);
              setShowBulletMenu(false);
              setShowNumberMenu(false);
            }}
            title="Text block formats"
            className="px-1 h-full flex items-center justify-center rounded-r-lg hover:bg-black/5 dark:hover:bg-white/5"
          >
            <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${showParagraphMenu ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Paragraph Dropdown */}
        {showParagraphMenu && (
          <div
            onMouseDown={(e) => e.preventDefault()}
            className={`absolute left-0 top-[34px] z-50 w-48 rounded-xl border p-1.5 shadow-xl ${
              darkMode
                ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
                : 'bg-white border-gray-200 text-gray-800'
            }`}
          >
            <div className="px-2 py-1 text-[11px] font-semibold tracking-wider uppercase text-gray-400 dark:text-zinc-400">
              Text Style
            </div>
            <button
              type="button"
              onClick={() => {
                onFormat('formatBlock', 'P');
                setShowParagraphMenu(false);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 dark:hover:text-purple-300 text-left transition-colors"
            >
              <Pilcrow className="w-4 h-4 text-gray-500" />
              <span>Normal text (P)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onFormat('formatBlock', 'H1');
                setShowParagraphMenu(false);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm font-bold hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 dark:hover:text-purple-300 text-left transition-colors"
            >
              <Heading1 className="w-4 h-4 text-gray-500" />
              <span>Heading 1</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onFormat('formatBlock', 'H2');
                setShowParagraphMenu(false);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm font-semibold hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 dark:hover:text-purple-300 text-left transition-colors"
            >
              <Heading2 className="w-4 h-4 text-gray-500" />
              <span>Heading 2</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onFormat('formatBlock', 'H3');
                setShowParagraphMenu(false);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm font-medium hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 dark:hover:text-purple-300 text-left transition-colors"
            >
              <Heading3 className="w-4 h-4 text-gray-500" />
              <span>Heading 3</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onFormat('formatBlock', 'BLOCKQUOTE');
                setShowParagraphMenu(false);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm italic hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 dark:hover:text-purple-300 text-left transition-colors"
            >
              <Quote className="w-4 h-4 text-gray-500" />
              <span>Quote block</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onFormat('formatBlock', 'PRE');
                setShowParagraphMenu(false);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm font-mono hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 dark:hover:text-purple-300 text-left transition-colors"
            >
              <Code className="w-4 h-4 text-gray-500" />
              <span>Code block</span>
            </button>
          </div>
        )}
      </div>

      {/* Vertical Divider */}
      <div className="w-px h-5 bg-gray-200 dark:bg-zinc-700 mx-1" />

      {/* ≡ ▾ (Bullet List & Bullet Indexing Options) */}
      <div className="relative inline-flex items-center" ref={bulletMenuRef}>
        <div
          className={`h-7 flex items-center rounded-lg border transition-colors ${
            showBulletMenu
              ? darkMode
                ? 'bg-purple-950/40 border-purple-700 text-purple-300'
                : 'bg-purple-50 border-purple-300 text-purple-700'
              : darkMode
              ? 'border-transparent hover:bg-zinc-700 text-zinc-200'
              : 'border-transparent hover:bg-gray-100 text-gray-700'
          }`}
        >
          <button
            id="format-bullet-btn"
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              if (onApplyListStyle) {
                onApplyListStyle('insertUnorderedList', selectedBulletStyle);
              } else {
                onFormat('insertUnorderedList');
              }
            }}
            title="Bullet List (Toggle)"
            className="px-2 h-full flex items-center justify-center rounded-l-lg hover:bg-black/5 dark:hover:bg-white/5"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            id="format-bullet-menu-btn"
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setShowBulletMenu(!showBulletMenu);
              setShowNumberMenu(false);
              setShowParagraphMenu(false);
            }}
            title="Bullet indexing styles"
            className="px-1 h-full flex items-center justify-center rounded-r-lg hover:bg-black/5 dark:hover:bg-white/5"
          >
            <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${showBulletMenu ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Bullet Indexing Dropdown Menu */}
        {showBulletMenu && (
          <div
            onMouseDown={(e) => e.preventDefault()}
            className={`absolute left-0 top-[34px] z-50 w-72 rounded-2xl border p-2.5 shadow-xl ${
              darkMode
                ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
                : 'bg-white border-gray-200 text-gray-800'
            }`}
          >
            <div className="flex items-center justify-between px-2 pb-2 mb-1.5 border-b border-gray-100 dark:border-zinc-700">
              <span className="text-xs font-semibold text-gray-700 dark:text-zinc-200">
                Bullet Indexing Styles
              </span>
              <span className="text-[11px] text-gray-400">8 styles</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 max-h-[300px] overflow-y-auto p-0.5">
              {BULLET_INDEXING_OPTIONS.map((opt) => {
                const isSelected = selectedBulletStyle === opt.styleType;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleBulletOptionClick(opt.styleType)}
                    className={`flex flex-col items-start p-2 rounded-xl border text-left transition-all group ${
                      isSelected
                        ? darkMode
                          ? 'bg-purple-950/50 border-purple-500/70 text-purple-200 shadow-2xs'
                          : 'bg-purple-50 border-purple-300 text-purple-900 shadow-2xs'
                        : darkMode
                        ? 'border-zinc-700/60 bg-zinc-800/60 hover:bg-zinc-700 hover:border-zinc-600 text-zinc-200'
                        : 'border-gray-150 bg-gray-50/70 hover:bg-white hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="w-full flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 flex items-center justify-center rounded-md bg-white dark:bg-zinc-700 shadow-2xs font-semibold text-xs text-purple-600 dark:text-purple-400">
                          {opt.badge}
                        </span>
                        <span className="font-semibold text-xs">{opt.name}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
                    </div>
                    <div className="w-full text-[11px] text-gray-500 dark:text-zinc-400 space-y-0.5 pl-0.5">
                      {opt.examples.slice(0, 2).map((ex, i) => (
                        <div key={i} className="truncate">{ex}</div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 1 2 3 ▾ (Numbered List & Indexing Options) */}
      <div className="relative inline-flex items-center" ref={numberMenuRef}>
        <div
          className={`h-7 flex items-center rounded-lg border transition-colors ${
            showNumberMenu
              ? darkMode
                ? 'bg-purple-950/40 border-purple-700 text-purple-300'
                : 'bg-purple-50 border-purple-300 text-purple-700'
              : darkMode
              ? 'border-transparent hover:bg-zinc-700 text-zinc-200'
              : 'border-transparent hover:bg-gray-100 text-gray-700'
          }`}
        >
          <button
            id="format-number-btn"
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              if (onApplyListStyle) {
                onApplyListStyle('insertOrderedList', selectedNumberStyle);
              } else {
                onFormat('insertOrderedList');
              }
            }}
            title="Numbered List (Toggle)"
            className="px-2 h-full flex items-center justify-center rounded-l-lg hover:bg-black/5 dark:hover:bg-white/5"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            id="format-number-menu-btn"
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setShowNumberMenu(!showNumberMenu);
              setShowBulletMenu(false);
              setShowParagraphMenu(false);
            }}
            title="Numbered indexing options"
            className="px-1 h-full flex items-center justify-center rounded-r-lg hover:bg-black/5 dark:hover:bg-white/5"
          >
            <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${showNumberMenu ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Numbered Indexing Dropdown Menu */}
        {showNumberMenu && (
          <div
            onMouseDown={(e) => e.preventDefault()}
            className={`absolute left-0 top-[34px] z-50 w-80 rounded-2xl border p-2.5 shadow-xl ${
              darkMode
                ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
                : 'bg-white border-gray-200 text-gray-800'
            }`}
          >
            <div className="flex items-center justify-between px-2 pb-2 mb-1.5 border-b border-gray-100 dark:border-zinc-700">
              <span className="text-xs font-semibold text-gray-700 dark:text-zinc-200">
                Numbered Indexing Options
              </span>
              <span className="text-[11px] text-gray-400">7 types</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 max-h-[320px] overflow-y-auto p-0.5">
              {NUMBERED_INDEXING_OPTIONS.map((opt) => {
                const isSelected = selectedNumberStyle === opt.styleType;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleNumberedOptionClick(opt.styleType)}
                    className={`flex flex-col items-start p-2 rounded-xl border text-left transition-all group ${
                      isSelected
                        ? darkMode
                          ? 'bg-purple-950/50 border-purple-500/70 text-purple-200 shadow-2xs'
                          : 'bg-purple-50 border-purple-300 text-purple-900 shadow-2xs'
                        : darkMode
                        ? 'border-zinc-700/60 bg-zinc-800/60 hover:bg-zinc-700 hover:border-zinc-600 text-zinc-200'
                        : 'border-gray-150 bg-gray-50/70 hover:bg-white hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="w-full flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-700 shadow-2xs font-semibold text-xs text-purple-600 dark:text-purple-400">
                          {opt.badge}
                        </span>
                        <span className="font-semibold text-xs">{opt.name}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
                    </div>
                    <div className="w-full text-[11px] text-gray-500 dark:text-zinc-400 space-y-0.5 pl-0.5">
                      {opt.examples.slice(0, 2).map((ex, i) => (
                        <div key={i} className="truncate">{ex}</div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Vertical Divider */}
      <div className="w-px h-5 bg-gray-200 dark:bg-zinc-700 mx-1" />

      {/* ☑ Checklist */}
      <button
        id="format-checklist-btn"
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onInsertChecklist}
        title="Insert Checklist"
        className={`px-2.5 h-7 flex items-center gap-1.5 rounded-lg text-sm font-normal transition-colors ${
          darkMode ? 'hover:bg-zinc-700 text-zinc-200' : 'hover:bg-gray-100 text-gray-700'
        }`}
      >
        <CheckSquare className="w-4 h-4 text-[#7F56D9]" />
        <span>Checklist</span>
      </button>

      {/* 🖼 Image */}
      <button
        id="format-image-btn"
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        title="Insert Image"
        className={`px-2.5 h-7 flex items-center gap-1.5 rounded-lg text-sm font-normal transition-colors ${
          darkMode ? 'hover:bg-zinc-700 text-zinc-200' : 'hover:bg-gray-100 text-gray-700'
        }`}
      >
        <ImageIcon className="w-4 h-4 text-gray-600 dark:text-zinc-400" />
        <span>Image</span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 📄 PDF Document dropdown button */}
      <div className="relative inline-flex items-center" ref={pdfMenuRef}>
        <div
          className={`h-7 flex items-center rounded-lg border transition-colors ${
            showPdfMenu || hasPdf
              ? darkMode
                ? 'bg-purple-950/40 border-purple-700 text-purple-300'
                : 'bg-purple-50 border-purple-300 text-purple-700'
              : darkMode
              ? 'border-transparent hover:bg-zinc-700 text-zinc-200'
              : 'border-transparent hover:bg-gray-100 text-gray-700'
          }`}
        >
          <button
            id="format-pdf-btn"
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setShowPdfMenu(!showPdfMenu);
              setShowBulletMenu(false);
              setShowNumberMenu(false);
              setShowParagraphMenu(false);
            }}
            title="Add PDF inside notes & draw"
            className="px-2 h-full flex items-center gap-1.5 rounded-l-lg hover:bg-black/5 dark:hover:bg-white/5 text-sm font-medium"
          >
            <FileText className="w-4 h-4 text-red-500" />
            <span>PDF</span>
            {hasPdf && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            )}
          </button>
          <button
            id="format-pdf-menu-btn"
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setShowPdfMenu(!showPdfMenu);
              setShowBulletMenu(false);
              setShowNumberMenu(false);
              setShowParagraphMenu(false);
            }}
            title="PDF Options"
            className="px-1 h-full flex items-center justify-center rounded-r-lg hover:bg-black/5 dark:hover:bg-white/5"
          >
            <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${showPdfMenu ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* PDF Dropdown Menu */}
        {showPdfMenu && (
          <div
            onMouseDown={(e) => e.preventDefault()}
            className={`absolute left-0 top-[34px] z-50 w-72 rounded-2xl border p-2 shadow-xl ${
              darkMode
                ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
                : 'bg-white border-gray-200 text-gray-800'
            }`}
          >
            <div className="px-2 py-1.5 text-[11px] font-semibold tracking-wider uppercase text-gray-400 dark:text-zinc-400 border-b border-gray-100 dark:border-zinc-700 mb-1">
              Add PDF to Note
            </div>

            <button
              type="button"
              onClick={() => {
                pdfFileInputRef.current?.click();
                setShowPdfMenu(false);
              }}
              className="w-full flex items-start gap-2.5 p-2 rounded-xl text-left hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300">
                  Upload PDF from computer
                </div>
                <div className="text-[11px] text-gray-500 dark:text-zinc-400">
                  Select any PDF to annotate and draw on
                </div>
              </div>
            </button>

            {onInsertSamplePdf && (
              <button
                type="button"
                onClick={() => {
                  onInsertSamplePdf();
                  setShowPdfMenu(false);
                }}
                className="w-full flex items-start gap-2.5 p-2 rounded-xl text-left hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-[#7F56D9] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300">
                    Insert Sample DBMS PDF
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-zinc-400">
                    2-page Relational Algebra & ACID handout
                  </div>
                </div>
              </button>
            )}
          </div>
        )}
      </div>
      <input
        ref={pdfFileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handlePdfFileChange}
        className="hidden"
      />

      {/* 📋 Paste image */}
      <button
        id="format-paste-image-btn"
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onPasteImage}
        title="Paste Image from Clipboard"
        className={`px-2.5 h-7 flex items-center gap-1.5 rounded-lg text-sm font-normal transition-colors ${
          darkMode ? 'hover:bg-zinc-700 text-zinc-200' : 'hover:bg-gray-100 text-gray-700'
        }`}
      >
        <Clipboard className="w-4 h-4 text-gray-600 dark:text-zinc-400" />
        <span>Paste image</span>
      </button>

      {/* ✏ Drawing */}
      <button
        id="format-drawing-toggle-btn"
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onToggleDrawing}
        title="Toggle Drawing Tools"
        className={`px-2.5 h-7 flex items-center gap-1.5 rounded-lg text-sm font-medium transition-colors ${
          drawingOpen
            ? darkMode
              ? 'bg-purple-950/40 text-[#c084fc]'
              : 'bg-[#F9F5FF] text-[#6941C6]'
            : darkMode
            ? 'hover:bg-zinc-700 text-zinc-200'
            : 'hover:bg-gray-100 text-gray-700'
        }`}
      >
        <PenTool className="w-4 h-4 text-[#7F56D9]" />
        <span>Drawing</span>
      </button>

      {/* ... (More options) */}
      <button
        id="format-more-btn"
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onFormat('removeFormat')}
        title="Clear formatting / More"
        className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm transition-colors ${
          darkMode ? 'hover:bg-zinc-700 text-zinc-300' : 'hover:bg-gray-100 text-gray-600'
        }`}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
    </div>
  );
};
