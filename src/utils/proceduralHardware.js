/**
 * High-performance 3D Procedural Hardware Engine for PixiJS
 * Generates photorealistic, gleaming metallic bolts, washer bases,
 * and 3D isometric hexagonal nut rotation frames with true rotational yaw.
 */

export const NUT_COLOR_PALETTE = {
  red: {
    base: '#dc2626',
    highlight: '#fca5a5',
    shadow: '#7f1d1d',
    rim: '#fee2e2',
    baseRgb: [220, 38, 38],
    specRgb: [255, 220, 220],
  },
  blue: {
    base: '#2563eb',
    highlight: '#93c5fd',
    shadow: '#1e3a8a',
    rim: '#dbeafe',
    baseRgb: [37, 99, 235],
    specRgb: [220, 240, 255],
  },
  green: {
    base: '#16a34a',
    highlight: '#86efac',
    shadow: '#14532d',
    rim: '#dcfce7',
    baseRgb: [22, 163, 74],
    specRgb: [220, 255, 230],
  },
  yellow: {
    base: '#eab308',
    highlight: '#fef08a',
    shadow: '#854d0e',
    rim: '#fef9c3',
    baseRgb: [234, 179, 8],
    specRgb: [255, 255, 220],
  },
  purple: {
    base: '#9333ea',
    highlight: '#d8b4fe',
    shadow: '#581c87',
    rim: '#f3e8ff',
    baseRgb: [147, 51, 234],
    specRgb: [245, 225, 255],
  },
  orange: {
    base: '#ea580c',
    highlight: '#fdba74',
    shadow: '#7c2d12',
    rim: '#ffedd5',
    baseRgb: [234, 88, 12],
    specRgb: [255, 235, 210],
  },
  pink: {
    base: '#db2777',
    highlight: '#f9a8d4',
    shadow: '#831843',
    rim: '#fce7f3',
    baseRgb: [219, 39, 119],
    specRgb: [255, 230, 245],
  },
  cyan: {
    base: '#0891b2',
    highlight: '#67e8f9',
    shadow: '#155e75',
    rim: '#cffafe',
    baseRgb: [8, 145, 178],
    specRgb: [215, 250, 255],
  },
  lime: {
    // Gunmetal / Obsidian titanium
    base: '#475569',
    highlight: '#cbd5e1',
    shadow: '#1e293b',
    rim: '#f1f5f9',
    baseRgb: [71, 85, 105],
    specRgb: [230, 238, 248],
  },
  teal: {
    // Mirror stainless steel chrome
    base: '#94a3b8',
    highlight: '#ffffff',
    shadow: '#334155',
    rim: '#ffffff',
    baseRgb: [148, 163, 184],
    specRgb: [255, 255, 255],
  },
  wood: {
    base: '#b45309',
    highlight: '#fde68a',
    shadow: '#713f12',
    rim: '#fef3c7',
    baseRgb: [180, 83, 9],
    specRgb: [253, 230, 138],
  },
};

/**
 * Creates a single 3D isometric hexagonal nut Canvas at angle theta
 * The top face remains horizontal in perspective while the 6 vertical facets rotate in true 3D yaw.
 * The central bore hole is a clean, crisp aperture through which the metallic threaded bolt is 100% visible.
 *
 * @param {string} colorKey
 * @param {number} theta - Rotation angle in radians [0, PI/3]
 * @returns {HTMLCanvasElement}
 */
export function createNutFrameCanvas(colorKey = 'red', theta = 0) {
  const canvas = document.createElement('canvas');
  canvas.width = 240;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');

  const pal = NUT_COLOR_PALETTE[colorKey] || NUT_COLOR_PALETTE.red;
  const cx = 120;
  const cy = 68;
  const radius = 74;
  const thickness = 32;
  const tilt = 0.52; // 30-degree isometric perspective tilt

  // 1. Calculate the 6 vertices of the top hexagon and bottom hexagon
  const topPts = [];
  const botPts = [];
  for (let i = 0; i < 6; i++) {
    const phi = (i * Math.PI) / 3 + theta;
    const px = cx + radius * Math.cos(phi);
    const py = cy - radius * Math.sin(phi) * tilt;
    topPts.push({ x: px, y: py });
    botPts.push({ x: px, y: py + thickness });
  }

  // 2. Soft contact drop shadow beneath the nut
  ctx.beginPath();
  ctx.ellipse(cx, cy + thickness + 5, radius * 0.92, radius * 0.36, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.36)';
  ctx.fill();

  // 3. Render visible front-facing vertical facets with directional 3D metallic lighting
  for (let i = 0; i < 6; i++) {
    const nextI = (i + 1) % 6;
    const midPhi = ((i + 0.5) * Math.PI) / 3 + theta;

    // Facet is front-facing if normal points towards camera: sin(midPhi) < 0.05
    if (Math.sin(midPhi) < 0.05) {
      // Directional key light from top-left (approx 225 degrees in X-Z)
      const lightAngle = (225 * Math.PI) / 180;
      const dot = Math.cos(midPhi - lightAngle);
      const lit = 0.40 + 0.60 * Math.max(0.0, dot);

      // Specular highlight peak when facet faces forward specular angle
      const specDot = Math.max(0.0, Math.cos(midPhi - (270 * Math.PI) / 180));
      const spec = Math.pow(specDot, 8) * 0.60;

      const r = Math.min(255, Math.round(pal.baseRgb[0] * lit + pal.specRgb[0] * spec));
      const g = Math.min(255, Math.round(pal.baseRgb[1] * lit + pal.specRgb[1] * spec));
      const b = Math.min(255, Math.round(pal.baseRgb[2] * lit + pal.specRgb[2] * spec));

      // Facet body
      ctx.beginPath();
      ctx.moveTo(topPts[i].x, topPts[i].y);
      ctx.lineTo(topPts[nextI].x, topPts[nextI].y);
      ctx.lineTo(botPts[nextI].x, botPts[nextI].y);
      ctx.lineTo(botPts[i].x, botPts[i].y);
      ctx.closePath();

      // Vertical metallic gradient on facet
      const facetGrad = ctx.createLinearGradient(topPts[i].x, topPts[i].y, topPts[i].x, botPts[i].y);
      facetGrad.addColorStop(0, `rgb(${Math.min(255, r + 24)},${Math.min(255, g + 24)},${Math.min(255, b + 24)})`);
      facetGrad.addColorStop(0.65, `rgb(${r},${g},${b})`);
      facetGrad.addColorStop(1, `rgb(${Math.max(0, r - 32)},${Math.max(0, g - 32)},${Math.max(0, b - 32)})`);
      ctx.fillStyle = facetGrad;
      ctx.fill();

      // Vertical facet corner ridge highlight
      ctx.strokeStyle = pal.rim;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(topPts[i].x, topPts[i].y);
      ctx.lineTo(botPts[i].x, botPts[i].y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(topPts[nextI].x, topPts[nextI].y);
      ctx.lineTo(botPts[nextI].x, botPts[nextI].y);
      ctx.stroke();

      // Bottom chamfer shadow stroke
      ctx.strokeStyle = 'rgba(0,0,0,0.40)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(botPts[i].x, botPts[i].y);
      ctx.lineTo(botPts[nextI].x, botPts[nextI].y);
      ctx.stroke();
    }
  }

  // 4. Render Top Hexagonal Face with smooth metallic lacquer gradient
  ctx.beginPath();
  ctx.moveTo(topPts[0].x, topPts[0].y);
  for (let i = 1; i < 6; i++) {
    ctx.lineTo(topPts[i].x, topPts[i].y);
  }
  ctx.closePath();

  const topGrad = ctx.createLinearGradient(cx - radius * 0.7, cy - radius * 0.4, cx + radius * 0.7, cy + radius * 0.4);
  topGrad.addColorStop(0, pal.highlight);
  topGrad.addColorStop(0.35, pal.base);
  topGrad.addColorStop(0.85, pal.shadow);
  topGrad.addColorStop(1, `rgb(${Math.max(0, pal.baseRgb[0] - 45)},${Math.max(0, pal.baseRgb[1] - 45)},${Math.max(0, pal.baseRgb[2] - 45)})`);
  ctx.fillStyle = topGrad;
  ctx.fill();

  // Top outer bevel rim stroke (Gleaming specular edge)
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = pal.rim;
  ctx.stroke();

  // 5. Clean, sharp Center Bore Hole Cutout
  // The threaded bolt shaft underneath in boltsLayer is 100% visible through this opening!
  const holeRx = 30;
  const holeRy = holeRx * tilt;

  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.ellipse(cx, cy, holeRx, holeRy, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Dark inner chamfer groove ring around bore hole:
  // Creates crisp optical separation between the nut's colorful lacquer and the silver bolt!
  ctx.save();
  ctx.lineWidth = 2.0;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.60)';
  ctx.beginPath();
  ctx.ellipse(cx, cy, holeRx + 0.8, holeRy + 0.8, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Specular inner lip highlight on front half
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = pal.rim;
  ctx.beginPath();
  ctx.ellipse(cx, cy, holeRx + 0.4, holeRy + 0.4, 0, 0, Math.PI);
  ctx.stroke();
  ctx.restore();

  // 6. Top Specular Glint (Studio key-light reflection, kept strictly on top face)
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx - radius * 0.35, cy - radius * 0.20, 16, 6, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.fill();
  ctx.restore();

  return canvas;
}

/**
 * Pre-renders an array of 3D rotation frames for each color
 * @param {string} colorKey
 * @param {number} numFrames - Default 36 frames for silky 60fps rotational yaw
 * @returns {Array<HTMLCanvasElement>}
 */
export function createNutFrames(colorKey = 'red', numFrames = 36) {
  const frames = [];
  for (let f = 0; f < numFrames; f++) {
    const theta = (f / numFrames) * (Math.PI / 3);
    frames.push(createNutFrameCanvas(colorKey, theta));
  }
  return frames;
}

/**
 * Default single-frame fallback
 */
export function createNutCanvas(colorKey = 'red') {
  return createNutFrameCanvas(colorKey, 0);
}

/**
 * Creates a photorealistic bright silver stainless steel bolt shaft with machine bolt cap head and 3D threads
 */
export function createShaftCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  const cx = 80;

  // Bolt dimensions inside canvas
  const headTopY = 16;
  const headBottomY = 46;
  const headW = 96;
  const headLeft = cx - headW / 2; // 32
  const headRight = cx + headW / 2; // 128

  const shaftW = 80;
  const shaftLeft = cx - shaftW / 2; // 40
  const shaftRight = cx + shaftW / 2; // 120
  const shaftBottomY = 390;

  // 1. Threaded Shaft Cylinder with bright stainless steel metallic profile
  const cylGrad = ctx.createLinearGradient(shaftLeft, 0, shaftRight, 0);
  cylGrad.addColorStop(0, '#475569'); // left ambient tone
  cylGrad.addColorStop(0.18, '#cbd5e1'); // soft diffuse midtone
  cylGrad.addColorStop(0.32, '#ffffff'); // bright sharp specular streak
  cylGrad.addColorStop(0.55, '#f1f5f9'); // bright brushed steel body
  cylGrad.addColorStop(0.80, '#cbd5e1'); // right diffuse
  cylGrad.addColorStop(0.92, '#94a3b8'); // right shadow roll-off
  cylGrad.addColorStop(1, '#334155'); // right dark occlusion rim

  ctx.fillStyle = cylGrad;
  ctx.fillRect(shaftLeft, headBottomY, shaftW, shaftBottomY - headBottomY);

  // 2. Machine Bolt Cap Head at Top (Slightly wider than threaded shaft with screwdriver slot)
  const headGrad = ctx.createLinearGradient(headLeft, 0, headRight, 0);
  headGrad.addColorStop(0, '#334155');
  headGrad.addColorStop(0.20, '#cbd5e1');
  headGrad.addColorStop(0.35, '#ffffff');
  headGrad.addColorStop(0.60, '#f1f5f9');
  headGrad.addColorStop(0.85, '#94a3b8');
  headGrad.addColorStop(1, '#1e293b');

  // Cap head body
  ctx.beginPath();
  // Rounded top corners
  const r = 8;
  ctx.roundRect(headLeft, headTopY, headW, headBottomY - headTopY, [r, r, 2, 2]);
  ctx.fillStyle = headGrad;
  ctx.fill();

  // Cap head outer contour
  ctx.strokeStyle = 'rgba(30, 41, 59, 0.70)';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // Cap head top rim specular highlight
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(headLeft + r, headTopY + 1);
  ctx.lineTo(headRight - r, headTopY + 1);
  ctx.stroke();

  // Screwdriver machine slot in bolt head center
  const slotW = 5;
  const slotH = 18;
  const slotX = cx - slotW / 2;
  const slotY = headTopY + 5;

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(slotX, slotY, slotW, slotH);
  // Slot right highlight edge
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(slotX + slotW, slotY, 1.2, slotH);

  // Top cap specular glint
  ctx.beginPath();
  ctx.ellipse(cx - 18, headTopY + 7, 12, 4, -Math.PI / 6, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fill();

  // 3. Continuous 3D Helical Spiral Threads along shaft
  const pitch = 16;
  const threadSlope = 5;

  for (let y = headBottomY + 4; y < shaftBottomY - 6; y += pitch) {
    // Thread tooth relief profile on left and right edges for true 3D contouring
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(shaftLeft, y);
    ctx.lineTo(shaftLeft - 2.5, y + pitch * 0.5);
    ctx.lineTo(shaftLeft, y + pitch);
    ctx.fill();

    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(shaftRight, y + threadSlope);
    ctx.lineTo(shaftRight + 2.5, y + threadSlope + pitch * 0.5);
    ctx.lineTo(shaftRight, y + threadSlope + pitch);
    ctx.fill();

    // Thread root shadow V-groove (Delicate metallic occlusion)
    ctx.beginPath();
    ctx.moveTo(shaftLeft - 1, y);
    ctx.lineTo(shaftRight + 1, y + threadSlope);
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.80)';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Thread crest highlight (Bright gleaming stainless steel reflection)
    ctx.beginPath();
    ctx.moveTo(shaftLeft, y + 2.4);
    ctx.lineTo(shaftRight, y + threadSlope + 2.4);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Specular highlight gleam along crest at specular streak position (x ≈ 62)
    ctx.beginPath();
    ctx.moveTo(cx - 24, y + 2.4 + threadSlope * 0.25);
    ctx.lineTo(cx - 6, y + 2.4 + threadSlope * 0.45);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.8;
    ctx.stroke();
  }

  // 4. Clean side contour lines
  ctx.strokeStyle = 'rgba(30, 41, 59, 0.65)';
  ctx.lineWidth = 1.6;
  ctx.strokeRect(shaftLeft, headBottomY, shaftW, shaftBottomY - headBottomY);

  return canvas;
}

/**
 * Creates a photorealistic heavy-duty stainless steel washer/flange base
 */
export function createBaseCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = 240;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  const cx = 120;
  const cy = 48;
  const rx = 90;
  const ry = 28;

  // 1. Soft contact drop shadow on table surface
  ctx.beginPath();
  ctx.ellipse(cx, cy + 10, rx * 1.05, ry * 1.05, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
  ctx.fill();

  // 2. Outer beveled thickness (Bottom rim of washer base)
  const rimHeight = 12;
  ctx.beginPath();
  ctx.ellipse(cx, cy + rimHeight, rx, ry, 0, 0, Math.PI);
  ctx.lineTo(cx - rx, cy);
  ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, 0, true);
  ctx.closePath();

  const rimGrad = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0);
  rimGrad.addColorStop(0, '#334155');
  rimGrad.addColorStop(0.25, '#cbd5e1');
  rimGrad.addColorStop(0.40, '#ffffff');
  rimGrad.addColorStop(0.70, '#94a3b8');
  rimGrad.addColorStop(1, '#1e293b');
  ctx.fillStyle = rimGrad;
  ctx.fill();

  ctx.strokeStyle = 'rgba(30, 41, 59, 0.65)';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // 3. Top washer face (Radial brushed stainless steel profile)
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);

  const topGrad = ctx.createLinearGradient(cx - rx * 0.7, cy - ry, cx + rx * 0.7, cy + ry);
  topGrad.addColorStop(0, '#ffffff');
  topGrad.addColorStop(0.28, '#f1f5f9');
  topGrad.addColorStop(0.65, '#94a3b8');
  topGrad.addColorStop(1, '#475569');
  ctx.fillStyle = topGrad;
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.0;
  ctx.stroke();

  // 4. Raised center collar / boss (Threaded collar where bolt shaft roots)
  const collarRx = rx * 0.52;
  const collarRy = ry * 0.52;
  const collarH = 6;

  // Collar vertical wall
  ctx.beginPath();
  ctx.ellipse(cx, cy - 2 + collarH, collarRx, collarRy, 0, 0, Math.PI);
  ctx.lineTo(cx - collarRx, cy - 2);
  ctx.ellipse(cx, cy - 2, collarRx, collarRy, 0, Math.PI, 0, true);
  ctx.closePath();
  ctx.fillStyle = rimGrad;
  ctx.fill();

  // Collar top ring
  ctx.beginPath();
  ctx.ellipse(cx, cy - 2, collarRx, collarRy, 0, 0, Math.PI * 2);
  const collarGrad = ctx.createLinearGradient(cx - collarRx, cy - collarRy, cx + collarRx, cy + collarRy);
  collarGrad.addColorStop(0, '#ffffff');
  collarGrad.addColorStop(0.4, '#cbd5e1');
  collarGrad.addColorStop(1, '#64748b');
  ctx.fillStyle = collarGrad;
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // Inner bolt root hole (Dark socket)
  ctx.beginPath();
  ctx.ellipse(cx, cy - 2, collarRx * 0.65, collarRy * 0.65, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#1e293b';
  ctx.fill();

  return canvas;
}
