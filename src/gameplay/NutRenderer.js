/**
 * NutRenderer.js
 *
 * Dedicated PixiJS renderer for realistic 3D hexagonal nuts:
 * - Uses true 3D rotational yaw frames so the top face stays level in perspective
 *   while the 6 hexagonal facets rotate naturally around the vertical bolt.
 * - Center bore hole is transparent, so the silver threaded bolt shaft is 100% visible inside.
 * - Snug, accurate resting stack placement without floating.
 * - Object pooling for zero-allocation performance.
 */

import { Sprite } from 'pixi.js';

export class NutRenderer {
  /**
   * Helper to select the exact 3D rotational yaw frame for any angle theta.
   * Hexagons have 6-fold rotational symmetry (60 degrees = PI/3 radians).
   *
   * @param {object} textures - Textures map containing nutFrames
   * @param {string} colorKey
   * @param {number} theta - Rotation angle in radians
   */
  getTexture(textures, colorKey, theta = 0) {
    const frames = textures.nutFrames?.[colorKey];
    if (!frames || frames.length === 0) {
      return textures[colorKey] || textures.red;
    }
    const numFrames = frames.length;
    const period = Math.PI / 3; // 60 degrees
    const normTheta = ((theta % period) + period) % period;
    const frameIdx = Math.min(numFrames - 1, Math.floor((normTheta / period) * numFrames));
    return frames[frameIdx];
  }

  /**
   * Synchronizes sprites in nutsLayer with current total number of resting nuts
   */
  syncSprites(nutsLayer, totalCount, textures) {
    while (nutsLayer.children.length < totalCount) {
      const nutSp = new Sprite(textures.red);
      nutSp.anchor.set(0.5, 0.5);
      nutsLayer.addChild(nutSp);
    }
    while (nutsLayer.children.length > totalCount) {
      nutsLayer.removeChildAt(nutsLayer.children.length - 1);
    }
  }

  /**
   * Renders resting stacked nuts across all bolts
   */
  renderRestingNuts(nutsLayer, effectsLayer, tubes, state, textures, stackManager, rotationController, activeNutSkinId) {
    let totalNutsCount = 0;
    for (let i = 0; i < tubes.length; i++) {
      const stack = state.bottles[i];
      const isSource = state.isAnimating && state.moveData?.fromIdx === i;
      const displayCount = isSource ? stack.length - state.moveData.amount : stack.length;
      totalNutsCount += displayCount;
    }

    this.syncSprites(nutsLayer, totalNutsCount, textures);

    let nutSpriteIdx = 0;
    const LIFT_PX = Math.max(22, tubes[0]?.nutH * 1.15 || 28);

    for (let i = 0; i < tubes.length; i++) {
      const t = tubes[i];
      const stack = state.bottles[i];
      const lift = state.selectedLift[i] || 0;
      const isSelected = state.selected === i && !state.isAnimating;

      const isSource = state.isAnimating && state.moveData?.fromIdx === i;
      const displayCount = isSource ? stack.length - state.moveData.amount : stack.length;

      for (let l = 0; l < displayCount; l++) {
        const colorKey = stack[l];
        const isTopNut = l === displayCount - 1;
        const nutLift = (isTopNut && isSelected) ? lift : 0;
        const nutY = stackManager.getNutRestY(t, l) - nutLift;

        const nutSp = nutsLayer.children[nutSpriteIdx++];

        // Calculate thread-phase resting angle
        const restAngle = rotationController.getRestingAngle(l, t.stepY);
        let currentAngle = restAngle;

        if (isTopNut && isSelected) {
          // Synchronized helical unscrewing rotation as it hovers lifted
          currentAngle = rotationController.getSelectedHoverAngle(restAngle, lift, LIFT_PX, state.time);
          nutSp.scale.set(1.05, 1.05);
        } else {
          nutSp.scale.set(1.0, 1.0);
        }

        // True 3D yaw texture frame (Level top face, rotating facets!)
        nutSp.texture = this.getTexture(textures, colorKey, currentAngle);
        nutSp.rotation = 0; // Stays horizontal in perspective view!
        nutSp.width = t.nutW * (240 / 148);
        nutSp.height = t.nutH * (160 / 109);
        nutSp.position.set(t.x, nutY);

        // Render equipped nut skin auras
        this.renderNutAura(effectsLayer, t.x, nutY, t.nutW, t.nutH, activeNutSkinId, state.time);
      }
    }
  }

  /**
   * Renders the active in-flight moving nut with true 3D yaw rotation
   */
  renderMovingNut(movingLayer, shadowsLayer, effectsLayer, motionData, textures, activeNutSkinId, time) {
    while (movingLayer.children.length < 1) {
      const sp = new Sprite(textures.red);
      sp.anchor.set(0.5, 0.5);
      movingLayer.addChild(sp);
    }

    const movingSprite = movingLayer.children[0];

    if (!motionData) {
      movingSprite.visible = false;
      return;
    }

    movingSprite.visible = true;
    movingSprite.texture = this.getTexture(textures, motionData.color, motionData.rotation);
    // Add subtle aerodynamic flight banking tilt only during horizontal transfer
    movingSprite.rotation = motionData.tilt || 0;
    movingSprite.width = motionData.width * (240 / 148);
    movingSprite.height = motionData.height * (160 / 109);
    movingSprite.position.set(motionData.x, motionData.y);

    // Equipped skin aura
    this.renderNutAura(effectsLayer, motionData.x, motionData.y, motionData.width, motionData.height, activeNutSkinId, time);

    // Dynamic contact shadow on table beneath airborne nut
    if (motionData.shadowY !== undefined && motionData.shadowFade > 0) {
      shadowsLayer.ellipse(motionData.x, motionData.shadowY, motionData.width * 0.42, 3.5);
      shadowsLayer.fill({ color: 0x000000, alpha: motionData.shadowFade });
    }
  }

  renderNutAura(effectsLayer, x, y, w, h, skinId, time) {
    if (skinId === 'green_glow') {
      effectsLayer.roundRect(x - w * 0.53, y - h * 0.53, w * 1.06, h * 1.06, 7);
      effectsLayer.stroke({ width: 2.5, color: 0x4ade80, alpha: 0.82 + Math.sin(time * 6) * 0.18 });
    } else if (skinId === 'neon_purple') {
      effectsLayer.roundRect(x - w * 0.54, y - h * 0.54, w * 1.08, h * 1.08, 8);
      effectsLayer.stroke({ width: 2.2, color: 0xc084fc, alpha: 0.9 });
      effectsLayer.roundRect(x - w * 0.44, y - h * 0.44, w * 0.88, h * 0.88, 5);
      effectsLayer.stroke({ width: 1.5, color: 0xf472b6, alpha: 0.85 });
    } else if (skinId === 'wood') {
      effectsLayer.roundRect(x - w * 0.51, y - h * 0.51, w * 1.02, h * 1.02, 6);
      effectsLayer.stroke({ width: 1.6, color: 0xd97706, alpha: 0.75 });
    } else if (skinId === 'blue') {
      effectsLayer.roundRect(x - w * 0.51, y - h * 0.51, w * 1.02, h * 1.02, 6);
      effectsLayer.stroke({ width: 1.8, color: 0x38bdf8, alpha: 0.75 });
    } else if (skinId === 'red') {
      effectsLayer.roundRect(x - w * 0.51, y - h * 0.51, w * 1.02, h * 1.02, 6);
      effectsLayer.stroke({ width: 1.8, color: 0xf43f5e, alpha: 0.75 });
    }
  }
}

export const defaultNutRenderer = new NutRenderer();
