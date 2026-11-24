import React, { useState } from 'react';
import { X, Check, Home, Sparkles } from 'lucide-react';
import { BOLT_SKINS, NUT_SKINS, GAME_THEMES } from '../data/themes';
import { gameAudio } from '../utils/gameAudio';

export default function ShopModal({
  isOpen,
  onClose,
  coins = 250,
  stars = 125,
  gems = 15,
  activeTheme = 'playbg3',
  unlockedThemes = ['playbg3'],
  onEquipTheme,
  onPurchaseTheme,
  activeSkin = 'classic',
  unlockedSkins = ['classic'],
  onEquipSkin,
  onPurchaseSkin,
  activeNutSkin = 'steel_classic',
  unlockedNutSkins = ['steel_classic'],
  onEquipNutSkin,
  onPurchaseNutSkin,
  onHome,
}) {
  // Default to 'hardware' tab so Bolts & Nuts shelves are immediately visible when Shop opens
  const [activeTab, setActiveTab] = useState('hardware'); // 'hardware' | 'themes'
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const showNotification = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 3000);
  };

  const handleBuyBolt = (bolt) => {
    if (coins < bolt.price) {
      gameAudio.playClick();
      showNotification(`Need ${bolt.price - coins} more coins to unlock ${bolt.name}!`);
      return;
    }
    const success = onPurchaseSkin?.(bolt.id, bolt.price);
    if (success) {
      gameAudio.playPowerUp();
      showNotification(`🎉 ${bolt.name} unlocked and equipped!`);
    }
  };

  const handleBuyNut = (nut) => {
    if (coins < nut.price) {
      gameAudio.playClick();
      showNotification(`Need ${nut.price - coins} more coins to unlock ${nut.name}!`);
      return;
    }
    const success = onPurchaseNutSkin?.(nut.id, nut.price);
    if (success) {
      gameAudio.playPowerUp();
      showNotification(`🎉 ${nut.name} unlocked and equipped!`);
    }
  };

  const handleBuyTheme = (theme) => {
    if (coins < theme.price) {
      gameAudio.playClick();
      showNotification(`Need ${theme.price - coins} more coins to unlock ${theme.name}!`);
      return;
    }
    const success = onPurchaseTheme?.(theme.id, theme.price);
    if (success) {
      gameAudio.playPowerUp();
      showNotification(`🎉 ${theme.name} unlocked and equipped!`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md select-none animate-fadeIn">
      {/* Central Shop Container matching Reference Image Style */}
      <div className="relative w-full max-w-5xl max-h-[96vh] h-[720px] bg-gradient-to-b from-[#2a1a10] via-[#1a110a] to-[#0c0805] rounded-3xl sm:rounded-[36px] border-3 sm:border-4 border-[#c49b65] shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(251,191,36,0.3)] flex flex-col overflow-hidden">
        
        {/* Top Specular Sheen Line */}
        <div className="absolute top-1 inset-x-12 h-[2px] bg-gradient-to-r from-transparent via-[#ffdca8]/60 to-transparent pointer-events-none rounded-full" />

        {/* 1. TOP HEADER BAR: Navigation Switcher, Shop Title, Currencies, and Close */}
        <div className="w-full bg-[#1c120a]/95 px-3 sm:px-6 py-2 sm:py-3 border-b-2 border-[#c49b65]/80 flex items-center justify-between gap-2 flex-shrink-0 z-20 shadow-lg">
          
          {/* Left: Category Navigation Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-[#120a05] p-1 rounded-2xl border border-[#c49b65]/40 shadow-inner">
            <button
              onClick={() => {
                gameAudio.playClick();
                setActiveTab('hardware');
              }}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-black tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'hardware'
                  ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-700 text-[#1a0e05] shadow-md border border-amber-200'
                  : 'text-[#dfbf8d] hover:text-[#ffeed2] hover:bg-white/5'
              }`}
            >
              <span>🔩</span>
              <span>Bolts & Nuts</span>
            </button>

            <button
              onClick={() => {
                gameAudio.playClick();
                setActiveTab('themes');
              }}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-black tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'themes'
                  ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-700 text-[#1a0e05] shadow-md border border-amber-200'
                  : 'text-[#dfbf8d] hover:text-[#ffeed2] hover:bg-white/5'
              }`}
            >
              <span>🖼️</span>
              <span>Themes</span>
            </button>
          </div>

          {/* Center Title: 3D Golden "SHOP" Header */}
          <div className="flex items-center justify-center">
            <h1 className="text-2xl sm:text-4xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-[#fff2a8] via-[#facc15] to-[#c27803] drop-shadow-[0_3px_6px_rgba(0,0,0,0.95)]">
              SHOP
            </h1>
          </div>

          {/* Right: Coins, Stars, Home, Close */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Coins Counter */}
            <div className="flex items-center gap-1 bg-[#120a05] px-2.5 sm:px-3.5 py-1 rounded-full border border-[#c49b65]/60 shadow-inner">
              <span className="text-xs sm:text-sm">🪙</span>
              <span className="text-xs sm:text-sm font-black text-[#facc15]">{coins}</span>
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow ml-0.5">
                +
              </div>
            </div>

            {/* Stars Counter */}
            <div className="hidden sm:flex items-center gap-1 bg-[#120a05] px-2.5 sm:px-3 py-1 rounded-full border border-[#c49b65]/60 shadow-inner">
              <span className="text-xs sm:text-sm">⭐</span>
              <span className="text-xs sm:text-sm font-black text-amber-300">{stars}</span>
            </div>

            {/* Home Navigation Button */}
            <button
              onClick={() => {
                gameAudio.playClick();
                if (onHome) onHome();
                else onClose();
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-b from-[#ffeed2] via-[#f7dfb9] to-[#dfbf8d] hover:brightness-110 text-[#5c3a1d] border-2 border-[#8c6239] flex items-center justify-center font-black transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow"
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
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-b from-rose-500 to-red-700 hover:brightness-110 text-white border-2 border-rose-300 flex items-center justify-center font-black transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow"
              title="Close Shop"
              aria-label="Close"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Floating Notification Banner */}
        {errorMsg && (
          <div className="absolute top-16 inset-x-8 z-30 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-[#1a0e05] font-black text-xs sm:text-sm text-center shadow-2xl border-2 border-white/60 animate-bounce">
            {errorMsg}
          </div>
        )}

        {/* 2. MAIN SHOP SHOWCASE CONTENT */}
        <div className="relative flex-1 w-full overflow-y-auto overflow-x-hidden p-3 sm:p-6 flex flex-col gap-6 sm:gap-8 scrollbar-thin scrollbar-thumb-amber-500/30">
          
          {/* === HARDWARE TAB: 2 WOODEN SHELVES (BOLTS & NUTS) === */}
          {activeTab === 'hardware' && (
            <div className="w-full flex flex-col gap-8 sm:gap-12">
              
              {/* ======================================================== */}
              {/* --- SHELF 1: BOLTS (Matching Reference Image 4 Top) --- */}
              {/* ======================================================== */}
              <div className="relative w-full flex flex-col">
                
                {/* Blue Bookmark Ribbon Badge: "BOLTS" */}
                <div className="absolute -top-3 left-2 sm:left-4 z-20 flex flex-col items-center">
                  <div className="px-3 sm:px-5 py-1 sm:py-1.5 rounded-t-md bg-gradient-to-b from-[#2563eb] via-[#1d4ed8] to-[#1e3a8a] border-2 border-sky-300 shadow-[0_4px_10px_rgba(0,0,0,0.8)] flex items-center justify-center">
                    <span className="text-xs sm:text-sm font-black text-white tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                      BOLTS
                    </span>
                  </div>
                  {/* Ribbon swallowtail bottom tip */}
                  <div className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[8px] border-t-[#1e3a8a]" />
                </div>

                {/* 6 Bolts Grid Sitting directly ON Top of the Shelf */}
                <div className="w-full grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4 px-2 sm:px-6 z-10 items-end">
                  {BOLT_SKINS.map((bolt) => {
                    const isUnlocked = (unlockedSkins || []).includes(bolt.id) || bolt.price === 0;
                    const isEquipped = activeSkin === bolt.id;

                    return (
                      <div
                        key={bolt.id}
                        className="flex flex-col items-center justify-end group transition-transform duration-150"
                      >
                        {/* 3D Bolt Graphic Preview */}
                        <div
                          onClick={() => {
                            if (isUnlocked) {
                              gameAudio.playClick();
                              onEquipSkin?.(bolt.id);
                            }
                          }}
                          className={`relative h-28 sm:h-36 w-full flex items-end justify-center pb-1 cursor-pointer transition-transform ${
                            isEquipped ? 'scale-105' : 'hover:scale-105'
                          }`}
                          title={bolt.name}
                        >
                          <img
                            src={bolt.previewImg}
                            alt={bolt.name}
                            className={`max-h-full max-w-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)] ${
                              isEquipped ? 'drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]' : ''
                            }`}
                            style={{ imageRendering: 'high-quality' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Heavy Wooden Shelf Plank (Runs 100% across beneath the 6 bolts) */}
                <div className="w-full h-5 sm:h-7 rounded-md bg-gradient-to-b from-[#c49b65] via-[#8c6239] to-[#4a2e16] border-t-2 border-[#ffeed2]/40 shadow-[0_8px_16px_rgba(0,0,0,0.85),inset_0_2px_4px_rgba(255,255,255,0.25)] relative z-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffdca8]/20 to-transparent pointer-events-none" />
                </div>

                {/* 6 Buttons Row Hanging Directly Below the Shelf Plank */}
                <div className="w-full grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4 px-2 sm:px-6 pt-2 items-start z-10">
                  {BOLT_SKINS.map((bolt) => {
                    const isUnlocked = (unlockedSkins || []).includes(bolt.id) || bolt.price === 0;
                    const isEquipped = activeSkin === bolt.id;

                    return (
                      <div key={bolt.id} className="w-full flex flex-col items-center justify-start">
                        {isEquipped ? (
                          <button
                            type="button"
                            className="w-full max-w-[125px] py-1.5 px-2 rounded-full bg-gradient-to-b from-cyan-400 via-sky-500 to-blue-700 text-white font-black text-[11px] sm:text-xs tracking-wider uppercase shadow-[0_3px_0_#1e3a8a,0_4px_10px_rgba(0,0,0,0.6)] flex items-center justify-center gap-1 border-2 border-cyan-200"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>IN USE</span>
                          </button>
                        ) : isUnlocked ? (
                          <button
                            type="button"
                            onClick={() => {
                              gameAudio.playClick();
                              onEquipSkin?.(bolt.id);
                            }}
                            className="w-full max-w-[125px] py-1.5 px-2 rounded-full bg-gradient-to-b from-emerald-400 via-emerald-500 to-green-700 hover:brightness-110 active:scale-95 text-white font-black text-[11px] sm:text-xs tracking-wider uppercase shadow-[0_3px_0_#064e3b,0_4px_10px_rgba(0,0,0,0.6)] transition-all cursor-pointer border-2 border-emerald-200"
                          >
                            EQUIP
                          </button>
                        ) : (
                          <div className="relative w-full max-w-[125px] flex flex-col items-center">
                            {/* LOCKED Tab Badge matching reference */}
                            {bolt.isLocked && (
                              <div className="px-2.5 py-0.5 rounded-t-md bg-[#16380d] border border-[#3b8705] text-[#bbf77a] text-[9px] sm:text-[10px] font-black uppercase tracking-wider -mb-1 z-10 shadow">
                                LOCKED
                              </div>
                            )}

                            {/* Glossy Green Pill Button matching reference */}
                            <button
                              type="button"
                              onClick={() => handleBuyBolt(bolt)}
                              className="w-full py-1.5 px-2 rounded-full bg-gradient-to-b from-[#8ce33a] via-[#5cb811] to-[#3a7d08] hover:brightness-110 active:scale-95 text-white font-black text-xs sm:text-sm tracking-tight shadow-[0_3px_0_#235203,0_4px_10px_rgba(0,0,0,0.65)] flex items-center justify-center gap-1 transition-all cursor-pointer border-2 border-[#bbf77a]"
                            >
                              {bolt.isNew ? (
                                <span className="tracking-wide">NEW</span>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <span>{bolt.displayPrice || bolt.price}</span>
                                  <div className="w-4 h-4 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 border border-amber-200 flex items-center justify-center text-[10px] text-amber-950 font-black shadow-sm">
                                    ⭐
                                  </div>
                                </div>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ======================================================== */}
              {/* --- SHELF 2: NUTS (Matching Reference Image 4 Bottom) --- */}
              {/* ======================================================== */}
              <div className="relative w-full flex flex-col">
                
                {/* Blue Bookmark Ribbon Badge: "NUTS" */}
                <div className="absolute -top-3 left-2 sm:left-4 z-20 flex flex-col items-center">
                  <div className="px-3 sm:px-5 py-1 sm:py-1.5 rounded-t-md bg-gradient-to-b from-[#2563eb] via-[#1d4ed8] to-[#1e3a8a] border-2 border-sky-300 shadow-[0_4px_10px_rgba(0,0,0,0.8)] flex items-center justify-center">
                    <span className="text-xs sm:text-sm font-black text-white tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                      NUTS
                    </span>
                  </div>
                  {/* Ribbon swallowtail bottom tip */}
                  <div className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[8px] border-t-[#1e3a8a]" />
                </div>

                {/* 6 Nuts Grid Sitting directly ON Top of the Shelf */}
                <div className="w-full grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4 px-2 sm:px-6 z-10 items-end">
                  {NUT_SKINS.map((nut) => {
                    const isUnlocked = (unlockedNutSkins || []).includes(nut.id) || nut.price === 0;
                    const isEquipped = activeNutSkin === nut.id;

                    // Nut 3 has luminous emerald aura glow; Nut 5 has double magenta-purple neon cyber rings!
                    const isEmeraldGlow = nut.id === 'green_glow';
                    const isNeonPurple = nut.id === 'neon_purple';

                    return (
                      <div
                        key={nut.id}
                        className="flex flex-col items-center justify-end group transition-transform duration-150"
                      >
                        {/* 3D Nut Graphic Preview */}
                        <div
                          onClick={() => {
                            if (isUnlocked) {
                              gameAudio.playClick();
                              onEquipNutSkin?.(nut.id);
                            }
                          }}
                          className={`relative h-24 sm:h-32 w-full flex items-end justify-center pb-1 cursor-pointer transition-transform ${
                            isEquipped ? 'scale-105' : 'hover:scale-105'
                          }`}
                          title={nut.name}
                        >
                          <img
                            src={nut.previewImg}
                            alt={nut.name}
                            className={`max-h-full max-w-full object-contain filter ${
                              isEmeraldGlow
                                ? 'drop-shadow-[0_0_16px_rgba(74,222,128,0.95)] drop-shadow-[0_0_28px_rgba(134,239,172,0.6)]'
                                : isNeonPurple
                                ? 'drop-shadow-[0_0_16px_rgba(192,132,252,0.95)] drop-shadow-[0_0_28px_rgba(244,114,182,0.7)]'
                                : isEquipped
                                ? 'drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]'
                                : 'drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)]'
                            }`}
                            style={{ imageRendering: 'high-quality' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Heavy Wooden Shelf Plank (Runs 100% across beneath the 6 nuts) */}
                <div className="w-full h-5 sm:h-7 rounded-md bg-gradient-to-b from-[#c49b65] via-[#8c6239] to-[#4a2e16] border-t-2 border-[#ffeed2]/40 shadow-[0_8px_16px_rgba(0,0,0,0.85),inset_0_2px_4px_rgba(255,255,255,0.25)] relative z-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ffdca8]/20 to-transparent pointer-events-none" />
                </div>

                {/* 6 Buttons Row Hanging Directly Below the Shelf Plank */}
                <div className="w-full grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4 px-2 sm:px-6 pt-2 items-start z-10">
                  {NUT_SKINS.map((nut) => {
                    const isUnlocked = (unlockedNutSkins || []).includes(nut.id) || nut.price === 0;
                    const isEquipped = activeNutSkin === nut.id;

                    return (
                      <div key={nut.id} className="w-full flex flex-col items-center justify-start">
                        {isEquipped ? (
                          <button
                            type="button"
                            className="w-full max-w-[125px] py-1.5 px-2 rounded-full bg-gradient-to-b from-cyan-400 via-sky-500 to-blue-700 text-white font-black text-[11px] sm:text-xs tracking-wider uppercase shadow-[0_3px_0_#1e3a8a,0_4px_10px_rgba(0,0,0,0.6)] flex items-center justify-center gap-1 border-2 border-cyan-200"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>IN USE</span>
                          </button>
                        ) : isUnlocked ? (
                          <button
                            type="button"
                            onClick={() => {
                              gameAudio.playClick();
                              onEquipNutSkin?.(nut.id);
                            }}
                            className="w-full max-w-[125px] py-1.5 px-2 rounded-full bg-gradient-to-b from-emerald-400 via-emerald-500 to-green-700 hover:brightness-110 active:scale-95 text-white font-black text-[11px] sm:text-xs tracking-wider uppercase shadow-[0_3px_0_#064e3b,0_4px_10px_rgba(0,0,0,0.6)] transition-all cursor-pointer border-2 border-emerald-200"
                          >
                            EQUIP
                          </button>
                        ) : (
                          <div className="relative w-full max-w-[125px] flex flex-col items-center">
                            {/* LOCKED Tab Badge matching reference */}
                            {nut.isLocked && (
                              <div className="px-2.5 py-0.5 rounded-t-md bg-[#16380d] border border-[#3b8705] text-[#bbf77a] text-[9px] sm:text-[10px] font-black uppercase tracking-wider -mb-1 z-10 shadow">
                                LOCKED
                              </div>
                            )}

                            {/* Glossy Green Pill Button matching reference */}
                            <button
                              type="button"
                              onClick={() => handleBuyNut(nut)}
                              className="w-full py-1.5 px-2 rounded-full bg-gradient-to-b from-[#8ce33a] via-[#5cb811] to-[#3a7d08] hover:brightness-110 active:scale-95 text-white font-black text-xs sm:text-sm tracking-tight shadow-[0_3px_0_#235203,0_4px_10px_rgba(0,0,0,0.65)] flex items-center justify-center gap-1 transition-all cursor-pointer border-2 border-[#bbf77a]"
                            >
                              {nut.isNew ? (
                                <span className="tracking-wide">NEW</span>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <span>{nut.displayPrice || nut.price}</span>
                                  <div className="w-4 h-4 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 border border-amber-200 flex items-center justify-center text-[10px] text-amber-950 font-black shadow-sm">
                                    ⭐
                                  </div>
                                </div>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* === THEMES TAB: WORKSHOP BACKGROUND SCENES === */}
          {activeTab === 'themes' && (
            <div className="w-full flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#c49b65]/30">
                <span className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <span>🖼️</span> Workshop Background Themes (Gameplay Scenes)
                </span>
                <span className="text-xs text-[#dfbf8d]">
                  Purchased scenes are saved to your account!
                </span>
              </div>

              {/* 4 Background Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {GAME_THEMES.map((theme) => {
                  const isUnlocked = (unlockedThemes || []).includes(theme.id) || theme.price === 0;
                  const isEquipped = activeTheme === theme.id;

                  return (
                    <div
                      key={theme.id}
                      className={`relative flex flex-col rounded-2xl overflow-hidden transition-all duration-200 ${
                        isEquipped
                          ? 'bg-gradient-to-b from-[#3a2212] to-[#1a1008] border-2 sm:border-3 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.4)]'
                          : 'bg-[#140b05] border border-[#c49b65]/50 hover:border-amber-400/80 hover:bg-[#1f120a]'
                      }`}
                    >
                      {/* 16:9 Thumbnail Preview */}
                      <div className="relative w-full aspect-[16/9] overflow-hidden bg-black/60 group">
                        <img
                          src={theme.previewImg}
                          alt={theme.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          style={{ imageRendering: 'high-quality' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />

                        {/* Status Badges */}
                        {isEquipped ? (
                          <div className="absolute top-2 right-2 px-3 py-1 rounded-full bg-cyan-500 text-white font-black text-[10px] tracking-wider uppercase shadow flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" />
                            EQUIPPED
                          </div>
                        ) : theme.isDefault ? (
                          <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-amber-500 text-amber-950 font-black text-[9px] tracking-wider uppercase shadow">
                            DEFAULT
                          </div>
                        ) : null}

                        {/* Name on image */}
                        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                          <span className="text-sm font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                            {theme.name}
                          </span>
                        </div>
                      </div>

                      {/* Description & Button */}
                      <div className="p-3 flex items-center justify-between gap-2">
                        <p className="text-xs text-[#dfbf8d] line-clamp-1 flex-1">
                          {theme.desc}
                        </p>

                        {isEquipped ? (
                          <div className="px-4 py-1.5 rounded-full bg-cyan-500 text-white font-black text-xs text-center shadow whitespace-nowrap">
                            IN USE
                          </div>
                        ) : isUnlocked ? (
                          <button
                            onClick={() => {
                              gameAudio.playClick();
                              onEquipTheme?.(theme.id);
                            }}
                            className="px-4 py-1.5 rounded-full bg-gradient-to-b from-emerald-500 to-green-700 hover:brightness-110 active:scale-95 text-white font-black text-xs text-center shadow cursor-pointer transition-transform whitespace-nowrap border border-emerald-300"
                          >
                            EQUIP
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBuyTheme(theme)}
                            className="px-4 py-1.5 rounded-full bg-gradient-to-b from-lime-300 via-emerald-400 to-green-600 hover:brightness-110 active:scale-95 text-[#0c2207] font-black text-xs text-center shadow flex items-center justify-center gap-1.5 cursor-pointer transition-transform whitespace-nowrap border border-lime-100"
                          >
                            <span>{theme.price}</span>
                            <span>🪙 BUY</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
