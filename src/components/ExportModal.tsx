import React from 'react';
import { X, FileCode, FileText, Download, Printer } from 'lucide-react';
import { NoteItem } from '../types';

interface ExportModalProps {
  note: NoteItem;
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  note,
  isOpen,
  onClose,
  darkMode = false,
}) => {
  if (!isOpen) return null;

  const handleDownloadHtml = () => {
    // Generate full standalone HTML document
    const title = note.title || 'Untitled note';
    const htmlContent = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} - NoteStorage</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      max-width: 860px;
      margin: 40px auto;
      padding: 0 24px;
      color: #111827;
      line-height: 1.7;
    }
    .header {
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    h1 {
      font-size: 32px;
      font-weight: 800;
      margin: 0 0 8px 0;
    }
    .meta {
      font-size: 14px;
      color: #6b7280;
    }
    .content {
      font-size: 16px;
    }
    .content img {
      max-width: 100%;
      border-radius: 8px;
    }
    .check-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 6px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <div class="meta">Subject: ${note.subject || 'General'} | Topic: ${note.topic || 'General'} | Updated: ${new Date(note.updated).toLocaleString()}</div>
  </div>
  <div class="content">
    ${note.content || '<p>No written text</p>'}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9_-]/gi, '_').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(note, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(note.title || 'note').replace(/[^a-z0-9_-]/gi, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  const handlePrint = () => {
    window.print();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
      <div
        className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all ${
          darkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-white border-gray-200 text-gray-900'
        }`}
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-zinc-700">
          <div>
            <h3 className="text-lg font-bold">Export Note</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400">Choose your preferred export format</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {/* Export HTML */}
          <button
            onClick={handleDownloadHtml}
            className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-colors ${
              darkMode
                ? 'border-zinc-700 hover:bg-zinc-700/60'
                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-[#7F56D9] flex items-center justify-center">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">Download Standalone HTML</div>
                <div className="text-xs text-gray-500 dark:text-zinc-400">Viewable in any web browser</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-gray-400" />
          </button>

          {/* Export JSON */}
          <button
            onClick={handleDownloadJson}
            className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-colors ${
              darkMode
                ? 'border-zinc-700 hover:bg-zinc-700/60'
                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">Download Raw JSON</div>
                <div className="text-xs text-gray-500 dark:text-zinc-400">Includes stroke vectors and metadata</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-gray-400" />
          </button>

          {/* Print / PDF */}
          <button
            onClick={handlePrint}
            className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-colors ${
              darkMode
                ? 'border-zinc-700 hover:bg-zinc-700/60'
                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">Print / Save as PDF</div>
                <div className="text-xs text-gray-500 dark:text-zinc-400">Standard browser print dialog</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
