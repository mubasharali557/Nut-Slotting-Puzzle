import React from 'react';
import { X, HelpCircle, Check, ArrowRight } from 'lucide-react';
import { gameAudio } from '../utils/gameAudio';

export default function HowToPlayModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-sm max-h-[85vh] bg-gradient-to-b from-[#2a1a10] via-[#1c120a] to-[#0d0907] rounded-3xl p-5 border-2 border-[#c49b65] shadow-[0_15px_40px_rgba(0,0,0,0.9),0_0_25px_rgba(250,204,21,0.2)] flex flex-col gap-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#c49b65]/30">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-black text-[#ffeed2] tracking-wide">How To Play</h2>
          </div>
          <button
            onClick={() => {
              gameAudio.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full text-[#dfbf8d] hover:text-[#ffeed2] hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-3 overflow-y-auto py-1 pr-1 max-h-[55vh]">
          {/* Rule 1 */}
          <div className="p-3 rounded-2xl bg-[#140c06]/80 border border-[#c49b65]/40 flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-amber-400/20 text-[#facc15] font-black text-xs flex items-center justify-center flex-shrink-0 border border-amber-400/50">
              1
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-[#ffeed2]">Select a Bolt</h4>
              <p className="text-xs text-[#dfbf8d] mt-0.5 leading-relaxed">
                Tap any vertical bolt with nuts. The top nut will highlight in place, ready to be slotted onto another bolt.
              </p>
            </div>
          </div>

          {/* Rule 2 */}
          <div className="p-3 rounded-2xl bg-[#140c06]/80 border border-[#c49b65]/40 flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-sky-400/20 text-sky-300 font-black text-xs flex items-center justify-center flex-shrink-0 border border-sky-400/50">
              2
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-[#ffeed2]">Slot Onto Any Bolt</h4>
              <p className="text-xs text-[#dfbf8d] mt-0.5 leading-relaxed">
                Tap any destination bolt with available capacity. Nuts can be transferred onto any open bolt!
              </p>
            </div>
          </div>

          {/* Rule 3 */}
          <div className="p-3 rounded-2xl bg-[#140c06]/80 border border-[#c49b65]/40 flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center flex-shrink-0 border border-emerald-500/50">
              3
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-[#ffeed2]">Sort All Nuts</h4>
              <p className="text-xs text-[#dfbf8d] mt-0.5 leading-relaxed">
                Stack each bolt completely with 4 nuts of the same matching color to win the stage and earn stars!
              </p>
            </div>
          </div>
        </div>

        {/* Got It Button */}
        <button
          onClick={() => {
            gameAudio.playClick();
            onClose();
          }}
          className="w-full py-2.5 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 border border-amber-300 text-[#140b05] font-black text-sm uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
        >
          Got It!
        </button>
      </div>
    </div>
  );
}

