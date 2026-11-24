/**
 * NutStackManager.js
 *
 * Manages responsive layout geometry, generous inter-bolt spacing,
 * and snug, realistic nut-on-nut hardware stacking directly on the workbench table.
 *
 * Structure & Proportion Rules:
 * - Balanced, realistic proportions: neither bolts nor nuts are oversized.
 * - Bolt height is calibrated to ~3.1x nut height so when 4 nuts are threaded,
 *   the machined bolt head extends naturally and neatly ~12-16px above the top nut.
 * - In 2-row levels (e.g. 5 to 14 bolts):
 *   Row 1 (Back Row) base is anchored at 46% screen height.
 *   Row 2 (Front Row) base is anchored at 78% screen height.
 *   Row 1 and Row 2 have an 85-100px clear vertical gap with zero overlap.
 * - In 1-row levels (Stages 1-4 with 3-4 bolts):
 *   Single row sits proudly in center table area at 74% screen height.
 * - Nuts stack snugly on each other and sit flush on the washer collar with zero floating.
 */

export class NutStackManager {
  /**
   * Calculates responsive layout for any screen dimensions and tube count
   *
   * @param {number} numTubes - Total number of tubes/bolts
   * @param {number} screenW - Canvas width (pixels)
   * @param {number} screenH - Canvas height (pixels)
   * @returns {object} Layout specification
   */
  getLayout(numTubes, screenW, screenH) {
    const isTwoRows = numTubes > 4;
    const row1Count = isTwoRows ? Math.ceil(numTubes / 2) : numTubes;
    const row2Count = isTwoRows ? numTubes - row1Count : 0;
    const maxCols = Math.max(row1Count, row2Count, 3);

    let nutW = 46;
    let nutH = 26;
    let shaftW = 18;
    let shaftH = 84;
    let baseW = 54;
    let baseH = 18;
    let r1Y = 0;
    let r2Y = 0;
    let colSpacing = 100;

    if (isTwoRows) {
      // 2-Row mode: 5 to 14 bolts across 2 distinct vertical tiers
      const usableWidth = Math.min(screenW - 32, screenW * 0.80);
      colSpacing = Math.min(125, Math.max(62, Math.floor(usableWidth / Math.max(1, maxCols - 0.15))));

      // Balanced hardware proportions: sleek, not oversized
      nutW = Math.min(48, Math.max(30, Math.floor(colSpacing * 0.50)));
      nutH = Math.round(nutW * 0.56);
      shaftW = Math.max(15, Math.round(nutW * 0.36));
      baseW = Math.round(nutW * 1.18);
      baseH = Math.round(baseW * 0.32);

      // Calibrated bolt height: holds 4 nuts with clean ~12-15px bolt head top
      shaftH = Math.min(94, Math.max(68, Math.round(nutH * 3.10)));

      // Row 1 (Back Row): Upper tier base anchored at 46% screen height
      const r1BaseY = Math.round(screenH * 0.46);
      r1Y = r1BaseY - shaftH;

      // Row 2 (Front Row): Lower tier base anchored at 78% screen height
      const r2BaseY = Math.round(screenH * 0.78);
      r2Y = r2BaseY - shaftH;
    } else {
      // 1-Row mode: 1 to 4 bolts (Single generous row on the table)
      const usableWidth = Math.min(screenW - 32, screenW * 0.65);
      colSpacing = Math.min(160, Math.max(88, Math.floor(usableWidth / Math.max(1, numTubes - 0.15))));

      nutW = Math.min(58, Math.max(38, Math.floor(colSpacing * 0.48)));
      nutH = Math.round(nutW * 0.56);
      shaftW = Math.max(18, Math.round(nutW * 0.36));
      baseW = Math.round(nutW * 1.18);
      baseH = Math.round(baseW * 0.32);

      // Calibrated bolt height
      shaftH = Math.min(122, Math.max(88, Math.round(nutH * 3.10)));

      // Single row sits proudly in center table area at 74% screen height
      const targetBaseY = Math.round(screenH * 0.74);
      r1Y = targetBaseY - shaftH;
    }

    const tubes = [];
    const stepY = Math.round(nutH * 0.50);

    // Row 1 (Back row in 2-row mode, or only row in 1-row mode)
    const r1StartX = screenW / 2 - ((row1Count - 1) * colSpacing) / 2;
    for (let i = 0; i < row1Count; i++) {
      tubes.push({
        index: i,
        x: Math.round(r1StartX + i * colSpacing),
        y: Math.round(r1Y),
        nutW,
        nutH,
        shaftW,
        shaftH,
        baseW,
        baseH,
        row: 1,
        stepY,
      });
    }

    // Row 2 (Front row in 2-row mode)
    if (isTwoRows) {
      const r2StartX = screenW / 2 - ((row2Count - 1) * colSpacing) / 2;
      for (let j = 0; j < row2Count; j++) {
        tubes.push({
          index: row1Count + j,
          x: Math.round(r2StartX + j * colSpacing),
          y: Math.round(r2Y),
          nutW,
          nutH,
          shaftW,
          shaftH,
          baseW,
          baseH,
          row: 2,
          stepY,
        });
      }
    }

    return {
      tubes,
      nutW,
      nutH,
      shaftW,
      shaftH,
      baseW,
      baseH,
      isTwoRows,
      r1Y,
      r2Y,
      row1Count,
      row2Count,
      stepY,
    };
  }

  /**
   * Calculates exact vertical resting coordinate Y for a nut at layerIndex
   * Ensures the bottom nut sits flush on the washer collar, and subsequent nuts stack snugly on each other
   */
  getNutRestY(tube, layerIndex) {
    const washerCollarY = tube.y + tube.shaftH - tube.baseH * 0.35;
    const stepY = tube.stepY || Math.round(tube.nutH * 0.50);
    return washerCollarY - tube.nutH * 0.50 - layerIndex * stepY;
  }

  /**
   * Calculates apex clearance altitude for lifting cleanly above the bolt top cap
   */
  getApexY(fromTube, toTube) {
    const minBoltTop = Math.min(fromTube.y, toTube.y);
    return minBoltTop - Math.max(26, fromTube.nutH * 0.85);
  }
}

export const defaultStackManager = new NutStackManager();
