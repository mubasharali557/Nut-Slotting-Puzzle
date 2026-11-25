import React from 'react';
import { Volume2, VolumeX, Music, Smartphone, RotateCcw, X, ShieldAlert, LogOut } from 'lucide-react';
import { gameAudio } from '../utils/gameAudio';

export default function SettingsModal({
  isOpen,
  onClose,
  soundEnabled,
  onToggleSound,
  soundVolume = 0.85,
  onChangeSoundVolume,
  musicEnabled,
  onToggleMusic,
  vibrationEnabled,
  onToggleVibration,
  onResetProgress,
  onLogout,
  playerName,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-sm bg-slate-900/95 rounded-3xl p-6 border-2 border-white/20 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex flex-col">
            <h2 className="text-xl font-black text-white">Settings</h2>
            {playerName && (
              <span className="text-[11px] text-amber-300 font-semibold">
                Player: {playerName}
              </span>
            )}
          </div>
          <button
            onClick={() => {
              gameAudio.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toggles */}
        <div className="flex flex-col gap-3">
          {/* Sound */}
          <div className="flex flex-col gap-2.5 p-3 rounded-2xl bg-slate-800/60 border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {soundEnabled && soundVolume > 0 ? (
                  <Volume2 className="w-5 h-5 text-cyan-400" />
                ) : (
                  <VolumeX className="w-5 h-5 text-slate-400" />
                )}
                <div>
                  <h4 className="text-sm font-extrabold text-white">Sound Effects</h4>
                  <p className="text-[11px] text-slate-400">Metallic unscrewing, clicks, chimes</p>
                </div>
              </div>
              <button
                onClick={onToggleSound}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 flex items-center cursor-pointer ${
                  soundEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {onChangeSoundVolume && (
              <div className="flex items-center gap-3 pt-1 border-t border-white/5">
                <span className="text-[11px] font-bold text-slate-300 w-12">Volume</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={Math.round((soundEnabled ? soundVolume : 0) * 100)}
                  onChange={(e) => onChangeSoundVolume(Number(e.target.value) / 100)}
                  className="flex-1 h-1.5 accent-cyan-400 cursor-pointer"
                  aria-label="Sound effects volume"
                />
                <span className="text-[11px] font-bold text-cyan-300 w-9 text-right">
                  {Math.round((soundEnabled ? soundVolume : 0) * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Music */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-white/5">
            <div className="flex items-center gap-3">
              <Music className="w-5 h-5 text-purple-400" />
              <div>
                <h4 className="text-sm font-extrabold text-white">Music</h4>
                <p className="text-[11px] text-slate-400">Background cozy winter ambient</p>
              </div>
            </div>
            <button
              onClick={onToggleMusic}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                musicEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* Haptics */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-white/5">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-amber-400" />
              <div>
                <h4 className="text-sm font-extrabold text-white">Vibration</h4>
                <p className="text-[11px] text-slate-400">Haptic feedback on tap</p>
              </div>
            </div>
            <button
              onClick={onToggleVibration}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                vibrationEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-md" />
            </button>
          </div>
        </div>

        {/* Action Buttons: Log Out & Reset Progress */}
        <div className="flex flex-col gap-2 pt-1 border-t border-white/10">
          {onLogout && (
            <button
              onClick={() => {
                gameAudio.playClick();
                onClose();
                onLogout();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out ({playerName || 'Account'})</span>
            </button>
          )}

          <button
            onClick={() => {
              gameAudio.playClick();
              if (window.confirm('Reset all progress back to Stage 1?')) {
                onResetProgress();
                onClose();
              }
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Progress to Stage 1</span>
          </button>
        </div>
      </div>
    </div>
  );
}

