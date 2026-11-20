import React, { useEffect, useRef } from 'react';
import { Application, Graphics, Container } from 'pixi.js';
import { TUBE_COLORS } from '../data/colors';
import { CAPACITY } from '../data/levelStages';
import { gameAudio } from '../utils/gameAudio';

export default function PixiGameBoard({
  bottles,
  onBottlesChange,
  onWin,
  isPaused = false,
  hint = null,
  activeSkin = 'classic',
}) {
  const containerRef = useRef(null);
  const appRef = useRef(null);

  // Keep latest callbacks/props in ref so Pixi ticker always accesses fresh state
  const propsRef = useRef({ onBottlesChange, onWin, isPaused, hint, activeSkin });
  useEffect(() => {
    propsRef.current = { onBottlesChange, onWin, isPaused, hint, activeSkin };
  });

  const stateRef = useRef({
    bottles: bottles.map((b) => [...b]),
    selected: null,
    isAnimating: false,
    animTime: 0,
    animDuration: 1.25, // seconds for smooth, natural pouring
    pourData: null,
    splashParticles: [],
    sparkleParticles: [],
    selectedLift: {}, // smooth lift per tube
    time: 0,
  });

  // Sync state bottles when external bottles prop updates
  useEffect(() => {
    stateRef.current.bottles = bottles.map((b) => [...b]);
    stateRef.current.selected = null;
    stateRef.current.isAnimating = false;
    stateRef.current.pourData = null;
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

      const mainStage = new Container();
      app.stage.addChild(mainStage);

      // Dedicated render layers
      const shadowsLayer = new Graphics();
      const tubesLayer = new Container();
      const streamLayer = new Graphics();
      const splashLayer = new Graphics();
      const uiLayer = new Graphics();

      mainStage.addChild(shadowsLayer);
      mainStage.addChild(tubesLayer);
      mainStage.addChild(streamLayer);
      mainStage.addChild(splashLayer);
      mainStage.addChild(uiLayer);

      // Pointer click handler
      const handlePointerDown = (e) => {
        const state = stateRef.current;
        if (state.isAnimating || propsRef.current.isPaused) return;

        const rect = app.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const layout = getLayout(state.bottles.length, app.screen.width, app.screen.height);

        for (let i = 0; i < layout.tubes.length; i++) {
          const t = layout.tubes[i];
          if (
            clickX >= t.x - t.width / 2 - 16 &&
            clickX <= t.x + t.width / 2 + 16 &&
            clickY >= t.y - 15 &&
            clickY <= t.y + t.height + 25
          ) {
            handleTubeClick(i);
            break;
          }
        }
      };

      app.canvas.addEventListener('pointerdown', handlePointerDown);

      // Responsive, Centered & Scaled Grid Layout
      function getLayout(numTubes, screenW, screenH) {
        const isTwoRows = numTubes > 4;
        const row1Count = isTwoRows ? Math.ceil(numTubes / 2) : numTubes;
        const row2Count = isTwoRows ? numTubes - row1Count : 0;
        const maxCols = Math.max(row1Count, row2Count, 3);

        // Clearance zones ensuring tubes and hover pouring NEVER touch the top HUD or bottom controls
        const topClearance = Math.max(38, Math.min(65, Math.round(screenH * 0.09)));
        const bottomClearance = Math.max(22, Math.min(45, Math.round(screenH * 0.07)));
        const availableH = Math.max(160, screenH - topClearance - bottomClearance);

        let tubeW = 36;
        let tubeH = 120;
        let rowGap = 20;
        let r1Y = topClearance;
        let r2Y = 0;
        let colSpacing = 68;

        if (isTwoRows) {
          // Horizontal fit across columns
          colSpacing = Math.min(84, Math.max(34, Math.floor((screenW - 20) / maxCols)));
          tubeW = Math.min(42, Math.max(22, Math.floor(colSpacing * 0.58)));

          // Vertical fit for two rows
          rowGap = Math.max(16, Math.min(26, Math.round(availableH * 0.06)));
          const maxTubeH = Math.floor((availableH - rowGap) / 2);
          tubeH = Math.min(Math.round(tubeW * 3.3), maxTubeH, 140);

          // Maintain 3.3:1 tube aspect ratio if clamped by height
          if (tubeH === maxTubeH && tubeH < Math.round(tubeW * 3.3)) {
            tubeW = Math.max(20, Math.round(tubeH / 3.3));
          }

          const totalGridH = 2 * tubeH + rowGap;
          // Vertically centered inside available space with guaranteed top headroom
          r1Y = topClearance + Math.max(0, Math.floor((availableH - totalGridH) / 2));
          r2Y = r1Y + tubeH + rowGap;
        } else {
          // Single row layout (1-4 tubes)
          colSpacing = Math.min(95, Math.max(48, Math.floor((screenW - 32) / (numTubes + 0.5))));
          tubeW = Math.min(48, Math.max(28, Math.floor(colSpacing * 0.55)));
          tubeH = Math.min(Math.round(tubeW * 3.3), Math.round(availableH * 0.72), 150);

          const totalGridH = tubeH;
          r1Y = topClearance + Math.max(0, Math.floor((availableH - totalGridH) / 2));
        }

        const tubes = [];

        // Row 1
        const r1StartX = screenW / 2 - ((row1Count - 1) * colSpacing) / 2;
        for (let i = 0; i < row1Count; i++) {
          tubes.push({
            index: i,
            x: Math.round(r1StartX + i * colSpacing),
            y: Math.round(r1Y),
            width: tubeW,
            height: tubeH,
          });
        }

        // Row 2
        if (isTwoRows) {
          const r2StartX = screenW / 2 - ((row2Count - 1) * colSpacing) / 2;
          for (let j = 0; j < row2Count; j++) {
            tubes.push({
              index: row1Count + j,
              x: Math.round(r2StartX + j * colSpacing),
              y: Math.round(r2Y),
              width: tubeW,
              height: tubeH,
            });
          }
        }

        return { tubes, tubeW, tubeH };
      }

      // Smooth Easing Functions
      function easeInOutCubic(x) {
        return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
      }

      function easeOutQuad(x) {
        return 1 - (1 - x) * (1 - x);
      }

      // Tube Selection / Pour Trigger
      function handleTubeClick(index) {
        const state = stateRef.current;
        const b = state.bottles;

        // Case 1: Nothing selected yet
        if (state.selected === null) {
          if (b[index].length === 0) return;
          if (isComplete(b[index])) return; // completed tube is locked
          state.selected = index;
          gameAudio.playSelect();
          return;
        }

        // Case 2: Deselect clicked tube
        if (state.selected === index) {
          state.selected = null;
          gameAudio.playClick();
          return;
        }

        // Case 3: Clicked target tube
        const fromIdx = state.selected;
        const toIdx = index;
        const fromBottle = b[fromIdx];
        const toBottle = b[toIdx];

        if (!canPour(fromBottle, toBottle)) {
          if (toBottle.length >= CAPACITY && !isComplete(toBottle)) {
            state.selected = toIdx;
            gameAudio.playSelect();
          } else {
            state.selected = null;
            gameAudio.playClick();
          }
          return;
        }

        startPourAnimation(fromIdx, toIdx);
      }

      function canPour(fromB, toB) {
        if (!fromB || fromB.length === 0) return false;
        if (!toB || toB.length >= CAPACITY) return false;
        if (isComplete(fromB)) return false; // completed tube is locked with cork
        // Players can freely drop or pour colors into ANY bottle they choose with space,
        // regardless of its current color. The game does not restrict pouring based on color matching!
        return true;
      }

      function isComplete(bottle) {
        if (!bottle || bottle.length !== CAPACITY) return false;
        return bottle.every((c) => c === bottle[0]);
      }

      function startPourAnimation(fromIdx, toIdx) {
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
        state.pourData = {
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
        const layout = getLayout(state.bottles.length, screenW, screenH);

        // Clear dynamic canvas layers
        shadowsLayer.clear();
        streamLayer.clear();
        splashLayer.clear();
        uiLayer.clear();

        // Bottles remain 100% stationary when clicked - zero upward translation
        for (let i = 0; i < layout.tubes.length; i++) {
          state.selectedLift[i] = 0;
        }

        // Animation calculation variables
        let sourceTransform = null;
        let transferredUnits = 0;
        let isPouringStreamActive = false;
        let streamCoords = null;

        if (state.isAnimating && state.pourData) {
          state.animTime += deltaSec;
          const rawProgress = Math.min(1, state.animTime / state.animDuration);

          const { fromIdx, toIdx, color, amount } = state.pourData;
          const fromTube = layout.tubes[fromIdx];
          const toTube = layout.tubes[toIdx];
          const r = fromTube.width / 2;

          const isRight = toTube.x >= fromTube.x;
          // Natural tilt angle: ~74 degrees
          const maxTilt = isRight ? 1.28 : -1.28;

          const homeX = fromTube.x;
          const homeY = fromTube.y;

          if (rawProgress < 0.22) {
            // ==========================================
            // PHASE 1: Move & Tilt towards target mouth (0.00 -> 0.22)
            // ==========================================
            const sub = easeInOutCubic(rawProgress / 0.22);
            const currTilt = maxTilt * sub;

            // Compute offset from mouth center to lower spout lip
            const cosA = Math.cos(currTilt);
            const sinA = Math.sin(currTilt);
            const spoutOffX = isRight ? r * cosA : -r * cosA;
            const spoutOffY = isRight ? r * sinA : -r * sinA;

            const destHoverX = toTube.x - spoutOffX;
            const destHoverY = (toTube.y - 12) - spoutOffY;

            sourceTransform = {
              x: homeX + (destHoverX - homeX) * sub,
              y: homeY + (destHoverY - homeY) * sub,
              rotation: currTilt,
            };
            transferredUnits = 0;
          } else if (rawProgress < 0.80) {
            // ==========================================
            // PHASE 2: Realistic Continuous Pour Stream (0.22 -> 0.80)
            // ==========================================
            const sub = (rawProgress - 0.22) / 0.58;
            // Slight tilt deepening and subtle fluid wobble
            const tiltAngle = maxTilt * (1 + 0.03 * Math.sin(sub * Math.PI));

            const cosA = Math.cos(tiltAngle);
            const sinA = Math.sin(tiltAngle);
            const spoutOffX = isRight ? r * cosA : -r * cosA;
            const spoutOffY = isRight ? r * sinA : -r * sinA;

            const mouthX = toTube.x - spoutOffX;
            const mouthY = (toTube.y - 12) - spoutOffY;

            sourceTransform = {
              x: mouthX,
              y: mouthY,
              rotation: tiltAngle,
            };

            transferredUnits = sub * amount;
            isPouringStreamActive = true;

            // Surface of the liquid inside destination tube (fully fills near brim)
            const topLipGap = 7;
            const floorInset = 2.5;
            const totalLiquidH = Math.max(40, toTube.height - floorInset - topLipGap);
            const slotH = totalLiquidH / CAPACITY;
            const currentTotal = state.bottles[toIdx].length + transferredUnits;
            const targetFluidY = toTube.y + (toTube.height - floorInset) - (currentTotal * slotH);

            const streamFade = sub > 0.88 ? Math.max(0, (1 - sub) / 0.12) : 1.0;

            streamCoords = {
              fromX: toTube.x,
              fromY: toTube.y - 10,
              toX: toTube.x,
              toY: targetFluidY,
              color,
              time: state.animTime,
              fade: streamFade,
            };

            // Splash particles at the impact surface
            if (Math.random() < 0.55 && streamFade > 0.1) {
              state.splashParticles.push({
                x: toTube.x + (Math.random() * 10 - 5),
                y: targetFluidY + (Math.random() * 2 - 1),
                vx: (Math.random() - 0.5) * 2.4,
                vy: -Math.random() * 2.4 - 0.8,
                radius: Math.random() * 2.0 + 1.0,
                color: TUBE_COLORS[color]?.num || 0xfacc15,
                alpha: 1,
              });
            }
          } else if (rawProgress < 1.0) {
            // ==========================================
            // PHASE 3: Rotate upright & settle back home (0.80 -> 1.00)
            // ==========================================
            const sub = (rawProgress - 0.80) / 0.20;
            const easedSub = easeOutQuad(sub);
            const currTilt = maxTilt * (1 - easeInOutCubic(sub));

            const cosA = Math.cos(currTilt);
            const sinA = Math.sin(currTilt);
            const spoutOffX = isRight ? r * cosA : -r * cosA;
            const spoutOffY = isRight ? r * sinA : -r * sinA;

            const mouthHoverX = toTube.x - spoutOffX;
            const mouthHoverY = (toTube.y - 12) - spoutOffY;

            sourceTransform = {
              x: mouthHoverX + (homeX - mouthHoverX) * easedSub,
              y: mouthHoverY + (fromTube.y - mouthHoverY) * easedSub,
              rotation: currTilt,
            };

            transferredUnits = amount;
            isPouringStreamActive = false;
          } else {
            // ==========================================
            // Pouring Complete: Commit state cleanly
            // ==========================================
            const newBottles = state.bottles.map((b) => [...b]);
            for (let a = 0; a < amount; a++) {
              newBottles[fromIdx].pop();
              newBottles[toIdx].push(color);
            }

            state.bottles = newBottles;
            state.isAnimating = false;
            state.selected = null;
            state.pourData = null;

            // Tube Completed Celebration & Confetti Burst
            if (isComplete(newBottles[toIdx])) {
              gameAudio.playComplete();
              const toT = layout.tubes[toIdx];
              const starColors = [0xfacc15, 0x38bdf8, 0xec4899, 0xa855f7, 0x10b981, 0xffffff];
              for (let s = 0; s < 25; s++) {
                const angle = (Math.PI * 2 * s) / 25 + (Math.random() - 0.5) * 0.4;
                const speed = Math.random() * 3.8 + 2.2;
                state.sparkleParticles.push({
                  x: toT.x,
                  y: toT.y - 8,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed - 2.8,
                  radius: Math.random() * 2.4 + 1.2,
                  color: starColors[s % starColors.length],
                  alpha: 1,
                  decay: Math.random() * 0.024 + 0.018,
                });
              }
            }

            propsRef.current.onBottlesChange(newBottles);

            if (checkWin(newBottles)) {
              setTimeout(() => {
                gameAudio.playWin();
                propsRef.current.onWin();
              }, 250);
            }
          }
        }

        // Maintain Container per tube in tubesLayer
        while (tubesLayer.children.length < layout.tubes.length) {
          const tubeContainer = new Container();
          const liqG = new Graphics();
          const glsG = new Graphics();
          tubeContainer.addChild(liqG);
          tubeContainer.addChild(glsG);
          tubesLayer.addChild(tubeContainer);
        }
        while (tubesLayer.children.length > layout.tubes.length) {
          tubesLayer.removeChildAt(tubesLayer.children.length - 1);
        }

        const activeHint = propsRef.current.hint;

        // Render each tube
        for (let i = 0; i < layout.tubes.length; i++) {
          const t = layout.tubes[i];
          const tubeContainer = tubesLayer.children[i];
          const isSelected = state.selected === i && !state.isAnimating;
          const isPourSource = state.isAnimating && state.pourData?.fromIdx === i;
          const isPourDest = state.isAnimating && state.pourData?.toIdx === i;
          const isCompleteTube = isComplete(state.bottles[i]);

          let posX = t.x;
          let posY = t.y;
          let rot = 0;

          if (isPourSource && sourceTransform) {
            posX = sourceTransform.x;
            posY = sourceTransform.y;
            rot = sourceTransform.rotation;
            tubeContainer.zIndex = 50; // render on top of all tubes while pouring
          } else {
            tubeContainer.zIndex = 10;
          }

          tubeContainer.position.set(posX, posY);
          tubeContainer.rotation = rot;
          tubeContainer.pivot.set(0, 0); // stable mouth-center pivot

          // Base shadow on ground
          if (rot === 0) {
            const shadowAlpha = isSelected ? 0.40 : 0.40;
            shadowsLayer.ellipse(t.x, t.y + t.height + 6, t.width * 0.42, 3.5);
            shadowsLayer.fill({ color: 0x000000, alpha: shadowAlpha });
          }

          // In-place Selection indicator: Glowing halo and rim beacon (Zero vertical shift!)
          if (isSelected) {
            const pulse = (Math.sin(state.time * 8) + 1) * 0.5;
            // Glowing mouth rim ring
            uiLayer.ellipse(t.x, t.y, t.width * 0.54 + pulse * 1.5, 4.5 + pulse * 1);
            uiLayer.stroke({ width: 2.5, color: 0x38bdf8, alpha: 0.9 + pulse * 0.1 });
            // Subtle selection diamond/dot right at the rim
            uiLayer.circle(t.x, t.y - 8, 3.2);
            uiLayer.fill({ color: 0x38bdf8, alpha: 0.95 });
            uiLayer.circle(t.x, t.y - 8, 1.6);
            uiLayer.fill({ color: 0xffffff, alpha: 1.0 });
          }

          // Hint Halos
          if (activeHint && !state.isAnimating) {
            const pulse = (Math.sin(state.time * 8) + 1) * 0.5;
            if (activeHint.from === i) {
              // Recommended source tube: glowing golden ring
              uiLayer.ellipse(t.x, t.y, t.width * 0.58 + pulse * 3, 7 + pulse * 2);
              uiLayer.stroke({ width: 3, color: 0xfacc15, alpha: 0.85 + pulse * 0.15 });
            } else if (activeHint.to === i) {
              // Recommended target tube: glowing cyan ring
              uiLayer.ellipse(t.x, t.y, t.width * 0.58 + pulse * 3, 7 + pulse * 2);
              uiLayer.stroke({ width: 3, color: 0x38bdf8, alpha: 0.85 + pulse * 0.15 });
            }
          }

          // Completed Bottle: Ornate Stopper with Gold Seal & Crown (Themed per activeSkin)
          if (isCompleteTube && rot === 0) {
            const skinId = propsRef.current.activeSkin || 'classic';
            let corkFill = 0x92400e;
            let corkStroke = 0x78350f;
            let sealColor = 0xfacc15;
            let badgeColor = 0x10b981;

            if (skinId === 'golden') {
              corkFill = 0xb45309;
              corkStroke = 0xfacc15;
              sealColor = 0xfde047;
              badgeColor = 0xef4444; // royal ruby
            } else if (skinId === 'potion') {
              corkFill = 0x581c87; // magical purple
              corkStroke = 0x38bdf8;
              sealColor = 0x38bdf8;
              badgeColor = 0xa855f7;
            } else if (skinId === 'neon') {
              corkFill = 0x4f46e5; // electric indigo
              corkStroke = 0xf43f5e;
              sealColor = 0xf43f5e;
              badgeColor = 0x06b6d4;
            }

            // Wooden/crystal cork body plugged neatly inside the neck
            uiLayer.roundRect(t.x - t.width * 0.30, t.y - 6, t.width * 0.60, 9, 2);
            uiLayer.fill({ color: corkFill, alpha: 0.98 });
            uiLayer.stroke({ width: 1.2, color: corkStroke, alpha: 0.95 });

            // Cork top golden rounded cap
            uiLayer.ellipse(t.x, t.y - 6, t.width * 0.32, 2.5);
            uiLayer.fill({ color: sealColor, alpha: 1.0 });
            uiLayer.stroke({ width: 1.0, color: 0xffffff, alpha: 0.9 });

            // Sparkling Star Badge
            uiLayer.circle(t.x, t.y - 9, 3);
            uiLayer.fill({ color: badgeColor, alpha: 0.95 });
            uiLayer.circle(t.x, t.y - 9, 1.2);
            uiLayer.fill({ color: 0xffffff, alpha: 1.0 });
          }

          // Liquid Layer Heights calculation
          const tubeLayers = [];
          if (isPourSource && state.pourData) {
            // Top blocks drain out smoothly
            const initialLayers = state.bottles[i];
            const remainingCount = initialLayers.length - transferredUnits;
            for (let l = 0; l < initialLayers.length; l++) {
              const rem = Math.max(0, Math.min(1, remainingCount - l));
              if (rem > 0.005) {
                tubeLayers.push({ color: initialLayers[l], fraction: rem });
              }
            }
          } else if (isPourDest && state.pourData) {
            // Existing blocks stay full
            const initialLayers = state.bottles[i];
            for (let l = 0; l < initialLayers.length; l++) {
              tubeLayers.push({ color: initialLayers[l], fraction: 1.0 });
            }
            // Incoming blocks rise smoothly
            let incoming = transferredUnits;
            while (incoming > 0.005) {
              const frac = Math.min(1.0, incoming);
              tubeLayers.push({ color: state.pourData.color, fraction: frac });
              incoming -= frac;
            }
          } else {
            // Normal resting tube
            for (let l = 0; l < state.bottles[i].length; l++) {
              tubeLayers.push({ color: state.bottles[i][l], fraction: 1.0 });
            }
          }

          // Render tube contents
          const liqGraphics = tubeContainer.children[0];
          const glsGraphics = tubeContainer.children[1];
          liqGraphics.clear();
          glsGraphics.clear();

          let tubeRipple = 0;
          if (isPourDest && state.isAnimating) {
            const rawProg = Math.min(1, state.animTime / state.animDuration);
            if (rawProg < 0.80) {
              tubeRipple = Math.sin(state.time * 22) * 1.5;
            } else {
              const settleSub = (rawProg - 0.80) / 0.20;
              tubeRipple = Math.sin(settleSub * Math.PI * 4) * Math.max(0, 1 - settleSub) * 1.5;
            }
          }

          renderTubeGraphics(
            t.width,
            t.height,
            tubeLayers,
            rot,
            isSelected,
            liqGraphics,
            glsGraphics,
            tubeRipple
          );
        }

        // Sort children by zIndex so pouring tube renders on top
        tubesLayer.children.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

        // Render Animated Pouring Fluid Stream
        if (isPouringStreamActive && streamCoords) {
          const { fromX, fromY, toX, toY, color, time } = streamCoords;
          const streamColor = TUBE_COLORS[color]?.streamNum || 0xfacc15;
          const wobble = Math.sin(time * 24) * 0.9;
          const streamFade = streamCoords.fade ?? 1.0;
          const streamWidth = Math.max(1, 5.5 * streamFade);
          const streamAlpha = Math.min(0.95, streamFade * 0.95);

          // Main fluid stream column
          streamLayer.beginPath();
          streamLayer.moveTo(fromX, fromY);
          streamLayer.lineTo(toX + wobble, toY);
          streamLayer.stroke({
            width: streamWidth,
            color: streamColor,
            alpha: streamAlpha,
            cap: 'round',
          });

          // Glossy highlight inside stream
          streamLayer.beginPath();
          streamLayer.moveTo(fromX, fromY);
          streamLayer.lineTo(toX + wobble * 0.5, toY);
          streamLayer.stroke({
            width: Math.max(0.5, 2 * streamFade),
            color: 0xffffff,
            alpha: 0.85 * streamFade,
            cap: 'round',
          });

          // Surface ripple at entry point
          splashLayer.ellipse(toX, toY, 6.5 * streamFade, 2.2 * streamFade);
          splashLayer.fill({ color: streamColor, alpha: 0.8 * streamFade });
        }

        // Update & Render Splash Droplets
        for (let i = state.splashParticles.length - 1; i >= 0; i--) {
          const pt = state.splashParticles[i];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.vy += 0.22; // gravity
          pt.alpha -= 0.045;

          if (pt.alpha <= 0) {
            state.splashParticles.splice(i, 1);
            continue;
          }

          splashLayer.circle(pt.x, pt.y, pt.radius);
          splashLayer.fill({ color: pt.color, alpha: pt.alpha });
        }

        // Update & Render Completion Star Particles
        for (let i = state.sparkleParticles.length - 1; i >= 0; i--) {
          const sp = state.sparkleParticles[i];
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.vy += 0.16;
          sp.vx *= 0.97;
          sp.alpha -= sp.decay;

          if (sp.alpha <= 0) {
            state.sparkleParticles.splice(i, 1);
            continue;
          }

          splashLayer.circle(sp.x, sp.y, sp.radius);
          splashLayer.fill({ color: sp.color, alpha: sp.alpha });
        }
      });

      // Render single test tube graphics in its local coordinate space
      function renderTubeGraphics(
        w,
        h,
        renderList,
        rot,
        isSelected,
        liqG,
        glsG,
        waveRipple = 0
      ) {
        const radius = w / 2;
        const inset = 2.5; // glass wall thickness
        const r_in = radius - inset;
        const w_in = w - 2 * inset;

        // Fully-filled liquid geometry:
        // Top lip opening gap is only 7px (just below the glass rim lip at y = 0),
        // and floor is at h - inset (the inner glass bottom curve).
        const topLipGap = 7;
        const floorInset = inset;
        const totalLiquidH = Math.max(40, h - floorInset - topLipGap);
        const slotH = totalLiquidH / CAPACITY;

        // Geometry of the curved inner bottom
        const y_center = h - r_in - floorInset;
        const y_floor = h - floorInset;

        // Dynamic fluid tilt offset when tube is rotating
        const tiltY = Math.min(10, Math.abs(r_in * Math.sin(rot * 0.75)));
        const isTiltRight = rot > 0;

        // Draw Liquid Layers from Bottom (l = 0) Upward
        let currentBottom = y_floor;
        for (let l = 0; l < renderList.length; l++) {
          const item = renderList[l];
          const colorInfo = TUBE_COLORS[item.color] || { num: 0x2563eb, lightNum: 0x60a5fa };
          const layerHeight = slotH * item.fraction;
          const y_bottom = currentBottom;
          const y_top = y_bottom - layerHeight;
          const isAbsoluteTop = l === renderList.length - 1;

          liqG.beginPath();

          if (l === 0) {
            // First liquid block (bottom of the tube)
            if (y_top >= y_center) {
              // Liquid is still filling inside the bottom semicircular bowl
              const dy = Math.max(0, Math.min(r_in, y_top - y_center));
              const halfW = Math.sqrt(Math.max(0, r_in * r_in - dy * dy));
              const theta = Math.asin(Math.min(1.0, Math.max(0, dy / r_in)));

              liqG.moveTo(-halfW, y_top);
              liqG.arc(0, y_center, r_in, Math.PI - theta, theta, true);
              liqG.lineTo(halfW, y_top);
              liqG.closePath();
            } else {
              // Liquid has filled past the semicircular bowl into the vertical cylinder
              liqG.moveTo(-r_in, y_top);
              liqG.lineTo(-r_in, y_center);
              liqG.arc(0, y_center, r_in, Math.PI, 0, true);
              liqG.lineTo(r_in, y_center);
              liqG.lineTo(r_in, y_top);
              liqG.closePath();
            }
          } else if (isAbsoluteTop && tiltY > 1) {
            // Angled top layer surface when tilted under gravity
            const y_tl = isTiltRight ? y_top + tiltY : y_top - tiltY;
            const y_tr = isTiltRight ? y_top - tiltY : y_top + tiltY;
            liqG.moveTo(-r_in, y_bottom);
            liqG.lineTo(-r_in, y_tl);
            liqG.lineTo(r_in, y_tr);
            liqG.lineTo(r_in, y_bottom);
            liqG.closePath();
          } else {
            // Rectangular liquid block for layers above the curved bottom
            liqG.rect(-r_in, y_top, w_in, Math.max(0.5, y_bottom - y_top + 0.5));
          }

          // Solid 100% vibrant color
          liqG.fill({ color: colorInfo.num, alpha: 1.0 });

          // Top surface subtle luminosity sheen for extra radiance
          liqG.beginPath();
          liqG.rect(-r_in + 1, y_top + 0.5, w_in - 2, Math.min(3.5, Math.max(1, (y_bottom - y_top) * 0.22)));
          liqG.fill({ color: 0xffffff, alpha: 0.16 });

          // Crisp separator line between adjacent colors
          if (!isAbsoluteTop && y_top < y_center) {
            liqG.beginPath();
            liqG.moveTo(-r_in + 1, y_top);
            liqG.lineTo(r_in - 1, y_top);
            liqG.stroke({ width: 1.2, color: 0x000000, alpha: 0.15 });

            liqG.beginPath();
            liqG.moveTo(-r_in + 2, y_top - 0.5);
            liqG.lineTo(r_in - 2, y_top - 0.5);
            liqG.stroke({ width: 0.8, color: 0xffffff, alpha: 0.35 });
          }

          // Top liquid surface meniscus curve
          if (isAbsoluteTop) {
            if (tiltY > 1) {
              const y_tl = isTiltRight ? y_top + tiltY : y_top - tiltY;
              const y_tr = isTiltRight ? y_top - tiltY : y_top + tiltY;
              liqG.beginPath();
              liqG.moveTo(-r_in, y_tl);
              liqG.lineTo(r_in, y_tr);
              liqG.stroke({ width: 2, color: colorInfo.lightNum || 0xffffff, alpha: 0.85 });
            } else {
              let meniscusW = r_in - 1.5;
              if (y_top >= y_center) {
                const dy = Math.max(0, Math.min(r_in, y_top - y_center));
                meniscusW = Math.max(2, Math.sqrt(Math.max(0, r_in * r_in - dy * dy)) - 1);
              }
              liqG.ellipse(0, y_top + waveRipple, meniscusW, 2.6);
              liqG.fill({ color: colorInfo.lightNum || 0xffffff, alpha: 0.90 });
              liqG.stroke({ width: 1.0, color: 0xffffff, alpha: 0.65 });
            }
          }

          // 3D vertical primary gloss highlight
          if (y_top < y_floor - 4) {
            liqG.beginPath();
            liqG.moveTo(-r_in + 3, y_top + 1);
            liqG.lineTo(-r_in + 3, Math.min(y_bottom - 1, y_center + 4));
            liqG.stroke({ width: 2.2, color: 0xffffff, alpha: 0.48 });

            // Secondary softer gloss streak
            liqG.beginPath();
            liqG.moveTo(-r_in + 5.5, y_top + 2);
            liqG.lineTo(-r_in + 5.5, Math.min(y_bottom - 2, y_center + 2));
            liqG.stroke({ width: 1.0, color: 0xffffff, alpha: 0.22 });
          }

          // Subtle Luminous Watermark Vector Emblem per Color (Zero Ambiguity & Perfect Clarity)
          if (item.fraction > 0.65) {
            const cy = (y_top + y_bottom) / 2;
            const s = Math.min(5.5, Math.max(3.2, (y_bottom - y_top) * 0.22));
            liqG.beginPath();
            if (item.color === 'blue') {
              // Water Drop Emblem
              liqG.moveTo(0, cy - s);
              liqG.bezierCurveTo(s * 0.85, cy, s * 0.85, cy + s * 0.55, 0, cy + s * 0.8);
              liqG.bezierCurveTo(-s * 0.85, cy + s * 0.55, -s * 0.85, cy, 0, cy - s);
              liqG.fill({ color: 0xffffff, alpha: 0.32 });
            } else if (item.color === 'cyan') {
              // Crystalline 4-point Diamond Star
              liqG.moveTo(0, cy - s * 1.1);
              liqG.lineTo(s * 0.35, cy - s * 0.3);
              liqG.lineTo(s * 1.1, cy);
              liqG.lineTo(s * 0.35, cy + s * 0.3);
              liqG.lineTo(0, cy + s * 1.1);
              liqG.lineTo(-s * 0.35, cy + s * 0.3);
              liqG.lineTo(-s * 1.1, cy);
              liqG.lineTo(-s * 0.35, cy - s * 0.3);
              liqG.closePath();
              liqG.fill({ color: 0xffffff, alpha: 0.38 });
            } else if (item.color === 'orange') {
              // Flame Emblem
              liqG.moveTo(0, cy - s);
              liqG.bezierCurveTo(s * 0.8, cy - s * 0.2, s * 0.8, cy + s * 0.55, 0, cy + s * 0.8);
              liqG.bezierCurveTo(-s * 0.8, cy + s * 0.55, -s * 0.8, cy - s * 0.2, 0, cy - s);
              liqG.fill({ color: 0xffffff, alpha: 0.30 });
            } else if (item.color === 'yellow') {
              // 5-Point Star Emblem
              for (let pt = 0; pt < 10; pt++) {
                const rad = pt % 2 === 0 ? s : s * 0.44;
                const angle = (pt * Math.PI) / 5 - Math.PI / 2;
                const px = Math.cos(angle) * rad;
                const py = cy + Math.sin(angle) * rad;
                if (pt === 0) liqG.moveTo(px, py);
                else liqG.lineTo(px, py);
              }
              liqG.closePath();
              liqG.fill({ color: 0xffffff, alpha: 0.32 });
            } else if (item.color === 'green') {
              // Emerald Leaf Emblem
              liqG.moveTo(-s * 0.9, cy);
              liqG.quadraticCurveTo(0, cy - s * 0.75, s * 0.9, cy);
              liqG.quadraticCurveTo(0, cy + s * 0.75, -s * 0.9, cy);
              liqG.fill({ color: 0xffffff, alpha: 0.30 });
            } else if (item.color === 'pink') {
              // Heart Emblem
              liqG.moveTo(0, cy + s * 0.65);
              liqG.bezierCurveTo(-s * 0.9, cy + s * 0.1, -s * 0.9, cy - s * 0.75, 0, cy - s * 0.2);
              liqG.bezierCurveTo(s * 0.9, cy - s * 0.75, s * 0.9, cy + s * 0.1, 0, cy + s * 0.65);
              liqG.fill({ color: 0xffffff, alpha: 0.30 });
            } else if (item.color === 'purple') {
              // Amethyst Crescent Moon
              liqG.arc(0, cy, s * 0.75, -Math.PI * 0.45, Math.PI * 0.45);
              liqG.arc(-s * 0.3, cy, s * 0.65, Math.PI * 0.45, -Math.PI * 0.45, true);
              liqG.fill({ color: 0xffffff, alpha: 0.32 });
            } else if (item.color === 'red') {
              // Ruby Gem Emblem
              liqG.moveTo(-s * 0.6, cy - s * 0.55);
              liqG.lineTo(s * 0.6, cy - s * 0.55);
              liqG.lineTo(s * 0.9, cy - s * 0.1);
              liqG.lineTo(0, cy + s * 0.8);
              liqG.lineTo(-s * 0.9, cy - s * 0.1);
              liqG.closePath();
              liqG.fill({ color: 0xffffff, alpha: 0.34 });
            } else if (item.color === 'lime') {
              // Kiwi Sprout / Clover Emblem
              liqG.circle(0, cy - s * 0.32, s * 0.38);
              liqG.circle(-s * 0.32, cy + s * 0.24, s * 0.38);
              liqG.circle(s * 0.32, cy + s * 0.24, s * 0.38);
              liqG.fill({ color: 0xffffff, alpha: 0.28 });
            } else if (item.color === 'teal') {
              // Deep Ocean Ripple Ring
              liqG.circle(0, cy, s * 0.6);
              liqG.stroke({ width: 1.5, color: 0xffffff, alpha: 0.35 });
            }
          }

          currentBottom = y_top;
        }

        // Glass Tube Body Outline & Specular Highlights
        glsG.beginPath();
        glsG.moveTo(-radius, 0);
        glsG.lineTo(-radius, h - radius);
        glsG.arc(0, h - radius, radius, Math.PI, 0, true);
        glsG.lineTo(radius, 0);
        glsG.closePath();

        // Tube Skin Customization (classic, golden, potion, neon)
        const skinId = propsRef.current.activeSkin || 'classic';
        let bodyFillColor = 0xffffff;
        let bodyFillAlpha = 0.08;
        let wallStrokeColor = 0xffffff;
        let rimStrokeColor = 0xffffff;

        if (skinId === 'golden') {
          bodyFillColor = 0xfef08a;
          bodyFillAlpha = 0.12;
          wallStrokeColor = 0xfacc15;
          rimStrokeColor = 0xfde047;
        } else if (skinId === 'potion') {
          bodyFillColor = 0x0284c7;
          bodyFillAlpha = 0.14;
          wallStrokeColor = 0x38bdf8;
          rimStrokeColor = 0x06b6d4;
        } else if (skinId === 'neon') {
          bodyFillColor = 0xa855f7;
          bodyFillAlpha = 0.15;
          wallStrokeColor = 0xf43f5e;
          rimStrokeColor = 0xd946ef;
        }

        // Transparent glass body fill
        glsG.fill({
          color: isSelected ? 0x0284c7 : bodyFillColor,
          alpha: isSelected ? 0.22 : bodyFillAlpha,
        });

        // Outer glass wall stroke
        glsG.stroke({
          width: isSelected ? 3.4 : 2.8,
          color: isSelected ? 0x38bdf8 : wallStrokeColor,
          alpha: isSelected ? 1.0 : 0.85,
        });

        // Top open lip rim
        glsG.ellipse(0, 0, radius + 2.5, 4);
        glsG.stroke({
          width: isSelected ? 3.0 : 2.5,
          color: isSelected ? 0x38bdf8 : rimStrokeColor,
          alpha: isSelected ? 1.0 : 0.95,
        });

        // Left prominent glass reflection highlight
        glsG.beginPath();
        glsG.moveTo(-radius + 3, 8);
        glsG.lineTo(-radius + 3, h - radius);
        glsG.stroke({ width: 2, color: 0xffffff, alpha: 0.55 });

        // Right subtle glass reflection
        glsG.beginPath();
        glsG.moveTo(radius - 3, 12);
        glsG.lineTo(radius - 3, h - radius - 6);
        glsG.stroke({ width: 1, color: 0xffffff, alpha: 0.25 });
      }

      // Responsive Resize Listener (Window + ResizeObserver for mobile orientation/resizing)
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
  }, []); // Run once on mount; props accessed via propsRef

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center select-none touch-manipulation cursor-pointer"
    />
  );
}
