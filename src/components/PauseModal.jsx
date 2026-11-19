import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, X } from 'lucide-react';
import { gameAudio } from '../utils/gameAudio';

export default function PauseModal({
  isOpen,
  onClose,
  onRestart,
  onHome,
  soundEnabled,
  onToggleSound,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-xs bg-slate-900/90 rounded-3xl p-6 border-2 border-white/20 shadow-2xl flex flex-col items-center gap-5 text-center">
        {/* Title */}
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
            Water Sort
          </span>
          <h2 className="text-2xl font-black text-white mt-0.5">Game Paused</h2>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3">
          {/* Resume */}
          <button
            onClick={() => {
              gameAudio.playClick();
              onClose();
            }}
            className="w-full py-3.5 px-4 rounded-full bg-gradient-to-b from-emerald-400 to-green-600 border-2 border-emerald-200 text-white font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-green-600/30 active:scale-95 transition-transform"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Resume</span>
          </button>

          {/* Restart */}
          <button
            onClick={() => {
              gameAudio.playClick();
              onRestart();
            }}
            className="w-full py-3 px-4 rounded-full bg-slate-800 hover:bg-slate-700 border border-white/20 text-slate-200 font-extrabold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Restart Level</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              gameAudio.playClick();
              onToggleSound();
            }}
            className="w-full py-3 px-4 rounded-full bg-slate-800 hover:bg-slate-700 border border-white/20 text-slate-200 font-extrabold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>Sound: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-500" />
                <span>Sound: OFF</span>
              </>
            )}
          </button>

          {/* Home */}
          <button
            onClick={() => {
              gameAudio.playClick();
              onHome();
            }}
            className="w-full py-3 px-4 rounded-full bg-slate-800 hover:bg-slate-700 border border-white/20 text-slate-200 font-extrabold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Home className="w-4 h-4 text-indigo-400" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
}

