// Web Audio API Physical-Modeling Metallic Nut & Bolt Sound Engine
// Designed for authentic steel-on-steel twisting, unscrewing, thread-friction,
// and crisp seating clacks without cartoonish sine-wave sweeps or overlap clutter.

const STORAGE_VOLUME_KEY = 'watersort_sound_volume';

class GameAudio {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.compressor = null;
    this.noiseBuffer = null;
    this.soundEnabled = true;
    this.musicEnabled = true;
    this.volume = this._loadInitialVolume();
    this.lastPlayedAt = new Map();
    this.activeFrictionStops = new Set();
    this._unlocked = false;

    if (typeof window !== 'undefined') {
      const unlockHandler = () => {
        this.unlock();
      };
      window.addEventListener('pointerdown', unlockHandler, { capture: true, passive: true });
      window.addEventListener('touchstart', unlockHandler, { capture: true, passive: true });
      window.addEventListener('keydown', unlockHandler, { capture: true, passive: true });
    }
  }

  _loadInitialVolume() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = parseFloat(localStorage.getItem(STORAGE_VOLUME_KEY));
        if (!Number.isNaN(saved) && saved >= 0 && saved <= 1) {
          return saved;
        }
      }
    } catch {
      // Ignore storage access errors in restricted modes
    }
    return 0.85;
  }

  init() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Master dynamics chain keeps mobile & desktop output clean, balanced, and non-clipping
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-16, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(12, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(5, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.12, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this._applyMasterGain();

      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (!this.noiseBuffer && this.ctx) {
      // Textured steel-friction noise buffer (subtle micro-grit envelope baked slightly)
      const sampleRate = this.ctx.sampleRate;
      const length = Math.floor(sampleRate * 0.8);
      const buffer = this.ctx.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);
      let prev = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        // High-frequency metallic grit emphasis (differentiated noise blend)
        data[i] = 0.72 * white - 0.28 * prev;
        prev = white;
      }
      this.noiseBuffer = buffer;
    }
  }

  unlock() {
    this.init();
    if (!this.ctx || this._unlocked) return;
    try {
      const buffer = this.ctx.createBuffer(1, 1, this.ctx.sampleRate);
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      const silent = this.ctx.createGain();
      silent.gain.setValueAtTime(0, this.ctx.currentTime);
      src.connect(silent);
      silent.connect(this.ctx.destination);
      src.start(0);
      this._unlocked = true;
    } catch {
      // Safe fallback; resume() handles subsequent calls
    }
  }

  _applyMasterGain() {
    if (!this.ctx || !this.masterGain) return;
    const effective = this.soundEnabled ? Math.max(0, Math.min(1, this.volume)) : 0;
    this.masterGain.gain.setTargetAtTime(effective, this.ctx.currentTime, 0.015);
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = Boolean(enabled);
    if (!this.soundEnabled) {
      this._duckActiveFriction();
    }
    this._applyMasterGain();
  }

  setVolume(vol) {
    const clamped = Math.max(0, Math.min(1, Number(vol) || 0));
    this.volume = clamped;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_VOLUME_KEY, clamped.toFixed(2));
      }
    } catch {
      // Ignore storage errors
    }
    this._applyMasterGain();
  }

  getVolume() {
    return this.volume;
  }

  _canPlay(key, cooldownMs) {
    if (!this.soundEnabled || this.volume <= 0.005) return false;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const prev = this.lastPlayedAt.get(key) || 0;
    if (now - prev < cooldownMs) return false;
    this.lastPlayedAt.set(key, now);
    return true;
  }

  _getOut() {
    return this.masterGain || this.ctx?.destination;
  }

  _duckActiveFriction() {
    if (!this.ctx || this.activeFrictionStops.size === 0) return;
    const t = this.ctx.currentTime;
    this.activeFrictionStops.forEach((stopFn) => stopFn(t));
    this.activeFrictionStops.clear();
  }

  // Modal damped steel partial pair (non-harmonic steel ratios prevent cartoon beeps)
  _playSteelModal(time, { f1 = 1920, f2 = 3480, decay = 0.045, volume = 0.09 } = {}) {
    if (!this.ctx) return;
    const out = this._getOut();
    if (!out) return;

    [
      { f: f1, v: volume, d: decay },
      { f: f2, v: volume * 0.55, d: decay * 0.72 },
    ].forEach(({ f, v, d }) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, time);
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(v, time + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + d);
      osc.connect(gain);
      gain.connect(out);
      osc.start(time);
      osc.stop(time + d + 0.01);
    });
  }

  // Dual-bandpass metallic friction burst (real thread-on-thread metal scraping texture)
  _playMetalFriction(
    time,
    {
      duration = 0.16,
      startFreqA = 1850,
      endFreqA = 2500,
      startFreqB = 3400,
      endFreqB = 4350,
      qA = 6.2,
      qB = 7.5,
      volume = 0.11,
      trackAsSpin = false,
    } = {}
  ) {
    if (!this.ctx || !this.noiseBuffer) return;
    const out = this._getOut();
    if (!out) return;

    if (trackAsSpin) {
      this._duckActiveFriction();
    }

    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;

    const bpA = this.ctx.createBiquadFilter();
    bpA.type = 'bandpass';
    bpA.Q.setValueAtTime(qA, time);
    bpA.frequency.setValueAtTime(startFreqA, time);
    bpA.frequency.exponentialRampToValueAtTime(Math.max(200, endFreqA), time + duration);

    const bpB = this.ctx.createBiquadFilter();
    bpB.type = 'bandpass';
    bpB.Q.setValueAtTime(qB, time);
    bpB.frequency.setValueAtTime(startFreqB, time);
    bpB.frequency.exponentialRampToValueAtTime(Math.max(300, endFreqB), time + duration);

    const gA = this.ctx.createGain();
    gA.gain.setValueAtTime(volume, time);

    const gB = this.ctx.createGain();
    gB.gain.setValueAtTime(volume * 0.65, time);

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.0001, time);
    env.gain.linearRampToValueAtTime(1.0, time + Math.min(0.02, duration * 0.2));
    env.gain.setValueAtTime(0.9, time + duration * 0.65);
    env.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    src.connect(bpA);
    src.connect(bpB);
    bpA.connect(gA);
    bpB.connect(gB);
    gA.connect(env);
    gB.connect(env);
    env.connect(out);

    src.start(time);
    src.stop(time + duration + 0.02);

    if (trackAsSpin) {
      const stopNow = (nowTime) => {
        try {
          env.gain.cancelScheduledValues(nowTime);
          env.gain.setValueAtTime(Math.max(0.0001, env.gain.value), nowTime);
          env.gain.exponentialRampToValueAtTime(0.0001, nowTime + 0.016);
          src.stop(nowTime + 0.02);
        } catch {
          // Node may already have stopped
        }
      };
      this.activeFrictionStops.add(stopNow);
      src.onended = () => {
        this.activeFrictionStops.delete(stopNow);
      };
    }
  }

  // Solid damped low mechanical body thump (nut/collar physical impact)
  _playSolidBody(time, { startFreq = 165, endFreq = 74, decay = 0.048, volume = 0.14 } = {}) {
    if (!this.ctx) return;
    const out = this._getOut();
    if (!out) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(Math.max(30, endFreq), time + decay);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + decay);
    osc.connect(gain);
    gain.connect(out);
    osc.start(time);
    osc.stop(time + decay + 0.01);
  }

  // 1. Nut Initial Breakaway / Open Selection:
  // Realistic metal break-loose micro-click + subtle short half-turn thread twist
  playSelect() {
    if (!this._canPlay('select', 55)) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Torque breakaway snap on steel threads
    this._playSteelModal(t, { f1: 2150, f2: 3920, decay: 0.032, volume: 0.08 });
    this._playMetalFriction(t, {
      duration: 0.022,
      startFreqA: 2600,
      endFreqA: 3100,
      startFreqB: 4500,
      endFreqB: 5200,
      qA: 4.5,
      qB: 5.0,
      volume: 0.11,
    });
    // Short upward unscrew lift twist (~85ms) matching selectedLift spring animation
    this._playMetalFriction(t + 0.012, {
      duration: 0.09,
      startFreqA: 1750,
      endFreqA: 2350,
      startFreqB: 3250,
      endFreqB: 4100,
      qA: 6.5,
      qB: 7.5,
      volume: 0.09,
      trackAsSpin: true,
    });
  }

  // 2. Nut Deselect (lowering back down onto same bolt):
  playDeselect() {
    if (!this._canPlay('deselect', 55)) return;
    this.init();
    if (!this.ctx) return;

    this._duckActiveFriction();
    const t = this.ctx.currentTime;
    this._playSolidBody(t, { startFreq: 175, endFreq: 85, decay: 0.042, volume: 0.11 });
    this._playSteelModal(t, { f1: 1420, f2: 2740, decay: 0.032, volume: 0.055 });
  }

  // 3a. Phase 1 Start: Continuous metallic thread unscrewing texture (~220ms)
  playUnscrewStart(durationSec = 0.24) {
    if (!this._canPlay('unscrewStart', 75)) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    this._playMetalFriction(t, {
      duration: Math.max(0.14, Math.min(0.32, durationSec)),
      startFreqA: 1720,
      endFreqA: 2580,
      startFreqB: 3150,
      endFreqB: 4450,
      qA: 6.2,
      qB: 7.4,
      volume: 0.105,
      trackAsSpin: true,
    });
  }

  // 3b. Frame-Synchronized Helical Thread Ridge Tick (called at exact rotation increments)
  playThreadClick(progress = 0.5, direction = 'up') {
    if (!this._canPlay('tick', 24)) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const p = Math.max(0, Math.min(1, progress));
    const baseF = direction === 'up' ? 1980 + p * 680 : 2540 - p * 580;

    this._playSteelModal(t, {
      f1: baseF,
      f2: baseF * 1.78,
      decay: 0.02,
      volume: 0.042,
    });
    this._playMetalFriction(t, {
      duration: 0.016,
      startFreqA: baseF * 1.15,
      endFreqA: baseF * 1.25,
      startFreqB: baseF * 2.0,
      endFreqB: baseF * 2.1,
      qA: 5.5,
      qB: 6.0,
      volume: 0.068,
    });
  }

  // 3c. Nut Clears Bolt Top Threads (subtle crisp unthread release pop)
  playUnscrewRelease() {
    if (!this._canPlay('release', 65)) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    this._playSteelModal(t, { f1: 2480, f2: 4160, decay: 0.04, volume: 0.075 });
    this._playMetalFriction(t, {
      duration: 0.028,
      startFreqA: 2900,
      endFreqA: 3600,
      startFreqB: 4600,
      endFreqB: 5400,
      qA: 4.0,
      qB: 4.5,
      volume: 0.075,
    });
  }

  // 4a. Phase 3 Start: Clockwise re-threading onto destination bolt (~220ms)
  playScrewDownStart(durationSec = 0.24) {
    if (!this._canPlay('screwStart', 75)) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    this._playMetalFriction(t, {
      duration: Math.max(0.14, Math.min(0.3, durationSec)),
      startFreqA: 2420,
      endFreqA: 1580,
      startFreqB: 4200,
      endFreqB: 2850,
      qA: 6.4,
      qB: 7.4,
      volume: 0.095,
      trackAsSpin: true,
    });
  }

  // 4b. Phase 4: Solid Steel Nut-on-Nut / Collar Seat Clack
  playLand() {
    if (!this._canPlay('land', 55)) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    this._playSolidBody(t, { startFreq: 168, endFreq: 72, decay: 0.052, volume: 0.16 });
    this._playSteelModal(t, { f1: 1460, f2: 2790, decay: 0.055, volume: 0.095 });
    this._playMetalFriction(t, {
      duration: 0.015,
      startFreqA: 2600,
      endFreqA: 2100,
      startFreqB: 4200,
      endFreqB: 3500,
      qA: 3.5,
      qB: 4.0,
      volume: 0.1,
    });
  }

  // Fallback compatibility alias if called elsewhere
  playPour(durationSec = 0.82) {
    this.playUnscrewStart(durationSec * 0.3);
  }

  // Completed 4-Nut Bolt: Tightening lock click + subtle warm chime arpeggio
  playComplete() {
    if (!this._canPlay('complete', 120)) return;
    this.init();
    if (!this.ctx) return;

    const out = this._getOut();
    if (!out) return;
    const t = this.ctx.currentTime;

    this._playSteelModal(t, { f1: 1760, f2: 3320, decay: 0.05, volume: 0.09 });
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const noteTime = t + 0.03 + idx * 0.065;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);
      gain.gain.setValueAtTime(0.0001, noteTime);
      gain.gain.linearRampToValueAtTime(0.14, noteTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.32);
      osc.connect(gain);
      gain.connect(out);
      osc.start(noteTime);
      osc.stop(noteTime + 0.34);
    });
  }

  // Stage Cleared Celebration
  playWin() {
    if (!this._canPlay('win', 200)) return;
    this.init();
    if (!this.ctx) return;

    const out = this._getOut();
    if (!out) return;
    const t = this.ctx.currentTime;

    const sequence = [
      { f: 523.25, offset: 0.0, dur: 0.22 },
      { f: 659.25, offset: 0.09, dur: 0.22 },
      { f: 783.99, offset: 0.18, dur: 0.22 },
      { f: 1046.5, offset: 0.28, dur: 0.5 },
      { f: 1318.5, offset: 0.34, dur: 0.48 },
    ];
    sequence.forEach(({ f, offset, dur }) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t + offset);
      gain.gain.setValueAtTime(0.0001, t + offset);
      gain.gain.linearRampToValueAtTime(0.15, t + offset + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + offset + dur);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t + offset);
      osc.stop(t + offset + dur + 0.02);
    });
  }

  // Subtle Tactile UI Click
  playClick() {
    if (!this._canPlay('click', 45)) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    this._playSolidBody(t, { startFreq: 420, endFreq: 210, decay: 0.024, volume: 0.09 });
    this._playSteelModal(t, { f1: 1620, f2: 2940, decay: 0.02, volume: 0.035 });
  }

  // Undo Reverse Rewind
  playUndo() {
    if (!this._canPlay('undo', 75)) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    this._playMetalFriction(t, {
      duration: 0.11,
      startFreqA: 2450,
      endFreqA: 1650,
      startFreqB: 4100,
      endFreqB: 2800,
      volume: 0.085,
      trackAsSpin: true,
    });
  }

  // Power-Up / Add Bolt / Shop Upgrade
  playPowerUp() {
    if (!this._canPlay('powerup', 90)) return;
    this.init();
    if (!this.ctx) return;

    const out = this._getOut();
    if (!out) return;
    const t = this.ctx.currentTime;

    this._playSteelModal(t, { f1: 1850, f2: 3340, decay: 0.04, volume: 0.075 });
    [987.77, 1318.5].forEach((freq, i) => {
      const st = t + 0.03 + i * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, st);
      gain.gain.setValueAtTime(0.0001, st);
      gain.gain.linearRampToValueAtTime(0.11, st + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, st + 0.24);
      osc.connect(gain);
      gain.connect(out);
      osc.start(st);
      osc.stop(st + 0.26);
    });
  }

  playHint() {
    this.playPowerUp();
  }

  playAddBottle() {
    this.playPowerUp();
  }

  // Kept silent by default for invalid board taps so unscrewing audio never plays on invalid positions
  playError() {}
}

export const gameAudio = new GameAudio();
