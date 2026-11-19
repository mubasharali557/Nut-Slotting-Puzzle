import React from 'react';
import { Play, Settings, ShoppingBag, Sparkles, Trophy, Grid, Star } from 'lucide-react';
import { gameAudio } from '../utils/gameAudio';

export default function HomeScreen({
  onPlay,
  onOpenSettings,
  onOpenShop,
  onOpenLevels,
  onOpenAchievements,
  currentStage = 1,
  coins = 250,
  stars = 125,
}) {
  const handlePlayClick = () => {
    gameAudio.playClick();
    onPlay();
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between py-2 sm:py-6 px-3 sm:px-4 z-20 select-none overflow-hidden">
      {/* Top Spacer */}
      <div className="h-0.5 sm:h-2 flex-shrink-0" />

      {/* Center Hero: Traditional Water Sort Emblem & Static Badges */}
      <div className="flex flex-col items-center text-center my-auto">
        {/* Animated Title Emblem: Only this element rotates/animates slightly faster */}
        <div className="animate-title-rotate select-none flex flex-col items-center">
          {/* Traditional Trio of Water Sort Glass Test Tubes */}
          <div className="relative flex items-end justify-center -space-x-2 sm:-space-x-2.5 pb-1 filter drop-shadow-[0_10px_22px_rgba(0,0,0,0.6)]">
            {/* Left Test Tube (Tilted -12deg) */}
            <div className="relative w-6 h-16 sm:w-8 sm:h-22 rounded-b-xl rounded-t-sm bg-white/15 backdrop-blur-xs border-2 border-white/90 shadow-[0_4px_12px_rgba(0,0,0,0.45)] transform -rotate-12 flex flex-col justify-end overflow-hidden p-0.5">
              {/* Wooden Cork */}
              <div className="absolute top-0 inset-x-1.5 h-2 bg-gradient-to-r from-amber-700 to-amber-800 rounded-t-sm border-b border-amber-950 z-20" />
              {/* Glass Gloss highlight */}
              <div className="absolute top-2 left-1 bottom-2 w-1 bg-gradient-to-b from-white/80 via-white/40 to-transparent rounded-full z-20 pointer-events-none" />
              {/* 4 Colored Water Layers - Ultra-Bright */}
              <div className="w-full h-3 sm:h-4 bg-gradient-to-r from-yellow-300 to-amber-400 border-b border-black/10" />
              <div className="w-full h-3 sm:h-4 bg-gradient-to-r from-sky-400 to-blue-500 border-b border-black/10" />
              <div className="w-full h-3 sm:h-4 bg-gradient-to-r from-emerald-300 to-teal-400 border-b border-black/10" />
              <div className="w-full h-3.5 sm:h-5 rounded-b-lg bg-gradient-to-r from-rose-400 to-pink-500" />
            </div>

            {/* Center Main Test Tube (Taller, 0deg) */}
            <div className="relative w-7.5 h-20 sm:w-9.5 sm:h-26 rounded-b-2xl rounded-t-sm bg-white/15 backdrop-blur-xs border-2 border-white shadow-[0_8px_20px_rgba(0,0,0,0.55)] z-10 flex flex-col justify-end overflow-hidden p-0.5">
              {/* Wooden Cork with Gold Ring */}
              <div className="absolute top-0 inset-x-2 h-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 rounded-t-sm border-b-2 border-yellow-300 z-20" />
              {/* Glass Gloss highlight */}
              <div className="absolute top-2 left-1.5 bottom-2.5 w-1.5 bg-gradient-to-b from-white/90 via-white/50 to-transparent rounded-full z-20 pointer-events-none" />
              {/* Micro animated bubble */}
              <div className="absolute top-7 right-2 w-1.5 h-1.5 bg-white/80 rounded-full animate-ping z-20 pointer-events-none" style={{ animationDuration: '2.2s' }} />
              {/* 4 Colored Water Layers - Ultra-Bright */}
              <div className="w-full h-3.5 sm:h-4.5 bg-gradient-to-r from-pink-300 to-fuchsia-500 border-b border-black/10" />
              <div className="w-full h-3.5 sm:h-4.5 bg-gradient-to-r from-yellow-200 to-amber-400 border-b border-black/10" />
              <div className="w-full h-3.5 sm:h-4.5 bg-gradient-to-r from-cyan-300 to-teal-400 border-b border-black/10" />
              <div className="w-full h-4 sm:h-6 rounded-b-xl bg-gradient-to-r from-purple-300 to-indigo-500" />
            </div>

            {/* Right Test Tube (Tilted +12deg) */}
            <div className="relative w-6 h-16 sm:w-8 sm:h-22 rounded-b-xl rounded-t-sm bg-white/15 backdrop-blur-xs border-2 border-white/90 shadow-[0_4px_12px_rgba(0,0,0,0.45)] transform rotate-12 flex flex-col justify-end overflow-hidden p-0.5">
              {/* Wooden Cork */}
              <div className="absolute top-0 inset-x-1.5 h-2 bg-gradient-to-r from-amber-700 to-amber-800 rounded-t-sm border-b border-amber-950 z-20" />
              {/* Glass Gloss highlight */}
              <div className="absolute top-2 left-1 bottom-2 w-1 bg-gradient-to-b from-white/80 via-white/40 to-transparent rounded-full z-20 pointer-events-none" />
              {/* 4 Colored Water Layers - Ultra-Bright */}
              <div className="w-full h-3 sm:h-4 bg-gradient-to-r from-sky-300 to-blue-500 border-b border-black/10" />
              <div className="w-full h-3 sm:h-4 bg-gradient-to-r from-orange-300 to-amber-400 border-b border-black/10" />
              <div className="w-full h-3 sm:h-4 bg-gradient-to-r from-pink-300 to-rose-400 border-b border-black/10" />
              <div className="w-full h-3.5 sm:h-5 rounded-b-lg bg-gradient-to-r from-lime-300 to-emerald-400" />
            </div>
          </div>

          {/* Traditional 3D Typography Logo - Light, Bright & Radiant */}
          <div className="relative inline-block -mt-1 sm:-mt-2">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-amber-300 to-orange-400 drop-shadow-[0_3px_0_#b45309] sm:drop-shadow-[0_4px_0_#b45309] filter drop-shadow-[0_4px_16px_rgba(251,191,36,0.6)]">
              WATER
            </h1>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-sky-400 -mt-1.5 sm:-mt-2.5 drop-shadow-[0_3px_0_#0284c7] sm:drop-shadow-[0_4px_0_#0284c7] filter drop-shadow-[0_4px_16px_rgba(56,189,248,0.7)]">
              SORT
            </h2>
            {/* Traditional Casual "PUZZLE" Ribbon Banner */}
            <div className="mx-auto -mt-1 sm:-mt-1.5 px-3 sm:px-3.5 py-0.5 rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 border border-fuchsia-200/90 shadow-[0_3px_12px_rgba(217,70,239,0.55)] inline-block">
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-white drop-shadow-md">
                PUZZLE
              </span>
            </div>
          </div>
        </div>

        {/* Completely STATIC Traditional Level Banner (Zero animation, 100% stationary) */}
        <div className="mt-2 sm:mt-4 flex flex-col items-center">
          {/* 3 Golden Stars */}
          <div className="flex items-center justify-center gap-1 -mb-1.5 sm:-mb-2 z-10">
            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300 fill-amber-300 filter drop-shadow-[0_0_6px_rgba(252,211,77,0.8)] transform -rotate-12" />
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200 fill-amber-200 filter drop-shadow-[0_0_10px_rgba(252,211,77,0.9)] transform -translate-y-0.5" />
            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300 fill-amber-300 filter drop-shadow-[0_0_6px_rgba(252,211,77,0.8)] transform rotate-12" />
          </div>

          {/* Traditional Plaque Pill: Stage + Stars */}
          <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-950/80 via-slate-900/85 to-blue-950/80 backdrop-blur-md px-3.5 sm:px-5 py-1 sm:py-2 rounded-2xl border-2 border-amber-300/80 shadow-[0_0_16px_rgba(251,191,36,0.35),0_6px_20px_rgba(0,0,0,0.45),inset_0_1px_2px_rgba(255,255,255,0.4)]">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-300 filter drop-shadow-[0_0_6px_rgba(103,232,249,0.8)]" />
              <span className="text-[11px] sm:text-sm font-black text-white tracking-wide uppercase drop-shadow-sm">
                STAGE {currentStage}
              </span>
            </div>
            <div className="w-[1px] sm:w-[1.5px] h-3 sm:h-3.5 bg-amber-300/40" />
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300 fill-amber-300 filter drop-shadow-[0_0_6px_rgba(252,211,77,0.8)]" />
              <span className="text-[11px] sm:text-sm font-black text-amber-200 tracking-wide drop-shadow-sm">
                {stars} Stars
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Traditional Main Action Hub */}
      <div className="w-full max-w-xs flex flex-col items-center gap-2.5 sm:gap-5 mb-2 sm:mb-6 flex-shrink-0">
        {/* Big Juicy 3D Arcade PLAY Button - Lighter, High-Vibrancy Mint & Emerald */}
        <button
          onClick={handlePlayClick}
          className="relative w-full py-2.5 sm:py-4 px-6 sm:px-8 rounded-full bg-gradient-to-b from-emerald-300 via-emerald-400 to-teal-600 border-3 sm:border-4 border-emerald-100/95 shadow-[0_7px_0_#047857,0_16px_36px_rgba(16,185,129,0.55),inset_0_2px_4px_rgba(255,255,255,0.6)] sm:shadow-[0_8px_0_#047857,0_18px_40px_rgba(16,185,129,0.6),inset_0_2px_4px_rgba(255,255,255,0.6)] text-white font-black text-xl sm:text-3xl tracking-widest uppercase flex items-center justify-center gap-2 sm:gap-3 transition-all hover:scale-105 active:translate-y-1 active:shadow-[0_3px_0_#047857,0_6px_12px_rgba(16,185,129,0.4)] cursor-pointer group"
        >
          {/* Top Glass Sheen */}
          <div className="absolute top-1 inset-x-6 h-2 sm:h-3 bg-gradient-to-b from-white/80 to-transparent rounded-full pointer-events-none" />

          <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] group-hover:scale-110 transition-transform" />
          <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">PLAY</span>
        </button>

        {/* Traditional 4-Icon Action Row: Levels, Trophy, Shop, Settings */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-5">
          {/* Levels Button */}
          <button
            onClick={() => {
              gameAudio.playClick();
              onOpenLevels?.();
            }}
            className="flex flex-col items-center gap-0.5 sm:gap-1 group active:scale-95 transition-transform cursor-pointer"
            title="Level Select"
          >
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-b from-sky-400 via-blue-500 to-indigo-600 border-2 border-sky-100/90 backdrop-blur-md shadow-[0_4px_14px_rgba(14,165,233,0.45)] flex items-center justify-center text-white group-hover:border-white group-hover:shadow-[0_0_16px_rgba(56,189,248,0.7)] transition-all overflow-hidden">
              <div className="absolute top-0.5 inset-x-2 h-1 bg-white/50 rounded-full pointer-events-none" />
              <Grid className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 drop-shadow-sm" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-black text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)] uppercase tracking-wider">
              Levels
            </span>
          </button>

          {/* Achievements / Trophy Button */}
          <button
            onClick={() => {
              gameAudio.playClick();
              onOpenAchievements?.();
            }}
            className="flex flex-col items-center gap-0.5 sm:gap-1 group active:scale-95 transition-transform cursor-pointer"
            title="Achievements & Trophies"
          >
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-b from-amber-300 via-amber-400 to-yellow-600 border-2 border-yellow-100/95 backdrop-blur-md shadow-[0_4px_14px_rgba(245,158,11,0.45)] flex items-center justify-center text-white group-hover:border-white group-hover:shadow-[0_0_16px_rgba(251,191,36,0.7)] transition-all overflow-hidden">
              <div className="absolute top-0.5 inset-x-2 h-1 bg-white/50 rounded-full pointer-events-none" />
              <Trophy className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 drop-shadow-sm" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-black text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)] uppercase tracking-wider">
              Trophy
            </span>
          </button>

          {/* Shop Button */}
          <button
            onClick={() => {
              gameAudio.playClick();
              onOpenShop?.();
            }}
            className="flex flex-col items-center gap-0.5 sm:gap-1 group active:scale-95 transition-transform cursor-pointer"
            title="Shop & Themes"
          >
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-b from-pink-400 via-fuchsia-500 to-purple-600 border-2 border-pink-100/95 backdrop-blur-md shadow-[0_4px_14px_rgba(236,72,153,0.45)] flex items-center justify-center text-white group-hover:border-white group-hover:shadow-[0_0_16px_rgba(244,114,182,0.7)] transition-all overflow-hidden">
              <div className="absolute top-0.5 inset-x-2 h-1 bg-white/50 rounded-full pointer-events-none" />
              <ShoppingBag className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 drop-shadow-sm" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-black text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)] uppercase tracking-wider">
              Shop
            </span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => {
              gameAudio.playClick();
              onOpenSettings?.();
            }}
            className="flex flex-col items-center gap-0.5 sm:gap-1 group active:scale-95 transition-transform cursor-pointer"
            title="Settings"
          >
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-b from-indigo-400 via-indigo-600 to-slate-700 border-2 border-indigo-100/90 backdrop-blur-md shadow-[0_4px_14px_rgba(99,102,241,0.45)] flex items-center justify-center text-white group-hover:border-white group-hover:shadow-[0_0_16px_rgba(129,140,248,0.7)] transition-all overflow-hidden">
              <div className="absolute top-0.5 inset-x-2 h-1 bg-white/50 rounded-full pointer-events-none" />
              <Settings className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 group-hover:rotate-45 transition-transform duration-300 drop-shadow-sm" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-black text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)] uppercase tracking-wider">
              Settings
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

