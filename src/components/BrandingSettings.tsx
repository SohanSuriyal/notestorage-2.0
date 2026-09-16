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
  size: 40,
  position: 'left',
  showName: true,
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

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');

    if (file.type !== 'image/png') {
      setError('Please choose a PNG file.');
      event.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Please use a PNG smaller than 2 MB.');
      event.target.value = '';
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
    event.target.value = '';
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

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 p-6">
          <div className="lg:col-span-3 space-y-5">
            <div className={`p-5 rounded-2xl border ${cardClass}`}>
              <div className="flex items-center gap-2 mb-1">
                <ImageIcon className="w-5 h-5 text-[#7F56D9]" />
                <h3 className={`text-lg font-bold ${textClass}`}>Custom Logo</h3>
              </div>
              <p className={`text-xs mb-5 ${mutedClass}`}>Transparent PNGs work best. Maximum file size: 2 MB.</p>

              <input ref={fileInputRef} type="file" accept="image/png" onChange={handleFile} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-xl border-2 border-dashed border-purple-200 dark:border-purple-800 p-8 text-center hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-colors"
              >
                <Upload className="w-7 h-7 mx-auto mb-2 text-[#7F56D9]" />
                <div className={`text-sm font-semibold ${textClass}`}>Upload a PNG image</div>
                <div className={`text-xs mt-1 ${mutedClass}`}>Recommended: 32×32 to 200×50 px</div>
                <span className="inline-flex mt-4 px-4 py-2 rounded-lg bg-[#7F56D9] text-white text-xs font-semibold">
                  Choose PNG File
                </span>
              </button>

              {pending.dataUrl && (
                <div className={`mt-3 flex items-center gap-3 p-3 rounded-xl ${darkMode ? 'bg-zinc-900' : 'bg-gray-50'}`}>
                  <img src={pending.dataUrl} alt="Uploaded logo" className="w-12 h-12 object-contain rounded-lg bg-white" />
                  <div className="min-w-0 flex-1">
                    <div className={`text-sm font-semibold truncate ${textClass}`}>{pending.fileName || 'Custom logo'}</div>
                    <div className={`text-xs ${mutedClass}`}>PNG image</div>
                  </div>
                  <Check className="w-5 h-5 text-emerald-500" />
                  <button
                    onClick={() => setPending((prev) => ({ ...prev, dataUrl: null, fileName: '' }))}
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
                    <div className={`text-xs ${mutedClass}`}>Adjust the displayed logo height.</div>
                  </div>
                  <span className="text-xs font-semibold text-[#7F56D9]">{pending.size}px</span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="64"
                  value={pending.size}
                  onChange={(e) => setPending((prev) => ({ ...prev, size: Number(e.target.value) }))}
                  className="w-full accent-[#7F56D9]"
                />
              </div>

              <div className="mb-5">
                <div className={`text-sm font-semibold mb-2 ${textClass}`}>Logo Position</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ['left', 'Left of name'],
                    ['right', 'Right of name'],
                    ['replace', 'Replace text'],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => setPending((prev) => ({ ...prev, position: value as BrandingSettingsData['position'] }))}
                      className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                        pending.position === value
                          ? 'border-[#7F56D9] text-[#7F56D9] bg-purple-50 dark:bg-purple-950/30'
                          : darkMode
                          ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-sm font-semibold ${textClass}`}>Show App Name</div>
                  <div className={`text-xs ${mutedClass}`}>Show “NoteStorage” next to your logo.</div>
                </div>
                <button
                  onClick={() => setPending((prev) => ({ ...prev, showName: !prev.showName }))}
                  className={`relative w-11 h-6 rounded-full p-1 transition-colors ${pending.showName ? 'bg-[#7F56D9]' : 'bg-gray-300 dark:bg-zinc-700'}`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white shadow transition-transform ${pending.showName ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-5">
            <div className={`p-5 rounded-2xl border ${cardClass}`}>
              <div className="flex items-center gap-2 mb-1">
                <ImageIcon className="w-5 h-5 text-[#7F56D9]" />
                <h3 className={`text-lg font-bold ${textClass}`}>Preview</h3>
              </div>
              <p className={`text-xs mb-5 ${mutedClass}`}>This is how the branding will appear in the sidebar.</p>

              <div className={`min-h-[130px] rounded-xl border flex items-center justify-center p-5 ${darkMode ? 'border-zinc-700 bg-zinc-900' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center gap-2 max-w-full">
                  {previewLogo && pending.position === 'left' && (
                    <img src={previewLogo} alt="Logo preview" style={{ width: pending.size, height: pending.size }} className="object-contain shrink-0" />
                  )}
                  {pending.position === 'replace' ? (
                    previewLogo ? (
                      <img src={previewLogo} alt="Logo preview" style={{ width: pending.size, height: pending.size }} className="object-contain" />
                    ) : (
                      <span className={`text-[21px] font-bold ${textClass}`}>NS</span>
                    )
                  ) : pending.showName ? (
                    <span className="text-[21px] font-bold tracking-tight">
                      <span className={darkMode ? 'text-white' : 'text-gray-900'}>Note</span>
                      <span className="text-[#7F56D9]">Storage</span>
                    </span>
                  ) : null}
                  {previewLogo && pending.position === 'right' && (
                    <img src={previewLogo} alt="Logo preview" style={{ width: pending.size, height: pending.size }} className="object-contain shrink-0" />
                  )}
                </div>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-blue-950/20 border-blue-900/50' : 'bg-blue-50 border-blue-100'}`}>
              <div className={`text-sm font-bold mb-2 ${textClass}`}>Tips for best results</div>
              <ul className={`text-xs space-y-2 list-disc pl-4 ${mutedClass}`}>
                <li>Use a PNG with a transparent background.</li>
                <li>Keep the logo simple and readable at small sizes.</li>
                <li>Recommended size is 32×32 to 200×50 pixels.</li>
                <li>Your logo is stored locally in this browser.</li>
              </ul>
            </div>

            {error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-300 text-xs font-semibold">{error}</div>}
          </div>
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
