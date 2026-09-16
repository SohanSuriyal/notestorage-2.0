import React, { useRef, useState } from 'react';
import {
  Check,
  Image as ImageIcon,
  RotateCcw,
  Upload,
  X,
} from 'lucide-react';

export interface BrandingSettingsData {
  dataUrl: string | null;
  fileName: string;
  size: number;
  position: 'left' | 'right' | 'replace';
  showName: boolean;
}

const STORAGE_KEY = 'ns_branding';
const DEFAULT_BRANDING: BrandingSettingsData = {
  dataUrl: null,
  fileName: '',
  size: 56,
  position: 'replace',
  showName: false,
};

export const loadBrandingSettings = (): BrandingSettingsData => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_BRANDING;
    return { ...DEFAULT_BRANDING, ...JSON.parse(saved) };
  } catch {
    return DEFAULT_BRANDING;
  }
};

export const BrandingSettings: React.FC<{ darkMode: boolean; onClose: () => void }> = ({
  darkMode,
  onClose,
}) => {
  const [branding, setBranding] = useState<BrandingSettingsData>(loadBrandingSettings);
  const [pending, setPending] = useState<BrandingSettingsData>(loadBrandingSettings);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
      setBranding(pending);
      window.dispatchEvent(new Event('ns-branding-updated'));
      onClose();
    } catch {
      setError('Could not save the logo. The image may be too large for browser storage.');
    }
  };

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setBranding(DEFAULT_BRANDING);
    setPending(DEFAULT_BRANDING);
    setError('');
    window.dispatchEvent(new Event('ns-branding-updated'));
  };

  const readPng = (file: File) => {
    setError('');
    if (file.type !== 'image/png') {
      setError('Please choose a PNG file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Please use a PNG smaller than 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPending((prev) => ({
        ...prev,
        dataUrl: reader.result as string,
        fileName: file.name,
      }));
    };
    reader.onerror = () => setError('Could not read that PNG file.');
    reader.readAsDataURL(file);
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) readPng(file);
    event.target.value = '';
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) readPng(file);
  };

  const previewLogo = pending.dataUrl;
  const textClass = darkMode ? 'text-white' : 'text-gray-900';
  const mutedClass = darkMode ? 'text-zinc-400' : 'text-gray-500';
  const cardClass = darkMode
    ? 'bg-zinc-800/80 border-zinc-700'
    : 'bg-white border-gray-200 shadow-xs';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border ${cardClass}`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-zinc-700">
          <div>
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#7F56D9]" />
              <h2 className={`text-xl font-bold ${textClass}`}>Logo & Branding</h2>
            </div>
            <p className={`text-xs mt-1 ${mutedClass}`}>
              Upload your own PNG and customize how it appears in NoteStorage.
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700" title="Close">
            <X className={`w-5 h-5 ${mutedClass}`} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className={`p-5 rounded-2xl border ${cardClass}`}>
            <div className="flex items-center gap-2 mb-1">
              <ImageIcon className="w-5 h-5 text-[#7F56D9]" />
              <h3 className={`text-lg font-bold ${textClass}`}>Upload Custom Logo</h3>
            </div>
            <p className={`text-xs mb-4 ${mutedClass}`}>PNG only. Transparent backgrounds work best. Maximum file size: 2 MB.</p>

            <input ref={fileInputRef} type="file" accept="image/png" onChange={handleFile} className="hidden" />
            <div
              onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
                dragging
                  ? 'border-[#7F56D9] bg-purple-50 dark:bg-purple-950/30'
                  : 'border-purple-200 dark:border-purple-800 hover:bg-purple-50/50 dark:hover:bg-purple-950/20'
              }`}
            >
              {previewLogo ? (
                <img src={previewLogo} alt="Uploaded logo preview" style={{ width: Math.min(pending.size, 80), height: Math.min(pending.size, 80) }} className="mx-auto mb-3 object-contain rounded-lg" />
              ) : (
                <Upload className="w-9 h-9 mx-auto mb-3 text-[#7F56D9]" />
              )}
              <div className={`text-sm font-semibold ${textClass}`}>
                {dragging ? 'Drop your PNG here' : 'Drag & drop a PNG image here'}
              </div>
              <div className={`text-xs mt-1 ${mutedClass}`}>or click to browse</div>
              <span className="inline-flex mt-4 px-4 py-2 rounded-lg bg-[#7F56D9] text-white text-xs font-semibold">
                Choose PNG File
              </span>
              <div className={`text-[11px] mt-3 ${mutedClass}`}>Recommended: 64×64 to 512×512 px</div>
            </div>

            {pending.dataUrl && (
              <div className={`mt-3 flex items-center gap-3 p-3 rounded-xl ${darkMode ? 'bg-zinc-900' : 'bg-gray-50'}`}>
                <img src={pending.dataUrl} alt="Uploaded logo" style={{ width: 56, height: 56 }} className="object-contain rounded-lg bg-white" />
                <div className="min-w-0 flex-1">
                  <div className={`text-sm font-semibold truncate ${textClass}`}>{pending.fileName || 'Custom logo'}</div>
                  <div className={`text-xs ${mutedClass}`}>PNG image ready to use</div>
                </div>
                <Check className="w-5 h-5 text-emerald-500" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPending((prev) => ({ ...prev, dataUrl: null, fileName: '' }));
                  }}
                  className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700"
                  title="Remove logo"
                >
                  <X className={`w-4 h-4 ${mutedClass}`} />
                </button>
              </div>
            )}
          </div>

          <div className={`p-5 rounded-2xl border ${cardClass}`}>
            <h3 className={`text-base font-bold mb-4 ${textClass}`}>Customize</h3>

            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className={`text-sm font-semibold ${textClass}`}>Logo Size</div>
                  <div className={`text-xs ${mutedClass}`}>Make your logo larger or smaller in the sidebar.</div>
                </div>
                <span className="text-xs font-semibold text-[#7F56D9]">{pending.size}px</span>
              </div>
              <input
                type="range"
                min="32"
                max="80"
                value={pending.size}
                onChange={(e) => setPending((prev) => ({ ...prev, size: Number(e.target.value) }))}
                className="w-full accent-[#7F56D9]"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className={`text-sm font-semibold ${textClass}`}>Center Logo Above Dashboard</div>
                <div className={`text-xs ${mutedClass}`}>The custom PNG is shown centered at the top of the main sidebar.</div>
              </div>
              <span className="text-xs font-semibold text-[#7F56D9]">Enabled</span>
            </div>
          </div>

          {error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-300 text-xs font-semibold">{error}</div>}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-100 dark:border-zinc-700">
          <button onClick={reset} className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-semibold ${darkMode ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
            <RotateCcw className="w-4 h-4" /> Reset to Default
          </button>
          <button onClick={save} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#7F56D9] text-white text-xs font-semibold hover:bg-[#6941C6]">
            <Check className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
