import React from 'react';
import { X, HelpCircle, Check, ArrowRight } from 'lucide-react';
import { gameAudio } from '../utils/gameAudio';

export default function HowToPlayModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-sm max-h-[85vh] bg-gradient-to-b from-slate-900 to-indigo-950 rounded-3xl p-5 border-2 border-cyan-400/50 shadow-2xl shadow-cyan-500/20 flex flex-col gap-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-black text-white">How To Play</h2>
          </div>
          <button
            onClick={() => {
              gameAudio.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-3 overflow-y-auto py-1 pr-1 max-h-[55vh]">
          {/* Rule 1 */}
          <div className="p-3 rounded-2xl bg-slate-800/70 border border-white/10 flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 font-black text-xs flex items-center justify-center flex-shrink-0 border border-cyan-500/40">
              1
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white">Select a Bottle</h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Tap any test tube containing liquid. It will highlight in place with a bright glowing rim beacon, indicating it is ready to pour.
              </p>
            </div>
          </div>

          {/* Rule 2 */}
          <div className="p-3 rounded-2xl bg-slate-800/70 border border-white/10 flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 font-black text-xs flex items-center justify-center flex-shrink-0 border border-indigo-500/40">
              2
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white">Pour Into Any Container</h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Tap any destination bottle. Colors can pour into all containers with open space, not just matching ones!
              </p>
            </div>
          </div>

          {/* Rule 3 */}
          <div className="p-3 rounded-2xl bg-slate-800/70 border border-white/10 flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center flex-shrink-0 border border-emerald-500/40">
              3
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white">Sort All Tubes</h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Fill each bottle completely with 4 units of the same color to win the stage and earn stars!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

