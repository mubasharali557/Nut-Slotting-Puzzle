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
          {/* Traditional Trio of Water Sort Glass Flasks (Matching Reference Image) */}
          <div className="relative flex items-end justify-center gap-6 sm:gap-8 pb-1 filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)]">
            {/* Left Flask (Tilted -8deg with generous breathing room) */}
            <div className="relative w-7 h-18 sm:w-9 sm:h-24 transform -rotate-8 flex flex-col justify-end">
              {/* Flared Glass Lip Collar (Clean Borderless) */}
              <div className="absolute top-0 inset-x-[-1px] h-2 bg-gradient-to-r from-white/30 via-white/50 to-white/30 rounded-full shadow-sm z-30" />
              {/* Narrow Neck */}
              <div className="absolute top-1.5 inset-x-1 h-2.5 bg-white/10 z-20" />
              {/* Main Body (Borderless Crystal Glass) */}
              <div className="relative w-full h-[90%] rounded-b-md rounded-t-xl bg-white/10 backdrop-blur-md shadow-lg flex flex-col justify-end overflow-hidden">
                {/* Glass Gloss highlight */}
                <div className="absolute top-1 left-0.5 bottom-1.5 w-1 bg-gradient-to-b from-white/60 via-white/30 to-transparent rounded-full z-20 pointer-events-none" />
                {/* 4 Colored Water Layers - Ultra-Vibrant Pure Solid Colors */}
                <div className="w-full h-3.5 sm:h-4.5 bg-[#ffea00] border-b border-black/20" />
                <div className="w-full h-3.5 sm:h-4.5 bg-[#004cff] border-b border-black/20" />
                <div className="w-full h-3.5 sm:h-4.5 bg-[#00e626] border-b border-black/20" />
                <div className="w-full h-4 sm:h-5.5 rounded-b-sm bg-[#eb0000]" />
              </div>
            </div>

            {/* Center Main Flask (Taller, 0deg) */}
            <div className="relative w-8.5 h-22 sm:w-11 sm:h-28 z-10 flex flex-col justify-end">
              {/* Flared Glass Lip Collar (Clean Borderless) */}
              <div className="absolute top-0 inset-x-[-1.5px] h-2.5 bg-gradient-to-r from-white/35 via-white/60 to-white/35 rounded-full shadow-md z-30" />
              {/* Narrow Neck */}
              <div className="absolute top-2 inset-x-1.5 h-3 bg-white/10 z-20" />
              {/* Main Body (Borderless Crystal Glass) */}
              <div className="relative w-full h-[90%] rounded-b-md rounded-t-xl bg-white/10 backdrop-blur-md shadow-[0_12px_28px_rgba(0,0,0,0.8)] flex flex-col justify-end overflow-hidden">
                {/* Glass Gloss highlight */}
                <div className="absolute top-1 left-1 bottom-2 w-1.5 bg-gradient-to-b from-white/70 via-white/35 to-transparent rounded-full z-20 pointer-events-none" />
                {/* 4 Colored Water Layers - Ultra-Vibrant Pure Solid Colors */}
                <div className="w-full h-4 sm:h-5.5 bg-[#ff5ebc] border-b border-black/20" />
                <div className="w-full h-4 sm:h-5.5 bg-[#ffea00] border-b border-black/20" />
                <div className="w-full h-4 sm:h-5.5 bg-[#00e5ff] border-b border-black/20" />
                <div className="w-full h-4.5 sm:h-6.5 rounded-b-sm bg-[#9900ff]" />
              </div>
            </div>

            {/* Right Flask (Tilted +8deg with generous breathing room) */}
            <div className="relative w-7 h-18 sm:w-9 sm:h-24 transform rotate-8 flex flex-col justify-end">
              {/* Flared Glass Lip Collar (Clean Borderless) */}
              <div className="absolute top-0 inset-x-[-1px] h-2 bg-gradient-to-r from-white/30 via-white/50 to-white/30 rounded-full shadow-sm z-30" />
              {/* Narrow Neck */}
              <div className="absolute top-1.5 inset-x-1 h-2.5 bg-white/10 z-20" />
              {/* Main Body (Borderless Crystal Glass) */}
              <div className="relative w-full h-[90%] rounded-b-md rounded-t-xl bg-white/10 backdrop-blur-md shadow-lg flex flex-col justify-end overflow-hidden">
                {/* Glass Gloss highlight */}
                <div className="absolute top-1 left-0.5 bottom-1.5 w-1 bg-gradient-to-b from-white/60 via-white/30 to-transparent rounded-full z-20 pointer-events-none" />
                {/* 4 Colored Water Layers - Ultra-Vibrant Pure Solid Colors */}
                <div className="w-full h-3.5 sm:h-4.5 bg-[#004cff] border-b border-black/20" />
                <div className="w-full h-3.5 sm:h-4.5 bg-[#ff7700] border-b border-black/20" />
                <div className="w-full h-3.5 sm:h-4.5 bg-[#ffffff] border-b border-black/20" />
                <div className="w-full h-4 sm:h-5.5 rounded-b-sm bg-[#141418]" />
              </div>
            </div>
          </div>

          {/* Traditional 3D Typography Logo - High Contrast & Radiant Glow */}
          <div className="relative inline-block -mt-1 sm:-mt-2">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-500 drop-shadow-[0_3px_0_#78350f] sm:drop-shadow-[0_4px_0_#78350f] filter drop-shadow-[0_0_24px_rgba(245,158,11,0.55)]">
              WATER
            </h1>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-cyan-100 via-sky-400 to-blue-500 -mt-1.5 sm:-mt-2.5 drop-shadow-[0_3px_0_#0369a1] sm:drop-shadow-[0_4px_0_#0369a1] filter drop-shadow-[0_0_24px_rgba(6,182,212,0.6)]">
              SORT
            </h2>
            {/* Traditional Casual "PUZZLE" Ribbon Banner - Midnight Obsidian Capsule */}
            <div className="mx-auto -mt-1 sm:-mt-1.5 px-3.5 sm:px-4 py-0.5 rounded-full bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border border-indigo-500/60 shadow-[0_0_16px_rgba(99,102,241,0.4)] inline-block">
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-white drop-shadow-md">
                PUZZLE
              </span>
            </div>
          </div>
        </div>

        {/* Completely STATIC Traditional Level Banner (Zero animation, 100% stationary) */}
        <div className="mt-3.5 sm:mt-6 flex flex-col items-center">
          {/* 3 Golden Stars with Radiant Warm Glow */}
          <div className="flex items-center justify-center gap-1.5 -mb-1.5 sm:-mb-2 z-10">
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.85)] transform -rotate-12" />
            <Star className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 text-amber-300 fill-amber-300 filter drop-shadow-[0_0_12px_rgba(251,191,36,0.95)] transform -translate-y-0.5" />
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.85)] transform rotate-12" />
          </div>

          {/* Traditional Plaque Pill: Stage + Stars - Polished Obsidian Glass Card */}
          <div className="inline-flex items-center gap-2.5 sm:gap-3.5 bg-gradient-to-r from-slate-950/98 via-slate-900/98 to-slate-950/98 backdrop-blur-xl px-4 sm:px-6 py-1.5 sm:py-2.5 rounded-2xl border border-amber-400/60 shadow-[0_12px_36px_rgba(0,0,0,0.85),0_0_20px_rgba(245,158,11,0.25),inset_0_1px_1px_rgba(255,255,255,0.12)]">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 filter drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <span className="text-[12px] sm:text-sm font-black text-white tracking-wide uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                STAGE {currentStage}
              </span>
            </div>
            <div className="w-[1.5px] h-3.5 sm:h-4 bg-slate-700/80" />
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              <span className="text-[12px] sm:text-sm font-black text-amber-300 tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {stars} Stars
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Traditional Main Action Hub */}
      <div className="w-full max-w-xs flex flex-col items-center gap-2.5 sm:gap-5 mb-2 sm:mb-6 flex-shrink-0">
        {/* Big High-Contrast 3D Arcade PLAY Button - Radiant Emerald */}
        <button
          onClick={handlePlayClick}
          className="relative w-full py-2.5 sm:py-4 px-6 sm:px-8 rounded-full bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-700 border-3 sm:border-4 border-emerald-300 shadow-[0_8px_0_#064e3b,0_0_35px_rgba(16,185,129,0.5),0_18px_36px_rgba(0,0,0,0.7)] text-white font-black text-xl sm:text-3xl tracking-widest uppercase flex items-center justify-center gap-2 sm:gap-3 transition-all hover:scale-105 active:translate-y-1 active:shadow-[0_3px_0_#064e3b,0_6px_12px_rgba(0,0,0,0.5)] cursor-pointer group"
        >
          {/* Top Glass Sheen */}
          <div className="absolute top-1 inset-x-6 h-2 sm:h-3 bg-gradient-to-b from-white/45 to-transparent rounded-full pointer-events-none" />

          <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] group-hover:scale-110 transition-transform" />
          <span className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">PLAY</span>
        </button>

        {/* Traditional 4-Icon Action Row: Levels, Trophy, Shop, Settings - Sleek Dark Obsidian Cards */}
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
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-b from-slate-900/98 via-slate-950/98 to-black border border-sky-500/50 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.75),0_0_15px_rgba(14,165,233,0.25)] flex items-center justify-center text-sky-400 group-hover:border-sky-300 group-hover:text-sky-300 group-hover:shadow-[0_0_20px_rgba(14,165,233,0.5)] transition-all overflow-hidden">
              <div className="absolute top-0.5 inset-x-2 h-0.5 bg-white/25 rounded-full pointer-events-none" />
              <Grid className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 drop-shadow-[0_0_6px_rgba(14,165,233,0.6)]" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-black text-slate-100 group-hover:text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)] uppercase tracking-wider transition-colors">
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
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-b from-slate-900/98 via-slate-950/98 to-black border border-amber-500/50 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.75),0_0_15px_rgba(245,158,11,0.25)] flex items-center justify-center text-amber-400 group-hover:border-amber-300 group-hover:text-amber-300 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all overflow-hidden">
              <div className="absolute top-0.5 inset-x-2 h-0.5 bg-white/25 rounded-full pointer-events-none" />
              <Trophy className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-black text-slate-100 group-hover:text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)] uppercase tracking-wider transition-colors">
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
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-b from-slate-900/98 via-slate-950/98 to-black border border-pink-500/50 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.75),0_0_15px_rgba(236,72,153,0.25)] flex items-center justify-center text-pink-400 group-hover:border-pink-300 group-hover:text-pink-300 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all overflow-hidden">
              <div className="absolute top-0.5 inset-x-2 h-0.5 bg-white/25 rounded-full pointer-events-none" />
              <ShoppingBag className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 drop-shadow-[0_0_6px_rgba(236,72,153,0.6)]" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-black text-slate-100 group-hover:text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)] uppercase tracking-wider transition-colors">
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
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-b from-slate-900/98 via-slate-950/98 to-black border border-slate-700/80 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.75),0_0_15px_rgba(255,255,255,0.1)] flex items-center justify-center text-slate-200 group-hover:border-white/50 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all overflow-hidden">
              <div className="absolute top-0.5 inset-x-2 h-0.5 bg-white/25 rounded-full pointer-events-none" />
              <Settings className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 group-hover:rotate-45 transition-transform duration-300 drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-black text-slate-100 group-hover:text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)] uppercase tracking-wider transition-colors">
              Settings
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

