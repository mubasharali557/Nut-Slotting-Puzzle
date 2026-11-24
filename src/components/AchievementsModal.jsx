import React from 'react';
import { X, Trophy, Star, Flame, Award, CheckCircle2, Home } from 'lucide-react';
import { gameAudio } from '../utils/gameAudio';

export default function AchievementsModal({
  isOpen,
  onClose,
  onHome,
  totalStars = 125,
  currentStage = 1,
}) {
  if (!isOpen) return null;

  const achievements = [
    {
      title: 'First Transmutation',
      desc: 'Complete Stage 1 of the puzzle',
      progress: currentStage > 1 ? 1 : 0,
      max: 1,
      reward: '50 🪙',
      icon: '🧪',
    },
    {
      title: 'Apprentice Chemist',
      desc: 'Clear 10 puzzle chambers',
      progress: Math.min(10, currentStage - 1),
      max: 10,
      reward: '200 🪙',
      icon: '✨',
    },
    {
      title: 'Stargazer',
      desc: 'Collect 100 golden stars',
      progress: Math.min(100, totalStars),
      max: 100,
      reward: '350 🪙',
      icon: '⭐',
    },
    {
      title: 'Silver Sorter',
      desc: 'Reach Stage 25',
      progress: Math.min(25, currentStage),
      max: 25,
      reward: '500 🪙',
      icon: '🥈',
    },
    {
      title: 'Golden Alchemist',
      desc: 'Reach Stage 50',
      progress: Math.min(50, currentStage),
      max: 50,
      reward: '800 🪙',
      icon: '🥇',
    },
    {
      title: 'Century Master',
      desc: 'Complete all 100 Stages of Nut Slotting!',
      progress: Math.min(100, currentStage),
      max: 100,
      reward: '2000 🪙',
      icon: '👑',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-sm max-h-[85vh] bg-gradient-to-b from-slate-900 to-indigo-950 rounded-3xl p-5 border-2 border-purple-400/50 shadow-2xl shadow-purple-500/20 flex flex-col gap-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-black text-white">Achievements</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                gameAudio.playClick();
                if (onHome) onHome();
                else onClose();
              }}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Return to Home Screen"
              aria-label="Home"
            >
              <Home className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                gameAudio.playClick();
                onClose();
              }}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex flex-col gap-3 overflow-y-auto py-1 pr-1 max-h-[55vh]">
          {achievements.map((a, idx) => {
            const isCompleted = a.progress >= a.max;
            return (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/70 border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{a.icon}</div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white">{a.title}</h4>
                    <p className="text-[10px] text-slate-400">{a.desc}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-24 h-1.5 rounded-full bg-slate-700 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-yellow-300"
                          style={{ width: `${(a.progress / a.max) * 100}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-slate-300">
                        {a.progress}/{a.max}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  {isCompleted ? (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Done
                    </span>
                  ) : (
                    <span className="text-[10px] font-black text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                      {a.reward}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

