import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, ShieldCheck, Sparkles, AlertCircle, LogIn, UserPlus, Play } from 'lucide-react';
import { authService } from '../utils/authService';
import { gameAudio } from '../utils/gameAudio';

export default function AuthScreen({ onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isLogin = mode === 'login';

  const switchMode = (newMode) => {
    gameAudio.playClick();
    setMode(newMode);
    setError('');
  };

  const handleGuestPlay = () => {
    gameAudio.playClick();
    const res = authService.loginAsGuest();
    onAuthSuccess?.(res.user, res.progress);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setError('Please enter a username.');
      gameAudio.playClick();
      return;
    }

    if (cleanUsername.length < 3) {
      setError('Username must be at least 3 characters.');
      gameAudio.playClick();
      return;
    }

    if (!password) {
      setError('Please enter a password.');
      gameAudio.playClick();
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      gameAudio.playClick();
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match. Please check again.');
      gameAudio.playClick();
      return;
    }

    setIsLoading(true);
    gameAudio.playClick();

    try {
      let result;
      if (isLogin) {
        result = await authService.login(cleanUsername, password);
      } else {
        result = await authService.register(cleanUsername, password);
      }

      gameAudio.playWin();
      onAuthSuccess?.(result.user, result.progress);
    } catch (err) {
      let msg = err.message || 'Authentication failed. Please try again.';
      if (
        msg.includes('is not valid JSON') ||
        msg.includes('Unexpected token') ||
        msg.includes('JSON.parse') ||
        msg.includes('SyntaxError') ||
        msg.includes('Failed to fetch')
      ) {
        msg = 'Connection error. Please try again or tap Guest to play immediately.';
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0a0705] overflow-y-auto select-none">
      
      {/* 1. Ambient Blurred Backdrop */}
      <img
        src="/game.webp?v=2"
        alt=""
        aria-hidden="true"
        className="fixed inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-40 brightness-50 pointer-events-none"
      />

      {/* 2. Central Authentication Card */}
      <div className="relative w-full max-w-md my-auto rounded-3xl bg-gradient-to-b from-[#2e1d11] via-[#1a110a] to-[#0c0805] border-2 sm:border-3 border-[#c49b65] shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_35px_rgba(251,191,36,0.25)] p-5 sm:p-7 z-10 flex flex-col gap-4 sm:gap-5">
        
        {/* Top Specular Sheen Line */}
        <div className="absolute top-1 inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-[#ffdca8]/50 to-transparent pointer-events-none rounded-full" />

        {/* Logo and Game Brand Header */}
        <div className="flex flex-col items-center text-center">
          <img
            src="/nut_sort_navbar_badge.webp"
            alt="Nut Sort Logo"
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-[0_4px_12px_rgba(251,191,36,0.4)] animate-pulse"
          />
          <h1 className="text-xl sm:text-2xl font-black italic tracking-wide mt-2">
            <span className="text-[#facc15] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">NUT</span>
            <span className="text-[#ffeed2] ml-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">SORT</span>
          </h1>
          <span className="text-[9px] font-black uppercase tracking-widest text-[#dfbf8d] px-2.5 py-0.5 rounded-full bg-[#1c1108] border border-[#c49b65]/50 shadow-sm mt-0.5">
            PLAYER ACCOUNT SYSTEM
          </span>
          <p className="text-xs text-[#dfbf8d] mt-2">
            {isLogin
              ? 'Log in to continue your puzzle progress'
              : 'Create a new account for an independent fresh game'}
          </p>
        </div>

        {/* Mode Selector Tabs (Log In / Create Account) */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#140b05]/90 border border-[#c49b65]/40 shadow-inner">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`py-2 text-xs sm:text-sm font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              isLogin
                ? 'bg-gradient-to-b from-[#5c3411] to-[#3a200a] text-[#ffeed2] border border-[#c49b65]/70 shadow-md scale-[1.02]'
                : 'text-[#dfbf8d] hover:text-[#ffeed2]'
            }`}
          >
            <LogIn className="w-4 h-4 text-amber-300" />
            <span>Log In</span>
          </button>

          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`py-2 text-xs sm:text-sm font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              !isLogin
                ? 'bg-gradient-to-b from-[#5c3411] to-[#3a200a] text-[#ffeed2] border border-[#c49b65]/70 shadow-md scale-[1.02]'
                : 'text-[#dfbf8d] hover:text-[#ffeed2]'
            }`}
          >
            <UserPlus className="w-4 h-4 text-amber-300" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-2xl bg-rose-950/70 border border-rose-500/60 text-rose-200 text-xs shadow-md animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Username Input */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-[#dfbf8d]">
              Username
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-amber-400 pointer-events-none">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter player name"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#140b05] border border-[#c49b65]/60 text-sm font-bold text-[#ffeed2] placeholder:text-[#dfbf8d]/40 focus:outline-none focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] transition-all"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-[#dfbf8d]">
              Password
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-amber-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#140b05] border border-[#c49b65]/60 text-sm font-bold text-[#ffeed2] placeholder:text-[#dfbf8d]/40 focus:outline-none focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] transition-all"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-[#dfbf8d] hover:text-[#ffeed2] transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Only in Register mode) */}
          {!isLogin && (
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#dfbf8d]">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-amber-400 pointer-events-none">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#140b05] border border-[#c49b65]/60 text-sm font-bold text-[#ffeed2] placeholder:text-[#dfbf8d]/40 focus:outline-none focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* Fresh Game Notice on Register */}
          {!isLogin && (
            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-[#c49b65]/30 flex items-center gap-2 text-xs text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
              <span>Starts brand-new at <strong>Stage 1</strong> with 0 stars and independent progress.</span>
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full mt-2 py-3 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 shadow-[0_4px_0_#8c6435,0_8px_20px_rgba(0,0,0,0.6)] cursor-pointer ${
              isLoading
                ? 'opacity-60 cursor-wait bg-gradient-to-b from-[#c49b65] to-[#8c6435] text-[#1c1108]'
                : 'bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-600 hover:brightness-110 active:scale-[0.98] active:translate-y-0.5 text-[#1c1108] border border-amber-200'
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-[#1c1108] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                <span>{isLogin ? 'Log In & Play' : 'Create Account & Play'}</span>
              </>
            )}
          </button>
        </form>

        {/* Footer switch prompt & Guest Play */}
        <div className="text-center pt-2 border-t border-[#c49b65]/20 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => switchMode(isLogin ? 'register' : 'login')}
            className="text-xs text-[#dfbf8d] hover:text-[#facc15] transition-colors underline cursor-pointer"
          >
            {isLogin
              ? "Don't have an account yet? Create one here!"
              : 'Already have an account? Log in to continue!'}
          </button>

          <button
            type="button"
            onClick={handleGuestPlay}
            className="w-full mt-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#c49b65]/40 text-[#ffeed2] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-[#facc15] text-[#facc15]" />
            <span>Play as Guest (No Account Required)</span>
          </button>
        </div>

      </div>
    </div>
  );
}

