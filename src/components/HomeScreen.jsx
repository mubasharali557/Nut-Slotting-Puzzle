import React, { useState, useEffect, useRef } from 'react';
import { gameAudio } from '../utils/gameAudio';
import { CheckCircle2, ShieldCheck, X, Settings, Trophy, ShoppingBag, ShieldAlert } from 'lucide-react';
import GameNavbar from './GameNavbar';

export default function HomeScreen({
  onPlay,
  onOpenSettings,
  onOpenShop,
  onOpenLevels,
  onOpenAchievements,
  currentStage = 1,
  coins = 250,
  stars = 125,
  playerName = 'Mubashar',
  playerId = '84920',
  soundEnabled = true,
  onToggleSound,
}) {
  const [showVipModal, setShowVipModal] = useState(false);
  const [mascotBounce, setMascotBounce] = useState(false);
  const [isPlayPressed, setIsPlayPressed] = useState(false);
  const [isLevelsPressed, setIsLevelsPressed] = useState(false);
  const [isPortrait, setIsPortrait] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth / window.innerHeight < 1.0;
    }
    return false;
  });
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerWidth / window.innerHeight < 1.0);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  // Sound and action handlers with tactile press animation
  const handlePlayClick = () => {
    gameAudio.playClick();
    setIsPlayPressed(true);
    // Tactile press-down and smooth spring return
    setTimeout(() => {
      setIsPlayPressed(false);
      setTimeout(() => {
        onPlay?.();
      }, 140);
    }, 180);
  };

  const handleLevelsClick = () => {
    gameAudio.playClick();
    setIsLevelsPressed(true);
    setTimeout(() => {
      setIsLevelsPressed(false);
      setTimeout(() => {
        onOpenLevels?.();
      }, 120);
    }, 140);
  };

  const handleSettingsClick = () => {
    gameAudio.playClick();
    onOpenSettings?.();
  };

  const handleTrophyClick = () => {
    gameAudio.playClick();
    onOpenAchievements?.();
  };

  const handleShopClick = () => {
    gameAudio.playClick();
    onOpenShop?.();
  };

  const handleNoAdsClick = () => {
    gameAudio.playPowerUp();
    setShowVipModal(true);
  };

  const handleMascotClick = () => {
    gameAudio.playClick();
    setMascotBounce(true);
    setTimeout(() => setMascotBounce(false), 600);
  };

  // Sparkles & ambient particle physics canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let width = (canvas.width = canvas.offsetWidth || 1280);
    let height = (canvas.height = canvas.offsetHeight || 720);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // 42 Ambient Floating Golden Spark Particles
    const particles = Array.from({ length: 42 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 1.2 + Math.random() * 2.5,
      speedY: -0.25 - Math.random() * 0.45,
      speedX: (Math.random() - 0.5) * 0.35,
      alpha: 0.15 + Math.random() * 0.7,
      maxAlpha: 0.6 + Math.random() * 0.4,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.03,
      type: Math.random() > 0.3 ? 'mote' : 'star',
    }));

    // Mouse / touch interactive particles
    const interactiveParticles = [];

    const addTouchSparkles = (cx, cy) => {
      for (let i = 0; i < 4; i++) {
        interactiveParticles.push({
          x: cx + (Math.random() - 0.5) * 20,
          y: cy + (Math.random() - 0.5) * 20,
          radius: 1.5 + Math.random() * 2.5,
          speedX: (Math.random() - 0.5) * 2.5,
          speedY: (Math.random() - 0.5) * 2.5 - 0.8,
          alpha: 1,
          decay: 0.025 + Math.random() * 0.02,
        });
      }
    };

    const onPointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX ?? e.touches?.[0]?.clientX;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY;
      if (clientX === undefined || clientY === undefined) return;
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) return;

      const x = (clientX - rect.left) * (canvas.width / rect.width);
      const y = (clientY - rect.top) * (canvas.height / rect.height);
      if (Math.random() > 0.4) {
        addTouchSparkles(x, y);
      }
    };

    window.addEventListener('pointermove', onPointerMove);

    // Draw 4-point diamond star sparkle
    const drawStar = (x, y, size, alpha) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.fillStyle = '#fffae0';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = size * 3;

      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.quadraticCurveTo(0, 0, size, 0);
      ctx.quadraticCurveTo(0, 0, 0, size);
      ctx.quadraticCurveTo(0, 0, -size, 0);
      ctx.quadraticCurveTo(0, 0, 0, -size);
      ctx.closePath();
      ctx.fill();

      // Tiny center point
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.25, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // Main animation loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render ambient motes & stars
      for (let p of particles) {
        p.pulse += p.pulseSpeed;
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.pulse) * 0.25;

        // Wrap around screen
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentAlpha =
          p.alpha * (0.5 + 0.5 * Math.sin(p.pulse)) * p.maxAlpha;

        if (p.type === 'star') {
          drawStar(p.x, p.y, p.radius * 2.2, currentAlpha);
        } else {
          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, currentAlpha));
          ctx.fillStyle = '#fde68a';
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = p.radius * 3.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Render interactive touch sparkles
      for (let i = interactiveParticles.length - 1; i >= 0; i--) {
        const ip = interactiveParticles[i];
        ip.x += ip.speedX;
        ip.y += ip.speedY;
        ip.alpha -= ip.decay;
        ip.radius = Math.max(0.5, ip.radius * 0.97);

        if (ip.alpha <= 0) {
          interactiveParticles.splice(i, 1);
          continue;
        }

        drawStar(ip.x, ip.y, ip.radius * 2, ip.alpha);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  const heroMaskStyle = {
    imageRendering: 'high-quality',
    WebkitMaskImage:
      'linear-gradient(to bottom, transparent 0%, black 5.5%, black 91.8%, transparent 100%)',
    maskImage:
      'linear-gradient(to bottom, transparent 0%, black 5.5%, black 91.8%, transparent 100%)',
  };

  const renderSeamlessExtensions = () => (
    <>
      <img
        src="/home_ext_top.webp?v=2"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="absolute left-0 w-full max-w-none pointer-events-none select-none z-0"
        style={{
          height: '221.354%',
          bottom: '95.833%',
          WebkitMaskImage: 'linear-gradient(to top, black 0%, black 78%, transparent 100%)',
          maskImage: 'linear-gradient(to top, black 0%, black 78%, transparent 100%)',
        }}
      />
      <img
        src="/home_ext_bottom.webp?v=2"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="absolute left-0 w-full max-w-none pointer-events-none select-none z-0"
        style={{
          height: '273.438%',
          top: '92.448%',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 78%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black 0%, black 78%, transparent 100%)',
        }}
      />
      <img
        src="/home_ext_left.webp?v=2"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="absolute top-0 h-full max-w-none pointer-events-none select-none z-0"
        style={{ width: '43.605%', right: '99.7%' }}
      />
      <img
        src="/home_ext_right.webp?v=2"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="absolute top-0 h-full max-w-none pointer-events-none select-none z-0"
        style={{ width: '43.605%', left: '99.7%' }}
      />
    </>
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[100dvh] overflow-hidden flex items-center justify-center select-none"
    >
      {/* 1. FULL-VIEWPORT SEAMLESS WORKSHOP BACKDROP */}
      <img
        src="/home_bg_seamless.webp?v=2"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="fixed inset-0 w-full h-full object-cover pointer-events-none z-0"
        style={{ imageRendering: 'high-quality' }}
      />

      {/* CANVAS PARTICLE SYSTEM: Continuous Ambient Golden Dust & Touch Sparkles Across Whole Room */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-[15]"
      />

      {isPortrait ? (
        /* ========================================================
           MOBILE PORTRAIT UI (Unified, Continuous Seamless Scene)
           ======================================================== */
        <div className="relative w-full h-full flex flex-col justify-between z-10 overflow-hidden">
          {/* Top: Mobile-optimized Navbar */}
          <div className="relative z-30 w-full flex-shrink-0">
            <GameNavbar
              isHome={true}
              currentStage={currentStage}
              stars={stars}
              coins={coins}
              playerName={playerName}
              playerId={playerId}
              soundEnabled={soundEnabled}
              onToggleSound={onToggleSound}
              onOpenSettings={onOpenSettings}
              onOpenShop={onOpenShop}
              onOpenLevels={onOpenLevels}
              onOpenAchievements={onOpenAchievements}
            />
          </div>

          {/* Middle: Seamless Workshop Scene Anchored to Master Artwork */}
          <div
            className="relative z-10 flex-1 w-full min-h-0 flex items-center justify-center pointer-events-auto"
            style={{ containerType: 'size' }}
          >
            <div
              className="relative flex items-center justify-center"
              style={{
                width: 'min(100cqw, calc(100cqh * 2752 / 1536))',
                height: 'min(100cqh, calc(100cqw * 1536 / 2752))',
              }}
            >
              {renderSeamlessExtensions()}

              {/* Crisp Preserved Master Artwork Blended Seamlessly */}
              <img
                src="/game.webp?v=2"
                alt="Nut Sort Color Puzzle"
                className="relative z-10 w-full h-full object-contain pointer-events-none select-none"
                style={heroMaskStyle}
                draggable={false}
                onError={(e) => {
                  if (e.currentTarget.src.indexOf('mobile_hero_banner.webp') === -1) {
                    e.currentTarget.src = '/mobile_hero_banner.webp?v=2';
                  }
                }}
              />

              {/* Interactive Mascot Click/Wave Zone */}
              <div
                onClick={handleMascotClick}
                className={`absolute z-20 cursor-pointer transition-transform duration-300 ${
                  mascotBounce ? 'scale-110 -translate-y-1' : 'hover:scale-[1.03]'
                }`}
                style={{
                  left: '31%',
                  top: '31%',
                  width: '38%',
                  height: '31%',
                }}
                title="Nut & Bolt Buddies! Click to wave!"
              >
                {/* Mascot sparkle glints contained in puzzle */}
                <div className="w-full h-full relative">
                  <div className="absolute top-[18%] left-[10%] w-2.5 h-2.5 bg-white rounded-full filter blur-[1px] animate-ping opacity-60 pointer-events-none" />
                  <div className="absolute top-[22%] right-[16%] w-2 h-2 bg-amber-200 rounded-full filter blur-[1px] animate-ping opacity-50 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Lower Section: Workbench Table with Action Buttons & Bottom Navigation */}
          <div className="relative z-30 w-full flex flex-col items-center pointer-events-auto flex-shrink-0 pb-[max(env(safe-area-inset-bottom,0px),12px)] px-4">
            
            {/* Action Buttons: LEVELS & PLAY ▶ */}
            <div className="w-full flex items-center justify-center gap-3 max-w-sm mb-4">
              {/* LEVELS BUTTON */}
              <button
                onClick={handleLevelsClick}
                type="button"
                className="w-[38vw] max-w-[145px] aspect-[542/199] cursor-pointer select-none focus:outline-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] hover:brightness-105 active:scale-95 transition-all"
                title="Levels & Stage Map"
                aria-label="Levels and Stage Map"
              >
                <img
                  src="/levels_button.webp"
                  alt="Levels"
                  className="w-full h-full object-contain pointer-events-none select-none block"
                  draggable={false}
                />
              </button>

              {/* PLAY BUTTON */}
              <button
                onClick={handlePlayClick}
                onPointerDown={() => setIsPlayPressed(true)}
                onPointerLeave={() => setIsPlayPressed(false)}
                type="button"
                className="group relative w-[56vw] max-w-[218px] aspect-[757/286] cursor-pointer select-none focus:outline-none drop-shadow-[0_10px_22px_rgba(0,0,0,0.6)] hover:brightness-105 active:scale-95 transition-all"
                title={`Play Level ${currentStage}!`}
                aria-label={`Play Level ${currentStage}`}
              >
                <img
                  src="/play_button_base.webp"
                  alt="Play"
                  className="w-full h-full object-contain pointer-events-none select-none block"
                  draggable={false}
                />
                <div
                  className="absolute pointer-events-none select-none flex items-center justify-center"
                  style={{
                    left: '81.24%',
                    top: '30.42%',
                    width: '10.70%',
                    height: '36.01%',
                  }}
                >
                  <div
                    className={`relative w-full h-full transition-all duration-150 ease-out origin-center ${
                      isPlayPressed ? 'scale-[0.82] brightness-90' : 'group-hover:brightness-105'
                    }`}
                  >
                    <img
                      src="/play_arrow_icon.webp"
                      alt=""
                      className="w-full h-full object-contain pointer-events-none select-none block"
                      draggable={false}
                    />
                  </div>
                </div>
              </button>
            </div>

            {/* Bottom 4 Navigation Buttons: Settings, Trophies, Shop, VIP No Ads */}
            <div className="w-full flex items-center justify-between px-2 max-w-sm">
              {/* Left group: Settings & Trophy */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSettingsClick}
                  className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform cursor-pointer"
                  title="Settings"
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-b from-[#ffeed2] via-[#f7dfb9] to-[#dfbf8d] border-2 border-[#c49b65] shadow-[0_3px_0_#8c6435,0_6px_14px_rgba(0,0,0,0.7)] flex items-center justify-center text-[#5c3a1d]">
                    <Settings className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="text-[9px] font-black text-[#ffeed2] drop-shadow">Settings</span>
                </button>

                <button
                  onClick={handleTrophyClick}
                  className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform cursor-pointer"
                  title="Trophies"
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-b from-[#ffeed2] via-[#f7dfb9] to-[#dfbf8d] border-2 border-[#c49b65] shadow-[0_3px_0_#8c6435,0_6px_14px_rgba(0,0,0,0.7)] flex items-center justify-center text-[#5c3a1d]">
                    <Trophy className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="text-[9px] font-black text-[#ffeed2] drop-shadow">Trophy</span>
                </button>
              </div>

              {/* Right group: Shop & No Ads */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleShopClick}
                  className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform cursor-pointer"
                  title="Shop"
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-b from-[#ffeed2] via-[#f7dfb9] to-[#dfbf8d] border-2 border-[#c49b65] shadow-[0_3px_0_#8c6435,0_6px_14px_rgba(0,0,0,0.7)] flex items-center justify-center text-[#5c3a1d]">
                    <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="text-[9px] font-black text-[#ffeed2] drop-shadow">Shop</span>
                </button>

                <button
                  onClick={handleNoAdsClick}
                  className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform cursor-pointer"
                  title="VIP No Ads"
                >
                  <div className="w-11 h-11 rounded-full bg-gradient-to-b from-[#ffeed2] via-[#f7dfb9] to-[#dfbf8d] border-2 border-[#c49b65] shadow-[0_3px_0_#8c6435,0_6px_14px_rgba(0,0,0,0.7)] flex items-center justify-center text-[#5c3a1d]">
                    <ShieldCheck className="w-5 h-5 stroke-[2.5] text-amber-700" />
                  </div>
                  <span className="text-[9px] font-black text-[#ffeed2] drop-shadow">No Ads</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* ========================================================
           DESKTOP / WIDESCREEN LANDSCAPE UI (Seamless Unified Master Scene)
           ======================================================== */
        <div className="relative w-full h-full flex flex-col items-center justify-between z-10 overflow-hidden">
          {/* Top Navbar: Clean, Compact, and Aligned */}
          <div className="relative z-30 w-full flex-shrink-0">
            <GameNavbar
              isHome={true}
              showDesktopQuickActions={true}
              currentStage={currentStage}
              stars={stars}
              coins={coins}
              playerName={playerName}
              playerId={playerId}
              soundEnabled={soundEnabled}
              onToggleSound={onToggleSound}
              onOpenSettings={handleSettingsClick}
              onOpenShop={handleShopClick}
              onOpenLevels={onOpenLevels}
              onOpenAchievements={handleTrophyClick}
              onOpenVip={handleNoAdsClick}
            />
          </div>

          {/* 3. SEAMLESS CENTERED ARTWORK FRAME (Continues seamlessly into background on all sides) */}
          <div
            className="relative z-10 flex-1 w-full min-h-0 flex items-center justify-center"
            style={{ containerType: 'size' }}
          >
            <div
              className="relative flex items-center justify-center pointer-events-none"
              style={{
                width: 'min(100cqw, calc(100cqh * 2752 / 1536))',
                height: 'min(100cqh, calc(100cqw * 1536 / 2752))',
              }}
            >
              {renderSeamlessExtensions()}

              {/* Crisp Uncropped, Undistorted HD Master Artwork (blended cleanly into workshop background) */}
              <img
                src="/game.webp?v=2"
                alt="Nut Sort Color Puzzle Game"
                className="relative z-10 w-full h-full object-contain pointer-events-none select-none"
                style={heroMaskStyle}
                draggable={false}
              />

              {/* MASCOT CHARACTERS (Nut & Bolt Buddies) INTERACTIVE ZONE */}
              <div
                onClick={handleMascotClick}
                className={`absolute z-20 pointer-events-auto cursor-pointer transition-transform duration-300 ${
                  mascotBounce ? 'scale-110 -translate-y-2' : 'hover:scale-[1.03]'
                }`}
                style={{
                  left: '31%',
                  top: '31%',
                  width: '38%',
                  height: '31%',
                }}
                title="Nut & Bolt Buddies! Click to wave!"
              >
                {/* Subtle floating bob */}
                <div className="w-full h-full animate-mascot-float relative">
                  {/* Sparkle glint on waving nut */}
                  <div className="absolute top-[18%] left-[10%] w-3 h-3 bg-white rounded-full filter blur-[1px] animate-ping opacity-60 pointer-events-none" />
                  {/* Sparkle glint on bolt buddy */}
                  <div className="absolute top-[22%] right-[16%] w-2.5 h-2.5 bg-amber-200 rounded-full filter blur-[1px] animate-ping opacity-50 pointer-events-none" />
                </div>
              </div>

              {/* INTERACTIVE ACTION BUTTONS OVERLAY (Clean workbench without baked corner icons) */}
              <div className="absolute inset-0 z-20 pointer-events-auto">

                {/* === A. LEVELS BUTTON (Glossy Blue 3D Pill - 100% Fixed & Stationary) === */}
                <button
                  onClick={handleLevelsClick}
                  type="button"
                  className="absolute cursor-pointer select-none focus:outline-none"
                  style={{
                    left: '24.5%',
                    top: '70.2%',
                    width: '19.5%',
                    aspectRatio: '542 / 199',
                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5)) drop-shadow(0 0 12px rgba(59,130,246,0.3))',
                    transform: 'none',
                  }}
                  title="Levels & Stage Map"
                  aria-label="Levels and Stage Map"
                >
                  <img
                    src="/levels_button.webp"
                    alt="Levels"
                    className="w-full h-full object-contain pointer-events-none select-none block"
                    draggable={false}
                    style={{ transform: 'none' }}
                  />
                </button>

                {/* === B. PLAY ▶ BUTTON (100% Stationary Frame with Strictly Internal Icon Animation) === */}
                <button
                  onClick={handlePlayClick}
                  onPointerDown={() => setIsPlayPressed(true)}
                  onPointerUp={() => {
                    // Keep smooth return
                  }}
                  onPointerLeave={() => setIsPlayPressed(false)}
                  type="button"
                  className="group absolute cursor-pointer select-none focus:outline-none"
                  style={{
                    left: '47.5%',
                    top: '66.8%',
                    width: '28.0%',
                    aspectRatio: '757 / 286',
                    filter: 'drop-shadow(0 14px 28px rgba(0,0,0,0.6)) drop-shadow(0 0 16px rgba(34,197,94,0.35))',
                    transform: 'none',
                  }}
                  title={`Play Level ${currentStage}!`}
                  aria-label={`Play Level ${currentStage}`}
                >
                  {/* 1. Stationary Button Base Frame (pill body, metallic border & PLAY text) */}
                  <img
                    src="/play_button_base.webp"
                    alt="Play"
                    className="w-full h-full object-contain pointer-events-none select-none block"
                    draggable={false}
                    style={{ transform: 'none' }}
                  />

                  {/* 2. Arrow Icon Assembly: Anchored in place, ZERO container movement */}
                  <div
                    className="absolute pointer-events-none select-none flex items-center justify-center"
                    style={{
                      left: '81.24%',
                      top: '30.42%',
                      width: '10.70%',
                      height: '36.01%',
                      transform: 'none',
                    }}
                  >
                    {/* Animated Arrow Icon: Strictly internal inward press animation */}
                    <div
                      className={`relative w-full h-full transition-all duration-150 ease-out origin-center ${
                        isPlayPressed
                          ? 'scale-[0.82] brightness-90'
                          : 'group-hover:brightness-105 group-active:scale-[0.82] group-active:brightness-90'
                      }`}
                      style={{
                        transformOrigin: '50% 50%',
                      }}
                    >
                      {/* High-res crisp arrow image */}
                      <img
                        src="/play_arrow_icon.webp"
                        alt=""
                        className="w-full h-full object-contain pointer-events-none select-none block"
                        draggable={false}
                      />

                      {/* Internal Light Gleam / Shimmer (Strictly clipped within triangle shape) */}
                      <div
                        className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
                        style={{
                          clipPath: 'polygon(0% 4%, 18% 0%, 98% 50%, 18% 100%, 0% 96%)',
                        }}
                      >
                        <div
                          className={`absolute -inset-full w-[250%] h-[250%] bg-gradient-to-r from-transparent via-white/50 to-transparent -rotate-45 pointer-events-none transition-transform duration-500 ease-out ${
                            isPlayPressed
                              ? 'translate-x-full translate-y-full opacity-100'
                              : 'group-hover:translate-x-full group-hover:translate-y-full -translate-x-full -translate-y-full opacity-0 group-hover:opacity-100'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </button>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. VIP NO-ADS CELEBRATION MODAL */}
      {showVipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#2a1a10] via-[#1a120c] to-[#0d0907] border-3 border-[#c49b65] p-6 text-center shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_40px_rgba(251,191,36,0.25)]">
            {/* Close Button */}
            <button
              onClick={() => {
                gameAudio.playClick();
                setShowVipModal(false);
              }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-amber-950/60 border border-amber-600/50 flex items-center justify-center text-amber-200 hover:bg-amber-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* VIP Shield Badge */}
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-700 p-0.5 shadow-[0_0_25px_rgba(251,191,36,0.6)] flex items-center justify-center mb-4 animate-bounce">
              <div className="w-full h-full rounded-full bg-[#1c120a] flex items-center justify-center">
                <ShieldCheck className="w-9 h-9 text-amber-300" />
              </div>
            </div>

            <h3 className="text-2xl font-black text-[#ffeed2] tracking-wider uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              VIP Ad-Free Active
            </h3>

            <div className="my-3 py-2 px-3 rounded-xl bg-amber-950/40 border border-amber-800/40 flex items-center justify-center gap-2 text-amber-200 text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Zero Ads • Unlimited Sorting</span>
            </div>

            <p className="text-xs text-[#dfbf8d] leading-relaxed mb-5">
              You are playing in Premium VIP mode. Enjoy seamless, uninterrupted puzzle sorting across all stages!
            </p>

            <button
              onClick={() => {
                gameAudio.playClick();
                setShowVipModal(false);
              }}
              className="w-full py-3 rounded-full bg-gradient-to-b from-lime-400 via-emerald-500 to-green-700 border-2 border-lime-200 shadow-[0_4px_0_#064e3b,0_0_20px_rgba(16,185,129,0.4)] text-[#ffeed2] font-black text-base uppercase tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
