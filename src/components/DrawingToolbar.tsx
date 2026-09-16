import React, { useState } from 'react';
import {
  Pen,
  Highlighter,
  Eraser,
  ChevronDown,
  Undo2,
  Redo2,
  Trash2,
  Check,
} from 'lucide-react';
import { DrawingTool, EraserType } from '../types';

interface DrawingToolbarProps {
  currentTool: DrawingTool;
  onSelectTool: (tool: DrawingTool) => void;
  eraserType: EraserType;
  onSelectEraserType: (type: EraserType) => void;
  thickness: number;
  onThicknessChange: (thickness: number) => void;
  color: string;
  onColorChange: (color: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onDone: () => void;
  canUndo: boolean;
  canRedo: boolean;
  darkMode?: boolean;
}

export const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  currentTool,
  onSelectTool,
  eraserType,
  onSelectEraserType,
  thickness,
  onThicknessChange,
  color,
  onColorChange,
  onUndo,
  onRedo,
  onClear,
  onDone,
  canUndo,
  canRedo,
  darkMode = false,
}) => {
  const [showEraserMenu, setShowEraserMenu] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showThicknessMenu, setShowThicknessMenu] = useState(false);

  const presetColors = [
    { name: 'Black', hex: '#111111' },
    { name: 'Charcoal', hex: '#4B5563' },
    { name: 'Purple', hex: '#7F56D9' },
    { name: 'Blue', hex: '#1570EF' },
    { name: 'Green', hex: '#12B76A' },
    { name: 'Amber', hex: '#F79009' },
    { name: 'Red', hex: '#D92D20' },
  ];

  const presetThicknesses = [2, 4, 6, 8, 12, 16, 24];

  return (
    <div
      className={`rounded-xl border px-3 py-1.5 flex items-center gap-2 flex-wrap transition-colors select-none ${
        darkMode
          ? 'bg-zinc-800/90 border-zinc-700/80 text-zinc-200 shadow-xs'
          : 'bg-white border-[#EAECF0] text-gray-700 shadow-xs'
      }`}
    >
      {/* Pen Tool Button */}
      <button
        id="tool-pen-btn"
        type="button"
        onClick={() => {
          onSelectTool('pen');
          setShowEraserMenu(false);
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all shadow-2xs ${
          currentTool === 'pen'
            ? darkMode
              ? 'bg-purple-950/40 border-purple-500/50 text-[#c084fc]'
              : 'bg-[#F4EBFF] border-[#D6BBFB] text-[#6941C6]'
            : darkMode
            ? 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            : 'border-[#D0D5DD] bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Pen
          className={`w-4 h-4 ${
            currentTool === 'pen' ? 'text-[#7F56D9]' : 'text-gray-600 dark:text-zinc-400'
          }`}
        />
        <span>Pen</span>
      </button>

      {/* Highlighter Tool Button */}
      <button
        id="tool-highlighter-btn"
        type="button"
        onClick={() => {
          onSelectTool('highlighter');
          setShowEraserMenu(false);
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all shadow-2xs ${
          currentTool === 'highlighter'
            ? darkMode
              ? 'bg-amber-950/30 border-amber-600/50 text-amber-300'
              : 'bg-amber-50 border-amber-300 text-amber-800'
            : darkMode
            ? 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            : 'border-[#D0D5DD] bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Highlighter className="w-4 h-4 text-amber-500" />
        <span>Highlighter</span>
      </button>

      {/* Eraser Tool Button with Menu */}
      <div className="relative">
        <button
          id="tool-eraser-btn"
          type="button"
          onClick={() => {
            if (currentTool !== 'eraser') {
              onSelectTool('eraser');
            } else {
              setShowEraserMenu(!showEraserMenu);
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all shadow-2xs ${
            currentTool === 'eraser'
              ? darkMode
                ? 'bg-rose-950/30 border-rose-600/50 text-rose-300'
                : 'bg-rose-50 border-rose-300 text-rose-800'
              : darkMode
              ? 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              : 'border-[#D0D5DD] bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Eraser className="w-4 h-4 text-gray-600 dark:text-zinc-400" />
          <span>Eraser</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
              showEraserMenu ? 'rotate-180' : ''
            }`}
          />
        </button>

        {showEraserMenu && (
          <div
            className={`absolute left-0 top-[42px] z-30 w-44 rounded-xl border p-1 shadow-lg ${
              darkMode
                ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
                : 'bg-white border-gray-200 text-gray-800'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                onSelectEraserType('stroke-eraser');
                onSelectTool('eraser');
                setShowEraserMenu(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                eraserType === 'stroke-eraser'
                  ? darkMode
                    ? 'bg-purple-900/40 text-purple-300'
                    : 'bg-purple-50 text-purple-700'
                  : darkMode
                  ? 'hover:bg-zinc-700'
                  : 'hover:bg-gray-50'
              }`}
            >
              Stroke Eraser
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectEraserType('eraser');
                onSelectTool('eraser');
                setShowEraserMenu(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                eraserType === 'eraser'
                  ? darkMode
                    ? 'bg-purple-900/40 text-purple-300'
                    : 'bg-purple-50 text-purple-700'
                  : darkMode
                  ? 'hover:bg-zinc-700'
                  : 'hover:bg-gray-50'
              }`}
            >
              Point Eraser
            </button>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-gray-200 dark:bg-zinc-700 mx-1" />

      {/* Thickness Label, Slider & Dropdown */}
      <div className="flex items-center gap-2.5">
        <span className="text-sm font-normal text-gray-700 dark:text-zinc-300">
          Thickness
        </span>
        <input
          id="thickness-slider"
          type="range"
          min={1}
          max={40}
          value={thickness}
          onChange={(e) => onThicknessChange(Number(e.target.value))}
          className="w-24 h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#7F56D9]"
        />

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowThicknessMenu(!showThicknessMenu)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
              darkMode ? 'hover:bg-zinc-700 text-zinc-300' : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <span>{thickness} px</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          {showThicknessMenu && (
            <div
              className={`absolute left-0 top-[30px] z-30 w-24 rounded-lg border p-1 shadow-md ${
                darkMode
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
                  : 'bg-white border-gray-200 text-gray-800'
              }`}
            >
              {presetThicknesses.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    onThicknessChange(val);
                    setShowThicknessMenu(false);
                  }}
                  className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                    thickness === val
                      ? 'bg-purple-50 text-purple-700 font-semibold'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {val} px
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-gray-200 dark:bg-zinc-700 mx-1" />

      {/* Color Indicator & Dropdown */}
      <div className="relative">
        <button
          id="color-picker-btn"
          type="button"
          onClick={() => setShowColorPalette(!showColorPalette)}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border transition-colors shadow-2xs ${
            darkMode
              ? 'border-zinc-700 bg-zinc-800 hover:bg-zinc-700'
              : 'border-[#D0D5DD] bg-white hover:bg-gray-50'
          }`}
          title="Pick color"
        >
          <span
            className="w-4 h-4 rounded-full border border-black/10 dark:border-white/20"
            style={{ backgroundColor: color }}
          />
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>

        {showColorPalette && (
          <div
            className={`absolute left-0 top-[42px] z-30 p-2 rounded-xl border shadow-lg flex flex-col gap-2 ${
              darkMode
                ? 'bg-zinc-800 border-zinc-700 text-zinc-200'
                : 'bg-white border-gray-200 text-gray-800'
            }`}
          >
            <div className="flex items-center gap-1.5">
              {presetColors.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => {
                    onColorChange(c.hex);
                    setShowColorPalette(false);
                  }}
                  className="w-6 h-6 rounded-full border border-black/10 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer pt-1 border-t border-gray-100 dark:border-zinc-700">
              <span>Custom color:</span>
              <input
                type="color"
                value={color}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
              />
            </label>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-gray-200 dark:bg-zinc-700 mx-1" />

      {/* ↶ Undo */}
      <button
        id="draw-undo-btn"
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-normal transition-colors ${
          !canUndo
            ? 'opacity-40 cursor-not-allowed text-gray-400'
            : darkMode
            ? 'hover:bg-zinc-700 text-zinc-300'
            : 'hover:bg-gray-100 text-gray-700'
        }`}
        title="Undo stroke"
      >
        <Undo2 className="w-4 h-4" />
        <span>Undo</span>
      </button>

      {/* ↷ Redo */}
      <button
        id="draw-redo-btn"
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-normal transition-colors ${
          !canRedo
            ? 'opacity-40 cursor-not-allowed text-gray-400'
            : darkMode
            ? 'hover:bg-zinc-700 text-zinc-300'
            : 'hover:bg-gray-100 text-gray-700'
        }`}
        title="Redo stroke"
      >
        <Redo2 className="w-4 h-4" />
        <span>Redo</span>
      </button>

      {/* 🗑 Clear */}
      <button
        id="draw-clear-btn"
        type="button"
        onClick={onClear}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-normal transition-colors ${
          darkMode ? 'hover:bg-zinc-700 text-zinc-300' : 'hover:bg-gray-100 text-gray-700'
        }`}
        title="Clear drawing canvas"
      >
        <Trash2 className="w-4 h-4" />
        <span>Clear</span>
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-gray-200 dark:bg-zinc-700 mx-1" />

      {/* ✓ Done drawing / done writing */}
      <button
        id="draw-done-btn"
        type="button"
        onClick={onDone}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-sm font-semibold transition-all shadow-xs bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white border-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:border-emerald-500 cursor-pointer"
        title="Finish drawing"
      >
        <Check className="w-4 h-4 text-white stroke-[2.5]" />
        <span>Done drawing</span>
      </button>
    </div>
  );
};
