import React from 'react';
import { Pause, Palette, Volume2, VolumeX, Sparkles, Coins } from 'lucide-react';
import { gameAudio } from '../utils/gameAudio';
import PlayerAvatar from './PlayerAvatar';

export default function GameHeader({
  currentStage = 1,
  coins = 250,
  playerId = '84920',
  isGameMode = false,
  onPause,
  onOpenShop,
  onOpenSettings,
}) {
  return (
    <header className="w-full max-w-md mx-auto px-4 py-3 flex items-center justify-between z-20 select-none">
      {/* Left: Player Profile or Pause */}
      {isGameMode ? (
        <button
          onClick={onPause}
          className="w-10 h-10 rounded-full bg-gradient-to-b from-cyan-400 to-blue-600 border-2 border-white/80 shadow-md shadow-blue-500/40 flex items-center justify-center text-white active:scale-95 transition-transform"
          title="Pause"
        >
          <Pause className="w-5 h-5 fill-white" />
        </button>
      ) : (
        <div className="flex items-center gap-2.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-md">
          <PlayerAvatar size="sm" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black text-amber-300 tracking-wider">
              Player
            </span>
            <span className="text-xs font-black text-white tracking-tight -mt-0.5">
              #{playerId}
            </span>
          </div>
        </div>
      )}

      {/* Center: Stage Indicator */}
      {isGameMode ? (
        <div className="flex flex-col items-center">
          <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide">
            Level {currentStage}
          </h2>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span className="text-xs font-black text-white">Stage {currentStage}</span>
        </div>
      )}

      {/* Right: Coins & Palette / Shop */}
      <div className="flex items-center gap-2">
        {/* Coins Pill */}
        <div
          onClick={onOpenShop}
          className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/20 cursor-pointer hover:bg-black/60 transition-colors"
        >
          <div className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center text-[10px] font-black text-amber-950 shadow-sm">
            🪙
          </div>
          <span className="text-xs font-black text-amber-300">{coins}</span>
        </div>

        {/* Theme / Palette Button */}
        <button
          onClick={onOpenShop}
          className="w-10 h-10 rounded-full bg-gradient-to-b from-cyan-400 to-blue-600 border-2 border-white/80 shadow-md shadow-blue-500/40 flex items-center justify-center text-white active:scale-95 transition-transform"
          title="Themes & Shop"
        >
          <Palette className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

