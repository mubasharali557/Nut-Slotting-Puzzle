import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CAPACITY } from '../data/levelStages';
import { gameAudio } from '../utils/gameAudio';
import { BOLT_SKINS } from '../data/themes';
import { CUSTOM_COLOR_PALETTE } from './ColorStudioBar';

// Luxury High-Distinction Anodized Metallic Hardware Pigments
export const THREE_NUT_COLORS = {
  red: 0xdc143c,     // Ruby Red (deep luminous jewel crimson)
  blue: 0x2563eb,    // Sapphire Blue (rich royal sapphire)
  green: 0x10b981,   // Emerald Green (vibrant luminous emerald)
  yellow: 0xf4c84a,  // Champagne Gold (warm 18K brushed champagne gold)
  purple: 0x9333ea,  // Amethyst Purple (deep royal amethyst)
  orange: 0xe06d53,  // Metallic Rose Gold (warm copper-rose metallic)
  pink: 0xd946ef,    // Orchid Magenta (distinct from Ruby Red & Rose Gold)
  cyan: 0x22d3ee,    // Turquoise (bright crystal aqua turquoise)
  lime: 0x1e293b,    // Obsidian Slate (dark metallic gunmetal)
  teal: 0x0f766e,    // Premium Teal (deep rich ocean teal)
  gold: 0xb45309,    // Burnished Bronze Gold
  silver: 0xe2e8f0,  // Mirror Platinum
  copper: 0xe06d53,  // Metallic Rose Gold
  white: 0xf8fafc,   // Pearl Silver
  black: 0x18181b,   // Black Oxide Steel
  wood: 0x78350f,    // Burnished Bronze
};

/**
 * Creates high-contrast continuous spiral thread color texture for Three.js PBR bolts.
 * Slanted helical lines wrap seamlessly from u=0 to u=1, creating true continuous spiral screw threads.
 */
function createThreadColorTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Polished brushed stainless steel base
  const bgGrad = ctx.createLinearGradient(0, 0, 512, 0);
  bgGrad.addColorStop(0, '#64748b');
  bgGrad.addColorStop(0.3, '#94a3b8');
  bgGrad.addColorStop(0.5, '#cbd5e1');
  bgGrad.addColorStop(0.7, '#94a3b8');
  bgGrad.addColorStop(1, '#64748b');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 512, 512);

  // Continuous helical threads: 16 spiral turns wrapping seamlessly across the cylinder
  const numTurns = 16;
  const pitch = 512 / numTurns;
  const slope = pitch; // 1 full pitch vertical offset across 1 circumference width

  for (let turn = -1; turn <= numTurns + 1; turn++) {
    const y0 = turn * pitch;

    // 1. Thread root shadow groove (deep metallic V-groove occlusion)
    ctx.beginPath();
    ctx.moveTo(0, y0);
    ctx.lineTo(512, y0 + slope);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4.2;
    ctx.stroke();

    // 2. Thread flank diffuse shading
    ctx.beginPath();
    ctx.moveTo(0, y0 + 3.0);
    ctx.lineTo(512, y0 + slope + 3.0);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3.0;
    ctx.stroke();

    // 3. Thread crest specular highlight (bright gleaming stainless steel reflection)
    ctx.beginPath();
    ctx.moveTo(0, y0 + 6.0);
    ctx.lineTo(512, y0 + slope + 6.0);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3.6;
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  return texture;
}

/**
 * Creates a high-res crisp circular victory checkmark seal texture for completed bolts/items
 */
function createVictoryCheckTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 128, 128);

  // 1. Golden Outer Bevel Rim
  ctx.beginPath();
  ctx.arc(64, 64, 58, 0, Math.PI * 2);
  const goldGrad = ctx.createLinearGradient(16, 16, 112, 112);
  goldGrad.addColorStop(0, '#fef08a');
  goldGrad.addColorStop(0.5, '#eab308');
  goldGrad.addColorStop(1, '#b45309');
  ctx.fillStyle = goldGrad;
  ctx.fill();

  // 2. Emerald Victory Center Disc
  ctx.beginPath();
  ctx.arc(64, 64, 48, 0, Math.PI * 2);
  const emeraldGrad = ctx.createLinearGradient(32, 24, 96, 104);
  emeraldGrad.addColorStop(0, '#34d399');
  emeraldGrad.addColorStop(0.4, '#10b981');
  emeraldGrad.addColorStop(1, '#047857');
  ctx.fillStyle = emeraldGrad;
  ctx.fill();

  // 3. Crisp White Victory Checkmark (✓)
  ctx.beginPath();
  ctx.moveTo(38, 65);
  ctx.lineTo(54, 82);
  ctx.lineTo(90, 44);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Highlight glint
  ctx.beginPath();
  ctx.arc(48, 38, 10, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  return texture;
}

/**
 * Creates true tangent-space normal map for realistic 3D spiral thread grooves
 */
function createThreadNormalTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Neutral tangent space normal: RGB(128, 128, 255)
  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, 512, 512);

  const numTurns = 16;
  const pitch = 512 / numTurns;
  const slope = pitch;

  for (let turn = -1; turn <= numTurns + 1; turn++) {
    const y0 = turn * pitch;

    // Upward-facing flank normal: more green (ny > 0)
    ctx.beginPath();
    ctx.moveTo(0, y0 + 2);
    ctx.lineTo(512, y0 + slope + 2);
    ctx.strokeStyle = 'rgb(128, 195, 235)';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Downward-facing flank normal: less green (ny < 0)
    ctx.beginPath();
    ctx.moveTo(0, y0 + 8);
    ctx.lineTo(512, y0 + slope + 8);
    ctx.strokeStyle = 'rgb(128, 65, 235)';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Sharp crest peak normal: pure outward blue
    ctx.beginPath();
    ctx.moveTo(0, y0 + 5);
    ctx.lineTo(512, y0 + slope + 5);
    ctx.strokeStyle = 'rgb(128, 128, 255)';
    ctx.lineWidth = 2.0;
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  return texture;
}

/**
 * Creates high-luminance studio reflection panorama so flat hex faces and chamfers
 * exhibit vibrant luxury anodized metal reflections instead of darkening in shadow bands.
 */
function createStudioEnvironment() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Luminous upper studio dome + crisp dark horizon contrast band + warm table bounce
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 512);
  bgGrad.addColorStop(0.0, '#f8fafc');  // Bright overhead studio dome
  bgGrad.addColorStop(0.24, '#cbd5e1'); // Satin ceiling fill
  bgGrad.addColorStop(0.40, '#334155'); // Crisp mid contrast shadow band
  bgGrad.addColorStop(0.54, '#f1f5f9'); // Gleaming horizon reflection strip
  bgGrad.addColorStop(0.68, '#3f2e21'); // Warm wood tone transition
  bgGrad.addColorStop(1.0, '#4a2a14');  // Warm wooden workbench bounce
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Broad studio softbox light panels wrapping smoothly around hex bevels
  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
  ctx.fillRect(70, 32, 300, 115);
  ctx.fillRect(460, 24, 340, 125);
  ctx.fillStyle = 'rgba(224, 242, 254, 0.88)';
  ctx.fillRect(850, 75, 140, 180);
  ctx.fillRect(16, 95, 90, 170);

  // Warm golden workshop lamp accent
  const warmGlow = ctx.createRadialGradient(512, 165, 20, 512, 165, 270);
  warmGlow.addColorStop(0, 'rgba(254, 243, 199, 0.85)');
  warmGlow.addColorStop(1, 'rgba(254, 243, 199, 0)');
  ctx.fillStyle = warmGlow;
  ctx.fillRect(240, 0, 544, 360);

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates a true 3D sculpted helical threaded steel shaft geometry
 * so silhouettes show real machined screw teeth catching light.
 */
function createThreadedShaftGeometry(baseRadius = 0.122, height = 0.56, turns = 16) {
  const geom = new THREE.CylinderGeometry(baseRadius, baseRadius, height, 44, 76, false);
  geom.translate(0, height / 2, 0);

  const pos = geom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    if (r < baseRadius * 0.5) continue; // Keep end cap centers intact

    const yNorm = y / height;
    // Taper thread relief near base collar and bolt head
    const endFade = Math.min(1, yNorm / 0.045, (1 - yNorm) / 0.045);
    const theta = Math.atan2(x, z);
    const phase = (yNorm * turns + theta / (Math.PI * 2)) * Math.PI * 2;
    const ridge = Math.pow(0.5 + 0.5 * Math.cos(phase), 1.35) - 0.45;
    const scale = (r + 0.011 * ridge * endFade) / r;

    pos.setX(i, x * scale);
    pos.setZ(i, z * scale);
  }
  pos.needsUpdate = true;
  geom.computeVertexNormals();
  return geom;
}

/**
 * Creates a smooth chamfered silver stud tip matching the shaft diameter
 * so stacked hex nuts show the bolt tip cleanly centered inside the top hole.
 */
function createStudTipGeometry(radius = 0.116, height = 0.044) {
  const pts = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(radius, 0.0),
    new THREE.Vector2(radius, height * 0.25),
    new THREE.Vector2(radius * 0.88, height * 0.65),
    new THREE.Vector2(radius * 0.60, height * 0.90),
    new THREE.Vector2(radius * 0.25, height),
    new THREE.Vector2(0.0, height),
  ];
  const geom = new THREE.LatheGeometry(pts, 40);
  geom.computeVertexNormals();
  return geom;
}

/**
 * Creates a solid 3D machined brushed-steel Completion Cap / Lock Lid
 * that screws onto the top of a finished 4-nut bolt to seal it cleanly.
 */
function createCompletionCapGeometry(radius = 0.174, height = 0.088) {
  const pts = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(radius, 0.0),
    new THREE.Vector2(radius, height * 0.54),
    new THREE.Vector2(radius * 0.84, height * 0.90),
    new THREE.Vector2(radius * 0.68, height),
    new THREE.Vector2(0.0, height),
  ];
  const geom = new THREE.LatheGeometry(pts, 40);
  geom.computeVertexNormals();
  return geom;
}

/**
 * Creates a clean bevelled round silver steel flange base disc (matching slot reference)
 */
function createMachinedFlangeGeometry(outerRadius = 0.305, height = 0.056) {
  const pts = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(outerRadius, 0.0),
    new THREE.Vector2(outerRadius, height * 0.72),
    new THREE.Vector2(outerRadius * 0.94, height * 0.94),
    new THREE.Vector2(outerRadius * 0.88, height),
    new THREE.Vector2(0.0, height),
  ];
  const geom = new THREE.LatheGeometry(pts, 44);
  geom.computeVertexNormals();
  return geom;
}

/**
 * Creates crisp DIN hexagonal nut geometry + open circular machined bearing collar ring
 */
function createNutGeometry(outerRadius = 0.268, innerRadius = 0.134, thickness = 0.120) {
  const shape = new THREE.Shape();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const x = outerRadius * Math.cos(angle);
    const y = outerRadius * Math.sin(angle);
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();

  // Snug circular center bore hole gripping the threaded bolt shaft
  const holePath = new THREE.Path();
  holePath.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
  shape.holes.push(holePath);

  const extrudeSettings = {
    depth: thickness,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.015,
    bevelThickness: 0.015,
  };

  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geom.center(); // Center at (0, 0, 0)
  geom.rotateX(Math.PI / 2); // Orient horizontal so bolt passes vertically along Y
  return geom;
}

/**
 * Creates the thin circular CNC chamfered bearing collar on the top face of a hex nut
 */
function createNutBearingRingGeometry(innerRadius = 0.129, outerRadius = 0.214, height = 0.006) {
  const pts = [
    new THREE.Vector2(innerRadius, 0.0),
    new THREE.Vector2(outerRadius, 0.0),
    new THREE.Vector2(outerRadius * 0.96, height),
    new THREE.Vector2(innerRadius * 1.03, height),
    new THREE.Vector2(innerRadius, 0.0),
  ];
  const geom = new THREE.LatheGeometry(pts, 40);
  geom.computeVertexNormals();
  return geom;
}

export default function ThreeGameBoard({
  bottles,
  onBottlesChange,
  onWin,
  isPaused = false,
  hint = null,
  activeSkin = 'classic',
  activeNutSkin = 'steel_classic',
  currentStage = 1,
  isPaintMode = false,
  activePaintColor = 'red',
  studioMode = 'paint',
  onNutPaint,
  onNutSwap,
  onColorCompleted,
}) {
  const containerRef = useRef(null);
  const propsRef = useRef({
    onBottlesChange,
    onWin,
    isPaused,
    hint,
    activeSkin,
    activeNutSkin,
    currentStage,
    isPaintMode,
    activePaintColor,
    studioMode,
    onNutPaint,
    onNutSwap,
    onColorCompleted,
  });
  useEffect(() => {
    propsRef.current = {
      onBottlesChange,
      onWin,
      isPaused,
      hint,
      activeSkin,
      activeNutSkin,
      currentStage,
      isPaintMode,
      activePaintColor,
      studioMode,
      onNutPaint,
      onNutSwap,
      onColorCompleted,
    };
  });

  const stateRef = useRef({
    bottles: bottles.map((b) => [...b]),
    selected: null,
    hoveredTube: null, // Interactive hover tracking for subtle motion & aura
    isAnimating: false,
    animTime: 0,
    moveData: null,
    selectedLift: {},
    lastRejectedIdx: null,
    swapSelection: null, // For swapping nuts in studio mode: { tubeIndex, nutIndex }
    celebratingBolts: {}, // { [tubeIndex]: { time, maxTime, color } }
  });

  const cameraUpdateRef = useRef(null);

  useEffect(() => {
    stateRef.current.bottles = bottles.map((b) => [...b]);
    stateRef.current.selected = null;
    stateRef.current.isAnimating = false;
    stateRef.current.moveData = null;
    if (cameraUpdateRef.current && containerRef.current) {
      cameraUpdateRef.current(
        containerRef.current.clientWidth || 600,
        containerRef.current.clientHeight || 500
      );
    }
  }, [bottles]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 500;

    // 1. Scene & Hardware Renderer (Calibrated camera placing gameplay 100% inside the wooden table)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, width / height, 0.1, 100);

    // Responsive FOV & Camera positioning helper: Prominent, proportionate hardware on mobile & desktop
    const updateCameraForViewport = (w, h) => {
      const aspect = w / h;
      camera.aspect = aspect;

      const refAspect = 16 / 9;
      if (aspect < 1.0) {
        // Mobile portrait: prominent, larger bolts seated cleanly on the wooden bench
        const bottlesLen = stateRef.current?.bottles?.length || 4;
        const isWidePortraitRow = bottlesLen === 4 || bottlesLen >= 7;
        camera.fov = 42;
        camera.position.set(0, isWidePortraitRow ? 2.26 : 2.00, isWidePortraitRow ? 7.45 : 5.90);
        camera.lookAt(0, isWidePortraitRow ? -0.15 : -0.16, 0);
      } else if (aspect < refAspect) {
        // Intermediate screens / tablets
        const baseFovRad = (28 * Math.PI) / 180;
        const targetHalfWidth = Math.tan(baseFovRad / 2) * refAspect;
        const requiredFovRad = 2 * Math.atan(targetHalfWidth / aspect);
        camera.fov = Math.min(35, (requiredFovRad * 180) / Math.PI);
        const ratioDiff = refAspect - aspect;
        camera.position.set(0, 2.00 + ratioDiff * 0.15, 8.95 + ratioDiff * 0.5);
        camera.lookAt(0, 0.05, 0);
      } else {
        // Desktop widescreen: closer framing so bolts & nuts look prominent and crisp across the workbench
        camera.fov = 28;
        camera.position.set(0, 1.94, 8.65);
        camera.lookAt(0, 0.03, 0);
      }
      camera.updateProjectionMatrix();
    };

    cameraUpdateRef.current = updateCameraForViewport;
    updateCameraForViewport(width, height);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    container.appendChild(renderer.domElement);

    // 2. Studio Environment & Lighting Rig (Realistic studio lighting without color bleaching)
    const envTexture = createStudioEnvironment();
    scene.environment = envTexture;

    const ambientLight = new THREE.AmbientLight(0xfff7ed, 0.70);
    scene.add(ambientLight);

    // Primary Key Light (Top-Left key)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(5, 12, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 512;
    keyLight.shadow.mapSize.height = 512;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // Cool Back/Rim Light (Crisp metallic contour edges)
    const rimLight = new THREE.DirectionalLight(0xdbeafe, 0.90);
    rimLight.position.set(-6, 8, -5);
    scene.add(rimLight);

    // Warm Front Accent Light
    const fillLight = new THREE.DirectionalLight(0xffeed6, 0.60);
    fillLight.position.set(0, 4, 10);
    scene.add(fillLight);

    // 3. Shared Geometries & PBR Hardware Textures
    const textureLoader = new THREE.TextureLoader();
    const loadBrushedMap = (url, repeatVal = 3.2) => {
      const tex = textureLoader.load(url);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(repeatVal, repeatVal);
      return tex;
    };

    const brushedAlbedoMap = loadBrushedMap('/hardware/steel_brushed_albedo.webp', 3.4);
    brushedAlbedoMap.colorSpace = THREE.SRGBColorSpace;
    const brushedRoughnessMap = loadBrushedMap('/hardware/steel_brushed_roughness.webp', 3.4);
    const brushedBumpMap = loadBrushedMap('/hardware/steel_brushed_bump.webp', 3.4);

    // Nano Banana Photorealistic Stainless Steel Screw Thread PBR Maps
    const nanoThreadColorMap = textureLoader.load('/hardware/nano_screw_thread_albedo.webp');
    nanoThreadColorMap.wrapS = THREE.RepeatWrapping;
    nanoThreadColorMap.wrapT = THREE.RepeatWrapping;
    nanoThreadColorMap.repeat.set(1, 2.8);
    nanoThreadColorMap.colorSpace = THREE.SRGBColorSpace;

    const nanoThreadNormalMap = textureLoader.load('/hardware/nano_screw_thread_normal.webp');
    nanoThreadNormalMap.wrapS = THREE.RepeatWrapping;
    nanoThreadNormalMap.wrapT = THREE.RepeatWrapping;
    nanoThreadNormalMap.repeat.set(1, 2.8);

    const nanoThreadRoughMap = textureLoader.load('/hardware/nano_screw_thread_roughness.webp');
    nanoThreadRoughMap.wrapS = THREE.RepeatWrapping;
    nanoThreadRoughMap.wrapT = THREE.RepeatWrapping;
    nanoThreadRoughMap.repeat.set(1, 2.8);

    const threadColorMap = createThreadColorTexture();
    const threadNormalMap = createThreadNormalTexture();
    const nutGeometry = createNutGeometry(0.268, 0.134, 0.120);
    const nutRingGeometry = createNutBearingRingGeometry(0.135, 0.220, 0.006);
    const boreGeometry = new THREE.CylinderGeometry(0.135, 0.135, 0.136, 28, 1, true);

    // Prominent Stainless Threaded Steel Stud Shaft (sleek, taller hardware + exposed threaded tip when incomplete)
    const shaftHeight = 0.725;
    const shaftGeometry = createThreadedShaftGeometry(0.122, shaftHeight, 23);

    // Smooth Chamfered Silver Stud Tip (peeking out of top nut center hole when incomplete)
    const headHeight = 0.048;
    const headGeometry = createStudTipGeometry(0.122, headHeight);

    // 3D Brushed Steel Completion Cap Lid (screws on top when all 4 nuts match)
    const completionCapGeometry = createCompletionCapGeometry(0.180, 0.095);
    const completionCapMaterial = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.90,
      roughness: 0.18,
      map: brushedAlbedoMap,
      roughnessMap: brushedRoughnessMap,
      bumpMap: brushedBumpMap,
      bumpScale: 0.0025,
      envMapIntensity: 1.55,
    });

    // Round Silver Steel Flange Base Disc
    const baseHeight = 0.064;
    const baseGeometry = createMachinedFlangeGeometry(0.288, baseHeight);
    const contactShadowGeometry = new THREE.RingGeometry(0.155, 0.328, 36);
    contactShadowGeometry.rotateX(-Math.PI / 2);

    // Materials Cache
    const contactShadowMaterial = new THREE.MeshBasicMaterial({
      color: 0x050302,
      transparent: true,
      opacity: 0.40,
      depthWrite: false,
    });

    const boltShaftMaterial = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.90,
      roughness: 0.22,
      roughnessMap: nanoThreadRoughMap,
      map: nanoThreadColorMap,
      normalMap: nanoThreadNormalMap,
      normalScale: new THREE.Vector2(1.9, 1.9),
      envMapIntensity: 1.5,
    });

    const boltHeadMaterial = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.92,
      roughness: 0.18,
      map: brushedAlbedoMap,
      roughnessMap: brushedRoughnessMap,
      bumpMap: brushedBumpMap,
      bumpScale: 0.003,
      envMapIntensity: 1.55,
    });

    const boltBaseMaterial = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      metalness: 0.88,
      roughness: 0.24,
      map: brushedAlbedoMap,
      roughnessMap: brushedRoughnessMap,
      bumpMap: brushedBumpMap,
      bumpScale: 0.003,
      envMapIntensity: 1.45,
    });

    const boreMaterial = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.90,
      roughness: 0.28,
      map: nanoThreadColorMap,
      normalMap: nanoThreadNormalMap,
      normalScale: new THREE.Vector2(1.5, 1.5),
      side: THREE.BackSide,
      envMapIntensity: 1.2,
    });

    // Luxury Anodized & Brushed Metallic Hex Nut Materials (calibrated per pigment for jewel brilliance + real metal reflections)
    const metallicPreciousKeys = new Set(['yellow', 'orange', 'gold', 'silver', 'copper', 'white']);
    const nutMaterials = {};
    for (const [key, hex] of Object.entries(THREE_NUT_COLORS)) {
      const isPreciousMetal = metallicPreciousKeys.has(key);
      nutMaterials[key] = new THREE.MeshPhysicalMaterial({
        color: hex,
        map: brushedAlbedoMap,
        roughnessMap: brushedRoughnessMap,
        bumpMap: brushedBumpMap,
        bumpScale: 0.003,
        metalness: isPreciousMetal ? 0.68 : 0.44,
        roughness: isPreciousMetal ? 0.18 : 0.22,
        clearcoat: 0.85,
        clearcoatRoughness: 0.09,
        reflectivity: 0.96,
        envMapIntensity: isPreciousMetal ? 1.55 : 1.45,
        emissive: hex,
        emissiveIntensity: isPreciousMetal ? 0.05 : 0.07,
      });
    }

    // Selection Halo Material
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const haloGeometry = new THREE.RingGeometry(0.312, 0.368, 32);
    haloGeometry.rotateX(-Math.PI / 2);

    // 4. Object Pools
    const boltMeshes = []; // { group, shaft, headGroup, collar, base, halo, badge, badgeScale }
    const restingNutMeshes = []; // Array of THREE.Mesh (with bore + bearing collar ring children)
    const movingNutMesh = new THREE.Mesh(nutGeometry, nutMaterials.red);
    const movingBoreMesh = new THREE.Mesh(boreGeometry, boreMaterial);
    const movingRingMesh = new THREE.Mesh(nutRingGeometry, nutMaterials.red);
    movingRingMesh.position.y = 0.074;
    movingNutMesh.userData.ringMesh = movingRingMesh;
    movingNutMesh.add(movingBoreMesh);
    movingNutMesh.add(movingRingMesh);
    movingNutMesh.visible = false;
    scene.add(movingNutMesh);

    // 5. Celebration Sparkle Particle Pool (Starbursts when color set is completed)
    const sparkleParticles = [];
    const sparkleGeometry = new THREE.OctahedronGeometry(0.045, 0);
    const sparkleMaterialPool = [
      new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true }), // Golden Sparkle
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true }), // Pure Diamond White
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true }), // Electric Cyan
      new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true }), // Hot Rose
      new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true }), // Emerald Green
    ];

    for (let p = 0; p < 70; p++) {
      const mat = sparkleMaterialPool[p % sparkleMaterialPool.length];
      const mesh = new THREE.Mesh(sparkleGeometry, mat);
      mesh.visible = false;
      scene.add(mesh);
      sparkleParticles.push({
        mesh,
        vx: 0,
        vy: 0,
        vz: 0,
        rotSpeed: 0,
        life: 0,
        maxLife: 1.0,
      });
    }

    function triggerBoltCelebration(tubeIndex, colorKey) {
      const state = stateRef.current;
      state.celebratingBolts[tubeIndex] = { time: 0, maxTime: 1.5, color: colorKey };

      const layout = calculateLayout(state.bottles.length);
      const pos = layout.positions[tubeIndex];
      if (!pos) return;

      const originX = pos.x;
      const originY = pos.y + baseHeight + nutSpacing * 2.0;
      const originZ = pos.z;

      // Spawn 35 glistening starburst particles
      let spawned = 0;
      for (let i = 0; i < sparkleParticles.length && spawned < 35; i++) {
        const p = sparkleParticles[i];
        if (p.life <= 0) {
          const angle = Math.random() * Math.PI * 2;
          const hSpeed = 0.5 + Math.random() * 1.5;
          p.vx = Math.cos(angle) * hSpeed;
          p.vz = Math.sin(angle) * hSpeed;
          p.vy = 1.2 + Math.random() * 2.2;
          p.rotSpeed = (Math.random() - 0.5) * 14;
          p.maxLife = 0.9 + Math.random() * 0.5;
          p.life = p.maxLife;

          p.mesh.position.set(
            originX + (Math.random() - 0.5) * 0.18,
            originY + (Math.random() - 0.5) * 0.18,
            originZ + (Math.random() - 0.5) * 0.18
          );
          p.mesh.scale.setScalar(0.7 + Math.random() * 0.6);
          p.mesh.visible = true;
          spawned++;
        }
      }
    }

    // Layout configuration: Strictly constrained within the wooden table boundary
    function calculateLayout(numTubes) {
      const currentAspect = (renderer?.domElement?.clientWidth || 800) / (renderer?.domElement?.clientHeight || 600);
      const isPortrait = currentAspect < 1.0;

      // In portrait, split into 2 rows when tubes >= 5 so nuts remain large & uncrowded
      const isTwoRows = isPortrait ? numTubes >= 5 : numTubes > 4;
      const row1Count = isTwoRows ? Math.ceil(numTubes / 2) : numTubes;
      const row2Count = isTwoRows ? numTubes - row1Count : 0;
      const maxCols = Math.max(row1Count, row2Count, 3);

      let colSpacing, r1Z, r1Y, r2Z, r2Y;

      if (isPortrait) {
        if (numTubes >= 7) {
          r1Z = -0.48;
          r1Y = -1.92;
          r2Z = 0.52;
          r2Y = -2.02;
        } else if (isTwoRows) {
          r1Z = -0.40;
          r1Y = -1.56;
          r2Z = 0.48;
          r2Y = -1.64;
        } else if (numTubes === 4) {
          r1Z = 0.08;
          r1Y = -1.96;
          r2Z = 0.48;
          r2Y = -1.64;
        } else {
          r1Z = 0.10;
          r1Y = -1.62;
          r2Z = 0.48;
          r2Y = -1.64;
        }

        // Dynamic camera frustum width calculation on front-most row so outer flanges stay inside screen
        const vfovRad = (camera.fov * Math.PI) / 180;
        const frontRowZ = isTwoRows ? r2Z : r1Z;
        const distToPlane = Math.abs(camera.position.z - frontRowZ);
        const visH = 2 * distToPlane * Math.tan(vfovRad / 2);
        const visW = visH * currentAspect;

        const flangeDiameter = 0.576;
        const availableW = Math.max(1.2, visW * 0.95 - flangeDiameter);
        const maxGapSpacing = maxCols >= 4 ? 0.68 : 0.70;
        colSpacing = Math.min(maxGapSpacing, availableW / Math.max(1, maxCols - 1));
      } else {
        // Desktop / widescreen
        const totalWidth = 3.9;
        colSpacing = Math.min(0.92, totalWidth / Math.max(1, maxCols - 0.2));

        r1Z = isTwoRows ? -0.56 : 0.05;
        r1Y = isTwoRows ? -1.14 : -1.24;
        r2Z = 0.64;
        r2Y = -1.28;
      }

      const positions = [];
      const r1StartX = -((row1Count - 1) * colSpacing) / 2;

      for (let i = 0; i < row1Count; i++) {
        positions.push({
          x: r1StartX + i * colSpacing,
          y: r1Y,
          z: r1Z,
          row: 1,
        });
      }

      if (isTwoRows) {
        const r2StartX = -((row2Count - 1) * colSpacing) / 2;
        for (let j = 0; j < row2Count; j++) {
          positions.push({
            x: r2StartX + j * colSpacing,
            y: r2Y,
            z: r2Z,
            row: 2,
          });
        }
      }

      return { positions, isTwoRows, colSpacing };
    }

    // Raycaster for user click interaction (Supports both sorting gameplay and Paint Mode)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e) => {
      const state = stateRef.current;
      if (state.isAnimating || propsRef.current.isPaused) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Collect all interactive hardware meshes (nuts & bolts)
      const interactables = [];
      boltMeshes.forEach((bm) => {
        if (bm.group.visible) {
          interactables.push(bm.shaft, bm.collar, bm.base);
        }
      });
      restingNutMeshes.forEach((nm) => {
        if (nm.visible) {
          interactables.push(nm);
        }
      });

      const intersects = raycaster.intersectObjects(interactables, false);
      if (intersects.length > 0) {
        const hitObj = intersects[0].object;
        const hitData = hitObj.userData || {};

        // 1. Color Studio / Paint & Swap Mode Active (Exclusively for NUTS):
        if (propsRef.current.isPaintMode) {
          const studioMode = propsRef.current.studioMode || 'paint';

          if (studioMode === 'swap') {
            if (hitData.type === 'nut') {
              if (!state.swapSelection) {
                // Select 1st nut for swap
                state.swapSelection = { tubeIndex: hitData.tubeIndex, nutIndex: hitData.nutIndex };
                gameAudio.playSelect();
              } else {
                // Select 2nd nut and execute swap!
                const first = state.swapSelection;
                const second = { tubeIndex: hitData.tubeIndex, nutIndex: hitData.nutIndex };
                state.swapSelection = null;
                propsRef.current.onNutSwap?.(first, second);
                gameAudio.playClick();
              }
              return;
            }
          } else {
            // Paint mode: applies selected color exclusively to the clicked nut
            if (hitData.type === 'nut') {
              propsRef.current.onNutPaint?.(hitData.tubeIndex, hitData.nutIndex, propsRef.current.activePaintColor);
              gameAudio.playClick();
              return;
            }
            // If user clicked the bolt with nuts on it, paint top nut
            if (hitData.type === 'bolt' && hitData.tubeIndex !== undefined) {
              const b = state.bottles[hitData.tubeIndex];
              if (b && b.length > 0) {
                propsRef.current.onNutPaint?.(hitData.tubeIndex, b.length - 1, propsRef.current.activePaintColor);
                gameAudio.playClick();
                return;
              }
            }
          }
          return;
        }

        // 2. Normal Gameplay Mode:
        if (hitData.tubeIndex !== undefined) {
          handleTubeClick(hitData.tubeIndex);
        }
      }
    };

    // Subtle, interactive pointer hover tracking (gentle nut hover lifts and bolt aura)
    const handlePointerMove = (e) => {
      const state = stateRef.current;
      if (state.isAnimating || propsRef.current.isPaused) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const interactables = [];
      boltMeshes.forEach((bm) => {
        if (bm.group.visible) {
          interactables.push(bm.shaft, bm.collar, bm.base);
        }
      });
      restingNutMeshes.forEach((nm) => {
        if (nm.visible) {
          interactables.push(nm);
        }
      });

      const intersects = raycaster.intersectObjects(interactables, false);
      if (intersects.length > 0) {
        const hitData = intersects[0].object.userData || {};
        if (hitData.tubeIndex !== undefined) {
          state.hoveredTube = hitData.tubeIndex;
          renderer.domElement.style.cursor = 'pointer';
          return;
        }
      }
      state.hoveredTube = null;
      renderer.domElement.style.cursor = 'default';
    };

    const handlePointerLeave = () => {
      stateRef.current.hoveredTube = null;
      renderer.domElement.style.cursor = 'default';
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerleave', handlePointerLeave);

    function handleTubeClick(index) {
      const state = stateRef.current;
      const b = state.bottles;

      // Case 1: Nothing selected yet
      if (state.selected === null) {
        if (!b[index] || b[index].length === 0) return;
        state.selected = index;
        state.lastRejectedIdx = null;
        gameAudio.playSelect();
        return;
      }

      // Case 2: Deselect clicked tube
      if (state.selected === index) {
        state.selected = null;
        state.lastRejectedIdx = null;
        gameAudio.playDeselect();
        return;
      }

      // Case 3: Destination clicked
      const fromIdx = state.selected;
      const toIdx = index;
      const fromBottle = b[fromIdx];
      const toBottle = b[toIdx];

      // Free placement logic: No color restrictions!
      // Any nut can be moved to any bolt/slot/row as long as destination has room (< CAPACITY)
      if (!canSlot(fromBottle, toBottle)) {
        // Destination is full (already has 4 nuts): switch selection if destination has movable nuts
        if (toBottle && toBottle.length > 0) {
          state.selected = toIdx;
          state.lastRejectedIdx = null;
          gameAudio.playSelect();
        }
        // Invalid/empty tap while a nut is selected: do NOT play opening/unscrewing sound
        return;
      }

      state.lastRejectedIdx = null;

      // Start Transfer: 1 nut moves cleanly from source to destination regardless of color
      const topColor = fromBottle[fromBottle.length - 1];
      const amount = 1;

      state.isAnimating = true;
      state.animTime = 0;
      state.moveData = {
        fromIdx,
        toIdx,
        color: topColor,
        amount,
        phase1Started: false,
        phase1Released: false,
        phase3Started: false,
        lastSoundTurnStep: 0,
      };
    }

    // Universal Placement Validation: Color never blocks placement
    function canSlot(source, dest) {
      if (!source || source.length === 0) return false;
      if (!dest || dest.length >= CAPACITY) return false;
      // Free movement: allow nuts of any color to be placed into any row or slot
      return true;
    }

    function isComplete(bottle) {
      if (!bottle || bottle.length !== CAPACITY) return false;
      return bottle.every((c) => c === bottle[0]);
    }

    function checkWin(allBottles) {
      let hasSorted = false;
      for (const b of allBottles) {
        if (b.length === 0) continue;
        if (b.length !== CAPACITY) return false;
        if (!b.every((c) => c === b[0])) return false;
        hasSorted = true;
      }
      return hasSorted;
    }

    // Animation Ticker
    let clock = new THREE.Clock();
    let animId = null;

    const nutThickness = 0.120;
    const nutSpacing = 0.148; // Exact DIN machined nut thickness + chamfers with crisp layer separation
    const threadPitch = shaftHeight / 23;

    function renderLoop() {
      animId = requestAnimationFrame(renderLoop);
      const deltaSec = Math.min(0.05, clock.getDelta());
      const state = stateRef.current;
      const bottlesData = state.bottles;
      const layout = calculateLayout(bottlesData.length);

      // 1. Synchronize Bolt Meshes Pool (Slot-Style Stud Bolts + Round Silver Flange Discs)
      while (boltMeshes.length < layout.positions.length) {
        const group = new THREE.Group();
        const boltIdx = boltMeshes.length;

        // Soft contact shadow directly under round flange base
        const contactShadow = new THREE.Mesh(contactShadowGeometry, contactShadowMaterial);
        contactShadow.position.y = 0.002;
        group.add(contactShadow);

        // Silver stainless threaded stud shaft with Nano Banana threads
        const shaft = new THREE.Mesh(shaftGeometry, boltShaftMaterial);
        shaft.castShadow = true;
        shaft.receiveShadow = true;
        shaft.userData = { type: 'bolt', tubeIndex: boltIdx };

        // Smooth chamfered silver stud tip matching shaft diameter (allows nuts to thread cleanly off top)
        const headGroup = new THREE.Group();

        const collar = new THREE.Mesh(headGeometry, boltHeadMaterial);
        collar.castShadow = true;
        collar.receiveShadow = true;
        collar.userData = { type: 'bolt', tubeIndex: boltIdx };
        headGroup.add(collar);

        // 3D Brushed Silver Completion Cap Lid: screws flush onto the 4th nut when bolt is solved
        const badge = new THREE.Mesh(completionCapGeometry, completionCapMaterial);
        badge.position.y = baseHeight + 4 * nutSpacing - shaftHeight; // Exact flush top of 4th nut
        badge.castShadow = true;
        badge.receiveShadow = true;
        badge.visible = false;
        headGroup.add(badge);

        headGroup.position.y = shaftHeight;

        // Round Silver Steel Flange Disc Base
        const base = new THREE.Mesh(baseGeometry, boltBaseMaterial);
        base.castShadow = true;
        base.receiveShadow = true;
        base.userData = { type: 'bolt', tubeIndex: boltIdx };

        const halo = new THREE.Mesh(haloGeometry, haloMaterial);
        halo.position.y = 0.008;
        halo.visible = false;

        group.add(base);
        group.add(shaft);
        group.add(headGroup);
        group.add(halo);

        scene.add(group);
        boltMeshes.push({ group, shaft, headGroup, collar, base, halo, badge, badgeScale: 0 });
      }

      // Position bolts on wooden tabletop and update selection halo
      for (let i = 0; i < boltMeshes.length; i++) {
        const bm = boltMeshes[i];
        if (i < layout.positions.length) {
          const pos = layout.positions[i];
          bm.group.position.set(pos.x, pos.y, pos.z);
          bm.group.visible = true;

          const isSelected = state.selected === i && !state.isAnimating;
          const isHovered = state.hoveredTube === i && !isSelected && !state.isAnimating;
          const cel = state.celebratingBolts[i];
          bm.halo.visible = isSelected || isHovered || Boolean(cel);
          if (isSelected) {
            bm.halo.material.color.setHex(0xfacc15);
            bm.halo.material.opacity = 0.70 + Math.sin(clock.getElapsedTime() * 8) * 0.25;
          } else if (isHovered) {
            bm.halo.material.color.setHex(0x38bdf8); // Gentle cyan interactive hover aura
            bm.halo.material.opacity = 0.40 + Math.sin(clock.getElapsedTime() * 6) * 0.15;
          } else if (cel) {
            bm.halo.material.color.setHex(0xfacc15);
            bm.halo.material.opacity = 0.5 + Math.sin(cel.time * 20) * 0.45;
          }

          // 3D Completion Cap Lid: Smoothly screws down & locks onto top of completed 4-nut bolt
          const isCompleted = isComplete(bottlesData[i]);
          const targetScale = isCompleted ? 1.0 : 0.0;
          bm.badgeScale = THREE.MathUtils.lerp(bm.badgeScale || 0, targetScale, Math.min(1, 12 * deltaSec));

          if (bm.badgeScale > 0.02) {
            bm.badge.visible = true;
            bm.badge.scale.setScalar(bm.badgeScale);
            const flushCapY = baseHeight + 4 * nutSpacing - shaftHeight;
            // Descend slightly as it screws onto the top nut
            bm.badge.position.y = flushCapY + (1.0 - bm.badgeScale) * 0.06;
            bm.badge.rotation.y = (1.0 - bm.badgeScale) * Math.PI * 3;
          } else {
            bm.badge.visible = false;
          }
        } else {
          bm.group.visible = false;
        }
      }

      // 2. Synchronize Resting Nuts Pool
      let totalRestingNuts = 0;
      for (let i = 0; i < bottlesData.length; i++) {
        const isSource = state.isAnimating && state.moveData?.fromIdx === i;
        const count = isSource ? bottlesData[i].length - state.moveData.amount : bottlesData[i].length;
        totalRestingNuts += count;
      }

      while (restingNutMeshes.length < totalRestingNuts) {
        const nutMesh = new THREE.Mesh(nutGeometry, nutMaterials.red);
        const boreMesh = new THREE.Mesh(boreGeometry, boreMaterial);
        const ringMesh = new THREE.Mesh(nutRingGeometry, nutMaterials.red);
        ringMesh.position.y = 0.074;
        nutMesh.userData.ringMesh = ringMesh;
        nutMesh.add(boreMesh);
        nutMesh.add(ringMesh);
        nutMesh.castShadow = true;
        nutMesh.receiveShadow = true;
        scene.add(nutMesh);
        restingNutMeshes.push(nutMesh);
      }
      for (let i = totalRestingNuts; i < restingNutMeshes.length; i++) {
        restingNutMeshes[i].visible = false;
      }

      // Animate selection & subtle interactive hover lift with smooth spring physics
      for (let i = 0; i < bottlesData.length; i++) {
        const isSelected = state.selected === i && !state.isAnimating;
        const isHovered = state.hoveredTube === i && !isSelected && !state.isAnimating;
        const hasNuts = bottlesData[i] && bottlesData[i].length > 0;

        let targetLift = 0;
        if (isSelected) {
          targetLift = 0.21; // Full unscrew lift
        } else if (isHovered && hasNuts) {
          targetLift = 0.038; // Subtle interactive hover lift along threads
        }

        const currLift = state.selectedLift[i] || 0;
        state.selectedLift[i] = currLift + (targetLift - currLift) * Math.min(1, 16 * deltaSec);
      }

      // Position Resting Nuts
      let nutIdx = 0;
      for (let i = 0; i < bottlesData.length; i++) {
        const pos = layout.positions[i];
        const stack = bottlesData[i];
        const isSource = state.isAnimating && state.moveData?.fromIdx === i;
        const displayCount = isSource ? stack.length - state.moveData.amount : stack.length;
        const lift = state.selectedLift[i] || 0;

        for (let l = 0; l < displayCount; l++) {
          const colorKey = stack[l];
          const mesh = restingNutMeshes[nutIdx++];
          const mat = nutMaterials[colorKey] || nutMaterials.red;
          mesh.visible = true;
          mesh.material = mat;
          if (mesh.userData.ringMesh) mesh.userData.ringMesh.material = mat;
          mesh.userData = { ...mesh.userData, type: 'nut', tubeIndex: i, nutIndex: l };

          const isTop = l === displayCount - 1 && (state.selected === i || state.hoveredTube === i);
          const nutLift = isTop ? lift : 0;
          const cel = state.celebratingBolts[i];
          const celBounce = cel
            ? Math.sin(cel.time * 16 + l * 0.5) * 0.05 * Math.max(0, 1.0 - cel.time / cel.maxTime)
            : 0;
          const celSpin = cel ? cel.time * 7 : 0;

          // Nut sits flush on stepped washer flange: baseHeight + totalNutHeight / 2
          const restY = pos.y + baseHeight + nutSpacing * 0.5 + l * nutSpacing + nutLift + celBounce;

          mesh.position.set(pos.x, restY, pos.z);

          // Thread-phase resting angle + helical unscrewing rotation when lifted + celebration spin
          const baseAngle = l * 0.45;
          const unscrewAngle = isTop ? -(nutLift / threadPitch) * Math.PI * 2 : 0;
          mesh.rotation.set(0, baseAngle + unscrewAngle + celSpin, 0);
        }
      }

      // 3. Handle Active Nut Transfer
      if (state.isAnimating && state.moveData) {
        state.animTime += deltaSec;
        const duration = 0.82;
        const rawProgress = Math.min(1.0, state.animTime / duration);

        const { fromIdx, toIdx, color } = state.moveData;
        const fromPos = layout.positions[fromIdx];
        const toPos = layout.positions[toIdx];

        const fromStack = bottlesData[fromIdx];
        const toStack = bottlesData[toIdx];

        const fromRestY = fromPos.y + baseHeight + nutSpacing * 0.5 + (fromStack.length - 1) * nutSpacing;
        const toRestY = toPos.y + baseHeight + nutSpacing * 0.5 + toStack.length * nutSpacing;
        const apexY = Math.max(fromPos.y, toPos.y) + shaftHeight + headHeight + 0.14;

        const movingMat = nutMaterials[color] || nutMaterials.red;
        movingNutMesh.visible = true;
        movingNutMesh.material = movingMat;
        if (movingNutMesh.userData.ringMesh) movingNutMesh.userData.ringMesh.material = movingMat;

        // Cubic Easing helper
        const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

        // Phase 1: Unscrew & Climb Up (0.00 to 0.30)
        if (rawProgress < 0.30) {
          const sub = rawProgress / 0.30;
          const eased = easeInOut(sub);
          const currY = fromRestY + (apexY - fromRestY) * eased;
          const totalUnscrewTurns = (apexY - fromRestY) / threadPitch;

          movingNutMesh.position.set(fromPos.x, currY, fromPos.z);
          movingNutMesh.rotation.set(0, -eased * totalUnscrewTurns * Math.PI * 2, 0);

          if (!state.moveData.phase1Started) {
            state.moveData.phase1Started = true;
            gameAudio.playUnscrewStart(duration * 0.30);
          }
          const turnStep = Math.floor(eased * totalUnscrewTurns * 5.5);
          if (turnStep > state.moveData.lastSoundTurnStep) {
            state.moveData.lastSoundTurnStep = turnStep;
            gameAudio.playThreadClick(sub, 'up');
          }
        }
        // Phase 2: Parabolic 3D Transfer Arc (0.30 to 0.70)
        else if (rawProgress < 0.70) {
          if (!state.moveData.phase1Released) {
            state.moveData.phase1Released = true;
            gameAudio.playUnscrewRelease();
          }
          const sub = (rawProgress - 0.30) / 0.40;
          const eased = easeInOut(sub);

          const currX = fromPos.x + (toPos.x - fromPos.x) * eased;
          const currZ = fromPos.z + (toPos.z - fromPos.z) * eased;
          const flightArc = Math.sin(sub * Math.PI) * 0.18;
          const currY = apexY + flightArc;

          // Gentle flight banking tilt towards movement direction
          const dir = toPos.x >= fromPos.x ? 1 : -1;
          const tilt = dir * Math.sin(sub * Math.PI) * 0.12;

          movingNutMesh.position.set(currX, currY, currZ);
          movingNutMesh.rotation.set(0, -Math.PI * 3 + sub * Math.PI * 2, tilt);
        }
        // Phase 3: Descend & Screw Down onto Destination (0.70 to 1.00)
        else if (rawProgress < 1.0) {
          const sub = (rawProgress - 0.70) / 0.30;
          const eased = easeInOut(sub);
          const currY = apexY + (toRestY - apexY) * eased;
          const totalScrewTurns = (apexY - toRestY) / threadPitch;

          movingNutMesh.position.set(toPos.x, currY, toPos.z);
          // Clockwise tightening rotation ending at thread alignment
          movingNutMesh.rotation.set(0, (1.0 - eased) * totalScrewTurns * Math.PI * 2, 0);

          if (!state.moveData.phase3Started) {
            state.moveData.phase3Started = true;
            state.moveData.lastSoundTurnStep = 0;
            gameAudio.playScrewDownStart(duration * 0.30);
          }
          const downStep = Math.floor(eased * totalScrewTurns * 5.0);
          if (downStep > state.moveData.lastSoundTurnStep) {
            state.moveData.lastSoundTurnStep = downStep;
            gameAudio.playThreadClick(sub, 'down');
          }
        }
        // Phase 4: Completion & Landing Settle
        else {
          movingNutMesh.visible = false;

          const newBottles = state.bottles.map((b) => [...b]);
          for (let a = 0; a < state.moveData.amount; a++) {
            newBottles[fromIdx].pop();
            newBottles[toIdx].push(color);
          }

          state.bottles = newBottles;
          state.isAnimating = false;
          state.selected = null;
          state.moveData = null;

          gameAudio.playLand();

          // Check if color set was completed on toIdx (all 4 nuts match)
          if (isComplete(newBottles[toIdx])) {
            gameAudio.playComplete();
            triggerBoltCelebration(toIdx, color);
            propsRef.current.onColorCompleted?.({
              tubeIndex: toIdx,
              color: color,
            });
          }

          propsRef.current.onBottlesChange(newBottles);
          if (checkWin(newBottles)) {
            setTimeout(() => {
              gameAudio.playWin();
              propsRef.current.onWin();
            }, 250);
          }
        }
      } else {
        movingNutMesh.visible = false;
      }

      // 4. Update Celebration Sparkles & Bolt Celebration Timers
      for (let pIdx = 0; pIdx < sparkleParticles.length; pIdx++) {
        const p = sparkleParticles[pIdx];
        if (p.life > 0) {
          p.life -= deltaSec;
          p.mesh.position.x += p.vx * deltaSec;
          p.mesh.position.y += p.vy * deltaSec;
          p.mesh.position.z += p.vz * deltaSec;
          p.vy -= 4.2 * deltaSec; // Gravity
          p.mesh.rotation.x += p.rotSpeed * deltaSec;
          p.mesh.rotation.y += p.rotSpeed * deltaSec;

          const ratio = Math.max(0, p.life / p.maxLife);
          p.mesh.scale.setScalar(ratio * 1.3);
          p.mesh.material.opacity = ratio;
          if (p.life <= 0) p.mesh.visible = false;
        }
      }

      for (const [tIdxStr, cel] of Object.entries(state.celebratingBolts)) {
        cel.time += deltaSec;
        if (cel.time >= cel.maxTime) {
          delete state.celebratingBolts[tIdxStr];
        }
      }

      renderer.render(scene, camera);
    }

    renderLoop();

    // Responsive Resize Handler with dynamic camera FOV for mobile & desktop
    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 500;
      updateCameraForViewport(w, h);
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    let resizeObserver = null;
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);
    }

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerleave', handlePointerLeave);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      nutGeometry.dispose();
      nutRingGeometry.dispose();
      boreGeometry.dispose();
      shaftGeometry.dispose();
      headGeometry.dispose();
      completionCapGeometry.dispose();
      baseGeometry.dispose();
      contactShadowGeometry.dispose();
      haloGeometry.dispose();
      boltShaftMaterial.dispose();
      boltHeadMaterial.dispose();
      completionCapMaterial.dispose();
      boltBaseMaterial.dispose();
      boreMaterial.dispose();
      contactShadowMaterial.dispose();
      haloMaterial.dispose();
      brushedAlbedoMap.dispose();
      brushedRoughnessMap.dispose();
      brushedBumpMap.dispose();
      nanoThreadColorMap.dispose();
      nanoThreadNormalMap.dispose();
      nanoThreadRoughMap.dispose();
      threadColorMap.dispose();
      threadNormalMap.dispose();
      envTexture.dispose();
      sparkleGeometry.dispose();
      sparkleMaterialPool.forEach((m) => m.dispose());
      Object.values(nutMaterials).forEach((m) => m.dispose());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center select-none touch-manipulation cursor-pointer"
    />
  );
}
