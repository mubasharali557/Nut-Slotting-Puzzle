import React, { useState, useEffect, useCallback } from 'react';
import HomeScreen from './components/HomeScreen';
import ThreeGameBoard from './components/ThreeGameBoard';
const PauseModal = React.lazy(() => import('./components/PauseModal'));
const WinModal = React.lazy(() => import('./components/WinModal'));
const SettingsModal = React.lazy(() => import('./components/SettingsModal'));
const ShopModal = React.lazy(() => import('./components/ShopModal'));
const LevelsModal = React.lazy(() => import('./components/LevelsModal'));
const AchievementsModal = React.lazy(() => import('./components/AchievementsModal'));
const OutOfChancesModal = React.lazy(() => import('./components/OutOfChancesModal'));
import GameNavbar from './components/GameNavbar';
import AuthScreen from './components/AuthScreen';
import { authService } from './utils/authService';
import { getStageData } from './data/levelStages';
import { GAME_THEMES, BOLT_SKINS, NUT_SKINS } from './data/themes';
import { gameAudio } from './utils/gameAudio';
import { Undo2, RotateCcw, Trophy, Settings, Palette, Heart, Sparkles, ShoppingBag } from 'lucide-react';
import ColorStudioBar, { CUSTOM_COLOR_PALETTE } from './components/ColorStudioBar';

const normalizeUnlockedList = (list, defaultId) => {
  const arr = Array.isArray(list) ? list.filter(Boolean) : [];
  return arr.includes(defaultId) ? Array.from(new Set(arr)) : [defaultId, ...Array.from(new Set(arr))];
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [screen, setScreen] = useState('home'); // 'home' | 'game'
  const [stage, setStage] = useState(() => {
    const saved = localStorage.getItem('watersort_stage');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [highestUnlocked, setHighestUnlocked] = useState(() => {
    const savedHighest = localStorage.getItem('watersort_highest_stage');
    const savedStage = localStorage.getItem('watersort_stage');
    return savedHighest ? parseInt(savedHighest, 10) : (savedStage ? parseInt(savedStage, 10) : 1);
  });
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem('watersort_coins');
    return saved ? parseInt(saved, 10) : 250;
  });
  const [stars, setStars] = useState(() => {
    const saved = localStorage.getItem('watersort_stars');
    return saved ? parseInt(saved, 10) : 125;
  });
  const [gems, setGems] = useState(() => {
    const saved = localStorage.getItem('watersort_gems');
    return saved ? parseInt(saved, 10) : 15;
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('watersort_sound');
    return saved !== null ? saved === 'true' : true;
  });
  const [soundVolume, setSoundVolume] = useState(() => gameAudio.getVolume());
  const [musicEnabled, setMusicEnabled] = useState(() => {
    const saved = localStorage.getItem('watersort_music');
    return saved !== null ? saved === 'true' : false;
  });
  const [vibrationEnabled, setVibrationEnabled] = useState(() => {
    const saved = localStorage.getItem('watersort_vibration');
    return saved !== null ? saved === 'true' : true;
  });

  // Chances formula: generous chances
  const getMaxChances = (stageNum) => {
    return Math.max(8, 8 + (stageNum - 1) * 4);
  };
  const maxChances = getMaxChances(stage);
  const [chances, setChances] = useState(() => getMaxChances(stage));

  // Themes & Bolt Skins State
  const [activeTheme, setActiveTheme] = useState(() => {
    const saved = localStorage.getItem('watersort_active_theme');
    const valid = GAME_THEMES.map((t) => t.id);
    return saved && valid.includes(saved) ? saved : 'playbg3';
  });
  const [unlockedThemes, setUnlockedThemes] = useState(() => {
    try {
      const saved = localStorage.getItem('watersort_unlocked_themes');
      return normalizeUnlockedList(saved ? JSON.parse(saved) : [], 'playbg3');
    } catch {
      return ['playbg3'];
    }
  });

  const [activeSkin, setActiveSkin] = useState(() => {
    const saved = localStorage.getItem('watersort_active_skin');
    const valid = BOLT_SKINS.map((s) => s.id);
    return saved && valid.includes(saved) ? saved : 'classic';
  });
  const [unlockedSkins, setUnlockedSkins] = useState(() => {
    try {
      const saved = localStorage.getItem('watersort_unlocked_skins');
      return normalizeUnlockedList(saved ? JSON.parse(saved) : [], 'classic');
    } catch {
      return ['classic'];
    }
  });

  const [activeNutSkin, setActiveNutSkin] = useState(() => {
    const saved = localStorage.getItem('watersort_active_nut_skin');
    const valid = NUT_SKINS.map((s) => s.id);
    return saved && valid.includes(saved) ? saved : 'steel_classic';
  });
  const [unlockedNutSkins, setUnlockedNutSkins] = useState(() => {
    try {
      const saved = localStorage.getItem('watersort_unlocked_nut_skins');
      return normalizeUnlockedList(saved ? JSON.parse(saved) : [], 'steel_classic');
    } catch {
      return ['steel_classic'];
    }
  });

  // Flush full progress snapshot immediately (prevents losing purchases on quick refresh)
  const flushProgressSnapshot = useCallback((overrides = {}) => {
    const snapshot = {
      stage,
      highestUnlocked,
      coins,
      stars,
      gems,
      activeTheme,
      unlockedThemes,
      activeSkin,
      unlockedSkins,
      activeNutSkin,
      unlockedNutSkins,
      soundEnabled,
      musicEnabled,
      vibrationEnabled,
      ...overrides,
    };
    localStorage.setItem('watersort_coins', String(snapshot.coins));
    localStorage.setItem('watersort_active_theme', snapshot.activeTheme);
    localStorage.setItem('watersort_unlocked_themes', JSON.stringify(snapshot.unlockedThemes));
    localStorage.setItem('watersort_active_skin', snapshot.activeSkin);
    localStorage.setItem('watersort_unlocked_skins', JSON.stringify(snapshot.unlockedSkins));
    localStorage.setItem('watersort_active_nut_skin', snapshot.activeNutSkin);
    localStorage.setItem('watersort_unlocked_nut_skins', JSON.stringify(snapshot.unlockedNutSkins));
    if (currentUser) {
      authService.saveProgressNow(currentUser.username, snapshot);
    }
  }, [
    currentUser,
    stage,
    highestUnlocked,
    coins,
    stars,
    gems,
    activeTheme,
    unlockedThemes,
    activeSkin,
    unlockedSkins,
    activeNutSkin,
    unlockedNutSkins,
    soundEnabled,
    musicEnabled,
    vibrationEnabled,
  ]);

  const handlePurchaseTheme = (themeId, price) => {
    const cost = Math.max(0, Number(price) || 0);
    if (unlockedThemes.includes(themeId) || coins < cost) return false;
    const nextCoins = coins - cost;
    const nextUnlocked = normalizeUnlockedList([...unlockedThemes, themeId], 'playbg3');
    setCoins(nextCoins);
    setUnlockedThemes(nextUnlocked);
    setActiveTheme(themeId);
    flushProgressSnapshot({ coins: nextCoins, unlockedThemes: nextUnlocked, activeTheme: themeId });
    gameAudio.playPowerUp();
    return true;
  };

  const handleEquipTheme = (themeId) => {
    const themeDef = GAME_THEMES.find((t) => t.id === themeId);
    if (!themeDef || (!unlockedThemes.includes(themeId) && themeDef.price > 0)) return false;
    setActiveTheme(themeId);
    flushProgressSnapshot({ activeTheme: themeId });
    gameAudio.playClick();
    return true;
  };

  const handlePurchaseSkin = (skinId, price) => {
    const cost = Math.max(0, Number(price) || 0);
    if (unlockedSkins.includes(skinId) || coins < cost) return false;
    const nextCoins = coins - cost;
    const nextUnlocked = normalizeUnlockedList([...unlockedSkins, skinId], 'classic');
    setCoins(nextCoins);
    setUnlockedSkins(nextUnlocked);
    setActiveSkin(skinId);
    flushProgressSnapshot({ coins: nextCoins, unlockedSkins: nextUnlocked, activeSkin: skinId });
    gameAudio.playPowerUp();
    return true;
  };

  const handleEquipSkin = (skinId) => {
    const skinDef = BOLT_SKINS.find((s) => s.id === skinId);
    if (!skinDef || (!unlockedSkins.includes(skinId) && skinDef.price > 0)) return false;
    setActiveSkin(skinId);
    flushProgressSnapshot({ activeSkin: skinId });
    gameAudio.playClick();
    return true;
  };

  const handlePurchaseNutSkin = (nutSkinId, price) => {
    const cost = Math.max(0, Number(price) || 0);
    if (unlockedNutSkins.includes(nutSkinId) || coins < cost) return false;
    const nextCoins = coins - cost;
    const nextUnlocked = normalizeUnlockedList([...unlockedNutSkins, nutSkinId], 'steel_classic');
    setCoins(nextCoins);
    setUnlockedNutSkins(nextUnlocked);
    setActiveNutSkin(nutSkinId);
    flushProgressSnapshot({ coins: nextCoins, unlockedNutSkins: nextUnlocked, activeNutSkin: nutSkinId });
    gameAudio.playPowerUp();
    return true;
  };

  const handleEquipNutSkin = (nutSkinId) => {
    const nutDef = NUT_SKINS.find((n) => n.id === nutSkinId);
    if (!nutDef || (!unlockedNutSkins.includes(nutSkinId) && nutDef.price > 0)) return false;
    setActiveNutSkin(nutSkinId);
    flushProgressSnapshot({ activeNutSkin: nutSkinId });
    gameAudio.playClick();
    return true;
  };

  // Modals
  const [isPaused, setIsPaused] = useState(false);
  const [isWinOpen, setIsWinOpen] = useState(false);
  const [isOutOfChancesOpen, setIsOutOfChancesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isLevelsOpen, setIsLevelsOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);

  // Gameplay Bottles State
  const [bottles, setBottles] = useState(() => getStageData(stage).bottles);
  const [history, setHistory] = useState([]);

  // Boosters State
  const [hint, setHint] = useState(null);
  const [extraBottleUsed, setExtraBottleUsed] = useState(false);

  // Nut Color Customizer & Rearrange State (Exclusively for Nuts)
  const [isColorStudioOpen, setIsColorStudioOpen] = useState(false);
  const [activePaintColor, setActivePaintColor] = useState('red');
  const [studioMode, setStudioMode] = useState('paint'); // 'paint' | 'swap'
  const [colorWinBanner, setColorWinBanner] = useState(null); // Win Animation Banner for completed color set

  // Helper: check if a bottle is completed
  const isCompleteBottle = (b) => {
    return b && b.length === 4 && b.every((c) => c === b[0]);
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('watersort_stage', stage.toString());
  }, [stage]);

  useEffect(() => {
    localStorage.setItem('watersort_coins', coins.toString());
  }, [coins]);

  useEffect(() => {
    localStorage.setItem('watersort_stars', stars.toString());
  }, [stars]);

  useEffect(() => {
    localStorage.setItem('watersort_gems', gems.toString());
  }, [gems]);

  // Load stage bottles and assign starting chances
  // Load stage bottles and assign starting chances
  const loadStage = useCallback((stageNum) => {
    const data = getStageData(stageNum);
    setStage(stageNum);
    setBottles(data.bottles.map((b) => [...b]));
    setHistory([]);
    setChances(getMaxChances(stageNum));
    setExtraBottleUsed(false);
    setHint(null);
    setIsWinOpen(false);
    setIsOutOfChancesOpen(false);
    setIsPaused(false);
  }, []);

  // Apply loaded player progress from account
  const applyProgress = useCallback((prog) => {
    if (!prog) return;
    const stg = Math.max(1, Number(prog.stage) || 1);
    const highest = Math.max(1, Number(prog.highestUnlocked) || stg);
    const nextCoins = Math.max(0, Number(prog.coins) || 0);
    const nextStars = Math.max(0, Number(prog.stars) || 0);
    const nextGems = Math.max(0, Number(prog.gems) || 0);

    const nextUnlockedThemes = normalizeUnlockedList(prog.unlockedThemes, 'playbg3');
    const nextActiveTheme = nextUnlockedThemes.includes(prog.activeTheme) ? prog.activeTheme : 'playbg3';
    const nextUnlockedSkins = normalizeUnlockedList(prog.unlockedSkins, 'classic');
    const nextActiveSkin = nextUnlockedSkins.includes(prog.activeSkin) ? prog.activeSkin : 'classic';
    const nextUnlockedNutSkins = normalizeUnlockedList(prog.unlockedNutSkins, 'steel_classic');
    const nextActiveNutSkin = nextUnlockedNutSkins.includes(prog.activeNutSkin) ? prog.activeNutSkin : 'steel_classic';

    setStage(stg);
    setHighestUnlocked(highest);
    setCoins(nextCoins);
    setStars(nextStars);
    setGems(nextGems);
    setUnlockedThemes(nextUnlockedThemes);
    setActiveTheme(nextActiveTheme);
    setUnlockedSkins(nextUnlockedSkins);
    setActiveSkin(nextActiveSkin);
    setUnlockedNutSkins(nextUnlockedNutSkins);
    setActiveNutSkin(nextActiveNutSkin);

    localStorage.setItem('watersort_stage', String(stg));
    localStorage.setItem('watersort_highest_stage', String(highest));
    localStorage.setItem('watersort_coins', String(nextCoins));
    localStorage.setItem('watersort_stars', String(nextStars));
    localStorage.setItem('watersort_gems', String(nextGems));
    localStorage.setItem('watersort_active_theme', nextActiveTheme);
    localStorage.setItem('watersort_unlocked_themes', JSON.stringify(nextUnlockedThemes));
    localStorage.setItem('watersort_active_skin', nextActiveSkin);
    localStorage.setItem('watersort_unlocked_skins', JSON.stringify(nextUnlockedSkins));
    localStorage.setItem('watersort_active_nut_skin', nextActiveNutSkin);
    localStorage.setItem('watersort_unlocked_nut_skins', JSON.stringify(nextUnlockedNutSkins));

    if (prog.soundEnabled !== undefined) setSoundEnabled(Boolean(prog.soundEnabled));
    if (prog.musicEnabled !== undefined) setMusicEnabled(Boolean(prog.musicEnabled));
    if (prog.vibrationEnabled !== undefined) setVibrationEnabled(Boolean(prog.vibrationEnabled));
    loadStage(stg);
  }, [loadStage]);

  // Initial user authentication session check
  useEffect(() => {
    let mounted = true;
    authService
      .getCurrentUser()
      .then((res) => {
        if (!mounted) return;
        if (res && res.user) {
          setCurrentUser(res.user);
          applyProgress(res.progress);
        } else {
          setCurrentUser(null);
        }
        setIsAuthLoading(false);
      })
      .catch(() => {
        if (mounted) {
          setCurrentUser(null);
          setIsAuthLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, [applyProgress]);

  // Auto-save user progress to backend whenever key progress changes
  useEffect(() => {
    if (!currentUser || isAuthLoading) return;
    const saveTimer = setTimeout(() => {
      authService.saveProgress(currentUser.username, {
        stage,
        highestUnlocked,
        coins,
        stars,
        gems,
        activeTheme,
        unlockedThemes,
        activeSkin,
        unlockedSkins,
        activeNutSkin,
        unlockedNutSkins,
        soundEnabled,
        musicEnabled,
        vibrationEnabled,
      });
    }, 400);
    return () => clearTimeout(saveTimer);
  }, [
    currentUser,
    isAuthLoading,
    stage,
    highestUnlocked,
    coins,
    stars,
    gems,
    activeTheme,
    unlockedThemes,
    activeSkin,
    unlockedSkins,
    activeNutSkin,
    unlockedNutSkins,
    soundEnabled,
    musicEnabled,
    vibrationEnabled,
  ]);

  const handleAuthSuccess = (user, progress) => {
    setCurrentUser(user);
    if (progress) {
      applyProgress(progress);
    }
    setIsAuthLoading(false);
  };

  const handleLogout = async () => {
    gameAudio.playClick();
    await authService.logout();
    [
      'watersort_stage',
      'watersort_highest_stage',
      'watersort_coins',
      'watersort_stars',
      'watersort_gems',
      'watersort_active_theme',
      'watersort_unlocked_themes',
      'watersort_active_skin',
      'watersort_unlocked_skins',
      'watersort_active_nut_skin',
      'watersort_unlocked_nut_skins',
    ].forEach((k) => localStorage.removeItem(k));
    setCurrentUser(null);
    setScreen('home');
  };

  // Update bottles and decrement chances on each move
  const handleBottlesChange = useCallback((newBottles) => {
    setHistory((prev) => [...prev, bottles.map((b) => [...b])]);
    setBottles(newBottles);
    setChances((prev) => Math.max(0, prev - 1));
    setHint(null);
  }, [bottles]);

  // Booster: Add Extra Empty Bolt
  const handleAddBottle = () => {
    if (extraBottleUsed) return;
    setHistory((prev) => [...prev, bottles.map((b) => [...b])]);
    setBottles((prev) => [...prev, []]);
    setExtraBottleUsed(true);
    setChances((c) => c + 4);
    gameAudio.playPowerUp();
  };

  // Booster: Undo Move
  const handleUndo = () => {
    if (history.length === 0) return;
    const prevBottles = history[history.length - 1];
    setBottles(prevBottles);
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setChances((c) => c + 1);
    setHint(null);
    gameAudio.playUndo();
  };

  // Restart current stage
  const handleRestart = () => {
    gameAudio.playClick();
    loadStage(stage);
  };

  // Nut Color Studio: Paint individual nut at specific layer
  const handleNutPaint = (tubeIndex, nutIndex, colorId) => {
    if (!bottles[tubeIndex] || bottles[tubeIndex][nutIndex] === undefined) return;
    setHistory((prev) => [...prev, bottles.map((b) => [...b])]);
    const newBottles = bottles.map((col, tIdx) => {
      if (tIdx !== tubeIndex) return col;
      const updated = [...col];
      updated[nutIndex] = colorId;
      return updated;
    });
    setBottles(newBottles);
  };

  // Nut Color Studio: Rearrange / Swap two nuts between any positions
  const handleNutSwap = (first, second) => {
    if (!first || !second) return;
    const b1 = bottles[first.tubeIndex];
    const b2 = bottles[second.tubeIndex];
    if (!b1 || !b2 || b1[first.nutIndex] === undefined || b2[second.nutIndex] === undefined) return;
    setHistory((prev) => [...prev, bottles.map((b) => [...b])]);
    const newBottles = bottles.map((col, tIdx) => {
      if (tIdx === first.tubeIndex && tIdx === second.tubeIndex) {
        const copy = [...col];
        const temp = copy[first.nutIndex];
        copy[first.nutIndex] = copy[second.nutIndex];
        copy[second.nutIndex] = temp;
        return copy;
      }
      if (tIdx === first.tubeIndex) {
        const copy = [...col];
        copy[first.nutIndex] = b2[second.nutIndex];
        return copy;
      }
      if (tIdx === second.tubeIndex) {
        const copy = [...col];
        copy[second.nutIndex] = b1[first.nutIndex];
        return copy;
      }
      return col;
    });
    setBottles(newBottles);
  };

  // Nut Color Studio: Randomize nuts into balanced 4-packs
  const handleRandomizeNuts = () => {
    const paletteIds = CUSTOM_COLOR_PALETTE.map((c) => c.id);
    const totalNuts = bottles.reduce((sum, b) => sum + b.length, 0);
    const numColorsNeeded = Math.ceil(totalNuts / 4);
    const pickedPalette = [...paletteIds].sort(() => Math.random() - 0.5).slice(0, Math.max(numColorsNeeded, 3));
    let nutPool = [];
    for (let c = 0; c < numColorsNeeded; c++) {
      const colId = pickedPalette[c % pickedPalette.length];
      for (let k = 0; k < 4; k++) nutPool.push(colId);
    }
    nutPool = nutPool.slice(0, totalNuts).sort(() => Math.random() - 0.5);

    let poolIdx = 0;
    const randomized = bottles.map((b) => {
      if (b.length === 0) return [];
      const newCol = [];
      for (let i = 0; i < b.length; i++) {
        newCol.push(nutPool[poolIdx++] || paletteIds[0]);
      }
      return newCol;
    });
    setHistory((prev) => [...prev, bottles.map((b) => [...b])]);
    setBottles(randomized);
  };

  // Nut Color Studio: Reset nuts to default stage setup
  const handleResetNuts = () => {
    const stageData = getStageData(stage);
    setHistory((prev) => [...prev, bottles.map((b) => [...b])]);
    setBottles(stageData.bottles.map((b) => [...b]));
  };

  // Color Completed Celebration Handler (Triggered when 4 matching nuts of a color are completed)
  const handleColorCompleted = useCallback(({ tubeIndex, color }) => {
    const def = CUSTOM_COLOR_PALETTE.find((c) => c.id === color) || {
      name: color ? color.toUpperCase() : 'Color',
      hex: '#facc15',
    };
    setColorWinBanner({
      id: Date.now(),
      tubeIndex,
      color,
      colorName: def.name,
      hex: def.hex,
    });
    // Auto-dismiss celebration banner after 2.6s
    setTimeout(() => {
      setColorWinBanner((prev) => (prev?.tubeIndex === tubeIndex ? null : prev));
    }, 2600);
  }, []);

  // Out of chances check
  useEffect(() => {
    if (chances === 0 && !isWinOpen && screen === 'game') {
      const allComplete = bottles.every((b) => b.length === 0 || isCompleteBottle(b));
      if (!allComplete) {
        setIsOutOfChancesOpen(true);
      }
    }
  }, [chances, isWinOpen, bottles, screen]);

  // Stage Win Handler
  const handleWin = useCallback(() => {
    setIsWinOpen(true);
    setIsOutOfChancesOpen(false);
    setStars((s) => s + 3);
    setCoins((c) => c + 50);
    setGems((g) => g + 1);
    setHighestUnlocked((prev) => {
      const nextUnlocked = Math.max(prev, Math.min(100, stage + 1));
      localStorage.setItem('watersort_highest_stage', nextUnlocked.toString());
      return nextUnlocked;
    });
  }, [stage]);

  // Next Stage Handler
  const handleNextStage = () => {
    const nextStage = stage >= 100 ? 1 : stage + 1;
    setStage(nextStage);
    localStorage.setItem('watersort_stage', nextStage.toString());
    setHighestUnlocked((prev) => {
      const updated = Math.max(prev, nextStage);
      localStorage.setItem('watersort_highest_stage', updated.toString());
      return updated;
    });
    loadStage(nextStage);
  };

  // Toggle Sound preferences & sync to localStorage and gameAudio
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('watersort_sound', next.toString());
    gameAudio.setSoundEnabled(next);
  };

  const handleChangeSoundVolume = (vol) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setSoundVolume(clamped);
    gameAudio.setVolume(clamped);
    if (clamped > 0 && !soundEnabled) {
      setSoundEnabled(true);
      localStorage.setItem('watersort_sound', 'true');
      gameAudio.setSoundEnabled(true);
    }
  };

  useEffect(() => {
    gameAudio.setSoundEnabled(soundEnabled);
    gameAudio.musicEnabled = musicEnabled;
  }, [soundEnabled, musicEnabled]);

  const toggleMusic = () => {
    const next = !musicEnabled;
    setMusicEnabled(next);
    localStorage.setItem('watersort_music', next.toString());
    gameAudio.musicEnabled = next;
  };

  const toggleVibration = () => {
    const next = !vibrationEnabled;
    setVibrationEnabled(next);
    localStorage.setItem('watersort_vibration', next.toString());
  };

  const isHome = screen === 'home';
  const currentTheme = GAME_THEMES.find((t) => t.id === activeTheme) || GAME_THEMES[0];
  const gameplayBg = currentTheme?.bgImage || '/playbg3.webp';

  // Initial Auth Loading Spinner
  if (isAuthLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0705] text-[#ffeed2] select-none">
        <img
          src="/nut_sort_navbar_badge.webp"
          alt="Nut Sort Logo"
          className="w-16 h-16 object-contain animate-bounce drop-shadow-[0_0_25px_rgba(251,191,36,0.5)]"
        />
        <div className="mt-4 flex items-center gap-2 text-sm font-black text-amber-300">
          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span>Loading Account...</span>
        </div>
      </div>
    );
  }

  // Mandatory Authentication Check
  if (!currentUser) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-slate-950 flex flex-col justify-between font-sans select-none pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]">
      
      {/* 1. FULL-SCREEN HD GAMEPLAY BACKGROUND (Uncropped & Undistorted) */}
      {!isHome && (
        <img
          src={gameplayBg}
          alt="Ambient Background"
          className="fixed inset-0 w-full h-full object-cover object-center pointer-events-none z-0 filter blur-2xl scale-110 opacity-55 brightness-75"
          style={{ imageRendering: 'high-quality' }}
        />
      )}

      {/* 2. MAIN ACTIVE SCREEN (Home OR Gameplay) */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-between overflow-hidden">
        {isHome ? (
          /* SCREEN 1: HOME / FRONT PAGE (Matching Reference Image 1) */
          <HomeScreen
            onPlay={() => {
              loadStage(stage);
              setScreen('game');
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenShop={() => setIsShopOpen(true)}
            onOpenLevels={() => setIsLevelsOpen(true)}
            onOpenAchievements={() => setIsAchievementsOpen(true)}
            currentStage={stage}
            coins={coins}
            stars={stars}
            playerName={currentUser?.username || 'Mubashar'}
            playerId={currentUser?.id ? String(currentUser.id).slice(0, 6) : '84920'}
            soundEnabled={soundEnabled}
            onToggleSound={toggleSound}
          />
        ) : (
          /* SCREEN 2: GAMEPLAY SCREEN (Responsive & mobile-optimized) */
          <div
            className="relative mx-auto flex flex-col items-center justify-between z-20 overflow-hidden shadow-2xl w-full h-[100dvh]"
            style={{
              maxWidth: 'calc(100dvh * 2752 / 1536)',
            }}
          >
            {/* HD Background Artwork: The Dungeon Table Scene */}
            <img
              src={gameplayBg}
              alt="Gameplay Background Scene"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
              style={{ imageRendering: 'high-quality' }}
              draggable={false}
            />

            {/* Top Header Group: Navbar + In-Game Action Sub-Bar directly below it */}
            <div className="w-full relative z-30 flex flex-col items-center flex-shrink-0">
              <GameNavbar
                isHome={false}
                currentStage={stage}
                chances={chances}
                coins={coins}
                stars={stars}
                playerName={currentUser?.username || 'Mubashar'}
                playerId={currentUser?.id ? String(currentUser.id).slice(0, 6) : '84920'}
                soundEnabled={soundEnabled}
                onToggleSound={toggleSound}
                onRestart={handleRestart}
                onHome={() => setScreen('home')}
                onPause={() => setIsPaused(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onOpenShop={() => setIsShopOpen(true)}
                onOpenLevels={() => setIsLevelsOpen(true)}
              />

              {/* In-Game Action Sub-Bar: Responsive spacing & tap-friendly mobile controls */}
              <div
                className="w-full max-w-4xl mx-auto px-2.5 sm:px-6 pt-1.5 pb-1 flex items-center justify-between gap-1.5 sm:gap-3 flex-shrink-0 flex-nowrap"
              >
                {/* Left: Undo Button */}
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={history.length === 0}
                  className={`min-h-[34px] flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-b from-[#ffeed2] via-[#f7dfb9] to-[#dfbf8d] border-2 border-[#c49b65] shadow-[0_2px_0_#8c6435,0_3px_8px_rgba(0,0,0,0.6)] text-[#5c3a1d] font-black text-xs sm:text-sm group transition-all duration-150 flex-shrink-0 ${
                    history.length > 0 ? 'active:scale-90 active:translate-y-0.5 cursor-pointer opacity-100 hover:scale-105 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(251,191,36,0.3)]' : 'cursor-not-allowed opacity-50'
                  }`}
                  title="Undo Move"
                >
                  <Undo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] group-hover:-rotate-12 transition-transform duration-200" />
                  <span>Undo</span>
                  {history.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center shadow animate-pulse">
                      {history.length}
                    </span>
                  )}
                </button>

                {/* Center: Stage Indicator badge + Nut Colors Studio toggle */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div className="min-h-[32px] flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full bg-[#1c1108]/90 border border-[#c49b65]/60 text-amber-200 text-[11px] sm:text-xs font-black shadow">
                    <span>Stage {stage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      gameAudio.playClick();
                      setIsColorStudioOpen((v) => !v);
                    }}
                    className={`min-h-[32px] flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 rounded-full border shadow transition-all duration-200 cursor-pointer ${
                      isColorStudioOpen
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 border-amber-300 text-slate-950 font-black scale-105 ring-2 ring-amber-400/50'
                        : 'bg-[#1c1108]/90 border-[#c49b65]/60 text-amber-200 hover:text-white hover:border-amber-400 hover:scale-105 font-bold text-[11px] sm:text-xs'
                    }`}
                    title="Customize Nut Colors"
                  >
                    <Palette className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span className="hidden xs:inline">Nuts</span>
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-white/60 shadow"
                      style={{
                        backgroundColor:
                          CUSTOM_COLOR_PALETTE.find((c) => c.id === activePaintColor)?.hex || '#dc2626',
                      }}
                    />
                  </button>
                </div>

                {/* Chances / Lives Indicator: Compact icon between Nuts and Storage/Slots */}
                <div
                  className="flex items-center gap-1 sm:gap-2 px-1.5 xs:px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-gradient-to-b from-[#2a170b]/95 via-[#1a0f07]/95 to-[#120803]/98 border-1.5 sm:border-2 border-[#c49b65] shadow-[0_2px_0_#8c6435,0_3px_8px_rgba(0,0,0,0.6)] text-[10px] sm:text-xs select-none transition-all duration-200 hover:scale-105 hover:border-amber-400/80 flex-shrink-0"
                  title={`Chances Left: ${chances} | Used: ${Math.max(0, maxChances - chances)} (Total: ${maxChances})`}
                >
                  {/* Glowing Heart / Life Icon */}
                  <div className="relative flex items-center justify-center">
                    <Heart
                      className={`w-3 h-3 sm:w-4 sm:h-4 text-rose-500 fill-rose-500 transition-transform ${
                        chances <= 3 ? 'animate-bounce' : 'hover:scale-110'
                      }`}
                    />
                  </div>

                  {/* Remaining vs Used Breakdown */}
                  <div className="flex items-center gap-0.5 sm:gap-1 font-black leading-none">
                    {/* Remaining Chances */}
                    <div className="flex items-baseline gap-0.5">
                      <span
                        className={`text-[11px] sm:text-sm font-black tracking-tight ${
                          chances <= 3 ? 'text-rose-400 animate-pulse' : 'text-[#facc15]'
                        }`}
                      >
                        {chances}
                      </span>
                      <span className="hidden xs:inline text-[8px] sm:text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                        left
                      </span>
                    </div>

                    <span className="hidden sm:inline text-[#c49b65]/60 text-[10px] sm:text-xs">/</span>

                    {/* Used / Lost Chances */}
                    <div className="hidden sm:flex items-baseline gap-0.5 text-[#dfbf8d]">
                      <span className="text-[9.5px] sm:text-xs font-bold text-rose-400/90">
                        -{Math.max(0, maxChances - chances)}
                      </span>
                      <span className="text-[8px] sm:text-[9.5px] text-amber-200/60 font-medium">
                        used
                      </span>
                    </div>
                  </div>

                  {/* Visual Mini Life Gauge Bar */}
                  <div className="hidden md:flex w-10 sm:w-12 h-1.5 sm:h-2 rounded-full bg-[#120803] border border-[#c49b65]/40 overflow-hidden p-[1px]">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        chances / maxChances > 0.5
                           ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                          : chances / maxChances > 0.25
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                          : 'bg-gradient-to-r from-rose-600 to-red-500 animate-pulse'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, (chances / maxChances) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* Right: +1 Add Bolt Button */}
                <button
                  type="button"
                  onClick={handleAddBottle}
                  disabled={extraBottleUsed}
                  className={`min-h-[34px] flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-b from-[#ffeed2] via-[#f7dfb9] to-[#dfbf8d] border-2 border-[#c49b65] shadow-[0_2px_0_#8c6435,0_3px_8px_rgba(0,0,0,0.6)] text-[#5c3a1d] font-black text-xs sm:text-sm group transition-all duration-150 flex-shrink-0 ${
                    !extraBottleUsed ? 'active:scale-90 active:translate-y-0.5 cursor-pointer opacity-100 hover:scale-105 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(251,191,36,0.3)]' : 'cursor-not-allowed opacity-40'
                  }`}
                  title="Add Extra Bolt"
                >
                  <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#5c3a1d] text-[#ffeed2] text-[9px] sm:text-[10px] flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                    +
                  </span>
                  <span><span className="hidden sm:inline">Add </span>Bolt</span>
                </button>
              </div>
            </div>

            {/* COLOR SET COMPLETED WIN ANIMATION BANNER */}
            {colorWinBanner && (
              <div
                key={colorWinBanner.id}
                className="absolute top-16 sm:top-20 inset-x-0 mx-auto w-fit z-50 pointer-events-none flex flex-col items-center animate-in fade-in zoom-in-75 slide-in-from-top-4 duration-300"
              >
                <div className="relative px-5 sm:px-8 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-b from-[#2a170b]/98 via-[#1a0f07]/98 to-[#120803]/98 border-2 sm:border-3 border-[#facc15] shadow-[0_12px_36px_rgba(0,0,0,0.9),0_0_30px_rgba(250,204,21,0.5)] backdrop-blur-md flex items-center gap-3">
                  {/* Glowing animated sparkle jewel */}
                  <div
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg animate-bounce"
                    style={{ backgroundColor: colorWinBanner.hex, boxShadow: `0 0 22px ${colorWinBanner.hex}` }}
                  >
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.5] animate-spin" style={{ animationDuration: '3s' }} />
                  </div>

                  <div className="flex flex-col items-start leading-tight">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase text-[#facc15] drop-shadow">
                        ✨ COLOR COMPLETED! ✨
                      </span>
                    </div>
                    <span className="text-sm sm:text-base font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {colorWinBanner.colorName} Set Solved!
                    </span>
                  </div>

                  {/* 4 Matching Nuts Completed Indicator */}
                  <div className="flex items-center gap-1 ml-2">
                    {[0, 1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-white/80 shadow-md animate-pulse"
                        style={{
                          backgroundColor: colorWinBanner.hex,
                          animationDelay: `${n * 150}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Nut Color Studio Floating Customizer */}
            <ColorStudioBar
              isOpen={isColorStudioOpen}
              onClose={() => setIsColorStudioOpen(false)}
              activeColor={activePaintColor}
              onSelectColor={setActivePaintColor}
              onRandomizeNuts={handleRandomizeNuts}
              onResetNuts={handleResetNuts}
              studioMode={studioMode}
              onToggleStudioMode={setStudioMode}
            />

            {/* True 3D Photorealistic Nut & Bolt Sorting Board (Three.js PBR Engine) */}
            {/* Directly mapped 1:1 to the 2752x1536 artwork container so table positioning is 100% exact */}
            <div className="absolute inset-0 w-full h-full z-20 pointer-events-auto">
              <ThreeGameBoard
                bottles={bottles}
                onBottlesChange={handleBottlesChange}
                onWin={handleWin}
                isPaused={isPaused || isWinOpen || isOutOfChancesOpen}
                hint={hint}
                activeSkin={activeSkin}
                activeNutSkin={activeNutSkin}
                activeTheme={activeTheme}
                currentStage={stage}
                isPaintMode={isColorStudioOpen}
                activePaintColor={activePaintColor}
                studioMode={studioMode}
                onNutPaint={handleNutPaint}
                onNutSwap={handleNutSwap}
                onColorCompleted={handleColorCompleted}
              />
            </div>

            {/* Bottom In-Game Dock: Balanced, Easy-to-Tap Mobile & Desktop Controls */}
            <div
              className="w-full flex items-center justify-between px-6 sm:px-14 pb-[max(env(safe-area-inset-bottom,0px),14px)] flex-shrink-0 z-30 relative pointer-events-none"
            >
              {/* Bottom Left: Trophies Button */}
              <button
                type="button"
                onClick={() => {
                  gameAudio.playClick();
                  setIsAchievementsOpen(true);
                }}
                className="flex flex-col items-center gap-1 group active:scale-95 transition-transform cursor-pointer pointer-events-auto"
                title="Trophies"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-[#ffeed2] via-[#f7dfb9] to-[#dfbf8d] border-2 sm:border-3 border-[#c49b65] shadow-[0_4px_0_#8c6435,0_8px_16px_rgba(0,0,0,0.6)] flex items-center justify-center text-[#5c3a1d] group-hover:scale-105 transition-all">
                  <Trophy className="w-5 h-5 sm:w-7 sm:h-7 stroke-[2.5]" />
                </div>
                <span className="text-[10px] sm:text-xs font-black text-[#ffeed2] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] uppercase tracking-wide">
                  Trophies
                </span>
              </button>

              {/* Bottom Center: Shop Button */}
              <button
                type="button"
                onClick={() => {
                  gameAudio.playClick();
                  setIsShopOpen(true);
                }}
                className="flex flex-col items-center gap-1 group active:scale-95 transition-transform cursor-pointer pointer-events-auto"
                title="Shop"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-[#ffeed2] via-[#f7dfb9] to-[#dfbf8d] border-2 sm:border-3 border-[#c49b65] shadow-[0_4px_0_#8c6435,0_8px_16px_rgba(0,0,0,0.6)] flex items-center justify-center text-[#5c3a1d] group-hover:scale-105 transition-all">
                  <ShoppingBag className="w-5 h-5 sm:w-7 sm:h-7 stroke-[2.5]" />
                </div>
                <span className="text-[10px] sm:text-xs font-black text-[#ffeed2] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] uppercase tracking-wide">
                  Shop
                </span>
              </button>

              {/* Bottom Right: Settings Button */}
              <button
                type="button"
                onClick={() => {
                  gameAudio.playClick();
                  setIsSettingsOpen(true);
                }}
                className="flex flex-col items-center gap-1 group active:scale-95 transition-transform cursor-pointer pointer-events-auto"
                title="Settings"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-[#ffeed2] via-[#f7dfb9] to-[#dfbf8d] border-2 sm:border-3 border-[#c49b65] shadow-[0_4px_0_#8c6435,0_8px_16px_rgba(0,0,0,0.6)] flex items-center justify-center text-[#5c3a1d] group-hover:scale-105 transition-all">
                  <Settings className="w-5 h-5 sm:w-7 sm:h-7 stroke-[2.5]" />
                </div>
                <span className="text-[10px] sm:text-xs font-black text-[#ffeed2] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] uppercase tracking-wide">
                  Settings
                </span>
              </button>
            </div>

          </div>
        )}
      </div>

      {/* 3. LAZY-LOADED MODALS */}
      <React.Suspense fallback={null}>
        {/* SCREEN 3: STAGES & LEVELS SCREEN (Matching Reference Image 3) */}
        {isLevelsOpen && (
          <LevelsModal
            isOpen={isLevelsOpen}
            onClose={() => setIsLevelsOpen(false)}
            currentStage={stage}
            highestUnlocked={highestUnlocked}
            onSelectStage={(lvl) => {
              loadStage(lvl);
              setScreen('game');
            }}
            coins={coins}
            stars={stars}
            gems={gems}
            onHome={() => {
              setIsLevelsOpen(false);
              setScreen('home');
            }}
          />
        )}

        {/* SCREEN 4: CUSTOMIZING SHOP SYSTEM (Matching Reference Image 4) */}
        {isShopOpen && (
          <ShopModal
            isOpen={isShopOpen}
            onClose={() => setIsShopOpen(false)}
            coins={coins}
            stars={stars}
            gems={gems}
            activeTheme={activeTheme}
            unlockedThemes={unlockedThemes}
            onEquipTheme={handleEquipTheme}
            onPurchaseTheme={handlePurchaseTheme}
            activeSkin={activeSkin}
            unlockedSkins={unlockedSkins}
            onEquipSkin={handleEquipSkin}
            onPurchaseSkin={handlePurchaseSkin}
            activeNutSkin={activeNutSkin}
            unlockedNutSkins={unlockedNutSkins}
            onEquipNutSkin={handleEquipNutSkin}
            onPurchaseNutSkin={handlePurchaseNutSkin}
            onHome={() => {
              setIsShopOpen(false);
              setScreen('home');
            }}
          />
        )}

        {/* Settings Modal */}
        {isSettingsOpen && (
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            soundEnabled={soundEnabled}
            onToggleSound={toggleSound}
            soundVolume={soundVolume}
            onChangeSoundVolume={handleChangeSoundVolume}
            musicEnabled={musicEnabled}
            onToggleMusic={toggleMusic}
            vibrationEnabled={vibrationEnabled}
            onToggleVibration={toggleVibration}
            onResetProgress={() => loadStage(1)}
            onLogout={handleLogout}
            playerName={currentUser?.username}
          />
        )}

        {/* Pause Modal */}
        {isPaused && (
          <PauseModal
            isOpen={isPaused}
            onClose={() => setIsPaused(false)}
            onRestart={() => {
              setIsPaused(false);
              handleRestart();
            }}
            onHome={() => {
              setIsPaused(false);
              setScreen('home');
            }}
            soundEnabled={soundEnabled}
            onToggleSound={toggleSound}
          />
        )}

        {/* Win Modal */}
        {isWinOpen && (
          <WinModal
            isOpen={isWinOpen}
            stage={stage}
            onNextStage={handleNextStage}
            onReplay={handleRestart}
            onHome={() => {
              setIsWinOpen(false);
              setScreen('home');
            }}
          />
        )}

        {/* Out of Chances Modal */}
        {isOutOfChancesOpen && (
          <OutOfChancesModal
            isOpen={isOutOfChancesOpen}
            stage={stage}
            canUndo={history.length > 0}
            onRestart={handleRestart}
            onUndo={handleUndo}
            onHome={() => {
              setIsOutOfChancesOpen(false);
              setScreen('home');
            }}
          />
        )}

        {/* Achievements / Trophies Modal */}
        {isAchievementsOpen && (
          <AchievementsModal
            isOpen={isAchievementsOpen}
            onClose={() => setIsAchievementsOpen(false)}
            totalStars={stars}
            currentStage={stage}
            onHome={() => {
              setIsAchievementsOpen(false);
              setScreen('home');
            }}
          />
        )}
      </React.Suspense>

    </div>
  );
}