import React, { useEffect, useRef } from 'react';
import { Application, Graphics, Container, Texture, Assets } from 'pixi.js';
import { CAPACITY } from '../data/levelStages';
import { gameAudio } from '../utils/gameAudio';
import {
  createNutCanvas,
  createNutFrames,
  createShaftCanvas,
  createBaseCanvas,
  NUT_COLOR_PALETTE,
} from '../utils/proceduralHardware';

// Modular 3D Nut & Bolt Sorting Engine
import { ScrewMotionController } from '../gameplay/ScrewMotionController';
import { NutRotationController } from '../gameplay/NutRotationController';
import { NutStackManager } from '../gameplay/NutStackManager';
import { BoltRenderer } from '../gameplay/BoltRenderer';
import { NutRenderer } from '../gameplay/NutRenderer';
import { NutTransferController } from '../gameplay/NutTransferController';

// Color key to hardware texture path mapping
const HARDWARE_TEXTURES = {
  red: '/hardware/nut_red.png',
  blue: '/hardware/nut_blue.png',
  green: '/hardware/nut_green.png',
  yellow: '/hardware/nut_yellow.png',
  purple: '/hardware/nut_purple.png',
  orange: '/hardware/nut_orange.png',
  pink: '/hardware/nut_pink.png',
  cyan: '/hardware/nut_cyan.png',
  lime: '/hardware/nut_black.png', // gunmetal obsidian
  teal: '/hardware/nut_white.png', // polished silver
  wood: '/hardware/nut_wood.png', // carved oak
  base: '/hardware/bolt_base.png',
  shaft: '/hardware/bolt_shaft.png',
};

export default function PixiGameBoard({
  bottles,
  onBottlesChange,
  onWin,
  isPaused = false,
  hint = null,
  activeSkin = 'classic',
  activeNutSkin = 'steel_classic',
}) {
  const containerRef = useRef(null);
  const appRef = useRef(null);

  // Keep latest callbacks/props in ref so Pixi ticker always accesses fresh state
  const propsRef = useRef({ onBottlesChange, onWin, isPaused, hint, activeSkin, activeNutSkin });
  useEffect(() => {
    propsRef.current = { onBottlesChange, onWin, isPaused, hint, activeSkin, activeNutSkin };
  });

  const stateRef = useRef({
    bottles: bottles.map((b) => [...b]),
    selected: null,
    isAnimating: false,
    animTime: 0,
    moveData: null,
    sparkleParticles: [],
    selectedLift: {},
    time: 0,
  });

  // Sync state bottles when external bottles prop updates
  useEffect(() => {
    stateRef.current.bottles = bottles.map((b) => [...b]);
    stateRef.current.selected = null;
    stateRef.current.isAnimating = false;
    stateRef.current.moveData = null;
  }, [bottles]);

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) return;

    let app = null;
    let isDestroyed = false;
    let handleResize = null;
    let resizeObserver = null;

    async function initPixi() {
      app = new Application();
      await app.init({
        width: parent.clientWidth || 360,
        height: parent.clientHeight || 520,
        backgroundAlpha: 0,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        antialias: true,
      });

      if (isDestroyed) {
        app.destroy(true, { children: true });
        return;
      }

      appRef.current = app;
      parent.appendChild(app.canvas);

      // 1. Instant, synchronous high-fidelity procedural 3D hardware textures
      const textures = {
        shaft: Texture.from(createShaftCanvas()),
        base: Texture.from(createBaseCanvas()),
        nutFrames: {},
      };
      for (const colorKey of Object.keys(NUT_COLOR_PALETTE)) {
        textures[colorKey] = Texture.from(createNutCanvas(colorKey));
        const frames = createNutFrames(colorKey, 36);
        textures.nutFrames[colorKey] = frames.map((c) => Texture.from(c));
      }

      // 3. Initialize Modular 3D Gameplay Controllers
      const screwController = new ScrewMotionController(20);
      const rotationController = new NutRotationController(screwController);
      const stackManager = new NutStackManager();
      const boltRenderer = new BoltRenderer();
      const nutRenderer = new NutRenderer();
      const transferController = new NutTransferController(screwController, rotationController, stackManager);

      // Layer Containers in strict depth order (Bolts underneath Nuts so bolts are visible through center holes!)
      const mainStage = new Container();
      app.stage.addChild(mainStage);

      const shadowsLayer = new Graphics();
      const boltsLayer = new Container();
      const nutsLayer = new Container();
      const movingLayer = new Container();
      const uiLayer = new Graphics();
      const effectsLayer = new Graphics();

      mainStage.addChild(shadowsLayer);
      mainStage.addChild(boltsLayer);
      mainStage.addChild(nutsLayer);
      mainStage.addChild(movingLayer);
      mainStage.addChild(uiLayer);
      mainStage.addChild(effectsLayer);

      // Pointer click handler
      const handlePointerDown = (e) => {
        const state = stateRef.current;
        if (state.isAnimating || propsRef.current.isPaused) return;

        const rect = app.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const layout = stackManager.getLayout(state.bottles.length, app.screen.width, app.screen.height);

        for (let i = 0; i < layout.tubes.length; i++) {
          const t = layout.tubes[i];
          const hitPadX = t.nutW * 0.75;
          if (
            clickX >= t.x - hitPadX &&
            clickX <= t.x + hitPadX &&
            clickY >= t.y - 30 &&
            clickY <= t.y + t.shaftH + 30
          ) {
            handleRodClick(i);
            break;
          }
        }
      };

      app.canvas.addEventListener('pointerdown', handlePointerDown);

      // Rod Selection / Nut Slotting Trigger
      function handleRodClick(index) {
        const state = stateRef.current;
        const b = state.bottles;

        // Case 1: Nothing selected yet
        if (state.selected === null) {
          if (b[index].length === 0) return;
          if (isComplete(b[index])) return; // completed bolt is locked
          state.selected = index;
          gameAudio.playSelect();
          return;
        }

        // Case 2: Deselect clicked rod (screws back down)
        if (state.selected === index) {
          state.selected = null;
          gameAudio.playClick();
          return;
        }

        // Case 3: Clicked destination rod
        const fromIdx = state.selected;
        const toIdx = index;
        const fromBottle = b[fromIdx];
        const toBottle = b[toIdx];

        if (!canSlot(fromBottle, toBottle)) {
          if (toBottle.length > 0 && !isComplete(toBottle)) {
            state.selected = toIdx;
            gameAudio.playSelect();
          } else {
            state.selected = null;
            gameAudio.playClick();
          }
          return;
        }

        startSlotAnimation(fromIdx, toIdx);
      }

      function canSlot(fromB, toB) {
        if (!fromB || fromB.length === 0) return false;
        if (!toB || toB.length >= CAPACITY) return false;
        return true;
      }

      function isComplete(bottle) {
        if (!bottle || bottle.length !== CAPACITY) return false;
        return bottle.every((c) => c === bottle[0]);
      }

      function startSlotAnimation(fromIdx, toIdx) {
        const state = stateRef.current;
        const fromBottle = state.bottles[fromIdx];
        const toBottle = state.bottles[toIdx];
        const topColor = fromBottle[fromBottle.length - 1];

        let count = 0;
        for (let i = fromBottle.length - 1; i >= 0; i--) {
          if (fromBottle[i] === topColor) count++;
          else break;
        }
        const space = CAPACITY - toBottle.length;
        const amount = Math.min(count, space);

        state.isAnimating = true;
        state.animTime = 0;
        state.moveData = {
          fromIdx,
          toIdx,
          color: topColor,
          amount,
        };

        gameAudio.playPour();
      }

      function checkWin(allBottles) {
        for (const b of allBottles) {
          if (b.length === 0) continue;
          if (b.length !== CAPACITY) return false;
          if (!b.every((c) => c === b[0])) return false;
        }
        return true;
      }

      // Master Ticker / Game Loop
      app.ticker.add((ticker) => {
        const deltaSec = Math.min(0.05, ticker.deltaMS / 1000);
        const screenW = app.screen.width;
        const screenH = app.screen.height;
        const state = stateRef.current;
        state.time += deltaSec;

        // 1. Calculate responsive layout via NutStackManager
        const layout = stackManager.getLayout(state.bottles.length, screenW, screenH);
        // Synchronize thread pitch to current nut height: P = stepY
        screwController.setPitch(layout.stepY || 26);

        // Clear dynamic graphic layers
        shadowsLayer.clear();
        uiLayer.clear();
        effectsLayer.clear();

        // 2. Smooth Selection Lift Physics (Helical unscrewing upward)
        const LIFT_PX = Math.max(24, layout.nutH * 1.15);
        for (let i = 0; i < layout.tubes.length; i++) {
          const isTargetSelected = state.selected === i && !state.isAnimating;
          const targetLift = isTargetSelected ? LIFT_PX : 0;
          const currentLift = state.selectedLift[i] || 0;
          const speed = Math.min(1, 16 * deltaSec);
          state.selectedLift[i] = currentLift + (targetLift - currentLift) * speed;
        }

        // 3. Render Threaded Screw Bolts & Pedestal Bases via BoltRenderer
        boltRenderer.render(
          boltsLayer,
          shadowsLayer,
          uiLayer,
          effectsLayer,
          layout.tubes,
          state,
          textures,
          propsRef.current.activeSkin,
          propsRef.current.hint
        );

        // 4. Render Resting Stacked Nuts via NutRenderer (Thread-phase aligned, bolt visible through hole)
        nutRenderer.renderRestingNuts(
          nutsLayer,
          effectsLayer,
          layout.tubes,
          state,
          textures,
          stackManager,
          rotationController,
          propsRef.current.activeNutSkin
        );

        // 5. Update & Render Active Nut Transfer via NutTransferController
        const motionData = transferController.update(
          state,
          deltaSec,
          layout,
          (newBottles) => {
            propsRef.current.onBottlesChange(newBottles);
            if (checkWin(newBottles)) {
              setTimeout(() => {
                gameAudio.playWin();
                propsRef.current.onWin();
              }, 250);
            }
          }
        );

        nutRenderer.renderMovingNut(
          movingLayer,
          shadowsLayer,
          effectsLayer,
          motionData,
          textures,
          propsRef.current.activeNutSkin,
          state.time
        );

        // 6. Update & Render Sparkle Particles
        for (let i = state.sparkleParticles.length - 1; i >= 0; i--) {
          const sp = state.sparkleParticles[i];
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.vy += 0.18; // gravity
          sp.vx *= 0.97;
          sp.alpha -= sp.decay;

          if (sp.alpha <= 0) {
            state.sparkleParticles.splice(i, 1);
            continue;
          }

          effectsLayer.circle(sp.x, sp.y, sp.radius);
          effectsLayer.fill({ color: sp.color, alpha: sp.alpha });
        }
      });

      // Responsive Resize Listener
      handleResize = () => {
        if (!app || !parent || !app.renderer) return;
        const w = parent.clientWidth || 360;
        const h = parent.clientHeight || 520;
        app.renderer.resize(w, h);
      };
      window.addEventListener('resize', handleResize);

      if (window.ResizeObserver) {
        resizeObserver = new ResizeObserver(() => {
          handleResize();
        });
        resizeObserver.observe(parent);
      }
    }

    initPixi();

    return () => {
      isDestroyed = true;
      if (handleResize) {
        window.removeEventListener('resize', handleResize);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center select-none touch-manipulation cursor-pointer"
    />
  );
}
