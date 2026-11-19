import React, { useState } from 'react';

export default function PlayerAvatar({ size = 'sm', className = '' }) {
  const [imageError, setImageError] = useState(false);

  // Size dimensions map
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8 sm:w-8.5 sm:h-8.5',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const currentSize = sizeClasses[size] || sizeClasses.sm;

  return (
    <div
      className={`relative rounded-full flex-shrink-0 p-0.5 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 shadow-[0_2px_8px_rgba(245,158,11,0.5),inset_0_1px_2px_rgba(255,255,255,0.9)] ${currentSize} ${className}`}
    >
      {/* Inner Bezel Container */}
      <div className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-purple-950 border border-amber-300/80 shadow-inner flex items-center justify-center">
        {!imageError ? (
          <img
            src="/player-avatar.png"
            alt="Player Avatar"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center transform scale-105"
          />
        ) : (
          // Realistic 3D Stylized Vector Character Avatar Fallback
          <svg
            viewBox="0 0 64 64"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffd8b3" />
                <stop offset="100%" stopColor="#f6ad7b" />
              </linearGradient>
              <linearGradient id="hair" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#312e81" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
              <linearGradient id="hoodie" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>
              <linearGradient id="phone" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#be123c" />
              </linearGradient>
            </defs>

            {/* Background Halo */}
            <circle cx="32" cy="32" r="30" fill="#0f172a" />
            <circle cx="32" cy="22" r="18" fill="#38bdf8" opacity="0.25" />

            {/* Hoodie / Shoulders */}
            <path
              d="M12 58 C14 44 22 40 32 40 C42 40 50 44 52 58 Z"
              fill="url(#hoodie)"
            />
            {/* Hoodie Collar & Zipper */}
            <path d="M28 42 L32 49 L36 42 Z" fill="#0284c7" />
            <line x1="32" y1="49" x2="32" y2="58" stroke="#38bdf8" strokeWidth="1.5" />

            {/* Neck */}
            <rect x="28" y="34" width="8" height="9" rx="3" fill="#f6ad7b" />

            {/* Head / Face */}
            <circle cx="32" cy="26" r="11" fill="url(#skin)" />

            {/* Eyes */}
            <circle cx="28" cy="25" r="1.8" fill="#1e293b" />
            <circle cx="36" cy="25" r="1.8" fill="#1e293b" />
            <circle cx="28.5" cy="24.4" r="0.6" fill="#ffffff" />
            <circle cx="36.5" cy="24.4" r="0.6" fill="#ffffff" />

            {/* Friendly Smile */}
            <path
              d="M29.5 29 C31 30.5 33 30.5 34.5 29"
              stroke="#c2410c"
              strokeWidth="1.2"
              strokeLinecap="round"
            />

            {/* Hair */}
            <path
              d="M21 23 C21 16 26 12 33 12 C40 12 43 16 43 23 C41 20 38 19 35 19 C31 19 27 22 21 23 Z"
              fill="url(#hair)"
            />
            <path
              d="M23 18 C28 15 35 15 39 18 C38 16 35 14 31 14 C27 14 24 16 23 18 Z"
              fill="#60a5fa"
              opacity="0.6"
            />

            {/* Gaming Headphones (Headband + Earcups) */}
            <path
              d="M18 26 C18 17 24 11 32 11 C40 11 46 17 46 26"
              stroke="#e2e8f0"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Left Earcup */}
            <rect x="16" y="21" width="5" height="10" rx="2.5" fill="url(#phone)" />
            <rect x="17.5" y="23" width="2" height="6" rx="1" fill="#fecdd3" opacity="0.8" />
            {/* Right Earcup */}
            <rect x="43" y="21" width="5" height="10" rx="2.5" fill="url(#phone)" />
            <rect x="44.5" y="23" width="2" height="6" rx="1" fill="#fecdd3" opacity="0.8" />
          </svg>
        )}

        {/* 3D Glass Lens Specular Reflection (Top Hemisphere) */}
        <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/40 via-white/10 to-transparent pointer-events-none rounded-t-full" />
      </div>

      {/* Level / Status Jewel Pip (Bottom Right) */}
      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-gradient-to-tr from-emerald-500 to-green-300 border-[1.5px] border-slate-950 shadow-[0_0_5px_#22c55e]" />
    </div>
  );
}

