import React, { useState, useEffect } from 'react';
import { X, Play, Star, Lock, Sparkles, ChevronRight } from 'lucide-react';
import { STAGES, TOTAL_STAGES } from '../data/levelStages';
import { gameAudio } from '../utils/gameAudio';

export default function LevelsModal({
  isOpen,
  onClose,
  currentStage = 1,
  highestUnlocked = 1,
  onSelectStage,
}) {
  const [activeTab, setActiveTab] = useState(0); // 0: 1-25, 1: 26-50, 2: 51-75, 3: 76-100

  // Automatically switch tab to where currentStage belongs when opening
  useEffect(() => {
    if (isOpen) {
      const tabIndex = Math.min(3, Math.max(0, Math.floor((currentStage - 1) / 25)));
      setActiveTab(tabIndex);
    }
  }, [isOpen, currentStage]);

  if (!isOpen) return null;

  const TABS = [
    { label: '1 - 25', start: 1, end: 25 },
    { label: '26 - 50', start: 26, end: 50 },
    { label: '51 - 75', start: 51, end: 75 },
    { label: '76 - 100', start: 76, end: 100 },
  ];

  const currentRange = TABS[activeTab];
  const displayedStages = STAGES.filter(
    (s) => s.stage >= currentRange.start && s.stage <= currentRange.end
  );

  const effectiveUnlocked = Math.max(highestUnlocked, currentStage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="relative w-full max-w-md max-h-[90vh] bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 rounded-3xl p-4 sm:p-5 border-2 border-cyan-400/50 shadow-[0_0_30px_rgba(6,182,212,0.3)] flex flex-col gap-3 sm:gap-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center text-cyan-300">
              <Play className="w-4 h-4 fill-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white leading-none">Select Stage</h2>
              <span className="text-[10px] sm:text-xs font-bold text-cyan-400/90 tracking-wide">
                100 Total Levels • Unlocked: {effectiveUnlocked}/100
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              gameAudio.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chapter Range Tabs (1-25, 26-50, 51-75, 76-100) */}
        <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-slate-950/70 border border-white/10">
          {TABS.map((tab, idx) => {
            const isTabActive = activeTab === idx;
            const hasUnlockedInTab = effectiveUnlocked >= tab.start;

            return (
              <button
                key={tab.label}
                onClick={() => {
                  gameAudio.playClick();
                  setActiveTab(idx);
                }}
                className={`py-1.5 px-1 rounded-xl text-center font-black text-[11px] sm:text-xs transition-all cursor-pointer ${
                  isTabActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30'
                    : hasUnlockedInTab
                    ? 'text-slate-300 hover:text-white hover:bg-white/5'
                    : 'text-slate-600 hover:text-slate-500'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Stages Grid (5 columns x 5 rows = 25 stages per chapter) */}
        <div className="grid grid-cols-5 gap-2 sm:gap-2.5 overflow-y-auto py-1 pr-1 max-h-[50vh] scrollbar-thin scrollbar-thumb-cyan-500/30">
          {displayedStages.map((s) => {
            const isUnlocked = s.stage <= effectiveUnlocked;
            const isCurrent = s.stage === currentStage;
            const isPassed = s.stage < currentStage;

            return (
              <button
                key={s.stage}
                disabled={!isUnlocked}
                onClick={() => {
                  gameAudio.playClick();
                  onSelectStage(s.stage);
                  onClose();
                }}
                className={`relative aspect-square flex flex-col items-center justify-center rounded-2xl border transition-all active:scale-95 ${
                  isCurrent
                    ? 'bg-gradient-to-b from-indigo-500 to-purple-600 border-2 border-cyan-300 shadow-[0_0_16px_rgba(6,182,212,0.8)] text-white scale-105 z-10'
                    : isPassed
                    ? 'bg-slate-800/90 hover:bg-slate-700/90 border-amber-400/50 text-white shadow-sm hover:scale-102 cursor-pointer'
                    : isUnlocked
                    ? 'bg-slate-800/80 hover:bg-slate-700/80 border-cyan-400/30 text-slate-200 hover:scale-102 cursor-pointer'
                    : 'bg-slate-950/60 border-white/5 text-slate-600 cursor-not-allowed opacity-50'
                }`}
              >
                {isUnlocked ? (
                  <>
                    <span className={`text-base sm:text-lg font-black leading-none ${isCurrent ? 'text-amber-300' : 'text-white'}`}>
                      {s.stage}
                    </span>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1, 2, 3].map((starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                            isPassed
                              ? 'text-amber-400 fill-amber-400'
                              : isCurrent
                              ? 'text-amber-300 fill-amber-300'
                              : 'text-slate-600 fill-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Jump to Active Stage */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Current: <strong className="text-white">Stage {currentStage}</strong></span>
          </div>
          <button
            onClick={() => {
              gameAudio.playClick();
              onSelectStage(currentStage);
              onClose();
            }}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>Play Current</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
