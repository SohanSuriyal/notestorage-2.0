import React, { useState, useEffect } from 'react';
import {
  Plus,
  Folder,
  FolderPlus,
  ArrowRight,
  ChevronLeft,
  Search,
  Bookmark,
  FileText,
  Clock,
  Layers,
  X,
} from 'lucide-react';
import { NoteItem } from '../types';
import { AddSubjectModal } from './AddSubjectModal';

interface SubjectsViewProps {
  notes: NoteItem[];
  onSelectNote: (noteId: string) => void;
  onCreateNote: (subject?: string, topic?: string) => void;
  onAddSubject?: (subjectName: string, initialTopic?: string, openEditor?: boolean) => void;
  customSubjects?: string[];
  initialSubject?: string | null;
  onClearInitialSubject?: () => void;
  darkMode?: boolean;
}

function formatLastUpdated(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function stripHtml(html?: string): string {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  const text = tmp.textContent || tmp.innerText || '';
  return text.trim().slice(0, 100);
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  notes,
  onSelectNote,
  onCreateNote,
  onAddSubject,
  customSubjects = [],
  initialSubject = null,
  onClearInitialSubject,
  darkMode = false,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(initialSubject);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTopicDraft, setNewTopicDraft] = useState('');
  const [isAddingNewTopic, setIsAddingNewTopic] = useState(false);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);

  // Sync initialSubject prop if passed from parent (e.g. Dashboard navigation)
  useEffect(() => {
    if (initialSubject) {
      setSelectedSubject(initialSubject);
    }
  }, [initialSubject]);

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setSearchQuery('');
    setIsAddingNewTopic(false);
    setNewTopicDraft('');
    if (onClearInitialSubject) {
      onClearInitialSubject();
    }
  };

  const handleCreateTopicNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedSubject) return;
    const topicName = newTopicDraft.trim() || 'General';
    onCreateNote(selectedSubject, topicName);
    setNewTopicDraft('');
    setIsAddingNewTopic(false);
  };

  // Collect all unique subjects from notes and any custom subjects created
  const subjects = Array.from(
    new Set<string>([
      ...notes.map((n) => n.subject).filter((s): s is string => Boolean(s)),
      ...customSubjects,
    ])
  ).sort();

  // --------------------------------------------------------------------------
  // VIEW 1: DRILL-DOWN TOPICS GRID FOR THE SELECTED SUBJECT
  // --------------------------------------------------------------------------
  if (selectedSubject) {
    const subjectNotes = notes.filter((n) => n.subject === selectedSubject);

    // Group notes by topic
    const topicMap = new Map<string, NoteItem[]>();
    subjectNotes.forEach((note) => {
      const topicName = note.topic?.trim() || 'General';
      if (!topicMap.has(topicName)) {
        topicMap.set(topicName, []);
      }
      topicMap.get(topicName)!.push(note);
    });

    // Array of topics sorted by latest note updated
    const allTopics = Array.from(topicMap.keys()).map((topicName) => {
      const topicNotes = topicMap.get(topicName) || [];
      const sorted = [...topicNotes].sort((a, b) => b.updated - a.updated);
      return {
        name: topicName,
        notes: sorted,
        latestNote: sorted[0],
        lastUpdated: sorted[0]?.updated || 0,
      };
    }).sort((a, b) => b.lastUpdated - a.lastUpdated);

    // Filter topics by search query
    const filteredTopics = searchQuery.trim()
      ? allTopics.filter(
          (t) =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.notes.some(
              (n) =>
                n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                stripHtml(n.content).toLowerCase().includes(searchQuery.toLowerCase())
            )
        )
      : allTopics;

    return (
      <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 select-none max-w-6xl mx-auto w-full">
        {/* Top Navigation & Breadcrumbs */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="back-to-subjects-btn"
              onClick={handleBackToSubjects}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                darkMode
                  ? 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-2xs'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back to Subjects</span>
            </button>

            <span className="text-gray-400 dark:text-zinc-600 text-xs">/</span>
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              {selectedSubject} Topics
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <h1
                  className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {selectedSubject}
                </h1>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 pl-11">
                {allTopics.length} topic{allTopics.length !== 1 ? 's' : ''} worked on ·{' '}
                {subjectNotes.length} note{subjectNotes.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="create-topic-note-btn"
                onClick={() => onCreateNote(selectedSubject)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-700 transition-all active:scale-95 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Note in {selectedSubject}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Topics Bar */}
        <div className="relative mb-6">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            id="search-topics-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search topics or notes in ${selectedSubject}...`}
            className={`w-full pl-10 pr-9 py-2.5 rounded-xl border text-xs outline-none transition-colors ${
              darkMode
                ? 'bg-zinc-800/90 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:border-purple-500'
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-purple-600 shadow-2xs'
            }`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Add New Topic Inline Form */}
        {isAddingNewTopic ? (
          <form
            onSubmit={handleCreateTopicNote}
            className={`mb-6 p-4 rounded-2xl border flex flex-col sm:flex-row items-stretch sm:items-center gap-3 ${
              darkMode ? 'bg-zinc-800/80 border-purple-900/50' : 'bg-purple-50/50 border-purple-200'
            }`}
          >
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-purple-700 dark:text-purple-300 mb-1">
                New Topic Name
              </label>
              <input
                type="text"
                autoFocus
                value={newTopicDraft}
                onChange={(e) => setNewTopicDraft(e.target.value)}
                placeholder="e.g. Transactions, Relational Algebra, Week 8..."
                className={`w-full px-3 py-1.5 rounded-lg border text-xs outline-none ${
                  darkMode
                    ? 'bg-zinc-900 border-zinc-700 text-zinc-100'
                    : 'bg-white border-purple-300 text-gray-900'
                }`}
              />
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto mt-2 sm:mt-4">
              <button
                type="submit"
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                Create & Open Note
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingNewTopic(false);
                  setNewTopicDraft('');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${
                  darkMode
                    ? 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-750'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-600 dark:text-zinc-400">
              Topics Grid ({filteredTopics.length})
            </span>
            <button
              type="button"
              onClick={() => setIsAddingNewTopic(true)}
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Topic</span>
            </button>
          </div>
        )}

        {/* GRID OF TOPICS WORKED ON */}
        {filteredTopics.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {filteredTopics.map((topic) => {
              const count = topic.notes.length;
              const previewText = stripHtml(topic.latestNote?.content);

              return (
                <div
                  key={topic.name}
                  id={`topic-card-${topic.name.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => topic.latestNote && onSelectNote(topic.latestNote.id)}
                  className={`group p-5 rounded-2xl border transition-all duration-150 flex flex-col justify-between min-h-[190px] cursor-pointer shadow-2xs hover:shadow-md hover:-translate-y-0.5 ${
                    darkMode
                      ? 'bg-zinc-800/80 border-zinc-700/80 hover:border-purple-500 hover:bg-zinc-800'
                      : 'bg-white border-gray-200 hover:border-purple-400 hover:bg-purple-50/20'
                  }`}
                >
                  <div>
                    {/* Topic Header: Icon, Name & Note Count */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="w-9 h-9 rounded-xl bg-purple-100/70 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Bookmark className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          darkMode
                            ? 'bg-zinc-700/80 text-zinc-300'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {count} note{count !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <h3
                      className={`text-base font-bold truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}
                      title={topic.name}
                    >
                      {topic.name}
                    </h3>

                    {/* Latest Note Title & Snippet */}
                    <div className="mt-2 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-zinc-200 truncate">
                        <FileText className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span className="truncate">{topic.latestNote?.title || 'Untitled note'}</span>
                      </div>
                      {previewText && (
                        <p className="text-[11px] text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {previewText}
                        </p>
                      )}
                    </div>

                    {/* Multiple notes sub-links */}
                    {topic.notes.length > 1 && (
                      <div className="mt-2.5 pt-2 border-t border-dashed border-gray-100 dark:border-zinc-700/60 flex flex-wrap gap-1">
                        {topic.notes.slice(0, 3).map((n) => (
                          <button
                            key={n.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectNote(n.id);
                            }}
                            className={`text-[10px] px-1.5 py-0.5 rounded border truncate max-w-[120px] transition-colors ${
                              darkMode
                                ? 'border-zinc-700 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700'
                                : 'border-gray-200 text-gray-600 hover:text-purple-700 hover:bg-purple-50'
                            }`}
                            title={`Open "${n.title}"`}
                          >
                            {n.title}
                          </button>
                        ))}
                        {topic.notes.length > 3 && (
                          <span className="text-[10px] text-gray-400 self-center">
                            +{topic.notes.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Bar */}
                  <div className="flex items-center justify-between pt-3 mt-4 border-t border-gray-100 dark:border-zinc-700/70">
                    <div className="flex items-center gap-1 text-[11px] text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatLastUpdated(topic.lastUpdated)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreateNote(selectedSubject, topic.name);
                        }}
                        className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                          darkMode
                            ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-200'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                        title={`Create new note in ${topic.name}`}
                      >
                        + Note
                      </button>

                      <div className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform">
                        <span>Open</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className={`p-10 text-center rounded-2xl border border-dashed ${
              darkMode ? 'border-zinc-700 bg-zinc-800/40' : 'border-gray-300 bg-gray-50/50'
            }`}
          >
            <Bookmark className="w-8 h-8 text-purple-500 mx-auto mb-3" />
            <h3 className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {searchQuery ? `No topics found matching "${searchQuery}"` : `No topics yet in ${selectedSubject}`}
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'Try a different search keyword or create a new note with this topic.'
                : 'Start organizing your thoughts by creating your first note for this subject.'}
            </p>
            <button
              type="button"
              onClick={() => onCreateNote(selectedSubject, searchQuery.trim() || undefined)}
              className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
            >
              + Create Note {searchQuery ? `in "${searchQuery}"` : ''}
            </button>
          </div>
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // VIEW 2: SUBJECTS OVERVIEW
  // --------------------------------------------------------------------------
  return (
    <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 select-none max-w-6xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
        <div>
          <span className="text-xs font-semibold tracking-wide uppercase text-gray-500 dark:text-zinc-400">
            Library
          </span>
          <h1 className={`text-3xl font-bold tracking-tight mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Subjects
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            id="add-subject-header-btn"
            onClick={() => setIsAddSubjectModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#7F56D9] text-white rounded-xl text-xs font-semibold hover:bg-[#6941C6] transition-all active:scale-95 shadow-xs cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>

          <button
            type="button"
            id="new-note-btn"
            onClick={() => onCreateNote()}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 shadow-2xs cursor-pointer ${
              darkMode
                ? 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New note</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {subjects.map((sub) => {
          const subNotes = notes.filter((n) => n.subject === sub);
          const topics: string[] = Array.from(
            new Set(subNotes.map((n) => n.topic).filter((t): t is string => Boolean(t)))
          );

          return (
            <div
              key={sub}
              id={`subject-card-${sub.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => setSelectedSubject(sub)}
              className={`p-5 rounded-2xl border transition-all duration-150 flex flex-col justify-between min-h-[170px] shadow-2xs hover:shadow-md cursor-pointer hover:-translate-y-0.5 ${
                darkMode
                  ? 'bg-zinc-800/80 border-zinc-700 hover:border-purple-500/80'
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

                {/* Topic tags teaser */}
                {topics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {topics.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-medium truncate max-w-[120px] ${
                          darkMode ? 'bg-zinc-700/80 text-zinc-300' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {t}
                      </span>
                    ))}
                    {topics.length > 3 && (
                      <span className="text-[10px] text-gray-400 self-center">
                        +{topics.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100 dark:border-zinc-700/80">
                {/* View notes button: Opens the Grid of Topics worked on in this subject */}
                <button
                  type="button"
                  id={`view-notes-btn-${sub.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSubject(sub);
                  }}
                  className="text-xs font-semibold text-[#7F56D9] hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <span>View notes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateNote(sub);
                  }}
                  className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 rounded-lg text-gray-700 dark:text-zinc-200 font-medium cursor-pointer"
                >
                  + Add note
                </button>
              </div>
            </div>
          );
        })}

        {/* Add New Subject Card */}
        <div
          id="add-subject-grid-card"
          onClick={() => setIsAddSubjectModalOpen(true)}
          className={`p-5 rounded-2xl border-2 border-dashed transition-all duration-150 flex flex-col items-center justify-center text-center min-h-[170px] cursor-pointer hover:-translate-y-0.5 group ${
            darkMode
              ? 'border-zinc-700/80 hover:border-purple-500 bg-zinc-800/30 hover:bg-zinc-800/70 text-zinc-400 hover:text-purple-400'
              : 'border-gray-300 hover:border-purple-400 bg-purple-50/20 hover:bg-purple-50/60 text-gray-500 hover:text-purple-600'
          }`}
        >
          <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-[#7F56D9] dark:text-purple-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform shadow-2xs">
            <FolderPlus className="w-5 h-5" />
          </div>
          <h3
            className={`text-sm font-bold transition-colors ${
              darkMode ? 'group-hover:text-white text-zinc-200' : 'group-hover:text-gray-900 text-gray-800'
            }`}
          >
            + Add New Subject
          </h3>
          <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-1 max-w-[180px]">
            Create a new subject area for your notes and topics
          </p>
        </div>
      </div>

      {/* Add Subject Modal */}
      <AddSubjectModal
        isOpen={isAddSubjectModalOpen}
        onClose={() => setIsAddSubjectModalOpen(false)}
        existingSubjects={subjects}
        onSubmit={(newSub, newTop, openEditor) => {
          if (onAddSubject) {
            onAddSubject(newSub, newTop, openEditor);
          } else {
            onCreateNote(newSub, newTop);
          }
        }}
        darkMode={darkMode}
      />
    </div>
  );
};
