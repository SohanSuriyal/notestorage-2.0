import React, { useState } from 'react';
import { Plus, Search, BookOpen, Clock, FileText, ArrowRight } from 'lucide-react';
import { NoteItem } from '../types';

interface DashboardViewProps {
  notes: NoteItem[];
  onSelectNote: (noteId: string) => void;
  onCreateNote: (subject?: string, topic?: string) => void;
  onViewSubject?: (subject: string) => void;
  darkMode?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  notes,
  onSelectNote,
  onCreateNote,
  onViewSubject,
  darkMode = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Collect unique subjects
  const subjects = Array.from(new Set(notes.map((n) => n.subject).filter(Boolean))).sort();

  const filteredNotes = searchQuery.trim()
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.topic.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : notes;

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 select-none max-w-6xl mx-auto w-full">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
        <div>
          <span className="text-xs font-semibold tracking-wide uppercase text-gray-500 dark:text-zinc-400">
            Your learning library
          </span>
          <h1 className={`text-3xl font-bold tracking-tight mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Welcome back
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onCreateNote()}
            className="flex items-center gap-2 px-4 py-2 bg-[#7F56D9] text-white rounded-xl text-sm font-semibold hover:bg-[#6941C6] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New note</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-7">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search your notes, subjects, or topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm outline-none transition-colors ${
            darkMode
              ? 'bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:border-purple-500'
              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#7F56D9]'
          }`}
        />
      </div>

      {/* Subjects Overview */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Subjects</h2>
          <span className="text-sm text-gray-500 dark:text-zinc-400">{notes.length} total notes</span>
        </div>

        {subjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {subjects.map((sub) => {
              const subNotes = notes.filter((n) => n.subject === sub);
              const topics = Array.from(new Set(subNotes.map((n) => n.topic).filter(Boolean)));

              return (
                <div
                  key={sub}
                  onClick={() => {
                    if (onViewSubject) {
                      onViewSubject(sub);
                    } else if (subNotes[0]) {
                      onSelectNote(subNotes[0].id);
                    }
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer hover:-translate-y-0.5 shadow-2xs ${
                    darkMode
                      ? 'bg-zinc-800/80 border-zinc-700 hover:border-purple-500/50'
                      : 'bg-white border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl mb-2">📚</div>
                  <h3 className={`text-base font-bold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {sub}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400 mt-4">
                    <span>
                      {subNotes.length} note{subNotes.length !== 1 ? 's' : ''} · {topics.length} topic
                      {topics.length !== 1 ? 's' : ''}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl border border-dashed border-gray-200 dark:border-zinc-700">
            <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-zinc-400">No subjects yet.</p>
          </div>
        )}
      </div>

      {/* Recent Notes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Notes</h2>
        </div>

        {filteredNotes.length > 0 ? (
          <div className="flex flex-col gap-2">
            {filteredNotes.slice(0, 8).map((note) => (
              <div
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className={`flex items-center justify-between p-4 rounded-xl border transition-colors cursor-pointer ${
                  darkMode
                    ? 'bg-zinc-800/60 border-zinc-700 hover:bg-zinc-800'
                    : 'bg-white border-gray-200 hover:bg-purple-50/40 hover:border-purple-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
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

                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(note.updated).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl border border-dashed border-gray-200 dark:border-zinc-700">
            <p className="text-sm text-gray-500 dark:text-zinc-400">No matching notes found.</p>
          </div>
        )}
      </div>
    </div>
  );
};
