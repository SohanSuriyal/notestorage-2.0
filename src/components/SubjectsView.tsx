import React from 'react';
import { Plus, Folder, ArrowRight } from 'lucide-react';
import { NoteItem } from '../types';

interface SubjectsViewProps {
  notes: NoteItem[];
  onSelectNote: (noteId: string) => void;
  onCreateNote: (subject?: string, topic?: string) => void;
  darkMode?: boolean;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  notes,
  onSelectNote,
  onCreateNote,
  darkMode = false,
}) => {
  const subjects = Array.from(new Set(notes.map((n) => n.subject).filter(Boolean))).sort();

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 select-none max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between gap-4 mb-7">
        <div>
          <span className="text-xs font-semibold tracking-wide uppercase text-gray-500 dark:text-zinc-400">
            Library
          </span>
          <h1 className={`text-3xl font-bold tracking-tight mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Subjects
          </h1>
        </div>

        <button
          onClick={() => onCreateNote()}
          className="flex items-center gap-2 px-4 py-2 bg-[#7F56D9] text-white rounded-xl text-sm font-semibold hover:bg-[#6941C6] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New note</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {subjects.map((sub) => {
          const subNotes = notes.filter((n) => n.subject === sub);
          const topics = Array.from(new Set(subNotes.map((n) => n.topic).filter(Boolean)));

          return (
            <div
              key={sub}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between min-h-[160px] shadow-2xs ${
                darkMode
                  ? 'bg-zinc-800/80 border-zinc-700 hover:border-purple-500/50'
                  : 'bg-white border-gray-200 hover:border-purple-300'
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#7F56D9] flex items-center justify-center mb-3">
                  <Folder className="w-5 h-5" />
                </div>
                <h3 className={`text-lg font-bold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{sub}</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                  {subNotes.length} note{subNotes.length !== 1 ? 's' : ''} · {topics.length} topic
                  {topics.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100 dark:border-zinc-700/80">
                <button
                  onClick={() => subNotes[0] && onSelectNote(subNotes[0].id)}
                  className="text-xs font-semibold text-[#7F56D9] hover:underline flex items-center gap-1"
                >
                  <span>View notes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onCreateNote(sub)}
                  className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 rounded-lg text-gray-700 dark:text-zinc-200 font-medium"
                >
                  + Add note
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
