import React from 'react';
import { RotateCcw, Undo2, Home, HeartCrack } from 'lucide-react';
import { gameAudio } from '../utils/gameAudio';

export default function OutOfChancesModal({
  isOpen,
  stage = 1,
  canUndo = false,
  onRestart,
  onUndo,
  onHome,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-fadeIn">
      <div className="relative w-full max-w-xs bg-gradient-to-b from-slate-900 via-slate-950 to-indigo-950 rounded-3xl p-6 border-2 border-rose-500/60 shadow-[0_0_35px_rgba(244,63,94,0.35)] flex flex-col items-center gap-4 text-center">
        
        {/* Animated Broken Heart / Out of Chances Icon */}
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 border-2 border-white/80 flex items-center justify-center text-3xl shadow-lg shadow-rose-600/40 animate-pulse">
          <HeartCrack className="w-9 h-9 text-white drop-shadow-md" />
        </div>

        <div>
          <span className="text-[11px] font-black uppercase tracking-widest text-rose-400">
            No Chances Left!
          </span>
          <h2 className="text-2xl font-black text-white mt-0.5">
            Stage {stage} Failed
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            You used all your allotted chances for this stage.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5 mt-2">
          {/* Try Again / Restart Button */}
          <button
            onClick={() => {
              gameAudio.playClick();
              onRestart();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 border border-emerald-300/80 shadow-md shadow-emerald-500/30 text-white font-black text-sm tracking-wide uppercase flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again (Full Chances)</span>
          </button>

          {/* Undo Move Button (if moves were made) */}
          {canUndo && (
            <button
              onClick={() => {
                gameAudio.playClick();
                onUndo();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 border border-cyan-400/60 shadow-md text-white font-black text-xs tracking-wide uppercase flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Undo2 className="w-4 h-4" />
              <span>Undo Last Move (+1 Chance)</span>
            </button>
          )}

          {/* Home Button */}
          <button
            onClick={() => {
              gameAudio.playClick();
              onHome();
            }}
            className="w-full py-2 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-slate-300 hover:text-white font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}

