import React, { useState } from 'react';
import { X, Check, Home, ArrowLeft } from 'lucide-react';
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
      {/* Central Shop Container (Mobile & Desktop Responsive) */}
      <div className="relative w-full max-w-5xl max-h-[94dvh] sm:h-[720px] bg-gradient-to-b from-[#2a1a10] via-[#1a110a] to-[#0c0805] rounded-2xl sm:rounded-[36px] border-2 sm:border-4 border-[#c49b65] shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(251,191,36,0.3)] flex flex-col overflow-hidden">

        {/* Top Specular Sheen Line */}
        <div className="absolute top-1 inset-x-12 h-[2px] bg-gradient-to-r from-transparent via-[#ffdca8]/60 to-transparent pointer-events-none rounded-full" />

        {/* 1. RESPONSIVE HEADER BAR (Fits cleanly on narrow mobile screens without overflow) */}
        <div className="w-full bg-[#1c120a]/95 px-3 sm:px-6 py-2.5 sm:py-3 border-b-2 border-[#c49b65]/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 flex-shrink-0 z-20 shadow-lg">

          {/* Row 1 (Mobile) / Spread (Desktop): Back, SHOP Title, Coins + Close */}
          <div className="w-full sm:w-auto flex items-center justify-between gap-2 sm:order-2 sm:flex-1">
            {/* Visible Back Button (mobile & desktop) */}
            <button
              type="button"
              onClick={() => {
                gameAudio.playClick();
                onClose();
              }}
              className="sm:hidden h-9 px-3 rounded-xl bg-gradient-to-b from-[#ffeed2] via-[#f7dfb9] to-[#dfbf8d] hover:brightness-105 active:scale-95 text-[#5c3a1d] border-2 border-[#8c6239] flex items-center justify-center gap-1 font-black text-xs shadow cursor-pointer flex-shrink-0"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.8]" />
              <span>Back</span>
            </button>

            {/* Center Title: 3D Golden "SHOP" Header */}
            <div className="flex items-center justify-center sm:mx-auto">
              <h1 className="text-xl sm:text-3xl md:text-4xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-[#fff2a8] via-[#facc15] to-[#c27803] drop-shadow-[0_3px_6px_rgba(0,0,0,0.95)]">
                SHOP
              </h1>
            </div>

            {/* Right: Coins, Stars, Home, Close */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <div className="flex items-center gap-1 bg-[#120a05] px-2.5 sm:px-3.5 py-1.5 rounded-full border border-[#c49b65]/60 shadow-inner">
                <span className="text-xs sm:text-sm">🪙</span>
                <span className="text-xs sm:text-sm font-black text-[#facc15]">{coins}</span>
              </div>

              <div className="hidden md:flex items-center gap-1 bg-[#120a05] px-3 py-1.5 rounded-full border border-[#c49b65]/60 shadow-inner">
                <span className="text-xs sm:text-sm">⭐</span>
                <span className="text-xs sm:text-sm font-black text-amber-300">{stars}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  gameAudio.playClick();
                  if (onHome) onHome();
                  else onClose();
                }}
                className="hidden sm:flex w-9 h-9 rounded-full bg-gradient-to-b from-[#ffeed2] via-[#f7dfb9] to-[#dfbf8d] hover:brightness-110 text-[#5c3a1d] border-2 border-[#8c6239] items-center justify-center font-black transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow"
                title="Return to Home Screen"
                aria-label="Home"
              >
                <Home className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  gameAudio.playClick();
                  onClose();
                }}
                className="w-9 h-9 rounded-full bg-gradient-to-b from-rose-500 to-red-700 hover:brightness-110 text-white border-2 border-rose-300 flex items-center justify-center font-black transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow flex-shrink-0"
                title="Close Shop"
                aria-label="Close"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.8]" />
              </button>
            </div>
          </div>

          {/* Row 2 (Mobile) / Left (Desktop): Category Switcher (Never wraps text awkwardly) */}
          <div className="w-full sm:w-auto sm:order-1 grid grid-cols-2 sm:flex items-center gap-1.5 bg-[#120a05] p-1 rounded-2xl border border-[#c49b65]/40 shadow-inner flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                gameAudio.playClick();
                setActiveTab('hardware');
              }}
              className={`px-3 sm:px-4 py-2 sm:py-1.5 rounded-xl text-xs sm:text-sm font-black tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === 'hardware'
                  ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-700 text-[#1a0e05] shadow-md border border-amber-200'
                  : 'text-[#dfbf8d] hover:text-[#ffeed2] hover:bg-white/5'
              }`}
            >
              <span>🔩</span>
              <span>Bolts & Nuts</span>
            </button>

            <button
              type="button"
              onClick={() => {
                gameAudio.playClick();
                setActiveTab('themes');
              }}
              className={`px-3 sm:px-4 py-2 sm:py-1.5 rounded-xl text-xs sm:text-sm font-black tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === 'themes'
                  ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-700 text-[#1a0e05] shadow-md border border-amber-200'
                  : 'text-[#dfbf8d] hover:text-[#ffeed2] hover:bg-white/5'
              }`}
            >
              <span>🖼️</span>
              <span>Themes</span>
            </button>
          </div>
        </div>

        {/* Floating Notification Banner */}
        {errorMsg && (
          <div className="absolute top-24 sm:top-16 inset-x-4 sm:inset-x-8 z-30 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-[#1a0e05] font-black text-xs sm:text-sm text-center shadow-2xl border-2 border-white/60 animate-bounce">
            {errorMsg}
          </div>
        )}

        {/* 2. MAIN SHOP SHOWCASE CONTENT */}
        <div className="relative flex-1 w-full overflow-y-auto overflow-x-hidden p-3 sm:p-6 pb-6 flex flex-col gap-6 scrollbar-thin scrollbar-thumb-amber-500/30">

          {/* === HARDWARE TAB: ALIGNED SHELF CARDS (BOLTS & NUTS) === */}
          {activeTab === 'hardware' && (
            <div className="w-full flex flex-col gap-6 sm:gap-8">

              {/* --- SECTION 1: BOLTS --- */}
              <div className="w-full flex flex-col gap-2.5">
                <div className="flex items-center justify-between px-1">
                  <div className="px-4 py-1 rounded-lg bg-gradient-to-b from-[#2563eb] via-[#1d4ed8] to-[#1e3a8a] border-2 border-sky-300 shadow flex items-center justify-center">
                    <span className="text-xs sm:text-sm font-black text-white tracking-widest uppercase">
                      🔩 BOLTS
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#dfbf8d]/80">
                    Tap any unlocked bolt to equip
                  </span>
                </div>

                {/* Each Bolt paired directly with its own wood shelf base & action button */}
                <div className="w-full grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3.5">
                  {BOLT_SKINS.map((bolt) => {
                    const isUnlocked = (unlockedSkins || []).includes(bolt.id) || bolt.price === 0;
                    const isEquipped = activeSkin === bolt.id;

                    return (
                      <div
                        key={bolt.id}
                        className={`flex flex-col items-center rounded-2xl p-2 bg-gradient-to-b from-[#26160c] to-[#140b06] border transition-all ${
                          isEquipped
                            ? 'border-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.35)]'
                            : 'border-[#c49b65]/35'
                        }`}
                      >
                        <div
                          onClick={() => {
                            if (isUnlocked) {
                              gameAudio.playClick();
                              onEquipSkin?.(bolt.id);
                            }
                          }}
                          className="relative h-24 sm:h-28 w-full flex items-center justify-center p-1 cursor-pointer"
                          title={bolt.name}
                        >
                          <img
                            src={bolt.previewImg}
                            alt={bolt.name}
                            className={`max-h-full max-w-full object-contain filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.9)] transition-transform ${
                              isEquipped ? 'scale-105' : 'hover:scale-105'
                            }`}
                            style={{ imageRendering: 'high-quality' }}
                          />
                        </div>

                        {/* Mini Wooden Shelf Ledge */}
                        <div className="w-full h-2 rounded-sm bg-gradient-to-b from-[#c49b65] via-[#8c6239] to-[#4a2e16] border-t border-[#ffeed2]/40 mb-2 shadow" />

                        <span className="text-[10px] sm:text-[11px] font-bold text-[#ffeed2] truncate w-full text-center mb-1.5">
                          {bolt.name.replace(' Bolt', '')}
                        </span>

                        {isEquipped ? (
                          <button
                            type="button"
                            className="w-full min-h-[34px] py-1.5 px-2 rounded-full bg-gradient-to-b from-cyan-400 via-sky-500 to-blue-700 text-white font-black text-[11px] tracking-wider uppercase shadow-[0_2px_0_#1e3a8a] flex items-center justify-center gap-1 border border-cyan-200"
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
                            className="w-full min-h-[34px] py-1.5 px-2 rounded-full bg-gradient-to-b from-emerald-400 via-emerald-500 to-green-700 hover:brightness-110 active:scale-95 text-white font-black text-[11px] tracking-wider uppercase shadow-[0_2px_0_#064e3b] transition-all cursor-pointer border border-emerald-200"
                          >
                            EQUIP
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleBuyBolt(bolt)}
                            className="w-full min-h-[34px] py-1.5 px-2 rounded-full bg-gradient-to-b from-[#8ce33a] via-[#5cb811] to-[#3a7d08] hover:brightness-110 active:scale-95 text-white font-black text-xs tracking-tight shadow-[0_2px_0_#235203] flex items-center justify-center gap-1 transition-all cursor-pointer border border-[#bbf77a]"
                          >
                            <span>{bolt.price}</span>
                            <span className="text-[11px]">🪙</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* --- SECTION 2: NUTS --- */}
              <div className="w-full flex flex-col gap-2.5">
                <div className="flex items-center justify-between px-1">
                  <div className="px-4 py-1 rounded-lg bg-gradient-to-b from-[#2563eb] via-[#1d4ed8] to-[#1e3a8a] border-2 border-sky-300 shadow flex items-center justify-center">
                    <span className="text-xs sm:text-sm font-black text-white tracking-widest uppercase">
                      ⚙️ NUTS
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#dfbf8d]/80">
                    Tap any unlocked nut to equip
                  </span>
                </div>

                {/* Each Nut paired directly with its own wood shelf base & action button */}
                <div className="w-full grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3.5">
                  {NUT_SKINS.map((nut) => {
                    const isUnlocked = (unlockedNutSkins || []).includes(nut.id) || nut.price === 0;
                    const isEquipped = activeNutSkin === nut.id;
                    const isEmeraldGlow = nut.id === 'green_glow';
                    const isNeonPurple = nut.id === 'neon_purple';

                    return (
                      <div
                        key={nut.id}
                        className={`flex flex-col items-center rounded-2xl p-2 bg-gradient-to-b from-[#26160c] to-[#140b06] border transition-all ${
                          isEquipped
                            ? 'border-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.35)]'
                            : 'border-[#c49b65]/35'
                        }`}
                      >
                        <div
                          onClick={() => {
                            if (isUnlocked) {
                              gameAudio.playClick();
                              onEquipNutSkin?.(nut.id);
                            }
                          }}
                          className="relative h-20 sm:h-24 w-full flex items-center justify-center p-1 cursor-pointer"
                          title={nut.name}
                        >
                          <img
                            src={nut.previewImg}
                            alt={nut.name}
                            className={`max-h-full max-w-full object-contain filter transition-transform ${
                              isEquipped ? 'scale-105' : 'hover:scale-105'
                            } ${
                              isEmeraldGlow
                                ? 'drop-shadow-[0_0_12px_rgba(74,222,128,0.85)]'
                                : isNeonPurple
                                ? 'drop-shadow-[0_0_12px_rgba(192,132,252,0.85)]'
                                : 'drop-shadow-[0_6px_12px_rgba(0,0,0,0.9)]'
                            }`}
                            style={{ imageRendering: 'high-quality' }}
                          />
                        </div>

                        {/* Mini Wooden Shelf Ledge */}
                        <div className="w-full h-2 rounded-sm bg-gradient-to-b from-[#c49b65] via-[#8c6239] to-[#4a2e16] border-t border-[#ffeed2]/40 mb-2 shadow" />

                        <span className="text-[10px] sm:text-[11px] font-bold text-[#ffeed2] truncate w-full text-center mb-1.5">
                          {nut.name.replace(' Nut', '')}
                        </span>

                        {isEquipped ? (
                          <button
                            type="button"
                            className="w-full min-h-[34px] py-1.5 px-2 rounded-full bg-gradient-to-b from-cyan-400 via-sky-500 to-blue-700 text-white font-black text-[11px] tracking-wider uppercase shadow-[0_2px_0_#1e3a8a] flex items-center justify-center gap-1 border border-cyan-200"
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
                            className="w-full min-h-[34px] py-1.5 px-2 rounded-full bg-gradient-to-b from-emerald-400 via-emerald-500 to-green-700 hover:brightness-110 active:scale-95 text-white font-black text-[11px] tracking-wider uppercase shadow-[0_2px_0_#064e3b] transition-all cursor-pointer border border-emerald-200"
                          >
                            EQUIP
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleBuyNut(nut)}
                            className="w-full min-h-[34px] py-1.5 px-2 rounded-full bg-gradient-to-b from-[#8ce33a] via-[#5cb811] to-[#3a7d08] hover:brightness-110 active:scale-95 text-white font-black text-xs tracking-tight shadow-[0_2px_0_#235203] flex items-center justify-center gap-1 transition-all cursor-pointer border border-[#bbf77a]"
                          >
                            <span>{nut.price}</span>
                            <span className="text-[11px]">🪙</span>
                          </button>
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
              <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2 border-b border-[#c49b65]/30">
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
