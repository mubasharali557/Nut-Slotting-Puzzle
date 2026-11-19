import React, { useState } from 'react';
import { ShoppingBag, X, Check, Lock, Sparkles, Palette, FlaskConical } from 'lucide-react';
import { GAME_THEMES, TUBE_SKINS } from '../data/themes';
import { gameAudio } from '../utils/gameAudio';

export default function ShopModal({
  isOpen,
  onClose,
  coins = 250,
  activeTheme = 'apothecary',
  unlockedThemes = ['apothecary'],
  onEquipTheme,
  onPurchaseTheme,
  activeSkin = 'classic',
  unlockedSkins = ['classic'],
  onEquipSkin,
  onPurchaseSkin,
}) {
  const [activeTab, setActiveTab] = useState('themes'); // 'themes' | 'skins'
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleBuyTheme = (theme) => {
    if (coins < theme.price) {
      setErrorMsg(`Need ${theme.price - coins} more coins!`);
      setTimeout(() => setErrorMsg(null), 2500);
      return;
    }
    const success = onPurchaseTheme?.(theme.id, theme.price);
    if (success) {
      setErrorMsg(null);
    }
  };

  const handleBuySkin = (skin) => {
    if (coins < skin.price) {
      setErrorMsg(`Need ${skin.price - coins} more coins!`);
      setTimeout(() => setErrorMsg(null), 2500);
      return;
    }
    const success = onPurchaseSkin?.(skin.id, skin.price);
    if (success) {
      setErrorMsg(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md select-none animate-fadeIn">
      <div className="relative w-full max-w-md max-h-[90vh] bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 rounded-3xl p-4 sm:p-6 border-2 border-amber-400/50 shadow-[0_0_35px_rgba(245,158,11,0.25)] flex flex-col gap-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-300">
              <ShoppingBag className="w-4 h-4 fill-amber-400/30" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white leading-none">Theme & Bottle Shop</h2>
              <span className="text-[10px] sm:text-xs font-bold text-amber-400/90 tracking-wide">
                Equipped items apply live to gameplay!
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Coins Counter */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1 rounded-full border border-amber-400/40 shadow-inner">
              <span className="text-sm">🪙</span>
              <span className="text-xs sm:text-sm font-black text-amber-300">{coins}</span>
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
        </div>

        {/* Shop Category Tabs: Themes vs Bottles */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-950/70 border border-white/10">
          <button
            onClick={() => {
              gameAudio.playClick();
              setActiveTab('themes');
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-center font-black text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'themes'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Game Themes</span>
          </button>

          <button
            onClick={() => {
              gameAudio.playClick();
              setActiveTab('skins');
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-center font-black text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'skins'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>Bottle Skins</span>
          </button>
        </div>

        {/* Error notification banner if insufficient coins */}
        {errorMsg && (
          <div className="py-1 px-3 rounded-xl bg-rose-950/90 border border-rose-500/50 text-rose-300 text-xs font-bold text-center animate-shake">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Content List: Themes */}
        {activeTab === 'themes' && (
          <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[52vh] pr-1 scrollbar-thin scrollbar-thumb-amber-500/30">
            {GAME_THEMES.map((theme) => {
              const isUnlocked = unlockedThemes.includes(theme.id);
              const isActive = activeTheme === theme.id;

              return (
                <div
                  key={theme.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-950/40 via-slate-800/80 to-slate-800/90 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      : isUnlocked
                      ? 'bg-slate-800/70 hover:bg-slate-800 border-white/15'
                      : 'bg-slate-900/60 border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-950/80 border border-white/10 flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
                      {theme.previewIcon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-white">{theme.name}</h4>
                        {isActive && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.2 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/50">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 line-clamp-1">{theme.desc}</p>
                    </div>
                  </div>

                  <div className="flex-shrink-0 ml-2">
                    {isActive ? (
                      <span className="text-[11px] font-black uppercase px-3 py-1.5 rounded-full bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-md shadow-emerald-500/30">
                        <Check className="w-3.5 h-3.5 stroke-[3]" /> Applied
                      </span>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => onEquipTheme?.(theme.id)}
                        className="text-[11px] font-black uppercase px-3.5 py-1.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-400/60 hover:border-transparent transition-all active:scale-95 cursor-pointer shadow-sm"
                      >
                        Equip
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuyTheme(theme)}
                        className="text-[11px] font-black uppercase px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-md shadow-amber-500/30 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                      >
                        <Lock className="w-3 h-3 text-slate-950" />
                        <span>{theme.price} 🪙</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Content List: Bottle Skins */}
        {activeTab === 'skins' && (
          <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[52vh] pr-1 scrollbar-thin scrollbar-thumb-cyan-500/30">
            {TUBE_SKINS.map((skin) => {
              const isUnlocked = unlockedSkins.includes(skin.id);
              const isActive = activeSkin === skin.id;

              return (
                <div
                  key={skin.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-950/40 via-slate-800/80 to-slate-800/90 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : isUnlocked
                      ? 'bg-slate-800/70 hover:bg-slate-800 border-white/15'
                      : 'bg-slate-900/60 border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-950/80 border border-white/10 flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
                      {skin.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-white">{skin.name}</h4>
                        {isActive && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.2 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/50">
                            Equipped
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 line-clamp-1">{skin.desc}</p>
                    </div>
                  </div>

                  <div className="flex-shrink-0 ml-2">
                    {isActive ? (
                      <span className="text-[11px] font-black uppercase px-3 py-1.5 rounded-full bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-md shadow-emerald-500/30">
                        <Check className="w-3.5 h-3.5 stroke-[3]" /> Applied
                      </span>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => onEquipSkin?.(skin.id)}
                        className="text-[11px] font-black uppercase px-3.5 py-1.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-400/60 hover:border-transparent transition-all active:scale-95 cursor-pointer shadow-sm"
                      >
                        Equip
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuySkin(skin)}
                        className="text-[11px] font-black uppercase px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 shadow-md shadow-cyan-500/30 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                      >
                        <Lock className="w-3 h-3 text-slate-950" />
                        <span>{skin.price} 🪙</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
