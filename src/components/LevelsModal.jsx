import React, { useState, useEffect, useRef } from 'react';
import { X, Star, Lock, Sparkles, ChevronRight, Plus, Home, Check } from 'lucide-react';
import { STAGES, TOTAL_STAGES } from '../data/levelStages';
import { gameAudio } from '../utils/gameAudio';

export default function LevelsModal({
  isOpen,
  onClose,
  currentStage = 1,
  highestUnlocked = 1,
  onSelectStage,
  onHome,
  coins = 250,
  stars = 125,
  gems = 15,
}) {
  const scrollRef = useRef(null);

  // Auto-scroll to current stage when modal opens
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      setTimeout(() => {
        const activeNode = scrollRef.current.querySelector('[data-current-stage="true"]');
        if (activeNode) {
          activeNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [isOpen, currentStage]);

  if (!isOpen) return null;

  const effectiveUnlocked = Math.max(highestUnlocked, currentStage);

  // Generate winding S-curve positions for 50+ stages
  // A gentle snake-like winding road: 4 columns zigzagging back and forth
  const generateWindingStages = () => {
    const list = [];
    const cols = 4;
    for (let i = 1; i <= Math.min(TOTAL_STAGES, 60); i++) {
      const row = Math.floor((i - 1) / cols);
      const colInRow = (i - 1) % cols;
      // Zigzag: even rows go left->right (0, 1, 2, 3), odd rows go right->left (3, 2, 1, 0)
      const col = row % 2 === 0 ? colInRow : cols - 1 - colInRow;
      // Color scheme for stage circles matching reference
      const colors = ['bg-rose-500', 'bg-emerald-500', 'bg-amber-500', 'bg-sky-500', 'bg-blue-600', 'bg-purple-600'];
      const color = colors[(i - 1) % colors.length];

      list.push({
        stage: i,
        row,
        col,
        color,
        isMilestone: i === 1 || i % 10 === 0,
        starsCount: i < currentStage ? (i % 3 === 0 ? 3 : 2) : (i === currentStage ? 1 : 0),
      });
    }
    return list;
  };

  const windingStages = generateWindingStages();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md select-none animate-fadeIn">
      
      {/* Outer Phone / Tablet Parchment Frame */}
      <div className="relative w-full max-w-2xl max-h-[92vh] h-[650px] bg-[#fbf2df] rounded-3xl sm:rounded-[36px] border-4 sm:border-6 border-[#8c6239] shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_0_40px_rgba(180,130,70,0.3)] flex flex-col overflow-hidden">
        
        {/* 1. TOP CURRENCY & TITLE HEADER (Matching Reference Image 3) */}
        <div className="w-full bg-[#f4e5cb] px-3 sm:px-6 pt-2.5 pb-2 border-b-2 sm:border-b-3 border-[#c49b65] flex items-center justify-between gap-1 sm:gap-3 flex-shrink-0 z-20 shadow-md">
          
          {/* Left: Gems & Stars */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Purple Gems Pill */}
            <div className="flex items-center gap-1 bg-[#ecd9b8] px-2 sm:px-3 py-1 rounded-full border border-[#b88c52] shadow-inner">
              <span className="text-xs sm:text-sm">💎</span>
              <span className="text-[11px] sm:text-xs font-black text-[#5c3a1d]">{gems}</span>
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow cursor-pointer ml-0.5">
                +
              </div>
            </div>

            {/* Stars Pill */}
            <div className="flex items-center gap-1 bg-[#ecd9b8] px-2 sm:px-3 py-1 rounded-full border border-[#b88c52] shadow-inner">
              <span className="text-xs sm:text-sm">⭐</span>
              <span className="text-[11px] sm:text-xs font-black text-[#5c3a1d]">{stars}</span>
            </div>
          </div>

          {/* Center: Red Wooden Carved Ribbon "Progress & Map" */}
          <div className="relative flex items-center justify-center">
            <div className="relative px-4 sm:px-7 py-1 sm:py-1.5 rounded-lg bg-gradient-to-r from-red-700 via-rose-600 to-red-700 border-2 border-amber-300 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              <div className="absolute top-0.5 inset-x-2 h-0.5 bg-white/40 rounded-full" />
              <span className="text-xs sm:text-base font-black text-amber-100 tracking-wider uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] whitespace-nowrap">
                Progress & Map
              </span>
            </div>
          </div>

          {/* Right: Gold Coins & Close Button */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Gold Coins Pill */}
            <div className="flex items-center gap-1 bg-[#ecd9b8] px-2 sm:px-3 py-1 rounded-full border border-[#b88c52] shadow-inner">
              <span className="text-xs sm:text-sm">🪙</span>
              <span className="text-[11px] sm:text-xs font-black text-[#5c3a1d]">{coins}</span>
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow cursor-pointer ml-0.5">
                +
              </div>
            </div>

            {/* Home Button */}
            <button
              onClick={() => {
                gameAudio.playClick();
                if (onHome) onHome();
                else onClose();
              }}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-b from-[#ffeed2] via-[#f7dfb9] to-[#dfbf8d] hover:bg-[#cfa86e] border border-[#8c6239] text-[#5c3a1d] flex items-center justify-center font-black transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow"
              title="Return to Home Screen"
              aria-label="Home"
            >
              <Home className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                gameAudio.playClick();
                onClose();
              }}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#dfbf8d] hover:bg-[#cfa86e] border border-[#8c6239] text-[#5c3a1d] flex items-center justify-center font-black transition-colors cursor-pointer shadow"
              title="Close Map"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* 2. WINDING MAP ROAD CANVAS (Matching Reference Image 3) */}
        <div
          ref={scrollRef}
          className="relative flex-1 w-full overflow-y-auto px-4 sm:px-10 py-6 sm:py-8 bg-[radial-gradient(#ebd7b2_1.5px,transparent_1.5px)] [background-size:24px_24px] scrollbar-thin scrollbar-thumb-[#c49b65]/50 scrollbar-track-transparent"
        >
          {/* Decorative Nut Mascots along the Trail */}
          <div className="absolute top-6 right-8 opacity-90 pointer-events-none transform rotate-6 hidden sm:block">
            <img src="/hardware/nut_red.png" alt="" className="w-10 h-10 drop-shadow-md animate-bounce" />
          </div>
          <div className="absolute top-48 left-6 opacity-90 pointer-events-none transform -rotate-12 hidden sm:block">
            <img src="/hardware/nut_blue.png" alt="" className="w-10 h-10 drop-shadow-md animate-pulse" />
          </div>
          <div className="absolute bottom-16 right-10 opacity-90 pointer-events-none transform rotate-12 hidden sm:block">
            <img src="/hardware/nut_green.png" alt="" className="w-11 h-11 drop-shadow-md animate-bounce" />
          </div>

          {/* Winding S-Curve Stage Nodes */}
          <div className="relative max-w-lg mx-auto flex flex-col gap-6 sm:gap-8">
            {/* Group into rows of 4 nodes */}
            {Array.from({ length: Math.ceil(windingStages.length / 4) }).map((_, rowIdx) => {
              const rowNodes = windingStages.filter((s) => s.row === rowIdx);
              const isEvenRow = rowIdx % 2 === 0;

              return (
                <div key={rowIdx} className="relative flex items-center justify-between px-2 sm:px-6">
                  
                  {/* Dashed connector path behind nodes */}
                  <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-1 border-t-2 border-dashed border-[#b88c52]/60 z-0 pointer-events-none" />

                  {rowNodes.map((s) => {
                    const isUnlocked = s.stage <= effectiveUnlocked;
                    const isCurrent = s.stage === currentStage;
                    const isPassed = s.stage < currentStage;

                    return (
                      <div
                        key={s.stage}
                        data-current-stage={isCurrent}
                        className="relative z-10 flex flex-col items-center"
                      >
                        {/* 1 to 3 Stars above node */}
                        <div className="h-4 flex items-center justify-center gap-0.5 mb-1">
                          {isPassed && (
                            <>
                              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-500 drop-shadow" />
                              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-500 drop-shadow -translate-y-0.5" />
                              {s.starsCount >= 3 && (
                                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-500 drop-shadow" />
                              )}
                            </>
                          )}
                          {isCurrent && (
                            <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-100 px-1 rounded-full border border-amber-400 animate-pulse">
                              HERE
                            </span>
                          )}
                        </div>

                        {/* Circular Stage Node Button */}
                        <button
                          onClick={() => {
                            if (!isUnlocked) return;
                            gameAudio.playClick();
                            onSelectStage(s.stage);
                            onClose();
                          }}
                          disabled={!isUnlocked}
                          className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all ${
                            isCurrent
                              ? `${s.color} border-3 sm:border-4 border-amber-300 shadow-[0_0_24px_rgba(245,158,11,0.8),0_6px_12px_rgba(0,0,0,0.4)] scale-110 cursor-pointer animate-pulse`
                              : isUnlocked
                              ? `${s.color} border-2 sm:border-3 border-white/80 shadow-[0_4px_8px_rgba(0,0,0,0.35)] hover:scale-105 active:scale-95 cursor-pointer`
                              : 'bg-[#d8c29d] border-2 border-[#b88c52] shadow-sm cursor-not-allowed opacity-65'
                          }`}
                        >
                          {/* Inner Glossy Sheen */}
                          <div className="absolute top-1 inset-x-2 h-2.5 bg-white/40 rounded-full pointer-events-none" />

                          {isPassed ? (
                            <div className="flex flex-col items-center justify-center leading-none pointer-events-none">
                              <span className="text-xs sm:text-base font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                {s.stage}
                              </span>
                              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500 border border-white flex items-center justify-center shadow mt-0.5 animate-in zoom-in-75 duration-200">
                                <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white stroke-[3.5]" />
                              </div>
                            </div>
                          ) : isUnlocked ? (
                            <span className="text-sm sm:text-xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                              {s.stage}
                            </span>
                          ) : (
                            <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-[#8c6239]" />
                          )}

                          {/* Milestone Trophy Badge */}
                          {s.isMilestone && isUnlocked && (
                            <div className="absolute -bottom-2 -right-1 w-5 h-5 rounded-full bg-amber-400 border border-amber-600 flex items-center justify-center text-[10px] shadow">
                              🏆
                            </div>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. BOTTOM FOOTER INFO */}
        <div className="w-full bg-[#f4e5cb] py-2 px-4 border-t-2 border-[#c49b65] flex items-center justify-between text-xs font-black text-[#7a4e28]">
          <span>⭐ Tap any unlocked circle to start!</span>
          <span className="text-emerald-700">Unlocked: {effectiveUnlocked} / 100</span>
        </div>

      </div>
    </div>
  );
}
