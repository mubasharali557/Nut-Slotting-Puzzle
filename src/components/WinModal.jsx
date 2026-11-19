import React, { useEffect, useState } from 'react';
import { ArrowRight, RotateCcw, Star, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { gameAudio } from '../utils/gameAudio';

export default function WinModal({
  isOpen,
  stage = 1,
  onNextStage,
  onReplay,
}) {
  const [starsShown, setStarsShown] = useState(0);

  useEffect(() => {
    if (isOpen) {
      gameAudio.playWin();
      setStarsShown(0);

      // Sequential star appearance with bounce
      const t1 = setTimeout(() => setStarsShown(1), 250);
      const t2 = setTimeout(() => setStarsShown(2), 550);
      const t3 = setTimeout(() => setStarsShown(3), 850);

      // 1. Initial Grand Confetti Blast
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#facc15', '#22c55e', '#38bdf8', '#ec4899', '#a855f7', '#fb923c'],
      });

      // 2. Dual Continuous Victory Cannons (Left and Right)
      const duration = 3000;
      const animationEnd = Date.now() + duration;

      const cannonInterval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          clearInterval(cannonInterval);
          return;
        }

        // Left cannon
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.8 },
          colors: ['#facc15', '#38bdf8', '#ec4899', '#10b981', '#ffffff'],
        });

        // Right cannon
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.8 },
          colors: ['#facc15', '#38bdf8', '#ec4899', '#10b981', '#ffffff'],
        });
      }, 80);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearInterval(cannonInterval);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const flagColors = [
    '#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#ec4899', '#eab308', '#8b5cf6'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-fadeIn">
      {/* Outer Card with Festive Glow */}
      <div className="relative w-full max-w-xs sm:max-w-sm bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-7 border-2 border-emerald-400/60 shadow-[0_0_50px_rgba(16,185,129,0.35)] flex flex-col items-center gap-4 text-center overflow-visible">
        
        {/* Festive Bunting Triangle Flags Garland across the top */}
        <div className="absolute -top-4 inset-x-3 flex items-center justify-between pointer-events-none z-30">
          {flagColors.map((col, i) => (
            <div
              key={i}
              className="w-5 h-7 shadow-lg transform origin-top animate-bounce"
              style={{
                backgroundColor: col,
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                animationDelay: `${i * 0.12}s`,
                animationDuration: '1.6s',
              }}
            />
          ))}
        </div>

        {/* Garland Hanging String */}
        <div className="absolute -top-4 inset-x-2 h-[2px] bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-400 pointer-events-none z-20 shadow-sm" />

        {/* Central Victory Emblem with Sunburst Halo */}
        <div className="relative mt-2 flex items-center justify-center">
          {/* Rotating Sunburst Light Rays */}
          <div className="absolute w-36 h-36 rounded-full bg-gradient-to-r from-amber-400/20 via-yellow-300/30 to-amber-400/20 animate-spin-slow pointer-events-none blur-sm" />

          {/* Golden Trophy Box */}
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 border-3 border-white/90 flex items-center justify-center text-4xl shadow-[0_8px_25px_rgba(245,158,11,0.6)] transform hover:scale-105 transition-transform z-10 animate-bounce">
            🏆
            {/* Sparkling corner star */}
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-200 fill-yellow-200 animate-spin-slow" />
          </div>
        </div>

        {/* Header Text Banner */}
        <div className="z-10 mt-1">
          <div className="inline-block px-3 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/60 shadow-sm mb-1">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-emerald-300">
              🎉 PUZZLE SOLVED! 🎉
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black italic tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-yellow-300 to-amber-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            STAGE {stage} CLEARED!
          </h2>
        </div>

        {/* 3 Large Animated Drop-In Golden Stars */}
        <div className="flex items-center justify-center gap-3 my-1 z-10">
          {/* Left Star */}
          <div
            className={`transition-all duration-500 transform ${
              starsShown >= 1
                ? 'opacity-100 scale-100 rotate-[-12deg]'
                : 'opacity-0 scale-0 -translate-y-6'
            }`}
          >
            <Star className="w-9 h-9 text-amber-400 fill-amber-400 drop-shadow-[0_0_14px_rgba(251,191,36,0.9)]" />
          </div>

          {/* Center Main Star (Larger) */}
          <div
            className={`transition-all duration-500 transform ${
              starsShown >= 2
                ? 'opacity-100 scale-125 -translate-y-1'
                : 'opacity-0 scale-0 -translate-y-8'
            }`}
          >
            <Star className="w-10 h-10 text-amber-300 fill-amber-300 drop-shadow-[0_0_20px_rgba(253,224,71,1)]" />
          </div>

          {/* Right Star */}
          <div
            className={`transition-all duration-500 transform ${
              starsShown >= 3
                ? 'opacity-100 scale-100 rotate-[12deg]'
                : 'opacity-0 scale-0 -translate-y-6'
            }`}
          >
            <Star className="w-9 h-9 text-amber-400 fill-amber-400 drop-shadow-[0_0_14px_rgba(251,191,36,0.9)]" />
          </div>
        </div>

        {/* Victory Rewards Pills: Stars & Coins */}
        <div className="flex items-center justify-center gap-2.5 w-full my-1 z-10">
          {/* Stars Won Pill */}
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-950/90 to-yellow-950/90 px-4 py-2 rounded-2xl border border-amber-400/60 shadow-[0_4px_12px_rgba(245,158,11,0.25)]">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-xs sm:text-sm font-black text-amber-300">+3 Stars</span>
          </div>

          {/* Coins Won Pill */}
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-slate-900/90 to-indigo-950/90 px-4 py-2 rounded-2xl border border-cyan-400/50 shadow-[0_4px_12px_rgba(6,182,212,0.2)]">
            <span className="text-base">🪙</span>
            <span className="text-xs sm:text-sm font-black text-white">+50 Coins</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5 mt-2 z-10">
          {/* Big Juicy NEXT STAGE Button */}
          <button
            onClick={() => {
              gameAudio.playClick();
              onNextStage();
            }}
            className="w-full py-4 px-6 rounded-full bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-700 border-3 border-emerald-200/90 text-white font-black text-xl tracking-wider uppercase flex items-center justify-center gap-2.5 shadow-[0_8px_0_#065f46,0_16px_32px_rgba(16,185,129,0.5)] active:translate-y-1 active:shadow-[0_4px_0_#065f46,0_8px_16px_rgba(16,185,129,0.4)] transition-all cursor-pointer group"
          >
            <span>Next Stage</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
          </button>

          {/* Replay Button */}
          <button
            onClick={() => {
              gameAudio.playClick();
              onReplay();
            }}
            className="w-full py-2.5 px-4 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-white/20 text-slate-300 font-extrabold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Replay Stage</span>
          </button>
        </div>
      </div>
    </div>
  );
}
