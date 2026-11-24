/**
 * BoltRenderer.js
 *
 * Dedicated PixiJS renderer for realistic 3D metallic bolts and bases:
 * - Silver stainless steel appearance with detailed continuous spiral threading.
 * - Smooth cylindrical specular lighting reflections.
 * - Heavy-duty metallic washer bases with contact shadows directly on the table.
 * - Interactive selection/hint halos and celebration light rays.
 * - Object pooling for zero-allocation performance.
 */

import { Sprite } from 'pixi.js';
import { BOLT_SKINS } from '../data/themes';
import { CAPACITY } from '../data/levelStages';

export class BoltRenderer {
  /**
   * Synchronizes bolt shaft and base sprites in the PixiJS boltsLayer
   * Maintains 2 sprites per bolt: [shaftSprite, baseSprite]
   *
   * @param {Container} boltsLayer
   * @param {number} tubesCount
   * @param {object} textures
   */
  syncSprites(boltsLayer, tubesCount, textures) {
    const requiredSprites = tubesCount * 2;
    while (boltsLayer.children.length < requiredSprites) {
      const shaftSp = new Sprite(textures.shaft);
      shaftSp.anchor.set(0.5, 0); // anchor at top center of shaft
      const baseSp = new Sprite(textures.base);
      baseSp.anchor.set(0.5, 0.5); // anchor at center of base
      boltsLayer.addChild(shaftSp);
      boltsLayer.addChild(baseSp);
    }
    while (boltsLayer.children.length > requiredSprites) {
      boltsLayer.removeChildAt(boltsLayer.children.length - 1);
    }
  }

  /**
   * Renders and updates all bolts, bases, shadows, and status halos
   *
   * @param {Container} boltsLayer
   * @param {Graphics} shadowsLayer
   * @param {Graphics} uiLayer
   * @param {Graphics} effectsLayer
   * @param {Array} tubes - Array of tube layout objects
   * @param {object} state - Game board state (bottles, selected, isAnimating, time)
   * @param {object} textures - Textures map
   * @param {string} activeSkinId - Equipped bolt skin ID
   * @param {object|null} activeHint - Current hint ({ from, to })
   */
  render(boltsLayer, shadowsLayer, uiLayer, effectsLayer, tubes, state, textures, activeSkinId, activeHint) {
    this.syncSprites(boltsLayer, tubes.length, textures);

    const activeBolt = BOLT_SKINS.find((b) => b.id === activeSkinId) || BOLT_SKINS[0];
    const boltTint = activeBolt?.tint !== undefined ? activeBolt.tint : 0xffffff;

    for (let i = 0; i < tubes.length; i++) {
      const t = tubes[i];
      const isCompleteRod = this.isComplete(state.bottles[i]);
      const isSelected = state.selected === i && !state.isAnimating;

      const shaftSp = boltsLayer.children[i * 2];
      const baseSp = boltsLayer.children[i * 2 + 1];

      shaftSp.texture = textures.shaft;
      baseSp.texture = textures.base;
      shaftSp.tint = boltTint;
      baseSp.tint = boltTint;

      // Position shaft with accurate bounding box scaling
      shaftSp.position.set(t.x, t.y);
      shaftSp.width = t.shaftW * (160 / 80);
      shaftSp.height = t.shaftH * (400 / 374);

      // Position base directly on wooden table
      const baseY = t.y + t.shaftH;
      baseSp.position.set(t.x, baseY);
      baseSp.width = t.baseW * (240 / 180);
      baseSp.height = t.baseH * (100 / 68);

      // Subtle, realistic contact shadow below base onto the wooden table surface
      shadowsLayer.ellipse(t.x, baseY + 3, t.baseW * 0.50, 4.2);
      shadowsLayer.fill({ color: 0x000000, alpha: 0.35 });

      // Selection Halo
      if (isSelected) {
        const pulse = (Math.sin(state.time * 7) + 1) * 0.5;
        // Top golden halo hovering above top dome cap
        uiLayer.ellipse(t.x, t.y - 10, t.nutW * 0.52 + pulse * 2, 5 + pulse * 1.5);
        uiLayer.stroke({ width: 2.8, color: 0xfacc15, alpha: 0.9 + pulse * 0.1 });

        // Base ground ring
        uiLayer.ellipse(t.x, baseY, t.baseW * 0.54 + pulse * 2, 5 + pulse * 1.5);
        uiLayer.stroke({ width: 2.0, color: 0xfacc15, alpha: 0.65 });
      } else if (activeHint && !state.isAnimating) {
        const pulse = (Math.sin(state.time * 8) + 1) * 0.5;
        if (activeHint.from === i) {
          uiLayer.ellipse(t.x, t.y - 10, t.nutW * 0.52 + pulse * 2, 5 + pulse * 1.5);
          uiLayer.stroke({ width: 3, color: 0xfacc15, alpha: 0.95 });
        } else if (activeHint.to === i) {
          uiLayer.ellipse(t.x, t.y - 10, t.nutW * 0.52 + pulse * 2, 5 + pulse * 1.5);
          uiLayer.stroke({ width: 3, color: 0x38bdf8, alpha: 0.95 });
        }
      }

      // Completed Bolt Celebration Rays
      if (isCompleteRod) {
        const swirlTime = state.time * 4.0;
        for (let s = 0; s < 4; s++) {
          const yFrac = (swirlTime + s * 0.25) % 1;
          const swirlY = t.y + t.shaftH - yFrac * (t.shaftH + 18);
          const swirlX = t.x + Math.sin(yFrac * Math.PI * 4 + swirlTime) * (t.nutW * 0.58);
          effectsLayer.circle(swirlX, swirlY, 2.2 * (1 - yFrac * 0.35));
          effectsLayer.fill({ color: 0xfde047, alpha: 0.9 * (1 - yFrac * 0.3) });
        }

        uiLayer.circle(t.x, t.y - 6, 4.0);
        uiLayer.fill({ color: 0xfacc15, alpha: 1.0 });
        uiLayer.circle(t.x, t.y - 6, 2.0);
        uiLayer.fill({ color: 0xffffff, alpha: 1.0 });
      }
    }
  }

  isComplete(bottle) {
    if (!bottle || bottle.length !== CAPACITY) return false;
    return bottle.every((c) => c === bottle[0]);
  }
}

export const defaultBoltRenderer = new BoltRenderer();

