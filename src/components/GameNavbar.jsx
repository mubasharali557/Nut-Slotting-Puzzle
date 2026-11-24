import React from 'react';
import { RotateCcw, Pause, User } from 'lucide-react';
import { gameAudio } from '../utils/gameAudio';

export default function GameNavbar({
  isHome = false,
  currentStage = 1,
  chances = 20,
  stars = 125,
  coins = 250,
  playerName = 'Mubashar',
  playerId = '84920',
  soundEnabled = true,
  onToggleSound,
  onOpenSettings,
  onOpenShop,
  onOpenLevels,
  onOpenAchievements,
  onRestart,
  onHome,
  onPause,
}) {
  return (
    <header className="w-full z-40 flex-shrink-0 select-none flex justify-center">
      {/* 
        RESPONSIVE NAVBAR ALIGNED WITH MASTER IMAGE
        Matches the exact width and aspect ratio boundaries of the displayed image (calc((100dvh - 48px) * 2752 / 1536)),
        framing the gameplay cleanly on any screen resolution without stretching across black pillarbox bars.
      */}
      <div
        className="relative w-full bg-gradient-to-b from-[#3a2212] via-[#24140a] to-[#140b05] border-b-2 sm:border-b-3 border-[#c49b65] shadow-[0_4px_16px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,238,210,0.25)] px-1.5 sm:px-3 md:px-4 py-0.5 sm:py-1 md:py-1.5 flex items-center justify-between gap-1 sm:gap-2 md:gap-3 overflow-hidden rounded-b-xl sm:rounded-b-2xl border-x-2 sm:border-x-3 border-[#c49b65]/70"
        style={{
          maxWidth: 'calc(100dvh * 2752 / 1536)',
        }}
      >
        {/* Subtle top golden sheen line */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#ffdca8]/50 to-transparent pointer-events-none" />

        {/* LEFT SECTION: Nut Sort Puzzle Wooden Sign Badge (Moved to left where Level was) */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Pause Button (In gameplay only) */}
          {!isHome && (
            <button
              onClick={() => {
                gameAudio.playClick();
                if (onPause) onPause();
                else if (onOpenSettings) onOpenSettings();
              }}
              className="w-7 h-7 sm:w-8.5 sm:h-8.5 rounded-full bg-gradient-to-b from-sky-400 via-blue-500 to-blue-700 border-2 sm:border-2.5 border-sky-200 shadow-[0_2px_0_#1e3a8a,0_3px_8px_rgba(0,0,0,0.6)] flex items-center justify-center text-white cursor-pointer transition-transform hover:scale-105 active:scale-95 flex-shrink-0"
              title="Pause Game / Settings"
            >
              <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
            </button>
          )}

          {/* Nut Sort Puzzle Wooden Sign Badge */}
          <div
            onClick={() => {
              if (onHome) {
                gameAudio.playClick();
                onHome();
              }
            }}
            className="relative flex items-center cursor-pointer group transition-transform hover:scale-[1.03]"
            title="Nut Sort Color Puzzle"
          >
            <img
              src="/nut_sort_navbar_badge.webp"
              alt="Nut Sort Puzzle"
              className="h-6 sm:h-8 md:h-10 object-contain drop-shadow-[0_3px_8px_rgba(0,0,0,0.8)] filter brightness-105"
              style={{ imageRendering: 'high-quality' }}
            />
          </div>
        </div>

        {/* RIGHT SECTION: Level Plaque (moved here next to Plus), Coins Pill (+), Player Profile ID, & Gameplay Controls */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-2.5 flex-shrink-0">
          {/* Riveted Wooden Plaque: "Level {stage}" (Moved to the right side) */}
          <div
            onClick={() => {
              if (onOpenLevels) {
                gameAudio.playClick();
                onOpenLevels();
              }
            }}
            className="relative px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-gradient-to-b from-[#7a481c] via-[#5c3411] to-[#3d2008] border-2 border-[#b88c52] shadow-[0_2px_4px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center leading-none cursor-pointer hover:scale-105 active:scale-95 transition-transform flex-shrink-0"
            title="Current Level - Click for Stage Map"
          >
            {/* 4 Corner Screws/Rivets */}
            <div className="absolute top-0.5 left-0.5 w-0.5 sm:w-1 h-0.5 sm:h-1 rounded-full bg-[#dfbf8d] shadow-[0_1px_1px_rgba(0,0,0,0.6)]" />
            <div className="absolute top-0.5 right-0.5 w-0.5 sm:w-1 h-0.5 sm:h-1 rounded-full bg-[#dfbf8d] shadow-[0_1px_1px_rgba(0,0,0,0.6)]" />
            <div className="absolute bottom-0.5 left-0.5 w-0.5 sm:w-1 h-0.5 sm:h-1 rounded-full bg-[#dfbf8d] shadow-[0_1px_1px_rgba(0,0,0,0.6)]" />
            <div className="absolute bottom-0.5 right-0.5 w-0.5 sm:w-1 h-0.5 sm:h-1 rounded-full bg-[#dfbf8d] shadow-[0_1px_1px_rgba(0,0,0,0.6)]" />

            <span className="text-[7px] sm:text-[9px] font-black text-[#ffeed2] tracking-wider uppercase drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">
              Level
            </span>
            <span className="text-[11px] sm:text-sm font-black text-[#facc15] tracking-tight drop-shadow-[0_2px_3px_rgba(0,0,0,0.95)]">
              {currentStage}
            </span>
          </div>

          {/* Currency Pill: 🪙 Coins with Plus (+) Icon */}
          <div
            onClick={() => {
              if (onOpenShop) {
                gameAudio.playClick();
                onOpenShop();
              }
            }}
            className="flex items-center gap-0.5 sm:gap-1 bg-[#1c1108]/90 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-[#c49b65]/70 shadow-inner cursor-pointer hover:border-amber-400 transition-colors flex-shrink-0"
            title="Coins - Click for Shop"
          >
            <span className="text-[9px] sm:text-[11px]">🪙</span>
            <span className="text-[9.5px] sm:text-[11px] font-black text-[#facc15] tracking-tight">
              {coins}
            </span>
            <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] sm:text-[9px] font-bold shadow ml-0.5">
              +
            </div>
          </div>

          {/* Player Profile / Player ID Pill */}
          <div
            onClick={() => {
              gameAudio.playClick();
              if (onOpenSettings) onOpenSettings();
            }}
            className="flex items-center gap-1 sm:gap-1.5 bg-[#1c1108]/90 pl-1 pr-1.5 sm:pr-2.5 py-0.5 sm:py-1 rounded-full border border-[#c49b65]/70 shadow-inner cursor-pointer hover:border-amber-400 transition-colors flex-shrink-0 group"
            title={`Player: ${playerName || 'Mubashar'} (#${playerId || '84920'}) - Click for Settings`}
          >
            {/* Circular User Avatar Medallion */}
            <div className="w-4.5 h-4.5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-600 p-0.5 shadow-sm flex items-center justify-center flex-shrink-0">
              <div className="w-full h-full rounded-full bg-[#1c120a] flex items-center justify-center overflow-hidden">
                <User className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-amber-300 stroke-[2.5]" />
              </div>
            </div>
            {/* Player Label & ID */}
            <div className="flex flex-col leading-none">
              <span className="text-[7px] sm:text-[8.5px] font-black uppercase text-[#dfbf8d] tracking-wider truncate max-w-[42px] xs:max-w-[65px] sm:max-w-[80px]">
                {playerName || 'Player'}
              </span>
              <span className="hidden xs:inline text-[8.5px] sm:text-[10px] font-bold text-[#facc15] tracking-tight">
                #{playerId || '84920'}
              </span>
            </div>
          </div>

          {/* Moves Plaque (In gameplay only - hidden on mobile to prevent crowding with sub-bar) */}
          {!isHome && (
            <div className="hidden sm:flex relative px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-gradient-to-b from-[#7a481c] via-[#5c3411] to-[#3d2008] border-2 border-[#b88c52] shadow-[0_2px_4px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(0,0,0,0.8)] flex-col items-center justify-center leading-none flex-shrink-0">
              {/* 4 Corner Screws */}
              <div className="absolute top-0.5 left-0.5 w-0.5 sm:w-1 h-0.5 sm:h-1 rounded-full bg-[#dfbf8d] shadow-[0_1px_1px_rgba(0,0,0,0.6)]" />
              <div className="absolute top-0.5 right-0.5 w-0.5 sm:w-1 h-0.5 sm:h-1 rounded-full bg-[#dfbf8d] shadow-[0_1px_1px_rgba(0,0,0,0.6)]" />
              <div className="absolute bottom-0.5 left-0.5 w-0.5 sm:w-1 h-0.5 sm:h-1 rounded-full bg-[#dfbf8d] shadow-[0_1px_1px_rgba(0,0,0,0.6)]" />
              <div className="absolute bottom-0.5 right-0.5 w-0.5 sm:w-1 h-0.5 sm:h-1 rounded-full bg-[#dfbf8d] shadow-[0_1px_1px_rgba(0,0,0,0.6)]" />

              <span className="text-[7px] sm:text-[9px] font-black text-[#ffeed2] tracking-wider uppercase drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">
                Moves
              </span>
              <span className="text-[11px] sm:text-sm font-black text-[#facc15] tracking-tight drop-shadow-[0_2px_3px_rgba(0,0,0,0.95)]">
                {chances}
              </span>
            </div>
          )}

          {/* Green Restart Button 🔄 (In gameplay only) */}
          {!isHome && (
            <button
              onClick={() => {
                gameAudio.playClick();
                if (onRestart) onRestart();
              }}
              className="w-7 h-7 sm:w-8.5 sm:h-8.5 rounded-full bg-gradient-to-b from-lime-300 via-emerald-500 to-green-700 border-2 sm:border-2.5 border-lime-200 shadow-[0_2px_0_#064e3b,0_3px_8px_rgba(0,0,0,0.6)] flex items-center justify-center text-white cursor-pointer transition-transform hover:scale-105 active:scale-95 flex-shrink-0"
              title="Restart Level"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.8]" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
