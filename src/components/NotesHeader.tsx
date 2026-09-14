import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  CheckCircle2,
  Pencil,
  Upload,
  Trash2,
} from 'lucide-react';

interface NotesHeaderProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  onBack: () => void;
  onExport: () => void;
  onDelete: () => void;
  isSaved: boolean;
  darkMode?: boolean;
}

export const NotesHeader: React.FC<NotesHeaderProps> = ({
  title,
  onTitleChange,
  onBack,
  onExport,
  onDelete,
  isSaved,
  darkMode = false,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitleDraft(title);
  }, [title]);

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleSaveTitle = () => {
    const trimmed = titleDraft.trim();
    if (trimmed) {
      onTitleChange(trimmed);
    } else {
      setTitleDraft(title);
    }
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setTitleDraft(title);
      setIsEditingTitle(false);
    }
  };

  return (
    <header className="flex items-center justify-between gap-4 py-2 select-none">
      {/* Left side: Back to notes + Note Title */}
      <div className="flex items-center gap-5 min-w-0">
        <button
          id="back-to-notes-btn"
          onClick={onBack}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-sm font-medium transition-colors shadow-2xs ${
            darkMode
              ? 'border-zinc-700 bg-zinc-800/80 text-zinc-200 hover:bg-zinc-800'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <ChevronLeft className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
          <span>Notes</span>
        </button>

        {isEditingTitle ? (
          <input
            ref={inputRef}
            id="note-title-input"
            type="text"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={handleKeyDown}
            className={`text-2xl font-bold tracking-tight px-1 py-0.5 rounded-md border outline-none ${
              darkMode
                ? 'bg-zinc-800 border-zinc-700 text-white'
                : 'bg-white border-purple-400 text-gray-900 ring-2 ring-purple-100'
            }`}
          />
        ) : (
          <h1
            id="note-title-heading"
            onClick={() => setIsEditingTitle(true)}
            className={`text-2xl font-bold tracking-tight cursor-pointer hover:opacity-80 transition-opacity truncate ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}
            title="Click to rename"
          >
            {title || 'Untitled note'}
          </h1>
        )}
      </div>

      {/* Right side: Saved badge, Rename, Export, Delete */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        {/* Saved Status Indicator */}
        <div className="flex items-center gap-1.5 mr-2">
          <CheckCircle2 className="w-4 h-4 text-[#12B76A] fill-[#12B76A] text-white" />
          <span className="text-sm font-normal text-gray-600 dark:text-zinc-400">
            {isSaved ? 'Saved' : 'Saving...'}
          </span>
        </div>

        {/* Rename Button */}
        <button
          id="rename-note-btn"
          onClick={() => setIsEditingTitle(true)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-sm font-medium transition-colors shadow-2xs ${
            darkMode
              ? 'border-zinc-700 bg-zinc-800/80 text-zinc-200 hover:bg-zinc-800'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Pencil className="w-4 h-4 text-gray-600 dark:text-zinc-400" />
          <span>Rename</span>
        </button>

        {/* Export Button */}
        <button
          id="export-note-btn"
          onClick={onExport}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-sm font-medium transition-colors shadow-2xs ${
            darkMode
              ? 'border-zinc-700 bg-zinc-800/80 text-zinc-200 hover:bg-zinc-800'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Upload className="w-4 h-4 text-gray-600 dark:text-zinc-400" />
          <span>Export</span>
        </button>

        {/* Delete Button */}
        <button
          id="delete-note-btn"
          onClick={onDelete}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-sm font-medium transition-colors shadow-2xs ${
            darkMode
              ? 'border-red-900/50 bg-red-950/20 text-red-400 hover:bg-red-950/40'
              : 'border-[#FDA29B] bg-white text-[#D92D20] hover:bg-red-50/60'
          }`}
        >
          <Trash2 className="w-4 h-4 text-[#D92D20] dark:text-red-400" />
          <span>Delete</span>
        </button>
      </div>
    </header>
  );
};
