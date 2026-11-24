/**
 * NutTransferController.js
 *
 * Orchestrates the complete mechanical transfer cycle of a nut from one bolt to another:
 * 1. Upward Helical Unscrewing along source bolt shaft:
 *    Synchronized y(t) = y0 - (P / 2π) * (θ(t) - θ0)
 *    Physically unscrews along the threads until clearing the top dome cap.
 * 2. Natural Curved Parabolic Transfer Arc clearing the bolt tops.
 * 3. Alignment of nut's center bore with destination bolt axis.
 * 4. Downward Helical Screwing onto destination bolt shaft:
 *    Synchronized y(t) = y_apex + (P / 2π) * (θ(t) - θ_start)
 * 5. Tactile Elastic Settle Landing on the resting stack with metallic particles.
 */

import { gameAudio } from '../utils/gameAudio';
import { CAPACITY } from '../data/levelStages';

export class NutTransferController {
  constructor(screwController, rotationController, stackManager) {
    this.screwController = screwController;
    this.rotationController = rotationController;
    this.stackManager = stackManager;
    this.animDuration = 0.88; // Natural, realistic duration for screw & transfer
  }

  /**
   * Evaluates the active transfer motion for the current tick
   *
   * @param {object} state - Game state
   * @param {number} deltaSec - Elapsed delta time
   * @param {object} layout - Layout object
   * @param {function} onComplete - Callback when transfer finishes
   * @returns {object|null} Motion data for rendering { x, y, rotation, tilt, color, width, height, shadowY, shadowFade }
   */
  update(state, deltaSec, layout, onComplete) {
    if (!state.isAnimating || !state.moveData) {
      return null;
    }

    state.animTime += deltaSec;
    const rawProgress = Math.min(1.0, state.animTime / this.animDuration);

    const { fromIdx, toIdx, color, amount } = state.moveData;
    const fromTube = layout.tubes[fromIdx];
    const toTube = layout.tubes[toIdx];

    const fromStack = state.bottles[fromIdx];
    const toStack = state.bottles[toIdx];

    // Compute rest elevations & resting thread angles
    const fromRestY = this.stackManager.getNutRestY(fromTube, fromStack.length - 1);
    const toRestY = this.stackManager.getNutRestY(toTube, toStack.length);
    const apexY = this.stackManager.getApexY(fromTube, toTube);

    const fromRestAngle = this.rotationController.getRestingAngle(fromStack.length - 1, fromTube.stepY);
    const toRestAngle = this.rotationController.getRestingAngle(toStack.length, toTube.stepY);

    const pitch = this.screwController.getPitch();

    let currX = fromTube.x;
    let currY = fromRestY;
    let currRotation = fromRestAngle;
    let currTilt = 0;

    // -----------------------------------------------------------------------
    // PHASE 1: UNSCREW & LIFT ALONG SOURCE BOLT (0.00 to 0.30)
    // -----------------------------------------------------------------------
    const liftHeight = Math.abs(apexY - fromRestY);
    const totalUnscrewTurns = Math.max(1.2, liftHeight / pitch);
    const releaseAngle = fromRestAngle - totalUnscrewTurns * Math.PI * 2;

    if (rawProgress < 0.30) {
      const subProg = rawProgress / 0.30;
      const easedSub = this.screwController.easeInOutCubic(subProg);

      currX = fromTube.x;
      currY = fromRestY + (apexY - fromRestY) * easedSub;

      // Realistic unscrewing rotation strictly synchronized with vertical ascent:
      currRotation = fromRestAngle - easedSub * totalUnscrewTurns * Math.PI * 2;
      currTilt = 0; // Stays perfectly level while threaded on the bolt
    }
    // -----------------------------------------------------------------------
    // PHASE 2: CURVED TRANSFER ARC BETWEEN BOLTS (0.30 to 0.70)
    // -----------------------------------------------------------------------
    else if (rawProgress < 0.70) {
      const subProg = (rawProgress - 0.30) / 0.40;
      const easedSub = this.screwController.easeInOutCubic(subProg);

      // Horizontal transfer
      currX = fromTube.x + (toTube.x - fromTube.x) * easedSub;

      // Parabolic flight arc clearing bolt top caps
      const arcOffset = -Math.sin(subProg * Math.PI) * 26;
      currY = apexY + arcOffset;

      // Natural rotational momentum during transit
      currRotation = releaseAngle + subProg * Math.PI * 2.0;

      // Subtle aerodynamic banking tilt in the direction of flight
      const travelDir = toTube.x >= fromTube.x ? 1 : -1;
      currTilt = travelDir * Math.sin(subProg * Math.PI) * 0.12;
    }
    // -----------------------------------------------------------------------
    // PHASE 3: ALIGN & SCREW DOWN ONTO DESTINATION BOLT (0.70 to 1.00)
    // -----------------------------------------------------------------------
    else if (rawProgress < 1.0) {
      const subProg = (rawProgress - 0.70) / 0.30;
      const descendHeight = Math.abs(toRestY - apexY);

      // Elastic settle descent curve for realistic landing
      const easeOutBack = (x) => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
      };
      const easedDescent = easeOutBack(Math.min(1.0, subProg * 1.04));

      currX = toTube.x; // Perfect alignment with destination bolt axis
      currY = apexY + (toRestY - apexY) * Math.min(1.0, easedDescent);

      // Clockwise tightening rotation strictly synchronized with descent,
      // terminating precisely at the thread-matched destination resting angle!
      const totalScrewDownTurns = Math.max(1.2, descendHeight / pitch);
      const remainingProgress = Math.max(0, 1.0 - this.screwController.easeInOutCubic(subProg));
      currRotation = toRestAngle + remainingProgress * totalScrewDownTurns * Math.PI * 2;
      currTilt = 0; // Stays perfectly level while threading onto the destination bolt
    }
    // -----------------------------------------------------------------------
    // PHASE 4: LANDING SETTLE & COMPLETION
    // -----------------------------------------------------------------------
    else {
      // Commit state change
      const newBottles = state.bottles.map((b) => [...b]);
      for (let a = 0; a < amount; a++) {
        newBottles[fromIdx].pop();
        newBottles[toIdx].push(color);
      }

      state.bottles = newBottles;
      state.isAnimating = false;
      state.selected = null;
      state.moveData = null;

      // Spawn landing sparkles at contact point
      const landingColors = [0xfacc15, 0x38bdf8, 0xffffff];
      for (let k = 0; k < 12; k++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * 2.8 + 1.2;
        state.sparkleParticles.push({
          x: toTube.x,
          y: toRestY,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd - 1.4,
          radius: Math.random() * 2.0 + 1.0,
          color: landingColors[k % landingColors.length],
          alpha: 1.0,
          decay: 0.045,
        });
      }

      // Completed Bolt Celebration Burst
      if (this.isComplete(newBottles[toIdx])) {
        gameAudio.playComplete();
        const starColors = [0xfacc15, 0x38bdf8, 0xec4899, 0xa855f7, 0x10b981, 0xffffff];
        for (let s = 0; s < 35; s++) {
          const angle = (Math.PI * 2 * s) / 35 + (Math.random() - 0.5) * 0.3;
          const speed = Math.random() * 4.5 + 2.2;
          state.sparkleParticles.push({
            x: toTube.x,
            y: toTube.y + toTube.shaftH * 0.35,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2.8,
            radius: Math.random() * 2.8 + 1.2,
            color: starColors[s % starColors.length],
            alpha: 1.0,
            decay: Math.random() * 0.022 + 0.015,
          });
        }
      }

      if (onComplete) {
        onComplete(newBottles);
      }

      return null;
    }

    const shadowFade = Math.max(0.12, 0.38 - ((currY - apexY) / (toRestY - apexY)) * 0.18);
    return {
      x: currX,
      y: currY,
      rotation: currRotation,
      tilt: currTilt,
      color,
      width: fromTube.nutW * 1.05,
      height: fromTube.nutH * 1.05,
      shadowY: toTube.y + toTube.shaftH + 2,
      shadowFade,
    };
  }

  isComplete(bottle) {
    if (!bottle || bottle.length !== CAPACITY) return false;
    return bottle.every((c) => c === bottle[0]);
  }
}
