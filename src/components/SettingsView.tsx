import React, { useState, useRef } from 'react';
import { Download, Upload, Trash2, CheckCircle2, Shield } from 'lucide-react';
import { AppSettings, NoteItem } from '../types';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  notes: NoteItem[];
  onImportNotes: (imported: NoteItem[]) => void;
  onDeleteAllNotes: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  notes,
  onImportNotes,
  onDeleteAllNotes,
  darkMode,
  onToggleDarkMode,
}) => {
  const [activeTab, setActiveTab] = useState<'appearance' | 'notes' | 'storage' | 'organization' | 'privacy' | 'data'>('appearance');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalBytes = notes.reduce(
    (sum, n) => sum + (n.content?.length || 0) * 2 + (n.title?.length || 0) * 2 + (n.strokes?.length || 0) * 80,
    0
  );

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const handleExportBackup = () => {
    const backup = {
      version: 2,
      app: 'NoteStorage',
      exportedAt: new Date().toISOString(),
      notes,
      settings,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notestorage-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data.notes)) {
          onImportNotes(data.notes);
          alert(`Successfully imported ${data.notes.length} note(s)!`);
        } else if (Array.isArray(data)) {
          onImportNotes(data);
          alert(`Successfully imported ${data.length} note(s)!`);
        }
      } catch (err) {
        alert('Invalid backup file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 select-none max-w-5xl mx-auto w-full">
      <div className="mb-7">
        <span className="text-xs font-semibold tracking-wide uppercase text-gray-500 dark:text-zinc-400">
          Preferences
        </span>
        <h1 className={`text-3xl font-bold tracking-tight mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Settings
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Settings Navigation */}
        <div className="flex flex-col gap-1">
          {[
            { id: 'appearance', label: 'Appearance' },
            { id: 'notes', label: 'Notes' },
            { id: 'storage', label: 'Storage & Backup' },
            { id: 'organization', label: 'Organization' },
            { id: 'privacy', label: 'Privacy' },
            { id: 'data', label: 'Data Management' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? darkMode
                    ? 'bg-purple-900/40 text-purple-300'
                    : 'bg-purple-50 text-[#7F56D9]'
                  : darkMode
                  ? 'text-zinc-400 hover:bg-zinc-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Settings Content */}
        <div className="md:col-span-3">
          {activeTab === 'appearance' && (
            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-zinc-800/60 border-zinc-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Appearance</h3>
              <p className="text-xs text-gray-500 mb-6">Customize how NoteStorage looks and responds.</p>

              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-zinc-700">
                <div>
                  <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dark mode</div>
                  <div className="text-xs text-gray-500">Toggle dark slate workspace.</div>
                </div>
                <button
                  onClick={onToggleDarkMode}
                  className={`relative w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    darkMode ? 'bg-[#7F56D9]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      darkMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Compact Spacing</div>
                  <div className="text-xs text-gray-500">Reduce margins for higher information density.</div>
                </div>
                <button
                  onClick={() => onUpdateSettings({ compact: !settings.compact })}
                  className={`relative w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    settings.compact ? 'bg-[#7F56D9]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.compact ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-zinc-800/60 border-zinc-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Notes Preferences</h3>
              <p className="text-xs text-gray-500 mb-6">Configure defaults for note sorting and display.</p>

              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-zinc-700">
                <div>
                  <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Default View</div>
                  <div className="text-xs text-gray-500">Choose between grid or list views.</div>
                </div>
                <div className="flex rounded-lg border border-gray-200 dark:border-zinc-700 p-0.5">
                  {(['grid', 'list'] as const).map((view) => (
                    <button
                      key={view}
                      onClick={() => onUpdateSettings({ defaultView: view })}
                      className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-colors ${
                        settings.defaultView === view
                          ? 'bg-[#7F56D9] text-white'
                          : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {view}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'storage' && (
            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-zinc-800/60 border-zinc-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Storage & Backup</h3>
              <p className="text-xs text-gray-500 mb-6">All notes and drawings are safely preserved in this browser.</p>

              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-zinc-700">
                <div>
                  <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Notes Stored</div>
                  <div className="text-xs text-gray-500">{notes.length} notes in current library.</div>
                </div>
                <span className={`text-sm font-bold ${darkMode ? 'text-zinc-200' : 'text-gray-800'}`}>
                  {formatBytes(totalBytes)}
                </span>
              </div>

              <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-zinc-700">
                <div>
                  <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Export Backup</div>
                  <div className="text-xs text-gray-500">Download complete library with drawings as JSON.</div>
                </div>
                <button
                  onClick={handleExportBackup}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7F56D9] text-white rounded-lg text-xs font-semibold hover:bg-[#6941C6]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Backup</span>
                </button>
              </div>

              <div className="flex items-center justify-between py-4">
                <div>
                  <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Import Backup</div>
                  <div className="text-xs text-gray-500">Restore or merge previous NoteStorage backups.</div>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 dark:border-zinc-600 rounded-lg text-xs font-semibold hover:bg-gray-100 dark:hover:bg-zinc-700"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload JSON</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {activeTab === 'organization' && (
            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-zinc-800/60 border-zinc-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-lg font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Organization</h3>
              <p className="text-xs text-gray-500 mb-6">Tune how subjects and topics are remembered.</p>

              <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-zinc-700">
                <div>
                  <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Remember Last Subject</div>
                  <div className="text-xs text-gray-500">Auto-assign new notes to your most recently used subject.</div>
                </div>
                <button
                  onClick={() => onUpdateSettings({ rememberLastSubject: !settings.rememberLastSubject })}
                  className={`relative w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    settings.rememberLastSubject ? 'bg-[#7F56D9]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.rememberLastSubject ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Confirm Before Deleting</div>
                  <div className="text-xs text-gray-500">Prompt a confirmation dialog before permanently deleting notes.</div>
                </div>
                <button
                  onClick={() => onUpdateSettings({ confirmDelete: !settings.confirmDelete })}
                  className={`relative w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    settings.confirmDelete ? 'bg-[#7F56D9]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.confirmDelete ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-zinc-800/60 border-zinc-700' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-5 h-5 text-[#12B76A]" />
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Device-Only Privacy</h3>
              </div>
              <p className="text-xs text-gray-500 mb-6">NoteStorage runs completely client-side in your browser.</p>

              <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-zinc-700">
                <CheckCircle2 className="w-4 h-4 text-[#12B76A] flex-shrink-0 mt-0.5" />
                <div>
                  <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Local-First Architecture</div>
                  <div className="text-xs text-gray-500">Your notes and drawings are never transmitted to external cloud servers without your explicit action.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 py-3">
                <CheckCircle2 className="w-4 h-4 text-[#12B76A] flex-shrink-0 mt-0.5" />
                <div>
                  <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Offline Resilience</div>
                  <div className="text-xs text-gray-500">All features, rich text editing, and handwriting canvases work offline seamlessly.</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className={`p-6 rounded-2xl border border-red-200 dark:border-red-900/40 ${darkMode ? 'bg-red-950/10' : 'bg-red-50/30'}`}>
              <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-1">Danger Zone</h3>
              <p className="text-xs text-gray-500 mb-6">Permanent actions that cannot be reversed.</p>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-red-600 dark:text-red-400">Delete All Notes</div>
                  <div className="text-xs text-gray-500">Permanently erase every subject, topic, and note in this browser.</div>
                </div>
                <button
                  onClick={onDeleteAllNotes}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Everything</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
