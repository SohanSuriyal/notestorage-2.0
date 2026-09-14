import React from 'react';
import { Star, FileText, ArrowRight } from 'lucide-react';
import { NoteItem } from '../types';

interface FavoritesViewProps {
  notes: NoteItem[];
  onSelectNote: (noteId: string) => void;
  onToggleFavorite: (noteId: string) => void;
  darkMode?: boolean;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  notes,
  onSelectNote,
  onToggleFavorite,
  darkMode = false,
}) => {
  const favNotes = notes.filter((n) => n.favorite);

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 select-none max-w-5xl mx-auto w-full">
      <div className="mb-7">
        <span className="text-xs font-semibold tracking-wide uppercase text-gray-500 dark:text-zinc-400">
          Starred
        </span>
        <h1 className={`text-3xl font-bold tracking-tight mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Favorites
        </h1>
      </div>

      {favNotes.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {favNotes.map((note) => (
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
                <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center flex-shrink-0">
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

              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => onToggleFavorite(note.id)}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                  title="Remove from favorites"
                >
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                </button>
                <button
                  onClick={() => onSelectNote(note.id)}
                  className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-gray-200 dark:border-zinc-700">
          <Star className="w-10 h-10 text-gray-300 dark:text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-700 dark:text-zinc-300">
            No favorite notes yet
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Star notes to quickly access them from here anytime.
          </p>
        </div>
      )}
    </div>
  );
};
