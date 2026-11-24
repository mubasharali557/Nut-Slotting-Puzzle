import React from 'react';
import { Palette, Shuffle, RotateCcw, Check, ArrowLeftRight, Sparkles } from 'lucide-react';
import { gameAudio } from '../utils/gameAudio';

export const CUSTOM_COLOR_PALETTE = [
  { id: 'red', name: 'Ruby Red', hex: '#dc2626' },
  { id: 'blue', name: 'Sapphire Blue', hex: '#1d4ed8' },
  { id: 'green', name: 'Emerald Green', hex: '#15803d' },
  { id: 'yellow', name: 'Imperial Gold', hex: '#eab308' },
  { id: 'purple', name: 'Amethyst Purple', hex: '#9333ea' },
  { id: 'orange', name: 'Sunset Orange', hex: '#ea580c' },
  { id: 'pink', name: 'Hot Magenta', hex: '#ec4899' },
  { id: 'cyan', name: 'Ice Cyan', hex: '#06b6d4' },
  { id: 'lime', name: 'Obsidian Black', hex: '#111827' },
  { id: 'teal', name: 'Pearl White', hex: '#ffffff' },
  { id: 'gold', name: 'Bronze Gold', hex: '#d97706' },
  { id: 'silver', name: 'Mirror Platinum', hex: '#e2e8f0' },
  { id: 'copper', name: 'Rose Copper', hex: '#c2410c' },
];

export default function ColorStudioBar({
  isOpen,
  onClose,
  activeColor,
  onSelectColor,
  onRandomizeNuts,
  onResetNuts,
  studioMode = 'paint', // 'paint' | 'swap'
  onToggleStudioMode,
}) {
  if (!isOpen) return null;

  const currentColorObj =
    CUSTOM_COLOR_PALETTE.find((c) => c.id === activeColor) || CUSTOM_COLOR_PALETTE[0];

  return (
    <div className="absolute top-14 sm:top-16 left-2 right-2 sm:left-6 sm:right-6 mx-auto z-40 max-w-xl bg-gradient-to-b from-[#2a170b]/95 via-[#1a0f07]/95 to-[#120803]/98 border-2 border-[#d97706] rounded-2xl p-2.5 sm:p-3 shadow-[0_12px_32px_rgba(0,0,0,0.85),0_0_20px_rgba(217,119,6,0.25)] backdrop-blur-md flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-200">
      
      {/* Header: Title and Action Buttons */}
      <div className="flex items-center justify-between border-b border-[#c49b65]/30 pb-1.5 px-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow">
            <Palette className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-amber-200 font-black text-xs sm:text-sm tracking-wide block leading-none">
              Nut Color Studio
            </span>
            <span className="text-[10px] text-amber-400/80 font-medium">
              {studioMode === 'paint'
                ? 'Tap any nut on the bolts to apply color'
                : 'Tap two nuts to swap their positions'}
            </span>
          </div>
        </div>

        {/* Action Controls: Randomize, Reset, Done */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              gameAudio.playClick();
              onRandomizeNuts?.();
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-b from-purple-500 to-indigo-700 border border-purple-400 text-white font-bold text-[10px] sm:text-xs shadow hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Randomize nut colors into balanced sets"
          >
            <Shuffle className="w-3 h-3 stroke-[2.5]" />
            <span>Randomize</span>
          </button>

          <button
            onClick={() => {
              gameAudio.playClick();
              onResetNuts?.();
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-b from-slate-700 to-slate-900 border border-slate-600 text-slate-200 font-bold text-[10px] sm:text-xs shadow hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Reset nuts to stage default"
          >
            <RotateCcw className="w-3 h-3 stroke-[2.5]" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={() => {
              gameAudio.playClick();
              onClose?.();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-b from-emerald-500 to-emerald-700 border border-emerald-400 text-white font-black text-[10px] sm:text-xs shadow hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Done customizing"
          >
            <Check className="w-3 h-3 stroke-[3]" />
            <span>Done</span>
          </button>
        </div>
      </div>

      {/* Mode Selector & Active Brush Preview */}
      <div className="flex items-center justify-between px-1 text-[11px] font-bold">
        {/* Toggle between Paint Nut & Swap/Rearrange Nuts */}
        <div className="flex items-center gap-1 bg-[#100803] p-0.5 rounded-lg border border-[#c49b65]/30">
          <button
            onClick={() => onToggleStudioMode?.('paint')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              studioMode === 'paint'
                ? 'bg-amber-500 text-slate-950 font-black shadow'
                : 'text-amber-200/70 hover:text-white'
            }`}
          >
            <Palette className="w-3 h-3" />
            <span>Paint Nut</span>
          </button>
          <button
            onClick={() => onToggleStudioMode?.('swap')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              studioMode === 'swap'
                ? 'bg-amber-500 text-slate-950 font-black shadow'
                : 'text-amber-200/70 hover:text-white'
            }`}
          >
            <ArrowLeftRight className="w-3 h-3" />
            <span>Rearrange / Swap</span>
          </button>
        </div>

        {/* Current Active Brush Preview */}
        {studioMode === 'paint' ? (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900/90 border border-white/20 text-white text-[11px] shadow">
            <span className="text-slate-400 font-medium">Nut Color:</span>
            <div
              className="w-3.5 h-3.5 rounded-full border border-white/60 shadow-[0_0_8px_currentColor]"
              style={{ backgroundColor: currentColorObj.hex, color: currentColorObj.hex }}
            />
            <span className="font-bold text-amber-200">{currentColorObj.name}</span>
          </div>
        ) : (
          <div className="text-amber-300 text-[11px] font-semibold italic">
            Click 1st nut, then click 2nd nut
          </div>
        )}
      </div>

      {/* Color Swatches Grid (15 vibrant jewel pigments) */}
      {studioMode === 'paint' && (
        <div className="grid grid-cols-8 sm:grid-cols-15 gap-1.5 sm:gap-1 p-1 bg-[#0d0602]/80 rounded-xl border border-[#c49b65]/20 justify-items-center">
          {CUSTOM_COLOR_PALETTE.map((col) => {
            const isSelected = col.id === activeColor;
            return (
              <button
                key={col.id}
                onClick={() => {
                  gameAudio.playClick();
                  onSelectColor(col.id);
                }}
                className={`relative group w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                  isSelected
                    ? 'scale-115 ring-2 sm:ring-3 ring-amber-400 ring-offset-1 ring-offset-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.8)] z-10'
                    : 'hover:scale-105 opacity-90 hover:opacity-100'
                }`}
                style={{ backgroundColor: col.hex }}
                title={col.name}
              >
                {/* Glossy top-half shine reflection */}
                <div className="absolute inset-x-1 top-0.5 h-2.5 bg-white/40 rounded-t-full pointer-events-none" />

                {/* Selected Checkmark */}
                {isSelected && (
                  <Check
                    className={`w-3.5 h-3.5 stroke-[3.5] drop-shadow ${
                      col.id === 'white' || col.id === 'yellow' || col.id === 'lime' || col.id === 'silver'
                        ? 'text-slate-900'
                        : 'text-white'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
}
