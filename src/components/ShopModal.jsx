import React, { useState, useRef, useEffect } from 'react';
import { X, Check, Home, ArrowLeft, Package } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('hardware'); // 'hardware' | 'themes' | 'inventory'
  const [toast, setToast] = useState(null); // { text, type: 'success' | 'error' }
  const toastTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const showNotification = (text, type = 'success') => {
    setToast({ text, type });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2800);
  };

  const isBoltUnlocked = (bolt) => (unlockedSkins || []).includes(bolt.id) || bolt.price === 0;
  const isNutUnlocked = (nut) => (unlockedNutSkins || []).includes(nut.id) || nut.price === 0;
  const isThemeUnlocked = (theme) => (unlockedThemes || []).includes(theme.id) || theme.price === 0;

  const ownedBolts = BOLT_SKINS.filter(isBoltUnlocked);
  const ownedNuts = NUT_SKINS.filter(isNutUnlocked);
  const ownedThemes = GAME_THEMES.filter(isThemeUnlocked);
  const totalOwnedCount = ownedBolts.length + ownedNuts.length + ownedThemes.length;

  const equippedBolt = BOLT_SKINS.find((b) => b.id === activeSkin) || BOLT_SKINS[0];
  const equippedNut = NUT_SKINS.find((n) => n.id === activeNutSkin) || NUT_SKINS[0];
  const equippedTheme = GAME_THEMES.find((t) => t.id === activeTheme) || GAME_THEMES[0];

  const handleEquipBolt = (bolt) => {
    if (activeSkin === bolt.id) return;
    gameAudio.playClick();
    if (onEquipSkin?.(bolt.id) !== false) {
      showNotification(`Equipped ${bolt.name}!`);
    }
  };

  const handleEquipNut = (nut) => {
    if (activeNutSkin === nut.id) return;
    gameAudio.playClick();
    if (onEquipNutSkin?.(nut.id) !== false) {
      showNotification(`Equipped ${nut.name}!`);
    }
  };

  const handleEquipThemeItem = (theme) => {
    if (activeTheme === theme.id) return;
    gameAudio.playClick();
    if (onEquipTheme?.(theme.id) !== false) {
      showNotification(`Applied ${theme.name} theme!`);
    }
  };

  const handleBuyBolt = (bolt) => {
    if (isBoltUnlocked(bolt)) {
      handleEquipBolt(bolt);
      return;
    }
    if (coins < bolt.price) {
      gameAudio.playClick();
      showNotification(`Need ${bolt.price - coins} more coins to unlock ${bolt.name}!`, 'error');
      return;
    }
    const success = onPurchaseSkin?.(bolt.id, bolt.price);
    if (success) {
      showNotification(`${bolt.name} added to inventory & equipped!`);
    }
  };

  const handleBuyNut = (nut) => {
    if (isNutUnlocked(nut)) {
      handleEquipNut(nut);
      return;
    }
    if (coins < nut.price) {
      gameAudio.playClick();
      showNotification(`Need ${nut.price - coins} more coins to unlock ${nut.name}!`, 'error');
      return;
    }
    const success = onPurchaseNutSkin?.(nut.id, nut.price);
    if (success) {
      showNotification(`${nut.name} added to inventory & equipped!`);
    }
  };

  const handleBuyTheme = (theme) => {
    if (isThemeUnlocked(theme)) {
      handleEquipThemeItem(theme);
      return;
    }
    if (coins < theme.price) {
      gameAudio.playClick();
      showNotification(`Need ${theme.price - coins} more coins to unlock ${theme.name}!`, 'error');
      return;
    }
    const success = onPurchaseTheme?.(theme.id, theme.price);
    if (success) {
      showNotification(`${theme.name} unlocked & applied to gameplay!`);
    }
  };

  const renderHardwareCard = ({
    item,
    isUnlocked,
    isEquipped,
    isNut = false,
    onEquip,
    onBuy,
  }) => {
    const isEmeraldGlow = isNut && item.id === 'green_glow';
    const isNeonPurple = isNut && item.id === 'neon_purple';
    const canAfford = coins >= item.price;

    return (
      <div
        key={item.id}
        className={`relative flex flex-col items-center rounded-2xl p-2 bg-gradient-to-b from-[#26160c] to-[#140b06] border transition-all ${
          isEquipped
            ? 'border-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.38)]'
            : isUnlocked
            ? 'border-emerald-500/45 hover:border-emerald-400/80'
            : 'border-[#c49b65]/35'
        }`}
      >
        {/* Top Owned / Equipped Status Tag */}
        {isEquipped ? (
          <span className="absolute top-1.5 right-1.5 z-10 px-1.5 py-0.5 rounded-full bg-cyan-500/95 text-white text-[8px] font-black tracking-wider uppercase shadow">
            Active
          </span>
        ) : isUnlocked ? (
          <span className="absolute top-1.5 right-1.5 z-10 px-1.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-400/60 text-emerald-300 text-[8px] font-black tracking-wider uppercase shadow">
            Owned
          </span>
        ) : null}

        <div
          onClick={() => {
            if (isUnlocked) onEquip(item);
            else onBuy(item);
          }}
          className={`relative ${isNut ? 'h-20 sm:h-24' : 'h-24 sm:h-28'} w-full flex items-center justify-center p-1 cursor-pointer`}
          title={item.desc || item.name}
        >
          <img
            src={item.previewImg}
            alt={item.name}
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
          {item.name.replace(' Bolt', '').replace(' Nut', '')}
        </span>

        {isEquipped ? (
          <button
            type="button"
            disabled
            className="w-full min-h-[34px] py-1.5 px-2 rounded-full bg-gradient-to-b from-cyan-400 via-sky-500 to-blue-700 text-white font-black text-[11px] tracking-wider uppercase shadow-[0_2px_0_#1e3a8a] flex items-center justify-center gap-1 border border-cyan-200 cursor-default"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>IN USE</span>
          </button>
        ) : isUnlocked ? (
          <button
            type="button"
            onClick={() => onEquip(item)}
            className="w-full min-h-[34px] py-1.5 px-2 rounded-full bg-gradient-to-b from-emerald-400 via-emerald-500 to-green-700 hover:brightness-110 active:scale-95 text-white font-black text-[11px] tracking-wider uppercase shadow-[0_2px_0_#064e3b] transition-all cursor-pointer border border-emerald-200"
          >
            EQUIP
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onBuy(item)}
            className={`w-full min-h-[34px] py-1.5 px-2 rounded-full font-black text-xs tracking-tight flex items-center justify-center gap-1 transition-all cursor-pointer border ${
              canAfford
                ? 'bg-gradient-to-b from-[#8ce33a] via-[#5cb811] to-[#3a7d08] hover:brightness-110 active:scale-95 text-white shadow-[0_2px_0_#235203] border-[#bbf77a]'
                : 'bg-gradient-to-b from-slate-600 to-slate-800 text-slate-300 border-slate-500/70 opacity-85 hover:opacity-100'
            }`}
          >
            <span>{item.price}</span>
            <span className="text-[11px]">🪙</span>
          </button>
        )}
      </div>
    );
  };

  const renderThemeCard = (theme) => {
    const isUnlocked = isThemeUnlocked(theme);
    const isEquipped = activeTheme === theme.id;
    const canAfford = coins >= theme.price;

    return (
      <div
        key={theme.id}
        className={`relative flex flex-col rounded-2xl overflow-hidden transition-all duration-200 ${
          isEquipped
            ? 'bg-gradient-to-b from-[#3a2212] to-[#1a1008] border-2 sm:border-3 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.4)]'
            : isUnlocked
            ? 'bg-[#140b05] border border-emerald-500/50 hover:border-emerald-400'
            : 'bg-[#140b05] border border-[#c49b65]/50 hover:border-amber-400/80 hover:bg-[#1f120a]'
        }`}
      >
        <div
          onClick={() => (isUnlocked ? handleEquipThemeItem(theme) : handleBuyTheme(theme))}
          className="relative w-full aspect-[16/9] overflow-hidden bg-black/60 group cursor-pointer"
        >
          <img
            src={theme.previewImg}
            alt={theme.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            style={{ imageRendering: 'high-quality' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />

          {isEquipped ? (
            <div className="absolute top-2 right-2 px-3 py-1 rounded-full bg-cyan-500 text-white font-black text-[10px] tracking-wider uppercase shadow flex items-center gap-1">
              <Check className="w-3 h-3 stroke-[3]" />
              EQUIPPED
            </div>
          ) : isUnlocked ? (
            <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-400/70 text-emerald-300 font-black text-[9px] tracking-wider uppercase shadow">
              OWNED
            </div>
          ) : null}

          <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
            <span className="text-sm font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              {theme.name}
            </span>
          </div>
        </div>

        <div className="p-3 flex items-center justify-between gap-2">
          <p className="text-xs text-[#dfbf8d] line-clamp-1 flex-1">{theme.desc}</p>

          {isEquipped ? (
            <button
              type="button"
              disabled
              className="px-4 py-1.5 rounded-full bg-cyan-500 text-white font-black text-xs text-center shadow whitespace-nowrap flex items-center gap-1 cursor-default"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>IN USE</span>
            </button>
          ) : isUnlocked ? (
            <button
              type="button"
              onClick={() => handleEquipThemeItem(theme)}
              className="px-4 py-1.5 rounded-full bg-gradient-to-b from-emerald-500 to-green-700 hover:brightness-110 active:scale-95 text-white font-black text-xs text-center shadow cursor-pointer transition-transform whitespace-nowrap border border-emerald-300"
            >
              EQUIP
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleBuyTheme(theme)}
              className={`px-4 py-1.5 rounded-full font-black text-xs text-center shadow flex items-center justify-center gap-1.5 cursor-pointer transition-transform whitespace-nowrap border ${
                canAfford
                  ? 'bg-gradient-to-b from-lime-300 via-emerald-400 to-green-600 hover:brightness-110 active:scale-95 text-[#0c2207] border-lime-100'
                  : 'bg-slate-700 text-slate-300 border-slate-500'
              }`}
            >
              <span>{theme.price}</span>
              <span>🪙 BUY</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md select-none animate-fadeIn">
      {/* Central Shop Container (Mobile & Desktop Responsive) */}
      <div className="relative w-full max-w-5xl max-h-[94dvh] sm:h-[720px] bg-gradient-to-b from-[#2a1a10] via-[#1a110a] to-[#0c0805] rounded-2xl sm:rounded-[36px] border-2 sm:border-4 border-[#c49b65] shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(251,191,36,0.3)] flex flex-col overflow-hidden">

        {/* Top Specular Sheen Line */}
        <div className="absolute top-1 inset-x-12 h-[2px] bg-gradient-to-r from-transparent via-[#ffdca8]/60 to-transparent pointer-events-none rounded-full" />

        {/* 1. RESPONSIVE HEADER BAR */}
        <div className="w-full bg-[#1c120a]/95 px-3 sm:px-6 py-2.5 sm:py-3 border-b-2 border-[#c49b65]/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 flex-shrink-0 z-20 shadow-lg">

          {/* Row 1 (Mobile) / Spread (Desktop): Back, SHOP Title, Coins + Close */}
          <div className="w-full sm:w-auto flex items-center justify-between gap-2 sm:order-2 sm:flex-1">
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

            <div className="flex items-center justify-center sm:mx-auto">
              <h1 className="text-xl sm:text-3xl md:text-4xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-[#fff2a8] via-[#facc15] to-[#c27803] drop-shadow-[0_3px_6px_rgba(0,0,0,0.95)]">
                SHOP
              </h1>
            </div>

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

          {/* Row 2 (Mobile) / Left (Desktop): 3 Tabs - Bolts & Nuts | Themes | Inventory */}
          <div className="w-full sm:w-auto sm:order-1 grid grid-cols-3 sm:flex items-center gap-1 bg-[#120a05] p-1 rounded-2xl border border-[#c49b65]/40 shadow-inner flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                gameAudio.playClick();
                setActiveTab('hardware');
              }}
              className={`px-2 sm:px-3.5 py-2 sm:py-1.5 rounded-xl text-[11px] sm:text-sm font-black tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap ${
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
              className={`px-2 sm:px-3.5 py-2 sm:py-1.5 rounded-xl text-[11px] sm:text-sm font-black tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap ${
                activeTab === 'themes'
                  ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-700 text-[#1a0e05] shadow-md border border-amber-200'
                  : 'text-[#dfbf8d] hover:text-[#ffeed2] hover:bg-white/5'
              }`}
            >
              <span>🖼️</span>
              <span>Themes</span>
            </button>

            <button
              type="button"
              onClick={() => {
                gameAudio.playClick();
                setActiveTab('inventory');
              }}
              className={`px-2 sm:px-3.5 py-2 sm:py-1.5 rounded-xl text-[11px] sm:text-sm font-black tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1 whitespace-nowrap ${
                activeTab === 'inventory'
                  ? 'bg-gradient-to-b from-emerald-400 via-emerald-500 to-green-700 text-white shadow-md border border-emerald-200'
                  : 'text-[#dfbf8d] hover:text-[#ffeed2] hover:bg-white/5'
              }`}
            >
              <Package className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Owned ({totalOwnedCount})</span>
            </button>
          </div>
        </div>

        {/* Floating Notification Banner */}
        {toast && (
          <div
            className={`absolute top-24 sm:top-16 inset-x-4 sm:inset-x-8 z-30 py-2.5 px-4 rounded-2xl font-black text-xs sm:text-sm text-center shadow-2xl border-2 ${
              toast.type === 'error'
                ? 'bg-gradient-to-r from-rose-700 via-red-600 to-rose-700 text-white border-rose-200/70'
                : 'bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 text-white border-emerald-200/80'
            }`}
          >
            {toast.text}
          </div>
        )}

        {/* 2. MAIN SHOP & INVENTORY CONTENT */}
        <div className="relative flex-1 w-full overflow-y-auto overflow-x-hidden p-3 sm:p-6 pb-6 flex flex-col gap-6 scrollbar-thin scrollbar-thumb-amber-500/30">

          {/* === HARDWARE TAB: BOLTS & NUTS === */}
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
                    Owned: {ownedBolts.length}/{BOLT_SKINS.length}
                  </span>
                </div>

                <div className="w-full grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3.5">
                  {BOLT_SKINS.map((bolt) =>
                    renderHardwareCard({
                      item: bolt,
                      isUnlocked: isBoltUnlocked(bolt),
                      isEquipped: activeSkin === bolt.id,
                      onEquip: handleEquipBolt,
                      onBuy: handleBuyBolt,
                    })
                  )}
                </div>
              </div>

              {/* --- SECTION 2: NUTS --- */}
              <div className="w-full flex flex-col gap-2.5">
                <div className="flex items-center justify-between px-1">
                  <div className="px-4 py-1 rounded-lg bg-gradient-to-b from-[#2563eb] via-[#1d4ed8] to-[#1e3a8a] border-2 border-sky-300 shadow flex items-center justify-center">
                    <span className="text-xs sm:text-sm font-black text-white tracking-widest uppercase">
                      ⚙️ NUTS FINISHES
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#dfbf8d]/80">
                    Owned: {ownedNuts.length}/{NUT_SKINS.length}
                  </span>
                </div>

                <div className="w-full grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3.5">
                  {NUT_SKINS.map((nut) =>
                    renderHardwareCard({
                      item: nut,
                      isUnlocked: isNutUnlocked(nut),
                      isEquipped: activeNutSkin === nut.id,
                      isNut: true,
                      onEquip: handleEquipNut,
                      onBuy: handleBuyNut,
                    })
                  )}
                </div>
              </div>

            </div>
          )}

          {/* === THEMES TAB === */}
          {activeTab === 'themes' && (
            <div className="w-full flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2 border-b border-[#c49b65]/30">
                <span className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <span>🖼️</span> Workshop Background Themes ({ownedThemes.length}/{GAME_THEMES.length} Owned)
                </span>
                <span className="text-xs text-[#dfbf8d]">
                  Equipped themes apply immediately to gameplay!
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {GAME_THEMES.map(renderThemeCard)}
              </div>
            </div>
          )}

          {/* === INVENTORY TAB: ALL OWNED & EQUIPPED ITEMS === */}
          {activeTab === 'inventory' && (
            <div className="w-full flex flex-col gap-6">
              {/* Current Equipped Loadout Summary */}
              <div className="rounded-2xl p-3 sm:p-4 bg-[#140b06]/90 border border-[#c49b65]/50 shadow-inner">
                <div className="text-xs font-black uppercase tracking-widest text-amber-300 mb-3">
                  Currently Equipped in Gameplay
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="flex items-center gap-2 bg-[#1f1209] p-2 rounded-xl border border-cyan-500/40">
                    <img src={equippedBolt.previewImg} alt={equippedBolt.name} className="w-10 h-10 object-contain flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[9px] font-bold uppercase text-cyan-300">Bolt</div>
                      <div className="text-[11px] sm:text-xs font-black text-[#ffeed2] truncate">{equippedBolt.name.replace(' Bolt', '')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-[#1f1209] p-2 rounded-xl border border-cyan-500/40">
                    <img src={equippedNut.previewImg} alt={equippedNut.name} className="w-10 h-10 object-contain flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[9px] font-bold uppercase text-cyan-300">Nut Finish</div>
                      <div className="text-[11px] sm:text-xs font-black text-[#ffeed2] truncate">{equippedNut.name.replace(' Nut', '')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-[#1f1209] p-2 rounded-xl border border-cyan-500/40">
                    <img src={equippedTheme.previewImg} alt={equippedTheme.name} className="w-12 h-9 object-cover rounded flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[9px] font-bold uppercase text-cyan-300">Theme</div>
                      <div className="text-[11px] sm:text-xs font-black text-[#ffeed2] truncate">{equippedTheme.name}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Owned Bolts */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-black text-amber-200 uppercase tracking-wider">
                    🔩 Owned Bolts ({ownedBolts.length}/{BOLT_SKINS.length})
                  </h3>
                  {ownedBolts.length < BOLT_SKINS.length && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('hardware')}
                      className="text-xs font-bold text-emerald-300 hover:underline cursor-pointer"
                    >
                      + Buy More
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3.5">
                  {ownedBolts.map((bolt) =>
                    renderHardwareCard({
                      item: bolt,
                      isUnlocked: true,
                      isEquipped: activeSkin === bolt.id,
                      onEquip: handleEquipBolt,
                      onBuy: handleBuyBolt,
                    })
                  )}
                </div>
              </div>

              {/* Owned Nuts */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-black text-amber-200 uppercase tracking-wider">
                    ⚙️ Owned Nut Finishes ({ownedNuts.length}/{NUT_SKINS.length})
                  </h3>
                  {ownedNuts.length < NUT_SKINS.length && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('hardware')}
                      className="text-xs font-bold text-emerald-300 hover:underline cursor-pointer"
                    >
                      + Buy More
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3.5">
                  {ownedNuts.map((nut) =>
                    renderHardwareCard({
                      item: nut,
                      isUnlocked: true,
                      isEquipped: activeNutSkin === nut.id,
                      isNut: true,
                      onEquip: handleEquipNut,
                      onBuy: handleBuyNut,
                    })
                  )}
                </div>
              </div>

              {/* Owned Themes */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-black text-amber-200 uppercase tracking-wider">
                    🖼️ Owned Themes ({ownedThemes.length}/{GAME_THEMES.length})
                  </h3>
                  {ownedThemes.length < GAME_THEMES.length && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('themes')}
                      className="text-xs font-bold text-emerald-300 hover:underline cursor-pointer"
                    >
                      + Buy More
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ownedThemes.map(renderThemeCard)}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
