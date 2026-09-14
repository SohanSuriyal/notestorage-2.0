import React from 'react';
import { Clock, FileText, Star } from 'lucide-react';
import { NoteItem } from '../types';

interface RecentViewProps {
  notes: NoteItem[];
  onSelectNote: (noteId: string) => void;
  onToggleFavorite: (noteId: string) => void;
  darkMode?: boolean;
}

export const RecentView: React.FC<RecentViewProps> = ({
  notes,
  onSelectNote,
  onToggleFavorite,
  darkMode = false,
}) => {
  const sortedNotes = [...notes].sort((a, b) => b.updated - a.updated);

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 select-none max-w-5xl mx-auto w-full">
      <div className="mb-7">
        <span className="text-xs font-semibold tracking-wide uppercase text-gray-500 dark:text-zinc-400">
          History
        </span>
        <h1 className={`text-3xl font-bold tracking-tight mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Recent Notes
        </h1>
      </div>

      <div className="flex flex-col gap-2.5">
        {sortedNotes.map((note) => (
          <div
            key={note.id}
            className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
              darkMode
                ? 'bg-zinc-800/60 border-zinc-700 hover:bg-zinc-800'
                : 'bg-white border-gray-200 hover:border-purple-200 hover:bg-purple-50/20 shadow-2xs'
            }`}
          >
            <div
              onClick={() => onSelectNote(note.id)}
              className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-[#7F56D9] flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="truncate">
                <h4 className={`text-sm font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {note.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                  {note.subject || 'General'} {note.topic ? `· ${note.topic}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date(note.updated).toLocaleDateString()}</span>
              </div>
              <button
                onClick={() => onToggleFavorite(note.id)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                title={note.favorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star
                  className={`w-4 h-4 ${
                    note.favorite ? 'text-amber-400 fill-amber-400' : 'text-gray-400'
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
