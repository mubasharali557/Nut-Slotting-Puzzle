import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CAPACITY } from '../data/levelStages';
import { gameAudio } from '../utils/gameAudio';
import { BOLT_SKINS } from '../data/themes';
import { CUSTOM_COLOR_PALETTE } from './ColorStudioBar';

// Premium High-End Gemstone Hardware Pigments for 3D Nuts
// Saturated, rich jewel tones with maximized Delta-E contrast and distinct identities
export const THREE_NUT_COLORS = {
  red: 0xdc2626,     // Ruby Red (deep, lustrous crimson ruby)
  blue: 0x1d4ed8,    // Sapphire Blue (deep royal sapphire velvet blue)
  green: 0x15803d,   // Emerald Green (rich deep emerald, the only green in the game)
  yellow: 0xeab308,  // Imperial Gold (warm luminous solar gold)
  purple: 0x9333ea,  // Amethyst Purple (deep royal amethyst violet)
  orange: 0xea580c,  // Sunset Orange (vivid fiery tangerine orange)
  pink: 0xec4899,    // Hot Magenta (luxury orchid magenta rose)
  cyan: 0x06b6d4,    // Ice Cyan (crisp electric sea turquoise)
  lime: 0x111827,    // Obsidian Black (jet black gloss hardware lacquer - replaces redundant lime)
  teal: 0xffffff,    // Pearl White (pristine brilliant pearl white - replaces redundant teal)
  gold: 0xd97706,    // Imperial Topaz Gold
  silver: 0xe2e8f0,  // Mirror Platinum
  copper: 0xc2410c,  // Rose Copper
  white: 0xffffff,   // Pristine Pearl White
  black: 0x111827,   // Volcanic Obsidian
  wood: 0x854d0e,    // Burnished Bronze
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
 * Creates equirectangular studio environment map for photorealistic metallic PBR reflections
 */
function createStudioEnvironment() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Gradient studio backdrop: bright overhead lights, soft side reflections, warm table bounce
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 512);
  bgGrad.addColorStop(0, '#ffffff'); // bright ceiling light panel
  bgGrad.addColorStop(0.25, '#e2e8f0'); // soft diffuse studio ceiling
  bgGrad.addColorStop(0.50, '#94a3b8'); // horizon diffuse
  bgGrad.addColorStop(0.75, '#475569'); // lower rim
  bgGrad.addColorStop(1, '#24140a'); // warm wooden workbench bounce
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Softbox studio light reflection panels
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fillRect(200, 60, 260, 140); // Key light softbox
  ctx.fillRect(700, 80, 200, 120); // Rim light softbox

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  return texture;
}

/**
 * Creates true 3D extruded hexagonal nut geometry with clean cylindrical center bore hole
 */
function createNutGeometry(outerRadius = 0.44, innerRadius = 0.23, thickness = 0.20) {
  const shape = new THREE.Shape();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const x = outerRadius * Math.cos(angle);
    const y = outerRadius * Math.sin(angle);
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();

  // Clean circular center bore hole
  const holePath = new THREE.Path();
  holePath.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
  shape.holes.push(holePath);

  const extrudeSettings = {
    depth: thickness,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.032,
    bevelThickness: 0.032,
  };

  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geom.center(); // Center at (0, 0, 0)
  geom.rotateX(Math.PI / 2); // Orient horizontal so bolt passes vertically along Y
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

  useEffect(() => {
    stateRef.current.bottles = bottles.map((b) => [...b]);
    stateRef.current.selected = null;
    stateRef.current.isAnimating = false;
    stateRef.current.moveData = null;
  }, [bottles]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 500;

    // 1. Scene & Hardware Renderer (Calibrated camera placing gameplay 100% inside the wooden table)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, width / height, 0.1, 100);

    // Responsive FOV & Camera positioning helper: Adapts to mobile portrait & widescreen
    const updateCameraForViewport = (w, h) => {
      const aspect = w / h;
      camera.aspect = aspect;

      // Reference aspect ratio is 16:9 (~1.777)
      const refAspect = 16 / 9;
      if (aspect < refAspect) {
        // Narrow screen (mobile portrait, tablets):
        // Dynamically widen vertical FOV so the full horizontal span of all bolts stays 100% visible
        const baseFovRad = (28 * Math.PI) / 180;
        const targetHalfWidth = Math.tan(baseFovRad / 2) * refAspect;
        const requiredFovRad = 2 * Math.atan(targetHalfWidth / aspect);
        camera.fov = Math.min(54, (requiredFovRad * 180) / Math.PI);
        // Elevate camera slightly on portrait for optimal top-down angle
        const ratioDiff = refAspect - aspect;
        camera.position.set(0, 2.3 + ratioDiff * 0.35, 11.0 + ratioDiff * 1.2);
        camera.lookAt(0, 0.25 - ratioDiff * 0.12, 0);
      } else {
        camera.fov = 28;
        camera.position.set(0, 2.3, 11.0);
        camera.lookAt(0, 0.25, 0);
      }
      camera.updateProjectionMatrix();
    };

    updateCameraForViewport(width, height);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
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

    // 3. Shared Geometries & Textures
    const threadColorMap = createThreadColorTexture();
    const threadNormalMap = createThreadNormalTexture();
    const nutGeometry = createNutGeometry(0.28, 0.15, 0.10);

    // Bolt shaft geometry: cylinder of radius 0.13, height 0.56
    const shaftRadius = 0.13;
    const shaftHeight = 0.56;
    const shaftGeometry = new THREE.CylinderGeometry(shaftRadius, shaftRadius, shaftHeight, 36);
    shaftGeometry.translate(0, shaftHeight / 2, 0); // Origin at base of shaft

    // Solid Machined Bolt Head (Filled, heavy-duty cap with smooth rounded dome and recessed slot)
    const headRadius = 0.19;
    const collarHeight = 0.06;
    const collarGeometry = new THREE.CylinderGeometry(headRadius, headRadius * 0.94, collarHeight, 36);
    collarGeometry.translate(0, collarHeight / 2, 0);

    const domeRadius = headRadius;
    const domeGeometry = new THREE.SphereGeometry(domeRadius, 36, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    domeGeometry.scale(1, 0.40, 1); // Flatten into a smooth solid cap dome

    // Screwdriver Slot (Recessed dark steel groove in bolt head top)
    const slotGeometry = new THREE.BoxGeometry(0.24, 0.03, 0.05);

    // Washer Flange Base (Solid circular base resting on table)
    const baseRadius = 0.35;
    const baseHeight = 0.04;
    const baseGeometry = new THREE.CylinderGeometry(baseRadius * 0.94, baseRadius, baseHeight, 36);
    baseGeometry.translate(0, baseHeight / 2, 0);

    // Materials Cache - Recessed slot stays deep contrast steel
    const slotMaterial = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      metalness: 0.7,
      roughness: 0.4,
    });

    // Uniform, consistent realistic steel hardware materials for ALL bolts
    const boltShaftMaterial = new THREE.MeshStandardMaterial({
      color: 0x788596,
      metalness: 0.90,
      roughness: 0.25,
      map: threadColorMap,
      normalMap: threadNormalMap,
      normalScale: new THREE.Vector2(2.6, 2.6),
    });

    const boltHeadMaterial = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.92,
      roughness: 0.22,
    });

    const boltBaseMaterial = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.88,
      roughness: 0.30,
    });

    // Premium Automotive & Jewelry Lacquer Nut Materials (Clearcoat Specular Reflection)
    const nutMaterials = {};
    for (const [key, hex] of Object.entries(THREE_NUT_COLORS)) {
      nutMaterials[key] = new THREE.MeshPhysicalMaterial({
        color: hex,
        metalness: 0.45,
        roughness: 0.16,
        clearcoat: 0.95,
        clearcoatRoughness: 0.08,
        reflectivity: 0.90,
      });
    }

    // Selection Halo Material
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const haloGeometry = new THREE.RingGeometry(0.38, 0.44, 32);
    haloGeometry.rotateX(-Math.PI / 2);

    // Victory Checkmark Emblem Material & Geometry (Strictly inside bolt cap boundary: radius 0.13 < 0.19)
    const victoryBadgeTexture = createVictoryCheckTexture();
    const victoryBadgeGeometry = new THREE.CircleGeometry(0.135, 32);
    const victoryBadgeMaterial = new THREE.MeshBasicMaterial({
      map: victoryBadgeTexture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    // 4. Object Pools
    const boltMeshes = []; // { group, shaft, headGroup, collar, dome, slot, base, halo, badge, badgeScale }
    const restingNutMeshes = []; // Array of THREE.Mesh
    const movingNutMesh = new THREE.Mesh(nutGeometry, nutMaterials.red);
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
      const isTwoRows = numTubes > 4;
      const row1Count = isTwoRows ? Math.ceil(numTubes / 2) : numTubes;
      const row2Count = isTwoRows ? numTubes - row1Count : 0;
      const maxCols = Math.max(row1Count, row2Count, 3);

      // Usable width strictly within table surface boundaries (X: 25% to 75%)
      const totalWidth = 4.4;
      const colSpacing = Math.min(1.15, totalWidth / Math.max(1, maxCols - 0.2));

      const positions = [];

      // Row 1 (Back edge of wooden table surface: 70.8% screen height)
      const r1Z = isTwoRows ? -0.65 : 0.05;
      const r1Y = isTwoRows ? -1.15 : -1.25;
      const r1StartX = -((row1Count - 1) * colSpacing) / 2;

      for (let i = 0; i < row1Count; i++) {
        positions.push({
          x: r1StartX + i * colSpacing,
          y: r1Y,
          z: r1Z,
          row: 1,
        });
      }

      // Row 2 (Front edge of wooden table surface: 82.5% screen height)
      if (isTwoRows) {
        const r2Z = 0.75;
        const r2Y = -1.40;
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
          interactables.push(bm.shaft, bm.collar, bm.dome, bm.base);
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
          interactables.push(bm.shaft, bm.collar, bm.dome, bm.base);
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
        gameAudio.playClick();
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
        } else {
          gameAudio.playError?.();
        }
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
      };

      gameAudio.playPour();
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

    const nutThickness = 0.10;
    const nutSpacing = 0.11; // snug stacking distance
    const threadPitch = shaftHeight / 16;

    function renderLoop() {
      animId = requestAnimationFrame(renderLoop);
      const deltaSec = Math.min(0.05, clock.getDelta());
      const state = stateRef.current;
      const bottlesData = state.bottles;
      const layout = calculateLayout(bottlesData.length);

      // 1. Synchronize Bolt Meshes Pool (ALL bolts have identical, realistic brushed steel hardware finish)
      while (boltMeshes.length < layout.positions.length) {
        const group = new THREE.Group();
        const boltIdx = boltMeshes.length;

        // Uniform brushed steel shaft with continuous spiral helical thread grooves
        const shaft = new THREE.Mesh(shaftGeometry, boltShaftMaterial);
        shaft.castShadow = true;
        shaft.receiveShadow = true;
        shaft.userData = { type: 'bolt', tubeIndex: boltIdx };

        // Uniform heavy-duty machined steel bolt head (collar + rounded top dome + screwdriver slot)
        const headGroup = new THREE.Group();

        const collar = new THREE.Mesh(collarGeometry, boltHeadMaterial);
        collar.castShadow = true;
        collar.userData = { type: 'bolt', tubeIndex: boltIdx };
        headGroup.add(collar);

        const dome = new THREE.Mesh(domeGeometry, boltHeadMaterial);
        dome.position.y = collarHeight;
        dome.castShadow = true;
        dome.userData = { type: 'bolt', tubeIndex: boltIdx };
        headGroup.add(dome);

        const slot = new THREE.Mesh(slotGeometry, slotMaterial);
        slot.position.y = collarHeight + 0.04;
        slot.userData = { type: 'bolt', tubeIndex: boltIdx };
        headGroup.add(slot);

        // Small Victory Checkmark Emblem inside completed bolt cap head
        const badge = new THREE.Mesh(victoryBadgeGeometry, victoryBadgeMaterial);
        badge.position.y = collarHeight + 0.046;
        badge.rotation.x = -Math.PI / 2 + 0.30;
        badge.visible = false;
        headGroup.add(badge);

        headGroup.position.y = shaftHeight;

        // Flange Washer Base with uniform steel finish
        const base = new THREE.Mesh(baseGeometry, boltBaseMaterial);
        base.receiveShadow = true;
        base.userData = { type: 'bolt', tubeIndex: boltIdx };

        const halo = new THREE.Mesh(haloGeometry, haloMaterial);
        halo.position.y = 0.01;
        halo.visible = false;

        group.add(base);
        group.add(shaft);
        group.add(headGroup);
        group.add(halo);

        scene.add(group);
        boltMeshes.push({ group, shaft, headGroup, collar, dome, slot, base, halo, badge, badgeScale: 0 });
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

          // Small Victory Checkmark Indicator: Appears smoothly inside each completed color set / bolt
          const isCompleted = isComplete(bottlesData[i]);
          const targetScale = isCompleted ? 1.0 : 0.0;
          bm.badgeScale = THREE.MathUtils.lerp(bm.badgeScale || 0, targetScale, Math.min(1, 14 * deltaSec));

          if (bm.badgeScale > 0.015) {
            bm.badge.visible = true;
            bm.badge.scale.setScalar(bm.badgeScale);
            if (isCompleted) {
              bm.badge.rotation.z = Math.sin(clock.getElapsedTime() * 2.2 + i) * 0.05;
            }
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
          targetLift = 0.18; // Full unscrew lift
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
          mesh.visible = true;
          mesh.material = nutMaterials[colorKey] || nutMaterials.red;
          mesh.userData = { type: 'nut', tubeIndex: i, nutIndex: l };

          const isTop = l === displayCount - 1 && (state.selected === i || state.hoveredTube === i);
          const nutLift = isTop ? lift : 0;
          const cel = state.celebratingBolts[i];
          const celBounce = cel
            ? Math.sin(cel.time * 16 + l * 0.5) * 0.05 * Math.max(0, 1.0 - cel.time / cel.maxTime)
            : 0;
          const celSpin = cel ? cel.time * 7 : 0;

          // Nut sits flush on base collar: baseHeight + nutThickness / 2
          const restY = pos.y + baseHeight + nutThickness * 0.5 + l * nutSpacing + nutLift + celBounce;

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

        const fromRestY = fromPos.y + baseHeight + nutThickness * 0.5 + (fromStack.length - 1) * nutSpacing;
        const toRestY = toPos.y + baseHeight + nutThickness * 0.5 + toStack.length * nutSpacing;
        const apexY = Math.max(fromPos.y, toPos.y) + shaftHeight + collarHeight + 0.14;

        movingNutMesh.visible = true;
        movingNutMesh.material = nutMaterials[color] || nutMaterials.red;

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
        }
        // Phase 2: Parabolic 3D Transfer Arc (0.30 to 0.70)
        else if (rawProgress < 0.70) {
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

          gameAudio.playClick();

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
      shaftGeometry.dispose();
      collarGeometry.dispose();
      domeGeometry.dispose();
      slotGeometry.dispose();
      baseGeometry.dispose();
      boltMeshes.forEach((bm) => {
        if (bm.shaft?.material) bm.shaft.material.dispose();
        if (bm.collar?.material) bm.collar.material.dispose();
        if (bm.dome?.material) bm.dome.material.dispose();
        if (bm.base?.material) bm.base.material.dispose();
      });
      slotMaterial.dispose();
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
