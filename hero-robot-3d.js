/**
 * ABB IRB52 — Collada kinematics + brushed-metal PBR (local model + textures).
 */
import * as THREE from 'three';
import TWEEN from 'three/addons/libs/tween.module.js';
import { ColladaLoader } from 'three/addons/loaders/ColladaLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const WRAP_ID = 'hero-robot-canvas-wrap';
const STAGE_ID = 'hero-robot-stage';
const PROXY_ID = 'robot-effector-proxy';
const MODEL_URL = 'models/collada/abb_irb52_7_120_lite.dae';
const MODEL_RESOURCE_PATH = 'models/collada/';
const TEXTURE_BASE = 'models/textures/';
const MODEL_SCALE = 2.2;

/** Width tiers — align with hero CSS breakpoints (768 / 1024 / 1440). */
const HERO_BREAKPOINTS = { tablet: 768, desktop: 1024, widescreen: 1440 };

/**
 * Per-tier 3D layout — tune in teach mode (?heroTeach=1) or hero-teach-overrides.json.
 * Keys: mobile | tablet | desktop | widescreen × landscape | portrait.
 */
const RAW_HERO_LAYOUT_PROFILES = {
  mobile: {
    landscape: {
      robotSizeFactor: 0.38, scaleRef: 520, scaleMin: 0.32, scaleMax: 0.52,
      twinSeparation: 1.9, sceneShiftX: 0.55, twinOffsetX: 1.4, twinOffsetZ: 0,
      groundOffsetX: -1.8, groundOffsetZ: 0,
      frameBias: 0.14, lookZBias: 0, cameraHeightRatio: 0.4, cameraDepthRatio: 0.88,
      cameraFraming: 1.2, cameraPullback: 1.5, screenShiftPx: 0,
      fov: 44, padding: 1.32,
    },
    portrait: {
      robotSizeFactor: 0.34, scaleRef: 480, scaleMin: 0.3, scaleMax: 0.48,
      twinSeparation: 1.7, sceneShiftX: 0, twinOffsetX: 0, twinOffsetZ: 3.0,
      groundOffsetX: 0, groundOffsetZ: -4.8,
      frameBias: 0, lookZBias: 0.2, cameraHeightRatio: 0.56, cameraDepthRatio: 0.84,
      cameraFraming: 1.26, cameraPullback: 1.55, screenShiftPx: 0,
      fov: 46, padding: 1.38,
    },
  },
  tablet: {
    landscape: {
      robotSizeFactor: 0.48, scaleRef: 600, scaleMin: 0.34, scaleMax: 0.58,
      twinSeparation: 2.4, sceneShiftX: 0.95, twinOffsetX: 3.2, twinOffsetZ: 0,
      groundOffsetX: -3.2, groundOffsetZ: 0,
      frameBias: 0.32, lookZBias: 0, cameraHeightRatio: 0.39, cameraDepthRatio: 0.89,
      cameraFraming: 1.12, cameraPullback: 1.48, screenShiftPx: 0,
      fov: 40, padding: 1.24,
    },
    portrait: {
      robotSizeFactor: 0.42, scaleRef: 560, scaleMin: 0.32, scaleMax: 0.54,
      twinSeparation: 2.1, sceneShiftX: 0, twinOffsetX: 0, twinOffsetZ: 3.4,
      groundOffsetX: 0, groundOffsetZ: -4.2,
      frameBias: 0, lookZBias: 0.17, cameraHeightRatio: 0.54, cameraDepthRatio: 0.84,
      cameraFraming: 1.2, cameraPullback: 1.5, screenShiftPx: 0,
      fov: 44, padding: 1.3,
    },
  },
  desktop: {
    landscape: {
      robotSizeFactor: 0.58, scaleRef: 680, scaleMin: 0.34, scaleMax: 0.68,
      twinSeparation: 2.9, sceneShiftX: 1.25, twinOffsetX: 4.8, twinOffsetZ: 0.08,
      groundOffsetX: -5.5, groundOffsetZ: 0,
      frameBias: 0.58, lookZBias: 0, cameraHeightRatio: 0.38, cameraDepthRatio: 0.88,
      cameraFraming: 1.06, cameraPullback: 1.46, screenShiftPx: -220,
      fov: 38, padding: 1.18,
    },
    portrait: {
      robotSizeFactor: 0.48, scaleRef: 640, scaleMin: 0.34, scaleMax: 0.6,
      twinSeparation: 2.5, sceneShiftX: 0, twinOffsetX: 0, twinOffsetZ: 3.0,
      groundOffsetX: 0, groundOffsetZ: -3.8,
      frameBias: 0, lookZBias: 0.14, cameraHeightRatio: 0.5, cameraDepthRatio: 0.84,
      cameraFraming: 1.14, cameraPullback: 1.48, screenShiftPx: 0,
      fov: 42, padding: 1.28,
    },
  },
  widescreen: {
    landscape: {
      robotSizeFactor: 0.7, scaleRef: 720, scaleMin: 0.36, scaleMax: 0.84,
      twinSeparation: 3.2, sceneShiftX: -2.6, twinOffsetX: 6.1, twinOffsetZ: 0.1,
      groundOffsetX: -3.85, groundOffsetZ: -1.95,
      frameBias: 1.44, lookZBias: 0.12, cameraHeightRatio: 0.52, cameraDepthRatio: 0.93,
      cameraFraming: 0.98, cameraPullback: 1.29, screenShiftPx: -500,
      fov: 35, padding: 1.16,
      sceneYawDeg: 0, scenePushZ: 0,
      robotOffsetX: -3.44, robotOffsetY: 0, robotOffsetZ: 1.9,
    },
    portrait: {
      robotSizeFactor: 0.52, scaleRef: 700, scaleMin: 0.36, scaleMax: 0.72,
      twinSeparation: 2.8, sceneShiftX: 0, twinOffsetX: 0, twinOffsetZ: 2.6,
      groundOffsetX: 0, groundOffsetZ: -3.2,
      frameBias: 0, lookZBias: 0.1, cameraHeightRatio: 0.48, cameraDepthRatio: 0.84,
      cameraFraming: 1.1, cameraPullback: 1.45, screenShiftPx: 0,
      fov: 40, padding: 1.26,
    },
  },
};

const LEGACY_LAYOUT_KEYS = [
  'sceneShiftX', 'twinOffsetX', 'twinOffsetZ', 'groundOffsetX', 'groundOffsetZ',
  'lookZBias', 'twinSeparation', 'scaleRef', 'scaleMin', 'scaleMax', 'contentMaxWidth',
  'treadmillOffsetX', 'treadmillOffsetY', 'treadmillOffsetZ', 'treadmillYawDeg',
];

function stripLegacyLayoutKeys(profile) {
  const p = { ...profile };
  for (const key of LEGACY_LAYOUT_KEYS) delete p[key];
  return p;
}

function migrateLegacyLayoutProfile(profile) {
  const p = { ...profile };
  const scale = p.robotSizeFactor ?? 0.7;
  const sceneShiftX = p.sceneShiftX ?? 0;
  const twinOffsetX = p.twinOffsetX ?? 0;
  const twinOffsetZ = p.twinOffsetZ ?? 0;
  const groundOffsetX = p.groundOffsetX ?? 0;
  const groundOffsetZ = p.groundOffsetZ ?? 0;
  const hadLegacy = sceneShiftX !== 0 || twinOffsetX !== 0 || twinOffsetZ !== 0
    || groundOffsetX !== 0 || groundOffsetZ !== 0;

  if (hadLegacy) {
    p.robotOffsetX = groundOffsetX + twinOffsetX + (p.robotOffsetX ?? 0) + sceneShiftX * (1 - scale);
    p.robotOffsetZ = groundOffsetZ + twinOffsetZ + (p.robotOffsetZ ?? 0);
  }

  delete p.sceneShiftX;
  delete p.twinOffsetX;
  delete p.twinOffsetZ;
  delete p.groundOffsetX;
  delete p.groundOffsetZ;
  delete p.lookZBias;
  return p;
}

function bakeLayoutProfile(raw) {
  return stripLegacyLayoutKeys(migrateLegacyLayoutProfile(raw));
}

const HERO_LAYOUT_PROFILES = Object.fromEntries(
  Object.entries(RAW_HERO_LAYOUT_PROFILES).map(([tier, layouts]) => [
    tier,
    Object.fromEntries(
      Object.entries(layouts).map(([layout, profile]) => [layout, bakeLayoutProfile(profile)]),
    ),
  ]),
);

/** Authoritative widescreen tune — copied to every tier/layout until per-breakpoint tuning. */
const WIDESCREEN_LAYOUT_TUNE = {
  robotSizeFactor: 0.53,
  frameBias: 0.13,
  cameraHeightRatio: 1.04,
  cameraDepthRatio: 1.1,
  cameraFraming: 2,
  cameraPullback: 0.59,
  screenShiftPx: 165,
  fov: 20,
  padding: 1.02,
  sceneYawDeg: 0,
  scenePushZ: -6.18,
  robotOffsetX: -1.76,
  robotOffsetY: 0.01,
  robotOffsetZ: 7.8,
};
const bakedWidescreenLayout = bakeLayoutProfile(WIDESCREEN_LAYOUT_TUNE);
for (const tier of Object.keys(HERO_LAYOUT_PROFILES)) {
  for (const layout of Object.keys(HERO_LAYOUT_PROFILES[tier])) {
    Object.assign(HERO_LAYOUT_PROFILES[tier][layout], bakedWidescreenLayout);
  }
}
/** Default scene dolly (camera pull along view axis; positive = farther). */
const SCENE_PUSH_Z = 0;
/** Yaw the floor / twin stage (degrees). 0 = robot +X maps to screen horizontal. */
const GROUND_YAW_DEG = 0;
const GROUND_FOG_COLOR = 0xeaf2fb;
const GROUND_FOG_NEAR = 18;
const GROUND_FOG_FAR = 95;
const UV_TILE = 5;
const HERO_PHOTO_URL = 'photos/Graduation.png';

function heroPhotoUrl(filename) {
  return `photos/${filename.split('/').map(encodeURIComponent).join('/')}`;
}

/** Images shuffled and cycled — one new photo per forward belt feed. */
const HERO_PHOTO_POOL = [
  'Graduation.png',
  'part digital twin.png',
].map(heroPhotoUrl);

let photoCycleOrder = [];
let photoCycleIndex = 0;

/** Floor conveyor — upstream (+Z) feeds toward the robot pick station. */
const TREADMILL_SCALE = 3;
/** Belt offset from robot base (robot-mount local space). */
const DEFAULT_BELT_LAYOUT = {
  beltOffsetX: 6.8,
  beltOffsetY: 0,
  beltOffsetZ: 0,
  beltYawDeg: 90,
};
const BELT_LAYOUT_STORAGE_KEY = 'hero-robot-belt-layout-v1';
const BELT_LAYOUT_FIELDS = ['beltOffsetX', 'beltOffsetY', 'beltOffsetZ', 'beltYawDeg'];
const BELT_LAYOUT_CONFIG = {
  beltOffsetX: { min: -15, max: 15, step: 0.05, label: 'Belt X' },
  beltOffsetY: { min: -3, max: 3, step: 0.01, label: 'Belt Y' },
  beltOffsetZ: { min: -15, max: 15, step: 0.05, label: 'Belt Z' },
  beltYawDeg: { min: -180, max: 180, step: 1, label: 'Belt yaw°' },
};
const TREADMILL_PICK_X = -0.52;
const TREADMILL_PICK_Z = 0.98;
const TREADMILL_LENGTH = 1.85 * TREADMILL_SCALE * 2;
const TREADMILL_WIDTH = 0.46 * TREADMILL_SCALE;
const TREADMILL_DECK_Y = 0.054 * TREADMILL_SCALE;
const TREADMILL_BELT_SPEED = 0.0055;
const DEFAULT_TREADMILL_BELT_SPEED = TREADMILL_BELT_SPEED;
const BELT_PHOTO_TRAVEL_RATE = 2.4;
/** Texture tread scroll vs photo travel (1 = locked; >1 = faster belt animation). */
const BELT_TEXTURE_SCROLL_MULT = 3;
const BELT_SPEED_STORAGE_KEY = 'hero-robot-belt-speed-v1';
const BELT_PHOTO_WIDTH = 0.24 * TREADMILL_SCALE;
const EFFECTOR_PHOTO_WIDTH = BELT_PHOTO_WIDTH;
/** Thin print — image on +Z face, white paper on −Z. */
const PHOTO_CARD_THICKNESS = 0.004 * TREADMILL_SCALE;
/** Neutral grey for the unprinted side of the photo card. */
const PHOTO_BACK_COLOR = 0x8d96a5;
const LAYOUT_STORAGE_KEY = 'hero-robot-layout-v1';
const TEACH_OVERRIDE_FILENAME = 'hero-teach-overrides.json';
/** Bump to wipe stale localStorage poses/layout from older builds. */
const HERO_CACHE_GEN = '80';

function clearStaleHeroLocalCache() {
  try {
    if (localStorage.getItem('hero-robot-cache-gen') === HERO_CACHE_GEN) return;
    localStorage.removeItem('hero-robot-poses-v1');
    localStorage.removeItem(LAYOUT_STORAGE_KEY);
    localStorage.removeItem(BELT_SPEED_STORAGE_KEY);
    localStorage.removeItem(BELT_LAYOUT_STORAGE_KEY);
    localStorage.setItem('hero-robot-cache-gen', HERO_CACHE_GEN);
  } catch (_) { /* private mode */ }
}

clearStaleHeroLocalCache();
/** Effector photo scale at show pulse peak (300% = 3×). */
const SHOW_PHOTO_PULSE_SCALE = 3;
const PHOTO_CORNER_RADIUS_PX = 28;
const PHOTO_PRELOAD_AHEAD = 2;
const PROFILE_OVERRIDE_FIELDS = [
  'robotSizeFactor',
  'frameBias',
  'cameraHeightRatio',
  'cameraDepthRatio',
  'cameraFraming',
  'cameraPullback',
  'screenShiftPx',
  'fov',
  'padding',
  'sceneYawDeg',
  'scenePushZ',
  'robotOffsetX',
  'robotOffsetY',
  'robotOffsetZ',
];
const PROFILE_FIELD_CONFIG = {
  robotSizeFactor: { min: 0.2, max: 1.2, step: 0.01, label: 'Robot scale' },
  frameBias: { min: -3, max: 3, step: 0.01, label: 'Frame bias' },
  cameraHeightRatio: { min: 0, max: 1.5, step: 0.01, label: 'Cam height' },
  cameraDepthRatio: { min: 0.2, max: 1.5, step: 0.01, label: 'Cam depth' },
  cameraFraming: { min: 0.5, max: 2, step: 0.01, label: 'Cam framing' },
  cameraPullback: { min: 0.5, max: 2.5, step: 0.01, label: 'Cam pullback' },
  screenShiftPx: { min: -1000, max: 1000, step: 5, label: 'Screen shift px' },
  fov: { min: 20, max: 80, step: 1, label: 'FOV' },
  padding: { min: 0.8, max: 2, step: 0.01, label: 'Padding' },
  sceneYawDeg: { min: -180, max: 180, step: 1, label: 'Scene yaw' },
  scenePushZ: { min: -30, max: 30, step: 0.01, label: 'Cam dolly' },
  robotOffsetX: { min: -20, max: 20, step: 0.01, label: 'Robot X' },
  robotOffsetY: { min: -2, max: 5, step: 0.01, label: 'Robot Y' },
  robotOffsetZ: { min: -20, max: 20, step: 0.01, label: 'Robot Z' },
};

const PROFILE_DEFAULT_EXTRAS = {
  sceneYawDeg: GROUND_YAW_DEG,
  scenePushZ: SCENE_PUSH_Z,
  robotOffsetX: 0,
  robotOffsetY: 0,
  robotOffsetZ: 0,
};

/** Matches hero-teach-overrides.json — shared across all viewport tiers. */
const DEFAULT_POSES = {
  belt: {
    joint_1: 0, joint_2: 0, joint_3: 0, joint_4: 0, joint_5: 0, joint_6: 0,
    photoMountX: 0, photoMountY: 0.192, photoMountZ: 5,
    beltPhotoRotX: 90, beltPhotoRotY: 0, beltPhotoRotZ: -90,
    effectorPhotoX: 0, effectorPhotoY: 0, effectorPhotoZ: 0.11,
    effectorPhotoRotX: 0, effectorPhotoRotY: 0, effectorPhotoRotZ: 0,
  },
  'belt-ready': {
    joint_1: 0, joint_2: 60, joint_3: -60, joint_4: 0, joint_5: 70, joint_6: 0,
    photoMountX: 0, photoMountY: 0.19, photoMountZ: -4.77,
    beltPhotoRotX: 90, beltPhotoRotY: 0, beltPhotoRotZ: -90,
    effectorPhotoX: 0, effectorPhotoY: 0, effectorPhotoZ: 0.11,
    effectorPhotoRotX: 0, effectorPhotoRotY: 0, effectorPhotoRotZ: 0,
  },
  'belt-stop': {
    joint_1: 0, joint_2: 60, joint_3: -40, joint_4: 0, joint_5: 70, joint_6: 0,
    photoMountX: 0, photoMountY: 0.19, photoMountZ: -4.77,
    beltPhotoRotX: 90, beltPhotoRotY: 0, beltPhotoRotZ: -90,
    effectorPhotoX: 0, effectorPhotoY: 0, effectorPhotoZ: 0.11,
    effectorPhotoRotX: 0, effectorPhotoRotY: 0, effectorPhotoRotZ: 0,
  },
  pick: {
    joint_1: 0, joint_2: 88, joint_3: -57, joint_4: 0, joint_5: 58, joint_6: 0,
    photoMountX: 0, photoMountY: 0.19, photoMountZ: -4.77,
    beltPhotoRotX: 90, beltPhotoRotY: 0, beltPhotoRotZ: -90,
    effectorPhotoX: 0, effectorPhotoY: 0, effectorPhotoZ: 0.11,
    effectorPhotoRotX: 0, effectorPhotoRotY: 0, effectorPhotoRotZ: 0,
  },
  lift: {
    joint_1: 0, joint_2: 60, joint_3: -40, joint_4: 0, joint_5: 70, joint_6: 0,
    photoMountX: 0, photoMountY: 0.19, photoMountZ: -4.77,
    beltPhotoRotX: 90, beltPhotoRotY: 0, beltPhotoRotZ: -90,
    effectorPhotoX: 0, effectorPhotoY: 0, effectorPhotoZ: 0,
    effectorPhotoRotX: 180, effectorPhotoRotY: 0, effectorPhotoRotZ: 0,
  },
  show: {
    joint_1: -90, joint_2: -27, joint_3: 14, joint_4: 0, joint_5: -22, joint_6: 90,
    photoMountX: 0, photoMountY: 0.19, photoMountZ: -4.77,
    beltPhotoRotX: 90, beltPhotoRotY: 0, beltPhotoRotZ: -90,
    effectorPhotoX: 0, effectorPhotoY: 0, effectorPhotoZ: 0,
    effectorPhotoRotX: 180, effectorPhotoRotY: 0, effectorPhotoRotZ: 0,
  },
  retract: {
    joint_1: 0, joint_2: 60, joint_3: -40, joint_4: 0, joint_5: 70, joint_6: 0,
    photoMountX: 0, photoMountY: 0.19, photoMountZ: -4.77,
    beltPhotoRotX: 90, beltPhotoRotY: 0, beltPhotoRotZ: -90,
    effectorPhotoX: 0, effectorPhotoY: 0, effectorPhotoZ: 0,
    effectorPhotoRotX: 180, effectorPhotoRotY: 0, effectorPhotoRotZ: 0,
  },
  place: {
    joint_1: 0, joint_2: 88, joint_3: -57, joint_4: 0, joint_5: 58, joint_6: 0,
    photoMountX: 0, photoMountY: 0.19, photoMountZ: -4.77,
    beltPhotoRotX: 90, beltPhotoRotY: 0, beltPhotoRotZ: -90,
    effectorPhotoX: 0, effectorPhotoY: 0, effectorPhotoZ: 0.11,
    effectorPhotoRotX: 0, effectorPhotoRotY: 0, effectorPhotoRotZ: 0,
  },
};

/** Legacy pose keys — belt offset is fixed on the robot rig. */
const LEGACY_TREADMILL_POSE_FIELDS = [
  'treadmillOffsetX',
  'treadmillOffsetY',
  'treadmillOffsetZ',
  'treadmillYawDeg',
];

/** Per-stage scene frame — photo transforms on belt / effector (saved with each pose). */
const SCENE_FRAME_FIELDS = [
  'photoMountX',
  'photoMountY',
  'photoMountZ',
  'beltPhotoRotX',
  'beltPhotoRotY',
  'beltPhotoRotZ',
  'effectorPhotoX',
  'effectorPhotoY',
  'effectorPhotoZ',
  'effectorPhotoRotX',
  'effectorPhotoRotY',
  'effectorPhotoRotZ',
];
/** Per-stage camera — copied from belt stage to keep framing fixed across the cycle. */
const CAMERA_FRAME_FIELDS = [
  'robotSizeFactor',
  'frameBias',
  'cameraHeightRatio',
  'cameraDepthRatio',
  'cameraFraming',
  'cameraPullback',
  'screenShiftPx',
  'fov',
  'padding',
  'sceneYawDeg',
  'scenePushZ',
];
const STAGE_POSE_FIELD_SET = new Set([...SCENE_FRAME_FIELDS, ...CAMERA_FRAME_FIELDS]);
const SCENE_FRAME_FIELD_SET = STAGE_POSE_FIELD_SET;
const SCENE_FRAME_GROUPS = [
  {
    title: 'Photo on belt',
    rootId: 'hero-scene-belt-photo-sliders',
    fields: [
      'photoMountX', 'photoMountY', 'photoMountZ',
      'beltPhotoRotX', 'beltPhotoRotY', 'beltPhotoRotZ',
    ],
  },
  {
    title: 'Photo on effector',
    rootId: 'hero-scene-effector-photo-sliders',
    fields: [
      'effectorPhotoX', 'effectorPhotoY', 'effectorPhotoZ',
      'effectorPhotoRotX', 'effectorPhotoRotY', 'effectorPhotoRotZ',
    ],
  },
];
const SCENE_FRAME_CONFIG = {
  photoMountX: { min: -2, max: 2, step: 0.01, label: 'Mount X' },
  photoMountY: { min: -0.5, max: 1, step: 0.01, label: 'Mount Y' },
  photoMountZ: { min: -12, max: 12, step: 0.01, label: 'Mount Z' },
  beltPhotoRotX: { min: -180, max: 180, step: 1, label: 'Belt rot X°' },
  beltPhotoRotY: { min: -180, max: 180, step: 1, label: 'Belt rot Y°' },
  beltPhotoRotZ: { min: -180, max: 180, step: 1, label: 'Belt rot Z°' },
  effectorPhotoX: { min: -0.3, max: 0.3, step: 0.001, label: 'Eff X' },
  effectorPhotoY: { min: -0.3, max: 0.3, step: 0.001, label: 'Eff Y' },
  effectorPhotoZ: { min: -0.8, max: 0.8, step: 0.001, label: 'Eff Z' },
  effectorPhotoRotX: { min: -180, max: 180, step: 1, label: 'Eff rot X°' },
  effectorPhotoRotY: { min: -180, max: 180, step: 1, label: 'Eff rot Y°' },
  effectorPhotoRotZ: { min: -180, max: 180, step: 1, label: 'Eff rot Z°' },
};

const EFFECTOR_PHOTO_STAGES = new Set([
  'lift', 'show', 'retract',
]);
const BELT_PHOTO_STAGES = new Set(['belt', 'belt-ready', 'belt-stop', 'place']);
/** Stages where the photo lives on the belt (hand off from effector when carried). */
const BELT_PHOTO_CARRY_STAGES = new Set([...BELT_PHOTO_STAGES, 'pick']);

function beltTopSurfaceY() {
  return TREADMILL_DECK_Y + 0.008 * TREADMILL_SCALE;
}

/** Local Y offset on the mount — sits the card on the belt deck, not inside it. */
const BELT_PHOTO_LOCAL_Y = PHOTO_CARD_THICKNESS * 0.55;

function beltPhotoMountY(override) {
  const minY = beltTopSurfaceY() + BELT_PHOTO_LOCAL_Y;
  return Math.max(override ?? minY, minY);
}

function clampPhotoMountY(y) {
  return beltPhotoMountY(y);
}

/** Small world-space lift when picking so the card clears the belt surface. */
const HANDOFF_LIFT_Y = 0.006;

function beltTravelBounds() {
  const length = TREADMILL_LENGTH;
  const s = TREADMILL_SCALE;
  return {
    pickZ: -length / 2 + 0.24 * s,
    startZ: length / 2 - 0.35 * s,
    exitZ: length / 2 + 0.72 * s,
  };
}

function defaultPhotoMountPosition() {
  const length = TREADMILL_LENGTH;
  const bounds = beltTravelBounds();
  return {
    photoMountX: 0,
    photoMountY: beltPhotoMountY(),
    photoMountZ: bounds.startZ,
  };
}

function defaultSceneFrame() {
  const mount = defaultPhotoMountPosition();
  return {
    photoMountX: mount.photoMountX,
    photoMountY: mount.photoMountY,
    photoMountZ: mount.photoMountZ,
    beltPhotoRotX: 90,
    beltPhotoRotY: 0,
    beltPhotoRotZ: -90,
    effectorPhotoX: 0,
    effectorPhotoY: 0,
    effectorPhotoZ: 0,
    effectorPhotoRotX: 180,
    effectorPhotoRotY: 0,
    effectorPhotoRotZ: 0,
  };
}

function poseJointsOnly(pose) {
  const joints = {};
  for (const [key, value] of Object.entries(pose || {})) {
    if (SCENE_FRAME_FIELD_SET.has(key)) continue;
    if (LEGACY_TREADMILL_POSE_FIELDS.includes(key)) continue;
    joints[key] = value;
  }
  return joints;
}

function sceneFrameFromPose(pose, stageName) {
  const frame = { ...defaultSceneFrame() };
  for (const key of SCENE_FRAME_FIELDS) {
    if (pose?.[key] !== undefined) frame[key] = pose[key];
  }
  return frame;
}

function poseHasCameraOverride(pose) {
  return CAMERA_FRAME_FIELDS.some((key) => pose?.[key] !== undefined);
}

function cameraFieldsFromPose(pose) {
  const fields = {};
  for (const key of CAMERA_FRAME_FIELDS) {
    if (pose?.[key] !== undefined) fields[key] = pose[key];
  }
  return fields;
}

function viewportForStage(viewport, pose) {
  const vp = enrichViewport(viewport);
  if (!poseHasCameraOverride(pose)) return vp;
  return { ...vp, profile: { ...vp.profile, ...cameraFieldsFromPose(pose) } };
}

function normalizePoseStore(store) {
  const next = {};
  for (const [name, pose] of Object.entries(store)) {
    next[name] = { ...poseJointsOnly(pose), ...sceneFrameFromPose(pose, name) };
  }
  return next;
}

const POSE_STORAGE_KEY = 'hero-robot-poses-v1';

function clonePoses(source) {
  return JSON.parse(JSON.stringify(source));
}

function profileStorageKey(tier, layout) {
  return `${tier}-${layout}`;
}

function parseProfileKey(key) {
  const sep = key.indexOf('-');
  if (sep < 1) return ['desktop', 'landscape'];
  return [key.slice(0, sep), key.slice(sep + 1)];
}

function loadLayoutStore(fileData = null) {
  let store = {};
  if (fileData?.layouts && typeof fileData.layouts === 'object') {
    store = { ...fileData.layouts };
  } else {
    try {
      const raw = localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (raw) store = JSON.parse(raw);
    } catch (_) { /* ignore corrupt storage */ }
  }
  const clean = {};
  for (const [key, profile] of Object.entries(store)) {
    clean[key] = profileOverrideSubset(
      stripLegacyLayoutKeys(migrateLegacyLayoutProfile(profile)),
    );
  }
  return clean;
}

function saveLayoutStore(store) {
  localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(store));
}

function normalizeProfile(profile) {
  return stripLegacyLayoutKeys({ ...PROFILE_DEFAULT_EXTRAS, ...profile });
}

function profileOverrideSubset(profile) {
  const picked = {};
  for (const key of PROFILE_OVERRIDE_FIELDS) {
    if (profile[key] !== undefined) picked[key] = profile[key];
  }
  return picked;
}

function formatLayoutOverridesForSource(store) {
  const entries = Object.entries(store).map(([key, value]) => {
    const inner = Object.entries(value)
      .map(([name, v]) => `${name}: ${Number(v)}`)
      .join(', ');
    return `  '${key}': { ${inner} },`;
  });
  return `const HERO_LAYOUT_PROFILE_OVERRIDES = {\n${entries.join('\n')}\n};`;
}

function serializeTeachOverrides(poses, layouts, beltSpeed = DEFAULT_TREADMILL_BELT_SPEED, beltLayout = DEFAULT_BELT_LAYOUT) {
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    poses,
    layouts,
    beltSpeed,
    beltLayout: normalizeBeltLayout(beltLayout),
  };
}

function mergeTeachOverrides(data, poses, layouts) {
  if (data?.poses && typeof data.poses === 'object') {
    Object.assign(poses, data.poses);
  }
  if (data?.layouts && typeof data.layouts === 'object') {
    Object.assign(layouts, data.layouts);
  }
}

function loadBeltSpeed(fileData = null) {
  if (fileData?.beltSpeed != null && Number.isFinite(Number(fileData.beltSpeed))) {
    return Number(fileData.beltSpeed);
  }
  try {
    const raw = localStorage.getItem(BELT_SPEED_STORAGE_KEY);
    if (raw) {
      const value = parseFloat(raw);
      if (Number.isFinite(value)) return value;
    }
  } catch (_) { /* ignore corrupt storage */ }
  return DEFAULT_TREADMILL_BELT_SPEED;
}

function saveBeltSpeed(speed) {
  localStorage.setItem(BELT_SPEED_STORAGE_KEY, String(speed));
}

function normalizeBeltLayout(layout = {}) {
  return {
    beltOffsetX: layout.beltOffsetX ?? DEFAULT_BELT_LAYOUT.beltOffsetX,
    beltOffsetY: layout.beltOffsetY ?? DEFAULT_BELT_LAYOUT.beltOffsetY,
    beltOffsetZ: layout.beltOffsetZ ?? DEFAULT_BELT_LAYOUT.beltOffsetZ,
    beltYawDeg: layout.beltYawDeg ?? DEFAULT_BELT_LAYOUT.beltYawDeg,
  };
}

function loadBeltLayout(fileData = null) {
  if (fileData?.beltLayout && typeof fileData.beltLayout === 'object') {
    return normalizeBeltLayout(fileData.beltLayout);
  }
  try {
    const raw = localStorage.getItem(BELT_LAYOUT_STORAGE_KEY);
    if (raw) return normalizeBeltLayout(JSON.parse(raw));
  } catch (_) { /* ignore corrupt storage */ }
  return { ...DEFAULT_BELT_LAYOUT };
}

function saveBeltLayout(layout) {
  localStorage.setItem(BELT_LAYOUT_STORAGE_KEY, JSON.stringify(normalizeBeltLayout(layout)));
}

function formatBeltLayoutForSource(layout) {
  const L = normalizeBeltLayout(layout);
  const inner = BELT_LAYOUT_FIELDS.map((key) => `${key}: ${Number(L[key])}`).join(', ');
  return `const DEFAULT_BELT_LAYOUT = { ${inner} };`;
}

/** Load poses + layouts — hero-teach-overrides.json is authoritative when present. */
function loadTeachStores(fileData = null) {
  return {
    poses: loadPoseStore(fileData),
    layouts: loadLayoutStore(fileData),
    beltSpeed: loadBeltSpeed(fileData),
    beltLayout: loadBeltLayout(fileData),
  };
}

async function loadTeachOverridesFile() {
  try {
    const url = `${TEACH_OVERRIDE_FILENAME}?v=${Date.now()}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (_) {
    return null;
  }
}

function loadPoseStore(fileData = null) {
  const merged = clonePoses(DEFAULT_POSES);
  if (fileData?.poses && typeof fileData.poses === 'object') {
    Object.assign(merged, fileData.poses);
  }
  try {
    const raw = localStorage.getItem(POSE_STORAGE_KEY);
    if (raw) Object.assign(merged, JSON.parse(raw));
  } catch (_) { /* ignore corrupt storage */ }
  return normalizePoseStore(merged);
}

function savePoseStore(poses) {
  localStorage.setItem(POSE_STORAGE_KEY, JSON.stringify(poses));
}

function isPoseTeachMode() {
  return new URLSearchParams(window.location.search).has('heroTeach')
    || window.location.hash.includes('heroTeach');
}

const POSE_TEACH_MODE = isPoseTeachMode();

function getMovableJoints(kinematics) {
  const names = [];
  for (const prop in kinematics.joints) {
    if (!kinematics.joints[prop].static) names.push(prop);
  }
  return names.sort();
}

function readCurrentPose(kinematics, tweenParams) {
  const pose = {};
  for (const prop of getMovableJoints(kinematics)) {
    pose[prop] = tweenParams[prop] ?? kinematics.joints[prop].zeroPosition;
  }
  return pose;
}

function formatPosesForSource(poses) {
  const lines = Object.entries(poses).map(([name, joints]) => {
    const inner = Object.entries(joints).map(([k, v]) => `${k}: ${v}`).join(', ');
    const key = /^[a-z_][\w-]*$/i.test(name) ? name : `'${name}'`;
    return `  ${key}: { ${inner} },`;
  });
  return `const POSES = {\n${lines.join('\n')}\n};`;
}

function createPoseTeachPanel({
  kinematics,
  tweenParams,
  applyPoseImmediate,
  applyPose,
  getActiveTween,
  setActiveTween,
  readViewport,
  layoutScene,
  applySceneFrame,
  readSceneFrame,
  getBeltSpeed,
  setBeltSpeed,
  applyBeltLayout,
  readBeltLayoutFromRig,
  initialPoseStore = loadPoseStore(),
  initialLayoutStore = loadLayoutStore(),
  initialBeltSpeed = DEFAULT_TREADMILL_BELT_SPEED,
  initialBeltLayout = DEFAULT_BELT_LAYOUT,
}) {
  const poseStore = clonePoses(initialPoseStore);
  /** Same object as runtime layoutOverrideStore — avoids teach vs normal drift. */
  const layoutStore = layoutOverrideStore;
  const beltLayout = beltLayoutStore;
  let beltSpeed = initialBeltSpeed;
  const panel = document.createElement('aside');
  panel.id = 'hero-pose-teach';
  panel.setAttribute('aria-label', 'Robot pose teaching');
  panel.innerHTML = `
    <header class="hero-pose-teach__head">
      <div class="hero-pose-teach__head-row">
        <strong>Pose teach</strong>
        <button type="button" id="hero-pose-teach-toggle" class="hero-pose-teach__toggle" aria-expanded="false" aria-controls="hero-pose-teach-body" title="Expand panel">▸</button>
      </div>
      <span class="hero-pose-teach__hint">Dev only — expand panel · Save JSON needs <code>python dev-server.py</code></span>
    </header>
    <div class="hero-pose-teach__body" id="hero-pose-teach-body" hidden>
    <div class="hero-pose-teach__section-title">Arm poses</div>
    <label class="hero-pose-teach__field">
      <span>Stage</span>
      <select id="hero-pose-teach-stage"></select>
    </label>
    <div id="hero-pose-teach-sliders"></div>
    <div class="hero-pose-teach__section-title">Photo on belt (this stage)</div>
    <div id="hero-scene-belt-photo-sliders"></div>
    <div class="hero-pose-teach__section-title">Photo on effector (this stage)</div>
    <div id="hero-scene-effector-photo-sliders"></div>
    <div class="hero-pose-teach__actions hero-pose-teach__actions--inline">
      <button type="button" id="hero-scene-frame-read">Read scene from 3D</button>
    </div>
    <div class="hero-pose-teach__actions">
      <button type="button" id="hero-pose-teach-preview">Preview tween</button>
      <button type="button" id="hero-pose-teach-save">Save pose</button>
      <button type="button" id="hero-pose-teach-file">Save JSON</button>
      <button type="button" id="hero-pose-teach-read">Read from arm</button>
      <button type="button" id="hero-pose-teach-copy">Copy all poses</button>
      <button type="button" id="hero-pose-teach-reset" class="hero-pose-teach__danger">Reset defaults</button>
    </div>
    <div class="hero-pose-teach__section-title">Screen layout</div>
    <label class="hero-pose-teach__field">
      <span>Profile</span>
      <select id="hero-layout-teach-profile"></select>
    </label>
    <div class="hero-pose-teach__hint" id="hero-layout-teach-current"></div>
    <div id="hero-layout-teach-sliders"></div>
    <div class="hero-pose-teach__actions">
      <button type="button" id="hero-layout-teach-current-btn">Use current screen</button>
      <button type="button" id="hero-layout-teach-save">Save layout</button>
      <button type="button" id="hero-layout-teach-file">Save JSON</button>
      <button type="button" id="hero-layout-teach-copy">Copy layouts</button>
      <button type="button" id="hero-layout-teach-reset" class="hero-pose-teach__danger">Reset layouts</button>
    </div>
    <div class="hero-pose-teach__section-title">Belt on robot</div>
    <div id="hero-belt-layout-sliders"></div>
    <div class="hero-pose-teach__actions hero-pose-teach__actions--inline">
      <button type="button" id="hero-belt-layout-read">Read from 3D</button>
      <button type="button" id="hero-belt-layout-save">Save belt</button>
      <button type="button" id="hero-belt-layout-reset">Reset belt</button>
    </div>
    <div class="hero-pose-teach__section-title">Belt motion</div>
    <div id="hero-belt-speed-slider"></div>
    <div class="hero-pose-teach__section-title">Live scene positions</div>
    <div class="hero-pose-teach__hint hero-pose-teach__live-pos" id="hero-teach-live-pos">
      Treadmill: —<br>Photo: —
    </div>
    <p class="hero-pose-teach__status" id="hero-pose-teach-status" role="status"></p>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    #hero-pose-teach {
      position: fixed;
      left: 0.75rem;
      top: 0.75rem;
      z-index: 9999;
      width: min(17rem, calc(100vw - 1.5rem));
      height: calc(100vh - 1.5rem);
      max-height: calc(100vh - 1.5rem);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      padding: 0.45rem 0.55rem;
      border-radius: 8px;
      border: 1px solid rgba(59, 130, 246, 0.35);
      background: rgba(15, 23, 42, 0.92);
      color: #e2e8f0;
      font: 11px/1.35 system-ui, sans-serif;
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.35);
    }
    #hero-pose-teach.is-collapsed {
      max-height: none;
      width: auto;
      min-width: 9rem;
      padding: 0.35rem 0.5rem;
    }
    #hero-pose-teach.is-collapsed .hero-pose-teach__hint { display: none; }
    .hero-pose-teach__body {
      overflow-y: auto;
      overflow-x: hidden;
      flex: 1;
      min-height: 0;
      padding-right: 0.15rem;
    }
    #hero-pose-teach:not(.is-collapsed) .hero-pose-teach__body {
      max-height: none;
    }
    #hero-pose-teach button, #hero-pose-teach select, #hero-pose-teach input {
      font: inherit;
    }
    .hero-pose-teach__head {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
      margin-bottom: 0;
      flex-shrink: 0;
    }
    .hero-pose-teach__head-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }
    .hero-pose-teach__toggle {
      flex-shrink: 0;
      width: 1.6rem;
      height: 1.6rem;
      padding: 0;
      border-radius: 5px;
      border: 1px solid rgba(148, 163, 184, 0.35);
      background: #1e293b;
      color: #93c5fd;
      cursor: pointer;
      line-height: 1;
      font-size: 0.85rem;
    }
    .hero-pose-teach__toggle:hover { background: #334155; }
    #hero-pose-teach:not(.is-collapsed) .hero-pose-teach__head { margin-bottom: 0.4rem; }
    .hero-pose-teach__section-title {
      margin: 0.45rem 0 0.3rem;
      color: #bfdbfe;
      font-weight: 700;
      letter-spacing: 0.02em;
      font-size: 10px;
      text-transform: uppercase;
    }
    .hero-pose-teach__hint { color: #94a3b8; font-size: 11px; }
    .hero-pose-teach__field {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-bottom: 0.5rem;
    }
    .hero-pose-teach__field select {
      padding: 0.35rem 0.45rem;
      border-radius: 6px;
      border: 1px solid rgba(148, 163, 184, 0.35);
      background: #0f172a;
      color: inherit;
    }
    .hero-pose-teach__joint {
      display: grid;
      grid-template-columns: 2.8rem 1fr 3.6rem;
      align-items: center;
      gap: 0.25rem;
      margin-bottom: 0.25rem;
    }
    .hero-pose-teach__joint input[type="range"] { width: 100%; }
    .hero-pose-teach__joint input[type="number"] {
      width: 100%;
      min-width: 0;
      padding: 0.2rem 0.3rem;
      border-radius: 5px;
      border: 1px solid rgba(148, 163, 184, 0.35);
      background: #0f172a;
      color: #93c5fd;
      text-align: right;
      font-variant-numeric: tabular-nums;
    }
    .hero-pose-teach__joint--layout span {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .hero-pose-teach__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin-top: 0.5rem;
    }
    .hero-pose-teach__actions button {
      flex: 1 1 calc(50% - 0.2rem);
      padding: 0.28rem 0.35rem;
      border-radius: 5px;
      border: 1px solid rgba(148, 163, 184, 0.35);
      background: #1e293b;
      color: inherit;
      cursor: pointer;
    }
    .hero-pose-teach__actions button:hover { background: #334155; }
    .hero-pose-teach__danger { border-color: rgba(248, 113, 113, 0.45) !important; }
    .hero-pose-teach__status {
      margin: 0.55rem 0 0;
      min-height: 1.2em;
      color: #86efac;
      font-size: 11px;
    }
    .hero-pose-teach__live-pos {
      font-family: ui-monospace, 'Cascadia Code', monospace;
      font-size: 10px;
      line-height: 1.45;
      margin: 0.15rem 0 0.35rem;
      color: #cbd5e1;
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(panel);

  const toggleBtn = panel.querySelector('#hero-pose-teach-toggle');
  const bodyEl = panel.querySelector('#hero-pose-teach-body');
  const COLLAPSE_KEY = 'hero-pose-teach-collapsed';

  function setPanelCollapsed(collapsed) {
    panel.classList.toggle('is-collapsed', collapsed);
    bodyEl.hidden = collapsed;
    toggleBtn.setAttribute('aria-expanded', String(!collapsed));
    toggleBtn.textContent = collapsed ? '▸' : '▾';
    toggleBtn.title = collapsed ? 'Expand panel' : 'Collapse panel';
    try { sessionStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0'); } catch (_) { /* ignore */ }
  }

  setPanelCollapsed(sessionStorage.getItem(COLLAPSE_KEY) !== '0');

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setPanelCollapsed(!panel.classList.contains('is-collapsed'));
  });

  panel.querySelector('.hero-pose-teach__head-row').addEventListener('click', () => {
    setPanelCollapsed(!panel.classList.contains('is-collapsed'));
  });

  const statusEl = panel.querySelector('#hero-pose-teach-status');
  const stageSelect = panel.querySelector('#hero-pose-teach-stage');
  const slidersRoot = panel.querySelector('#hero-pose-teach-sliders');
  const profileSelect = panel.querySelector('#hero-layout-teach-profile');
  const currentProfileEl = panel.querySelector('#hero-layout-teach-current');
  const layoutSlidersRoot = panel.querySelector('#hero-layout-teach-sliders');
  const beltLayoutRoot = panel.querySelector('#hero-belt-layout-sliders');
  const beltSpeedRoot = panel.querySelector('#hero-belt-speed-slider');
  const jointNames = getMovableJoints(kinematics);
  const sliderMap = new Map();
  const sceneFrameSliderMap = new Map();
  const layoutSliderMap = new Map();
  const beltLayoutSliderMap = new Map();
  const profileKeys = Object.keys(HERO_LAYOUT_PROFILES).flatMap((tier) => (
    Object.keys(HERO_LAYOUT_PROFILES[tier]).map((layout) => profileStorageKey(tier, layout))
  ));

  function setStatus(msg) {
    statusEl.textContent = msg;
  }

  async function writeTeachOverrideFile() {
    const payload = JSON.stringify(
      serializeTeachOverrides(poseStore, layoutStore, beltSpeed, beltLayout),
      null,
      2,
    );
    const isLocalDev = /^(localhost|127\.0\.0\.1|\[::1\])$/i.test(location.hostname);
    if (!isLocalDev) {
      return `Save only works on localhost with dev-server.py`;
    }
    try {
      const res = await fetch(TEACH_OVERRIDE_FILENAME, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });
      if (res.ok) return `Updated ${TEACH_OVERRIDE_FILENAME}`;
      return `Save failed (${res.status}) — use: python dev-server.py`;
    } catch (_) {
      return `Save failed — use: python dev-server.py (not python -m http.server)`;
    }
  }

  function selectedStage() {
    return stageSelect.value;
  }

  function slidersToPose() {
    const pose = {};
    for (const [name, controls] of sliderMap) {
      pose[name] = parseFloat(controls.range.value);
    }
    for (const [name, controls] of sceneFrameSliderMap) {
      pose[name] = parseFloat(controls.range.value);
    }
    return pose;
  }

  function sceneFrameSlidersToFrame() {
    const frame = {};
    for (const [name, controls] of sceneFrameSliderMap) {
      frame[name] = parseFloat(controls.range.value);
    }
    return frame;
  }

  function applySceneFrameSliders() {
    if (!applySceneFrame) return;
    applySceneFrame(sceneFrameSlidersToFrame(), selectedStage());
  }

  function applySlidersToArm() {
    const tween = getActiveTween();
    if (tween) {
      tween.stop();
      setActiveTween(null);
    }
    applyPoseImmediate(poseJointsOnly(slidersToPose()));
  }

  function loadSlidersFromPose(pose) {
    for (const [name, controls] of sliderMap) {
      if (pose[name] !== undefined) {
        const value = String(pose[name]);
        controls.range.value = value;
        controls.number.value = value;
      }
    }
    const frame = sceneFrameFromPose(pose, selectedStage());
    for (const [name, controls] of sceneFrameSliderMap) {
      const value = String(frame[name]);
      controls.range.value = value;
      controls.number.value = value;
    }
  }

  function selectedProfileKey() {
    return profileSelect.value;
  }

  function currentViewportProfileKey() {
    const vp = readViewport();
    return profileStorageKey(vp.tier, vp.layout);
  }

  function layoutSlidersToProfile() {
    const next = {};
    for (const [name, controls] of layoutSliderMap) {
      next[name] = parseFloat(controls.range.value);
    }
    return next;
  }

  function updateCurrentProfileText() {
    const current = currentViewportProfileKey();
    const selected = selectedProfileKey();
    currentProfileEl.textContent = current === selected
      ? `Current screen: ${current}`
      : `Current screen: ${current} · editing ${selected}`;
  }

  function refreshViewportLayout() {
    if (layoutScene) layoutScene(readViewport());
    updateCurrentProfileText();
  }

  function loadLayoutSlidersFromProfile(profile) {
    for (const [name, controls] of layoutSliderMap) {
      const value = String(profile[name]);
      controls.range.value = value;
      controls.number.value = value;
    }
  }

  function applyLayoutDraft() {
    const key = selectedProfileKey();
    layoutStore[key] = profileOverrideSubset(layoutSlidersToProfile());
    refreshViewportLayout();
  }

  function beltLayoutSlidersToLayout() {
    const next = {};
    for (const [name, controls] of beltLayoutSliderMap) {
      next[name] = parseFloat(controls.range.value);
    }
    return next;
  }

  function loadBeltLayoutSliders(layout) {
    const L = normalizeBeltLayout(layout);
    for (const [name, controls] of beltLayoutSliderMap) {
      const value = String(L[name]);
      controls.range.value = value;
      controls.number.value = value;
    }
  }

  function applyBeltLayoutDraft() {
    const next = normalizeBeltLayout(beltLayoutSlidersToLayout());
    Object.assign(beltLayout, next);
    if (applyBeltLayout) applyBeltLayout(beltLayout);
  }

  for (const name of Object.keys(poseStore)) {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    stageSelect.appendChild(opt);
  }

  for (const key of profileKeys) {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = key;
    profileSelect.appendChild(opt);
  }

  for (const joint of jointNames) {
    const row = document.createElement('label');
    row.className = 'hero-pose-teach__joint';
    row.innerHTML = `
      <span>${joint.replace('joint_', 'J')}</span>
      <input type="range" min="-170" max="170" step="1" value="0">
      <input type="number" min="-170" max="170" step="1" value="0">
    `;
    const [rangeInput, numberInput] = row.querySelectorAll('input');
    const sync = (value, source = 'range') => {
      const next = String(value);
      if (source !== 'range') rangeInput.value = next;
      if (source !== 'number') numberInput.value = next;
      applySlidersToArm();
    };
    rangeInput.addEventListener('input', () => sync(rangeInput.value, 'range'));
    numberInput.addEventListener('input', () => sync(numberInput.value, 'number'));
    sliderMap.set(joint, { range: rangeInput, number: numberInput });
    slidersRoot.appendChild(row);
  }

  for (const group of SCENE_FRAME_GROUPS) {
    const root = panel.querySelector(`#${group.rootId}`);
    if (!root) continue;
    for (const field of group.fields) {
      const cfg = SCENE_FRAME_CONFIG[field];
      const row = document.createElement('label');
      row.className = 'hero-pose-teach__joint hero-pose-teach__joint--scene';
      row.innerHTML = `
        <span title="${cfg.label}">${cfg.label}</span>
        <input type="range" min="${cfg.min}" max="${cfg.max}" step="${cfg.step}" value="0">
        <input type="number" min="${cfg.min}" max="${cfg.max}" step="${cfg.step}" value="0">
      `;
      const [rangeInput, numberInput] = row.querySelectorAll('input');
      const sync = (value, source = 'range') => {
        const next = String(value);
        if (source !== 'range') rangeInput.value = next;
        if (source !== 'number') numberInput.value = next;
        applySceneFrameSliders();
      };
      rangeInput.addEventListener('input', () => sync(rangeInput.value, 'range'));
      numberInput.addEventListener('input', () => sync(numberInput.value, 'number'));
      sceneFrameSliderMap.set(field, { range: rangeInput, number: numberInput });
      root.appendChild(row);
    }
  }

  for (const field of PROFILE_OVERRIDE_FIELDS) {
    const cfg = PROFILE_FIELD_CONFIG[field];
    const row = document.createElement('label');
    row.className = 'hero-pose-teach__joint hero-pose-teach__joint--layout';
    row.innerHTML = `
      <span title="${cfg.label}">${cfg.label}</span>
      <input type="range" min="${cfg.min}" max="${cfg.max}" step="${cfg.step}" value="0">
      <input type="number" min="${cfg.min}" max="${cfg.max}" step="${cfg.step}" value="0">
    `;
    const [rangeInput, numberInput] = row.querySelectorAll('input');
    const sync = (value, source = 'range') => {
      const next = String(value);
      if (source !== 'range') rangeInput.value = next;
      if (source !== 'number') numberInput.value = next;
      applyLayoutDraft();
    };
    rangeInput.addEventListener('input', () => sync(rangeInput.value, 'range'));
    numberInput.addEventListener('input', () => sync(numberInput.value, 'number'));
    layoutSliderMap.set(field, { range: rangeInput, number: numberInput });
    layoutSlidersRoot.appendChild(row);
  }

  for (const field of BELT_LAYOUT_FIELDS) {
    const cfg = BELT_LAYOUT_CONFIG[field];
    const row = document.createElement('label');
    row.className = 'hero-pose-teach__joint hero-pose-teach__joint--layout';
    row.innerHTML = `
      <span title="${cfg.label}">${cfg.label}</span>
      <input type="range" min="${cfg.min}" max="${cfg.max}" step="${cfg.step}" value="0">
      <input type="number" min="${cfg.min}" max="${cfg.max}" step="${cfg.step}" value="0">
    `;
    const [rangeInput, numberInput] = row.querySelectorAll('input');
    const sync = (value, source = 'range') => {
      const next = String(value);
      if (source !== 'range') rangeInput.value = next;
      if (source !== 'number') numberInput.value = next;
      applyBeltLayoutDraft();
    };
    rangeInput.addEventListener('input', () => sync(rangeInput.value, 'range'));
    numberInput.addEventListener('input', () => sync(numberInput.value, 'number'));
    beltLayoutSliderMap.set(field, { range: rangeInput, number: numberInput });
    beltLayoutRoot.appendChild(row);
  }

  const beltSpeedCfg = { min: 0, max: 0.025, step: 0.0005, label: 'Belt speed' };
  const beltSpeedRow = document.createElement('label');
  beltSpeedRow.className = 'hero-pose-teach__joint hero-pose-teach__joint--layout';
  beltSpeedRow.innerHTML = `
    <span title="${beltSpeedCfg.label}">${beltSpeedCfg.label}</span>
    <input type="range" min="${beltSpeedCfg.min}" max="${beltSpeedCfg.max}" step="${beltSpeedCfg.step}" value="${beltSpeed}">
    <input type="number" min="${beltSpeedCfg.min}" max="${beltSpeedCfg.max}" step="${beltSpeedCfg.step}" value="${beltSpeed}">
  `;
  const [beltRangeInput, beltNumberInput] = beltSpeedRow.querySelectorAll('input');
  const syncBeltSpeed = (value, source = 'range') => {
    const next = String(value);
    if (source !== 'range') beltRangeInput.value = next;
    if (source !== 'number') beltNumberInput.value = next;
    beltSpeed = parseFloat(next);
    if (setBeltSpeed) setBeltSpeed(beltSpeed);
  };
  beltRangeInput.addEventListener('input', () => syncBeltSpeed(beltRangeInput.value, 'range'));
  beltNumberInput.addEventListener('input', () => syncBeltSpeed(beltNumberInput.value, 'number'));
  beltSpeedRoot.appendChild(beltSpeedRow);

  function loadSelectedStage() {
    const stage = selectedStage();
    const pose = poseStore[stage] || poseStore.belt;
    loadSlidersFromPose(pose);
    applySceneFrameSliders();
    applySlidersToArm();
    if (EFFECTOR_PHOTO_STAGES.has(stage)) {
      applySceneFrameSliders();
    }
  }

  function loadSelectedProfile() {
    const [tier, layout] = parseProfileKey(selectedProfileKey());
    const effective = heroLayoutProfile(tier, layout, layoutStore);
    loadLayoutSlidersFromProfile(effective);
    updateCurrentProfileText();
  }

  stageSelect.addEventListener('change', loadSelectedStage);
  profileSelect.addEventListener('change', loadSelectedProfile);

  panel.querySelector('#hero-pose-teach-preview').addEventListener('click', () => {
    const name = selectedStage();
    poseStore[name] = slidersToPose();
    window.dispatchEvent(new CustomEvent('hero-arm-stage', { detail: { stage: name } }));
    setStatus(`Previewing “${name}” with arm tween`);
  });

  panel.querySelector('#hero-pose-teach-save').addEventListener('click', () => {
    const name = selectedStage();
    poseStore[name] = slidersToPose();
    savePoseStore(poseStore);
    setStatus(`Saved “${name}” to browser storage`);
  });

  panel.querySelector('#hero-pose-teach-file').addEventListener('click', async () => {
    const name = selectedStage();
    poseStore[name] = slidersToPose();
    savePoseStore(poseStore);
    saveBeltSpeed(beltSpeed);
    saveBeltLayout(beltLayout);
    setStatus(await writeTeachOverrideFile());
  });

  panel.querySelector('#hero-pose-teach-read').addEventListener('click', () => {
    const name = selectedStage();
    const joints = readCurrentPose(kinematics, tweenParams);
    const frame = readSceneFrame ? readSceneFrame() : {};
    poseStore[name] = { ...joints, ...frame };
    loadSlidersFromPose(poseStore[name]);
    setStatus(`Read arm + scene into “${name}”`);
  });

  panel.querySelector('#hero-scene-frame-read').addEventListener('click', () => {
    if (!readSceneFrame) return;
    const name = selectedStage();
    const frame = readSceneFrame();
    poseStore[name] = { ...poseJointsOnly(poseStore[name] || {}), ...frame };
    loadSlidersFromPose(poseStore[name]);
    applySceneFrameSliders();
    setStatus(`Read scene into “${name}”`);
  });

  panel.querySelector('#hero-pose-teach-copy').addEventListener('click', async () => {
    const text = formatPosesForSource(poseStore);
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Copied POSES block — paste into chat to store in code');
    } catch (_) {
      console.log(text);
      setStatus('Logged POSES to console (clipboard blocked)');
    }
  });

  panel.querySelector('#hero-pose-teach-reset').addEventListener('click', () => {
    localStorage.removeItem(POSE_STORAGE_KEY);
    Object.assign(poseStore, normalizePoseStore(clonePoses(DEFAULT_POSES)));
    loadSelectedStage();
    setStatus('Reset to built-in defaults');
  });

  panel.querySelector('#hero-layout-teach-current-btn').addEventListener('click', () => {
    profileSelect.value = currentViewportProfileKey();
    loadSelectedProfile();
    setStatus(`Editing ${profileSelect.value}`);
  });

  panel.querySelector('#hero-layout-teach-save').addEventListener('click', () => {
    const key = selectedProfileKey();
    layoutStore[key] = layoutSlidersToProfile();
    saveLayoutStore(layoutStore);
    setStatus(`Saved layout for ${key}`);
  });

  panel.querySelector('#hero-layout-teach-file').addEventListener('click', async () => {
    const key = selectedProfileKey();
    layoutStore[key] = layoutSlidersToProfile();
    saveLayoutStore(layoutStore);
    saveBeltSpeed(beltSpeed);
    saveBeltLayout(beltLayout);
    setStatus(await writeTeachOverrideFile());
  });

  panel.querySelector('#hero-layout-teach-copy').addEventListener('click', async () => {
    const text = formatLayoutOverridesForSource(layoutStore);
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Copied layout overrides block');
    } catch (_) {
      console.log(text);
      setStatus('Logged layout overrides to console');
    }
  });

  panel.querySelector('#hero-layout-teach-reset').addEventListener('click', () => {
    localStorage.removeItem(LAYOUT_STORAGE_KEY);
    const fresh = loadLayoutStore();
    for (const key of Object.keys(layoutStore)) delete layoutStore[key];
    Object.assign(layoutStore, fresh);
    profileSelect.value = currentViewportProfileKey();
    loadSelectedProfile();
    refreshViewportLayout();
    setStatus('Reset layout overrides');
  });

  panel.querySelector('#hero-belt-layout-read').addEventListener('click', () => {
    if (!readBeltLayoutFromRig) return;
    Object.assign(beltLayout, normalizeBeltLayout(readBeltLayoutFromRig()));
    loadBeltLayoutSliders(beltLayout);
    if (applyBeltLayout) applyBeltLayout(beltLayout);
    setStatus('Read belt position from 3D');
  });

  panel.querySelector('#hero-belt-layout-save').addEventListener('click', () => {
    Object.assign(beltLayout, normalizeBeltLayout(beltLayoutSlidersToLayout()));
    saveBeltLayout(beltLayout);
    setStatus('Saved belt position to browser storage');
  });

  panel.querySelector('#hero-belt-layout-reset').addEventListener('click', () => {
    localStorage.removeItem(BELT_LAYOUT_STORAGE_KEY);
    Object.assign(beltLayout, { ...DEFAULT_BELT_LAYOUT });
    loadBeltLayoutSliders(beltLayout);
    if (applyBeltLayout) applyBeltLayout(beltLayout);
    setStatus('Reset belt to defaults');
  });

  profileSelect.value = currentViewportProfileKey();
  loadSelectedStage();
  loadSelectedProfile();
  loadBeltLayoutSliders(initialBeltLayout);
  Object.assign(beltLayout, normalizeBeltLayout(initialBeltLayout));
  window.__heroPoseTeach = {
    poseStore,
    layoutStore,
    beltLayout,
    get beltSpeed() { return beltSpeed; },
    save: () => {
      savePoseStore(poseStore);
      saveLayoutStore(layoutStore);
      saveBeltSpeed(beltSpeed);
      saveBeltLayout(beltLayout);
    },
    updateLivePositions: null,
  };
  window.dispatchEvent(new CustomEvent('hero-pose-teach-ready'));

  return poseStore;
}

let poseStore = loadPoseStore();
let layoutOverrideStore = loadLayoutStore();
let beltLayoutStore = { ...DEFAULT_BELT_LAYOUT };
let treadmillBeltSpeed = DEFAULT_TREADMILL_BELT_SPEED;
/** Runtime camera zoom multiplier (1 = layout default; lower = zoom in). */
let heroCameraFramingMult = 1;
/** Locked bbox — invalidated when layout profile, scale, or rig offsets change. */
let cameraFrameLock = null;
let cameraFrameLockContext = null;

const LAYOUT_OVERRIDE_FALLBACK_TIERS = {
  tablet: ['mobile'],
  desktop: ['tablet', 'mobile'],
  widescreen: ['desktop', 'tablet', 'mobile'],
};

/**
 * Photo card default lies in XY (image normal +Z). Vacuum cups face along gripper +Z.
 * Parent is eoat-vacuum-tip (cup contact plane). Rotate 180° X so print faces −Z
 * (workpiece) and paper back faces the cups (+Z).
 */
const EFFECTOR_PHOTO_ATTACH_POS = { x: 0, y: 0, z: 0 };
const EFFECTOR_PHOTO_ATTACH_ROT = { x: Math.PI, y: 0, z: 0 };
/** Above gripper meshes so the card is not drawn underneath the vacuum body. */
const EFFECTOR_PHOTO_RENDER_ORDER = 12;

function setEffectorPhotoRenderOrder(photo, order = EFFECTOR_PHOTO_RENDER_ORDER) {
  if (!photo) return;
  photo.renderOrder = order;
  photo.traverse((child) => {
    if (child.isMesh) child.renderOrder = order;
  });
}

function alignEffectorPhotoToGripper(photo) {
  if (!photo) return;
  photo.position.set(
    EFFECTOR_PHOTO_ATTACH_POS.x,
    EFFECTOR_PHOTO_ATTACH_POS.y,
    EFFECTOR_PHOTO_ATTACH_POS.z,
  );
  photo.rotation.set(
    EFFECTOR_PHOTO_ATTACH_ROT.x,
    EFFECTOR_PHOTO_ATTACH_ROT.y,
    EFFECTOR_PHOTO_ATTACH_ROT.z,
  );
}

function reportHero3dFailure(reason) {
  console.error('[hero-robot-3d]', reason);
}

function revealHeroVisual() {
  document.querySelector('.hero-integrated .hero__visual.reveal')?.classList.add('visible');
  document.querySelector('.hero-showcase')?.classList.add('is-inview');
}

function showCssFallback(stage) {
  revealHeroVisual();
  const fb = document.getElementById('hero-robot-fallback');
  if (fb) fb.hidden = false;
  stage?.classList.remove('hero__showcase-main--3d');
  stage?.classList.add('hero-stage--show');
  const wrap = document.getElementById(WRAP_ID);
  if (wrap) {
    delete wrap.dataset.ready;
    wrap.replaceChildren();
  }
  window.__heroRobotCssFallback = true;
  window.dispatchEvent(new CustomEvent('hero-robot-3d-ready'));
  window.dispatchEvent(new CustomEvent('hero-start-cycle'));
}

function markReady(stage) {
  revealHeroVisual();
  const fb = document.getElementById('hero-robot-fallback');
  if (fb) fb.hidden = true;
  stage?.classList.add('hero__showcase-main--3d', 'hero-stage--show');
  const wrap = document.getElementById(WRAP_ID);
  if (wrap) wrap.dataset.ready = 'true';
  window.__heroRobot3dReady = true;
  window.dispatchEvent(new CustomEvent('hero-robot-3d-ready'));
  window.dispatchEvent(new CustomEvent('hero-start-cycle'));
}

function armDurationMs() {
  const stage = document.getElementById(STAGE_ID);
  if (!stage) return 2000;
  const raw = getComputedStyle(stage).getPropertyValue('--hero-arm-ms').trim();
  if (!raw) return 2000;
  if (raw.endsWith('ms')) return parseFloat(raw);
  if (raw.endsWith('s')) return parseFloat(raw) * 1000;
  return 2000;
}

function findNodeByName(root, name) {
  let match = null;
  root.traverse((child) => {
    if (child.name === name) match = child;
  });
  return match;
}

function findEffectorNode(root) {
  return findNodeByName(root, 'tool0') || findNodeByName(root, 'link_6');
}

/** Cup contact plane — end of vacuum pump array (EOAT frame). */
function findVacuumTipNode(root) {
  return findNodeByName(root, 'eoat-vacuum-tip')
    || findNodeByName(root, 'eoat-gripper')
    || findEffectorNode(root);
}

function noise2(x, y) {
  return (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
}

function fillCanvas(size, paint) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const data = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const [r, g, b, a = 255] = paint(x, y);
      data.data[i] = r;
      data.data[i + 1] = g;
      data.data[i + 2] = b;
      data.data[i + 3] = a;
    }
  }
  ctx.putImageData(data, 0, 0);
  return canvas;
}

function configureTexture(source, renderer, { colorSpace = THREE.NoColorSpace } = {}) {
  const tex = source.isTexture ? source : new THREE.CanvasTexture(source);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(UV_TILE, UV_TILE);
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  tex.colorSpace = colorSpace;
  return tex;
}

/** Procedural brushed-metal maps — fallback when image files fail to load */
function createProceduralTextures(renderer) {
  const size = 512;

  const mapCanvas = fillCanvas(size, (x, y) => {
    const brush = Math.sin(y * 0.11) * 28 + Math.sin(y * 0.55 + x * 0.03) * 12;
    const n = (noise2(x, y) - 0.5) * 18;
    return [
      Math.min(255, Math.max(0, 224 + brush + n)),
      Math.min(255, Math.max(0, 88 + brush * 0.35 + n * 0.5)),
      Math.min(255, Math.max(0, 38 + n * 0.3)),
    ];
  });

  const normalCanvas = fillCanvas(size, (x, y) => {
    const brush = Math.sin(y * 0.42 + x * 0.04) * 22;
    const fine = (noise2(x * 3, y * 3) - 0.5) * 16;
    return [128 + fine, 128 + brush + fine, 255];
  });

  const roughCanvas = fillCanvas(size, (x, y) => {
    const brush = Math.sin(y * 0.38) * 0.12 + 0.38;
    const v = Math.floor((brush + noise2(x, y) * 0.15) * 255);
    return [v, v, v];
  });

  return {
    map: configureTexture(mapCanvas, renderer, { colorSpace: THREE.SRGBColorSpace }),
    normalMap: configureTexture(normalCanvas, renderer),
    roughnessMap: configureTexture(roughCanvas, renderer),
  };
}

function loadRobotTextures(renderer) {
  const loader = new THREE.TextureLoader();
  const load = (file, colorSpace) => new Promise((resolve, reject) => {
    loader.load(
      `${TEXTURE_BASE}${file}`,
      (tex) => resolve(configureTexture(tex, renderer, { colorSpace })),
      undefined,
      reject,
    );
  });

  return Promise.all([
    load('orange_diff.png', THREE.SRGBColorSpace),
    load('orange_normal.png', THREE.NoColorSpace),
    load('orange_rough.png', THREE.NoColorSpace),
  ]).then(([map, normalMap, roughnessMap]) => ({ map, normalMap, roughnessMap }));
}

/** Collada mesh has positions only — project box UVs so maps actually render */
function ensureMeshUVs(mesh) {
  const geometry = mesh.geometry;
  if (!geometry?.attributes?.position) return;

  const position = geometry.attributes.position;
  const normal = geometry.attributes.normal;
  if (!normal) geometry.computeVertexNormals();

  const count = position.count;
  const uv = new Float32Array(count * 2);
  const bbox = geometry.boundingBox || new THREE.Box3().setFromBufferAttribute(position);
  if (!geometry.boundingBox) geometry.boundingBox = bbox;

  const size = bbox.getSize(new THREE.Vector3());
  const sx = size.x || 1;
  const sy = size.y || 1;
  const sz = size.z || 1;
  const norms = geometry.attributes.normal;

  for (let i = 0; i < count; i++) {
    const nx = Math.abs(norms.getX(i));
    const ny = Math.abs(norms.getY(i));
    const nz = Math.abs(norms.getZ(i));
    let u;
    let v;

    if (nx >= ny && nx >= nz) {
      u = (position.getZ(i) - bbox.min.z) / sz;
      v = (position.getY(i) - bbox.min.y) / sy;
    } else if (ny >= nz) {
      u = (position.getX(i) - bbox.min.x) / sx;
      v = (position.getZ(i) - bbox.min.z) / sz;
    } else {
      u = (position.getX(i) - bbox.min.x) / sx;
      v = (position.getY(i) - bbox.min.y) / sy;
    }

    uv[i * 2] = u * UV_TILE;
    uv[i * 2 + 1] = v * UV_TILE;
  }

  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geometry.attributes.uv.needsUpdate = true;
}

function prepareRobotMeshes(root) {
  root.traverse((child) => {
    if (!child.isMesh) return;
    child.geometry?.computeBoundingBox();
    ensureMeshUVs(child);
  });
}

function enhancePhysicalMaterials(root, envMap, textures) {
  root.traverse((child) => {
    if (!child.isMesh) return;

    child.material = new THREE.MeshPhysicalMaterial({
      color: 0xff8c2a,
      map: textures.map,
      metalness: 0.42,
      roughness: 0.36,
      clearcoat: 0.62,
      clearcoatRoughness: 0.12,
      envMap,
      envMapIntensity: 1.35,
      normalMap: textures.normalMap,
      normalScale: new THREE.Vector2(2.4, 2.4),
      roughnessMap: textures.roughnessMap,
      emissive: 0x331800,
      emissiveIntensity: 0.08,
    });
    child.castShadow = false;
    child.receiveShadow = false;
  });
}

let heroPhotoTextureCache = null;

function getHeroPhotoTextureCache() {
  if (!heroPhotoTextureCache) heroPhotoTextureCache = new Map();
  return heroPhotoTextureCache;
}

function loadHeroPhotoTexture(imageUrl) {
  const cache = getHeroPhotoTextureCache();
  if (!cache.has(imageUrl)) {
    cache.set(imageUrl, new THREE.TextureLoader()
      .loadAsync(imageUrl)
      .then((tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
      })
      .catch(() => null));
  }
  return cache.get(imageUrl);
}

function photoGroupImageMaterial(photoGroup) {
  if (!photoGroup) return null;
  const plane = photoGroup.children.find((child) => child.isMesh && child.name === 'photo-front')
    ?? photoGroup.children.find((child) => child.isMesh && child.name !== 'photo-back');
  return plane?.material ?? null;
}

async function applyPhotoGroupTexture(photoGroup, imageUrl) {
  const mat = photoGroupImageMaterial(photoGroup);
  if (!mat) return;
  const token = (photoGroup.userData.textureToken ?? 0) + 1;
  photoGroup.userData.textureToken = token;
  photoGroup.userData.pendingUrl = imageUrl;
  const tex = await loadHeroPhotoTexture(imageUrl);
  if (photoGroup.userData.textureToken !== token) return;
  if (tex) {
    mat.map = tex;
    mat.color.set(0xffffff);
    mat.needsUpdate = true;
    tex.needsUpdate = true;
    photoGroup.userData.imageUrl = imageUrl;
    delete photoGroup.userData.pendingUrl;
  }
}

function syncEffectorPhotoTextureFromBelt(beltPhoto, effectorPhoto) {
  if (!beltPhoto || !effectorPhoto) return false;
  const srcMat = photoGroupImageMaterial(beltPhoto);
  const dstMat = photoGroupImageMaterial(effectorPhoto);
  if (!dstMat) return false;
  if (!srcMat?.map) return false;
  dstMat.map = srcMat.map;
  dstMat.color.copy(srcMat.color);
  dstMat.needsUpdate = true;
  effectorPhoto.userData.imageUrl = beltPhoto.userData.imageUrl;
  effectorPhoto.userData.textureToken = beltPhoto.userData.textureToken;
  return true;
}

async function ensurePhotoGroupTexture(photoGroup) {
  if (!photoGroup) return false;
  const mat = photoGroupImageMaterial(photoGroup);
  if (mat?.map) return true;
  const url = photoGroup.userData.pendingUrl ?? photoGroup.userData.imageUrl;
  if (!url) return false;
  await applyPhotoGroupTexture(photoGroup, url);
  return Boolean(photoGroupImageMaterial(photoGroup)?.map);
}

function shuffleArray(items) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function resetPhotoCycleOrder() {
  photoCycleOrder = shuffleArray(HERO_PHOTO_POOL);
  photoCycleIndex = 0;
}

function nextCyclePhotoUrl() {
  if (!photoCycleOrder.length) resetPhotoCycleOrder();
  const url = photoCycleOrder[photoCycleIndex];
  photoCycleIndex = (photoCycleIndex + 1) % photoCycleOrder.length;
  if (photoCycleIndex === 0) {
    photoCycleOrder = shuffleArray(HERO_PHOTO_POOL);
  }
  return url;
}

async function assignCyclePhoto(...photoGroups) {
  const url = nextCyclePhotoUrl();
  preloadUpcomingHeroPhotos(PHOTO_PRELOAD_AHEAD);
  await Promise.all(photoGroups
    .filter(Boolean)
    .map((group) => applyPhotoGroupTexture(group, url)));
  window.dispatchEvent(new CustomEvent('hero-cycle-photo', { detail: { url } }));
  return url;
}

function preloadUpcomingHeroPhotos(count = PHOTO_PRELOAD_AHEAD) {
  if (!photoCycleOrder.length) return;
  for (let i = 0; i < count; i++) {
    const idx = (photoCycleIndex + i) % photoCycleOrder.length;
    void loadHeroPhotoTexture(photoCycleOrder[idx]);
  }
}

function initPhotoCycle() {
  resetPhotoCycleOrder();
  preloadUpcomingHeroPhotos(PHOTO_PRELOAD_AHEAD);
}

const _photoAlphaCache = new Map();

function fillRoundedRect(ctx, x, y, w, h, radius) {
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, 0, x + r, y);
  ctx.closePath();
  ctx.fill();
}

/** Rounded-corner alpha mask shared by belt + effector photo planes. */
function getPhotoRoundedAlphaMap(aspect, cornerRadiusPx = PHOTO_CORNER_RADIUS_PX) {
  const key = `${aspect.toFixed(3)}-${cornerRadiusPx}`;
  if (_photoAlphaCache.has(key)) return _photoAlphaCache.get(key);
  const texW = 512;
  const texH = Math.max(64, Math.round(texW / aspect));
  const canvas = document.createElement('canvas');
  canvas.width = texW;
  canvas.height = texH;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  fillRoundedRect(ctx, 0, 0, texW, texH, cornerRadiusPx);
  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  _photoAlphaCache.set(key, tex);
  return tex;
}

function createPhotoPayload(imageUrl, { width = 0.22, aspect = 1.35, showBack = true } = {}) {
  const group = new THREE.Group();
  group.name = 'photo-payload';
  const height = width / aspect;
  const half = PHOTO_CARD_THICKNESS * 0.5;
  const roundedAlpha = getPhotoRoundedAlphaMap(aspect);

  const imageMat = new THREE.MeshBasicMaterial({
    side: THREE.FrontSide,
    transparent: true,
    depthWrite: true,
    alphaMap: roundedAlpha,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  const imagePlane = new THREE.Mesh(new THREE.PlaneGeometry(width, height), imageMat);
  imagePlane.position.z = half;
  imagePlane.name = 'photo-front';
  imagePlane.renderOrder = 2;
  group.add(imagePlane);

  if (showBack) {
    const backMat = new THREE.MeshBasicMaterial({
      color: PHOTO_BACK_COLOR,
      side: THREE.FrontSide,
      depthWrite: true,
      transparent: true,
      alphaMap: roundedAlpha,
    });
    const backPlane = new THREE.Mesh(new THREE.PlaneGeometry(width, height), backMat);
    backPlane.rotation.y = Math.PI;
    backPlane.position.z = -half;
    backPlane.name = 'photo-back';
    backPlane.renderOrder = 1;
    group.add(backPlane);
  }

  loadHeroPhotoTexture(imageUrl).then((tex) => {
    if (group.userData.pendingUrl && group.userData.pendingUrl !== imageUrl) return;
    if ((group.userData.textureToken ?? 0) > 0) return;
    if (tex) {
      imageMat.map = tex;
      imageMat.color.set(0xffffff);
      imageMat.needsUpdate = true;
      group.userData.imageUrl = imageUrl;
    } else {
      imageMat.color = new THREE.Color(0x94a3b8);
    }
  });

  return group;
}

/** Lie flat on belt (print down), matching pose beltPhotoRot 90 / 0 / -90. */
const BELT_PHOTO_ROTATION = { x: Math.PI / 2, y: 0, z: -Math.PI / 2 };

const _handoffWorldPos = new THREE.Vector3();
const _handoffWorldQuat = new THREE.Quaternion();
const _handoffParentQuat = new THREE.Quaternion();

function ensureBeltPhotoOnSurface(treadmillRig, beltPhoto) {
  const mount = treadmillRig?.userData?.photoMount;
  if (!mount || !beltPhoto) return;
  mount.position.y = beltPhotoMountY(mount.position.y);
  beltPhoto.position.y = BELT_PHOTO_LOCAL_Y;
}

/** Preserve belt card world pose on the gripper at pick contact (no fixed-offset snap). */
function syncEffectorPhotoWorldFromBelt(beltPhoto, effectorPhoto, liftY = HANDOFF_LIFT_Y) {
  if (!beltPhoto || !effectorPhoto?.parent) return;
  beltPhoto.updateWorldMatrix(true, false);
  effectorPhoto.parent.updateWorldMatrix(true, false);
  beltPhoto.getWorldPosition(_handoffWorldPos);
  beltPhoto.getWorldQuaternion(_handoffWorldQuat);
  _handoffWorldPos.y += liftY;
  effectorPhoto.parent.worldToLocal(_handoffWorldPos);
  effectorPhoto.position.copy(_handoffWorldPos);
  effectorPhoto.parent.getWorldQuaternion(_handoffParentQuat);
  effectorPhoto.quaternion.copy(_handoffParentQuat.invert().multiply(_handoffWorldQuat));
}

function finishHandoffBeltToEffector(beltPhoto, effectorPhoto, { dispatchEvent = true } = {}) {
  syncEffectorPhotoWorldFromBelt(beltPhoto, effectorPhoto);
  const synced = syncEffectorPhotoTextureFromBelt(beltPhoto, effectorPhoto);
  setEffectorPhotoRenderOrder(effectorPhoto);
  effectorPhoto.userData.carriedFromBelt = true;
  effectorPhoto.visible = true;
  if (beltPhoto) beltPhoto.visible = false;
  if (dispatchEvent) {
    window.dispatchEvent(new CustomEvent('hero-photo-handoff', {
      detail: { synced, imageUrl: effectorPhoto.userData.imageUrl ?? null },
    }));
  }
  return synced;
}

async function handoffBeltToEffector(beltPhoto, effectorPhoto, treadmillRig, { awaitTexture = true, dispatchEvent = true } = {}) {
  if (!effectorPhoto) return false;

  ensureBeltPhotoOnSurface(treadmillRig, beltPhoto);

  if (awaitTexture) {
    await ensurePhotoGroupTexture(beltPhoto);
    let synced = finishHandoffBeltToEffector(beltPhoto, effectorPhoto, { dispatchEvent });
    if (!synced && beltPhoto?.userData?.imageUrl) {
      await applyPhotoGroupTexture(effectorPhoto, beltPhoto.userData.imageUrl);
      synced = Boolean(photoGroupImageMaterial(effectorPhoto)?.map);
      if (dispatchEvent) {
        window.dispatchEvent(new CustomEvent('hero-photo-handoff', {
          detail: { synced, imageUrl: effectorPhoto.userData.imageUrl ?? null },
        }));
      }
    }
    return synced;
  }

  const synced = finishHandoffBeltToEffector(beltPhoto, effectorPhoto, { dispatchEvent });
  void ensurePhotoGroupTexture(beltPhoto).then(async () => {
    if (!syncEffectorPhotoTextureFromBelt(beltPhoto, effectorPhoto) && beltPhoto?.userData?.imageUrl) {
      await applyPhotoGroupTexture(effectorPhoto, beltPhoto.userData.imageUrl);
    }
  });
  return synced;
}

function shouldApplyEffectorSceneFrame(effectorPhoto, stageName) {
  if (!effectorPhoto) return false;
  if (!effectorPhoto.userData.carriedFromBelt) return true;
  return Boolean(stageName && EFFECTOR_PHOTO_STAGES.has(stageName));
}

function syncPhotoCarryForStage(stageName, beltPhoto, effectorPhoto, treadmillRig) {
  if (!beltPhoto || !effectorPhoto || !stageName) return;

  const carried = Boolean(effectorPhoto.userData.carriedFromBelt);

  if (EFFECTOR_PHOTO_STAGES.has(stageName)) {
    if (!carried) {
      if (POSE_TEACH_MODE) {
        effectorPhoto.userData.carriedFromBelt = true;
        effectorPhoto.visible = true;
        setEffectorPhotoRenderOrder(effectorPhoto);
        void ensurePhotoGroupTexture(beltPhoto).then(() => {
          syncEffectorPhotoTextureFromBelt(beltPhoto, effectorPhoto);
        });
      } else {
        handoffBeltToEffector(beltPhoto, effectorPhoto, treadmillRig, { awaitTexture: false });
      }
    }
  } else if (BELT_PHOTO_CARRY_STAGES.has(stageName) && carried) {
    handoffEffectorToBelt(beltPhoto, effectorPhoto);
    ensureBeltPhotoOnSurface(treadmillRig, beltPhoto);
  }
}

function handoffEffectorToBelt(beltPhoto, effectorPhoto) {
  resetEffectorPhotoPulse(effectorPhoto);
  if (effectorPhoto) effectorPhoto.userData.carriedFromBelt = false;
  if (effectorPhoto) effectorPhoto.visible = false;
  if (beltPhoto) beltPhoto.visible = true;
}

function resetEffectorPhotoPulse(effectorPhoto) {
  if (!effectorPhoto) return;
  const base = effectorPhoto.userData.baseScale ?? effectorPhoto.scale.x ?? 1;
  effectorPhoto.userData.pulseMult = 1;
  effectorPhoto.scale.setScalar(base);
  setEffectorPhotoRenderOrder(effectorPhoto);
}

function attachEffectorPhoto(robot, imageUrl) {
  const vacuumTip = findVacuumTipNode(robot);
  const parent = vacuumTip || findEffectorNode(robot);
  if (!parent) return null;
  const photo = createPhotoPayload(imageUrl, {
    width: EFFECTOR_PHOTO_WIDTH,
    aspect: 1.35,
    showBack: true,
  });
  if (findNodeByName(robot, 'eoat-vacuum-tip') || findNodeByName(robot, 'eoat-gripper')) {
    alignEffectorPhotoToGripper(photo);
    setEffectorPhotoRenderOrder(photo);
  } else {
    photo.scale.setScalar(1 / MODEL_SCALE);
    photo.position.set(0, 0.09 / MODEL_SCALE, 0.1 / MODEL_SCALE);
    photo.rotation.x = -0.42;
  }
  photo.visible = false;
  photo.userData.baseScale = photo.scale.x;
  photo.userData.pulseMult = 1;
  photo.userData.carriedFromBelt = false;
  parent.add(photo);
  return photo;
}

function createBeltPhoto(parent, imageUrl) {
  const photo = createPhotoPayload(imageUrl, { width: BELT_PHOTO_WIDTH, aspect: 1.35 });
  photo.rotation.set(BELT_PHOTO_ROTATION.x, BELT_PHOTO_ROTATION.y, BELT_PHOTO_ROTATION.z);
  photo.position.set(0, BELT_PHOTO_LOCAL_Y, 0);
  photo.renderOrder = 8;
  photo.traverse((child) => {
    if (child.isMesh) child.renderOrder = 10;
  });
  parent.add(photo);
  return photo;
}

function createTreadmillBeltTexture(lengthRepeats = 16) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#1a2433';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // High-contrast ribs across the belt width — motion reads when texture scrolls.
  for (let y = 0; y < canvas.height; y += 20) {
    ctx.fillStyle = y % 40 === 0 ? '#4b5f78' : '#2a3547';
    ctx.fillRect(0, y, canvas.width, 8);
    ctx.fillStyle = '#141c28';
    ctx.fillRect(0, y + 8, canvas.width, 12);
  }

  // Center guide stripe
  ctx.fillStyle = 'rgba(251, 191, 36, 0.42)';
  ctx.fillRect(canvas.width * 0.47, 0, canvas.width * 0.06, canvas.height);

  // Chevron tread marks along belt travel (+V when offset animates)
  for (let y = 28; y < canvas.height; y += 56) {
    ctx.fillStyle = 'rgba(203, 213, 225, 0.38)';
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.22, y + 10);
    ctx.lineTo(canvas.width * 0.5, y - 8);
    ctx.lineTo(canvas.width * 0.78, y + 10);
    ctx.lineTo(canvas.width * 0.5, y + 28);
    ctx.closePath();
    ctx.fill();
  }

  // Edge wear lines
  ctx.fillStyle = 'rgba(100, 116, 139, 0.35)';
  ctx.fillRect(0, 0, 10, canvas.height);
  ctx.fillRect(canvas.width - 10, 0, 10, canvas.height);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, lengthRepeats);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createTreadmill(envMap) {
  const group = new THREE.Group();
  group.name = 'treadmill';

  const length = TREADMILL_LENGTH;
  const width = TREADMILL_WIDTH;
  const deckY = TREADMILL_DECK_Y;
  const s = TREADMILL_SCALE;
  group.position.set(TREADMILL_PICK_X, 0, TREADMILL_PICK_Z + length * 0.5);

  const frameMat = new THREE.MeshPhysicalMaterial({
    color: 0x94a3b8,
    metalness: 0.84,
    roughness: 0.32,
    envMap,
    envMapIntensity: 1.05,
  });

  const railMat = new THREE.MeshPhysicalMaterial({
    color: 0x64748b,
    metalness: 0.78,
    roughness: 0.38,
    envMap,
    envMapIntensity: 0.9,
  });

  const beltLengthTiles = Math.max(18, Math.round(length * 2.2));
  const beltTex = createTreadmillBeltTexture(beltLengthTiles);
  const beltMat = new THREE.MeshStandardMaterial({
    map: beltTex,
    color: 0x3d4f63,
    metalness: 0.12,
    roughness: 0.86,
    envMap,
    envMapIntensity: 0.3,
  });

  const belt = new THREE.Mesh(new THREE.BoxGeometry(width, 0.016 * s, length), beltMat);
  belt.position.y = deckY;
  belt.name = 'treadmill-belt';

  const railH = 0.07 * s;
  const railGeom = new THREE.BoxGeometry(0.03 * s, railH, length);
  const railL = new THREE.Mesh(railGeom, railMat);
  railL.position.set(-width / 2 - 0.016 * s, deckY + railH * 0.32, 0);
  const railR = railL.clone();
  railR.position.x = width / 2 + 0.016 * s;

  const rollerGeom = new THREE.CylinderGeometry(0.04 * s, 0.04 * s, width + 0.06 * s, 24);
  const rollerRobot = new THREE.Mesh(rollerGeom, frameMat);
  rollerRobot.rotation.z = Math.PI / 2;
  rollerRobot.position.set(0, deckY + 0.01 * s, -length / 2 + 0.05 * s);
  const rollerFar = rollerRobot.clone();
  rollerFar.position.z = length / 2 - 0.05 * s;

  const legGeom = new THREE.BoxGeometry(0.055 * s, deckY * 0.92, 0.055 * s);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const leg = new THREE.Mesh(legGeom, frameMat);
    leg.position.set(sx * width * 0.36, deckY * 0.46, sz * length * 0.4);
    group.add(leg);
  }

  const photoMount = new THREE.Group();
  photoMount.name = 'treadmill-photo-mount';
  photoMount.position.set(0, beltPhotoMountY(), length / 2 - 0.35 * s);

  group.add(belt, railL, railR, rollerRobot, rollerFar, photoMount);
  group.userData.beltTexture = beltTex;
  group.userData.beltLengthTiles = beltLengthTiles;
  group.userData.photoMount = photoMount;
  setupBeltPhotoTravel(group);
  return group;
}

function setupBeltPhotoTravel(treadmillRig) {
  const { pickZ, startZ, exitZ } = beltTravelBounds();
  treadmillRig.userData.beltTravel = { pickZ, startZ, exitZ, mode: 'idle' };
  if (treadmillRig.userData.photoMount) {
    treadmillRig.userData.photoMount.position.z = startZ;
  }
}

function scrollBeltTextureOffset(tex, delta) {
  if (!tex || !delta) return;
  tex.offset.y = (tex.offset.y + delta) % 1;
  if (tex.offset.y < 0) tex.offset.y += 1;
}

function tickBeltFeed(treadmillRig, beltPhoto) {
  const travel = treadmillRig?.userData.beltTravel;
  if (!travel || travel.mode === 'idle') return { feeding: false, texDelta: 0 };

  const mount = treadmillRig.userData.photoMount;
  if (!mount) return { feeding: false, texDelta: 0 };

  const length = TREADMILL_LENGTH;
  const lengthRepeats = treadmillRig.userData.beltLengthTiles ?? Math.max(18, Math.round(length * 2.2));
  const step = treadmillBeltSpeed * length * BELT_PHOTO_TRAVEL_RATE;
  // Scroll UV distance proportional to photo travel; mult adds visible belt motion.
  const texDelta = (step / length) * lengthRepeats * BELT_TEXTURE_SCROLL_MULT;

  if (travel.mode === 'forward') {
    mount.position.z -= step;
    if (mount.position.z <= travel.pickZ) {
      mount.position.z = travel.pickZ;
      travel.mode = 'idle';
      window.dispatchEvent(new CustomEvent('hero-belt-feed', {
        detail: { direction: 'forward', phase: 'complete' },
      }));
      return { feeding: false, texDelta: -texDelta };
    }
    return { feeding: true, texDelta: -texDelta };
  }

  if (travel.mode === 'reverse') {
    mount.position.z += step;
    if (mount.position.z >= travel.exitZ) {
      mount.position.z = travel.startZ;
      travel.mode = 'idle';
      if (beltPhoto) beltPhoto.visible = false;
      window.dispatchEvent(new CustomEvent('hero-belt-feed', {
        detail: { direction: 'reverse', phase: 'complete' },
      }));
      return { feeding: false, texDelta: texDelta };
    }
    return { feeding: true, texDelta: texDelta };
  }

  return { feeding: false, texDelta: 0 };
}

function attachBeltToRobot(robotMountRig, treadmillRig, layout = beltLayoutStore) {
  if (!robotMountRig || !treadmillRig) return;
  const L = normalizeBeltLayout(layout);
  treadmillRig.position.set(L.beltOffsetX, L.beltOffsetY, L.beltOffsetZ);
  treadmillRig.rotation.y = THREE.MathUtils.degToRad(L.beltYawDeg);
  treadmillRig.updateMatrixWorld(true);
}

function updatePhotoStage(stage, beltPhoto, effectorPhoto) {
  const carried = Boolean(effectorPhoto?.userData?.carriedFromBelt);

  if (stage === 'pick') {
    if (beltPhoto) beltPhoto.visible = true;
    if (effectorPhoto) effectorPhoto.visible = false;
    return;
  }
  if (stage === 'place') {
    if (beltPhoto) beltPhoto.visible = !carried;
    if (effectorPhoto) effectorPhoto.visible = carried;
    return;
  }
  if (EFFECTOR_PHOTO_STAGES.has(stage)) {
    if (beltPhoto) beltPhoto.visible = !carried;
    if (effectorPhoto) effectorPhoto.visible = carried;
    return;
  }
  if (beltPhoto) beltPhoto.visible = BELT_PHOTO_STAGES.has(stage);
  if (effectorPhoto) effectorPhoto.visible = false;
}

function placeModelOnFloor(model) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const minY = box.min.y;
  model.position.x -= center.x;
  model.position.z -= center.z;
  model.position.y -= minY;
  model.position.y += 0.02;
  model.updateMatrixWorld(true);
}

function heroLayoutMode(width, height) {
  return width >= height ? 'landscape' : 'portrait';
}

function heroViewportTier(width) {
  if (width < HERO_BREAKPOINTS.tablet) return 'mobile';
  if (width < HERO_BREAKPOINTS.desktop) return 'tablet';
  if (width < HERO_BREAKPOINTS.widescreen) return 'desktop';
  return 'widescreen';
}

function getLayoutProfileOverrides(tier, layout, overrideStore) {
  const primaryKey = profileStorageKey(tier, layout);
  if (overrideStore[primaryKey]) return overrideStore[primaryKey];
  const wideLandscapeKey = profileStorageKey('widescreen', 'landscape');
  if (primaryKey !== wideLandscapeKey && overrideStore[wideLandscapeKey]) {
    return overrideStore[wideLandscapeKey];
  }
  for (const fbTier of LAYOUT_OVERRIDE_FALLBACK_TIERS[tier] || []) {
    const fbKey = profileStorageKey(fbTier, layout);
    if (overrideStore[fbKey]) return overrideStore[fbKey];
  }
  return {};
}

/** World origin — fixed ground center, projected to viewport center. */
const WORLD_FRAMING_ORIGIN = new THREE.Vector3(0, 0, 0);

function layoutFrameContextKey(vp) {
  const enriched = enrichViewport(vp);
  const p = enriched.profile;
  /** Rig offsets omitted — camera is anchored to world origin; rigs move on screen. */
  const cameraKey = [
    p.robotSizeFactor,
    p.frameBias,
    p.cameraHeightRatio,
    p.cameraDepthRatio,
    p.cameraFraming,
    p.cameraPullback,
    p.screenShiftPx,
    p.fov,
    p.padding,
    p.sceneYawDeg,
    p.scenePushZ,
  ].map((n) => Number(n).toFixed(3)).join(',');
  return `${profileStorageKey(enriched.tier, enriched.layout)}:${cameraKey}`;
}

function invalidateCameraFrameLockIfNeeded(vp) {
  const key = layoutFrameContextKey(vp);
  if (cameraFrameLockContext !== key) {
    cameraFrameLock = null;
    cameraFrameLockContext = null;
  }
}

function heroLayoutProfile(tier, layout, overrideStore = {}) {
  const base = HERO_LAYOUT_PROFILES[tier]?.[layout]
    ?? HERO_LAYOUT_PROFILES.desktop.landscape;
  const overrides = getLayoutProfileOverrides(tier, layout, overrideStore);
  return normalizeProfile({ ...base, ...overrides });
}

function enrichViewport(vp, overrideStore = layoutOverrideStore) {
  const layout = vp.layout ?? heroLayoutMode(vp.width, vp.height);
  const tier = heroViewportTier(vp.width);
  const profile = heroLayoutProfile(tier, layout, overrideStore);
  return { ...vp, layout, tier, profile };
}

function computeRobotScale(profile, scaleMultiplier = 1) {
  return profile.robotSizeFactor * scaleMultiplier;
}

function applyCellLayout(cellRig, robotMountRig, viewport) {
  const vp = enrichViewport(viewport);
  const scale = computeRobotScale(vp.profile, vp.scaleMultiplier ?? 1);
  cellRig.scale.setScalar(scale);
  cellRig.position.set(0, 0, 0);
  cellRig.updateMatrixWorld(true);
  robotMountRig.position.set(
    vp.profile.robotOffsetX,
    vp.profile.robotOffsetY,
    vp.profile.robotOffsetZ,
  );
  robotMountRig.updateMatrixWorld(true);
  return scale;
}

function frameRobot(model, camera, viewport = {}, visualScale = 1, options = {}) {
  const { storeLock = false, useLock = true } = options;
  const vp = enrichViewport(viewport);
  const { width, height, profile } = vp;

  const box = new THREE.Box3().setFromObject(model);
  let size = box.getSize(new THREE.Vector3());

  let lookPoint;
  if (useLock && cameraFrameLock && !storeLock) {
    lookPoint = cameraFrameLock.lookPoint;
    size = cameraFrameLock.size;
  } else {
    const center = box.getCenter(new THREE.Vector3());
    const bias = THREE.MathUtils.clamp(profile.frameBias ?? 0, 0, 1);
    lookPoint = center.clone().lerp(WORLD_FRAMING_ORIGIN, bias);
    if (storeLock || !cameraFrameLock) {
      cameraFrameLock = { lookPoint: lookPoint.clone(), size: size.clone() };
      cameraFrameLockContext = layoutFrameContextKey(viewport);
    }
  }

  const aspect = Math.max(width / Math.max(height, 1), 0.2);
  const fov = profile.fov;
  const padding = profile.padding;
  const scaleNorm = Math.max(visualScale, 0.05);

  camera.fov = fov;
  camera.aspect = aspect;
  camera.updateProjectionMatrix();

  const fovRad = fov * (Math.PI / 180);
  const hFovRad = 2 * Math.atan(Math.tan(fovRad / 2) * aspect);

  const distForHeight = (size.y * 0.5 * padding) / Math.tan(fovRad / 2) / scaleNorm;
  const distForWidth = (size.x * 0.5 * padding) / Math.tan(hFovRad / 2) / scaleNorm;
  let dist = Math.max(distForHeight, distForWidth, (size.z * 0.45) / scaleNorm, 2);
  dist *= profile.cameraFraming * profile.cameraPullback * heroCameraFramingMult;

  let lookY = lookPoint.y;
  let lookX = lookPoint.x;
  const lookZ = lookPoint.z;
  let camX = lookX;
  let camY = lookPoint.y + dist * profile.cameraHeightRatio;
  let camZ = lookZ + dist * profile.cameraDepthRatio;

  camera.position.set(camX, camY, camZ);
  camera.up.set(0, 1, 0);
  camera.lookAt(lookX, lookY, lookZ);
  camera.updateMatrixWorld();

  if (profile.screenShiftPx) {
    const worldShiftX = (-profile.screenShiftPx / width)
      * (2 * dist * Math.tan(hFovRad / 2));
    lookX += worldShiftX;
    camX += worldShiftX;
    camera.position.set(camX, camY, camZ);
    camera.lookAt(lookX, lookY, lookZ);
  }

  const push = profile.scenePushZ ?? 0;
  if (push !== 0) {
    const vx = camX - lookX;
    const vy = camY - lookY;
    const vz = camZ - lookZ;
    const vlen = Math.hypot(vx, vy, vz) || 1;
    camX += (vx / vlen) * push;
    camY += (vy / vlen) * push;
    camZ += (vz / vlen) * push;
    camera.position.set(camX, camY, camZ);
  }
}

function applySceneRigLayout(sceneRig, profile) {
  sceneRig.rotation.y = THREE.MathUtils.degToRad(profile.sceneYawDeg);
  sceneRig.position.set(0, 0, 0);
}

function placeRobot(model) {
  placeModelOnFloor(model);
  model.userData._floorX = model.position.x;
  model.userData._floorY = model.position.y;
  model.userData._floorZ = model.position.z;
}

function applyRobotModelFloor(robot) {
  if (robot.userData._floorX === undefined) return;
  robot.position.x = robot.userData._floorX;
  robot.position.y = robot.userData._floorY ?? 0.02;
  robot.position.z = robot.userData._floorZ ?? 0;
  robot.updateMatrixWorld(true);
}

/** Multi-cup vacuum EOAT — shared manifold + array of large suction pumps (not one central vacuum). */
/** Built along local +Z; flip 180° X when parenting to tool0 so cups face the workpiece. */
const EOAT_GRIPPER_ATTACH_ROT = { x: Math.PI, y: 0, z: 0 };
/** Push EOAT along tool0 +Z so cups clear link_6 (meters, tool0 frame). */
const EOAT_GRIPPER_ATTACH_OFFSET = { x: 0, y: 0, z: 0.05 };

/** Open face of suction cups along gripper +Z (matches addLargeSuctionPump geometry). */
const EOAT_VACUUM_CUP_TIP_Z = 0.09;

function createEndEffectorGripper(envMap, { digital = false } = {}) {
  const group = new THREE.Group();
  group.name = 'eoat-gripper';
  group.scale.setScalar(1 / MODEL_SCALE);

  const manifoldMat = new THREE.MeshPhysicalMaterial({
    color: digital ? 0x94a3b8 : 0x475569,
    metalness: digital ? 0.62 : 0.92,
    roughness: digital ? 0.38 : 0.28,
    envMap,
    envMapIntensity: digital ? 0.85 : 1.1,
    transparent: digital,
    opacity: digital ? 0.88 : 1,
  });

  const pumpMat = new THREE.MeshPhysicalMaterial({
    color: digital ? 0x7c8ea3 : 0x334155,
    metalness: digital ? 0.55 : 0.88,
    roughness: digital ? 0.42 : 0.32,
    envMap,
    envMapIntensity: digital ? 0.8 : 1.05,
    transparent: digital,
    opacity: digital ? 0.9 : 1,
  });

  const padMat = new THREE.MeshPhysicalMaterial({
    color: digital ? 0x64748b : 0x1e293b,
    metalness: 0.94,
    roughness: 0.22,
    envMap,
    envMapIntensity: digital ? 0.9 : 1.15,
  });

  const cupMat = new THREE.MeshPhysicalMaterial({
    color: digital ? 0x3b4f63 : 0x0f172a,
    metalness: 0.32,
    roughness: 0.64,
    envMap,
    envMapIntensity: 0.5,
    transparent: digital,
    opacity: digital ? 0.85 : 1,
  });

  function addLargeSuctionPump(cx, cy) {
    const pump = new THREE.Group();

    const housing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.028, 0.031, 0.054, 24),
      pumpMat,
    );
    housing.rotation.x = Math.PI / 2;
    housing.position.set(cx, cy, 0.027);

    const bellows = new THREE.Mesh(
      new THREE.CylinderGeometry(0.033, 0.03, 0.02, 24),
      padMat,
    );
    bellows.rotation.x = Math.PI / 2;
    bellows.position.set(cx, cy, 0.058);

    const lip = new THREE.Mesh(
      new THREE.TorusGeometry(0.034, 0.004, 10, 28),
      padMat,
    );
    lip.position.set(cx, cy, 0.066);

    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.026, 0.022, 0.011, 22),
      cupMat,
    );
    cup.rotation.x = Math.PI / 2;
    cup.position.set(cx, cy, 0.071);

    const feed = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.03, 12),
      manifoldMat,
    );
    feed.position.set(cx, cy, 0.082);

    if (digital) {
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(cup.geometry),
        new THREE.LineBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.75 }),
      );
      edges.rotation.x = Math.PI / 2;
      edges.position.set(cx, cy, 0.071);
      pump.add(edges);
    }

    pump.add(housing, bellows, lip, cup, feed);
    return pump;
  }

  const span = 0.054;
  const pumpCenters = [
    [-span, -span], [span, -span],
    [-span, span], [span, span],
  ];

  const manifold = new THREE.Mesh(
    new THREE.BoxGeometry(0.152, 0.152, 0.026),
    manifoldMat,
  );
  manifold.position.z = 0.092;

  const trunkA = new THREE.Mesh(
    new THREE.CylinderGeometry(0.01, 0.01, 0.048, 12),
    manifoldMat,
  );
  trunkA.rotation.z = Math.PI / 2;
  trunkA.position.set(-0.068, 0, 0.104);

  const trunkB = trunkA.clone();
  trunkB.position.set(0.068, 0, 0.104);

  pumpCenters.forEach(([x, y]) => {
    group.add(addLargeSuctionPump(x, y));
  });

  group.add(manifold, trunkA, trunkB);

  const vacuumTip = new THREE.Object3D();
  vacuumTip.name = 'eoat-vacuum-tip';
  vacuumTip.position.set(0, 0, EOAT_VACUUM_CUP_TIP_Z);
  group.add(vacuumTip);

  return group;
}

function attachEffectorGripper(robot, envMap, { digital = false } = {}) {
  const tool0 = findNodeByName(robot, 'tool0');
  if (!tool0) return null;
  const gripper = createEndEffectorGripper(envMap, { digital });
  gripper.rotation.set(
    EOAT_GRIPPER_ATTACH_ROT.x,
    EOAT_GRIPPER_ATTACH_ROT.y,
    EOAT_GRIPPER_ATTACH_ROT.z,
  );
  gripper.position.set(
    EOAT_GRIPPER_ATTACH_OFFSET.x,
    EOAT_GRIPPER_ATTACH_OFFSET.y,
    EOAT_GRIPPER_ATTACH_OFFSET.z,
  );
  tool0.add(gripper);
  ensureGripperVisible(gripper);
  return gripper;
}

function isEffectorPhotoNode(object) {
  let node = object;
  while (node) {
    if (node.name === 'photo-payload') return true;
    node = node.parent;
  }
  return false;
}

/** Reset gripper meshes to fully opaque (teach + after legacy opacity fades). */
function ensureGripperVisible(gripper) {
  if (!gripper) return;
  gripper.visible = true;
  gripper.traverse((child) => {
    if (isEffectorPhotoNode(child)) return;
    if (!child.isMesh || !child.material) return;
    const mats = Array.isArray(child.material) ? child.material : [child.material];
    for (const mat of mats) {
      mat.transparent = false;
      mat.opacity = 1;
      mat.depthWrite = true;
      mat.needsUpdate = true;
      delete mat.userData._gripperBaseOpacity;
    }
  });
}

function attachAxisTriad(target, size, position = null) {
  if (!target) return null;
  const triad = new THREE.AxesHelper(size);
  triad.material.depthTest = false;
  triad.renderOrder = 20;
  if (position) triad.position.copy(position);
  target.add(triad);
  return triad;
}

const _hudWorldPos = new THREE.Vector3();

function formatHudVec3(obj) {
  if (!obj) return '—';
  obj.updateWorldMatrix(true, false);
  obj.getWorldPosition(_hudWorldPos);
  return `${_hudWorldPos.x.toFixed(2)}, ${_hudWorldPos.y.toFixed(2)}, ${_hudWorldPos.z.toFixed(2)}`;
}

function formatTreadmillHud(rig) {
  if (!rig) return '—';
  rig.updateWorldMatrix(true, false);
  rig.getWorldPosition(_hudWorldPos);
  const yaw = THREE.MathUtils.radToDeg(rig.rotation.y).toFixed(1);
  return `${_hudWorldPos.x.toFixed(2)}, ${_hudWorldPos.y.toFixed(2)}, ${_hudWorldPos.z.toFixed(2)} · yaw ${yaw}°`;
}

function formatPhotoHud(treadmillRig, beltPhoto, effectorPhoto) {
  const active = effectorPhoto?.visible ? effectorPhoto : beltPhoto;
  if (!active?.visible) return 'hidden';
  const world = formatHudVec3(active);
  const mount = treadmillRig?.userData?.photoMount;
  if (active === beltPhoto && mount) {
    return `${world} · mount z ${mount.position.z.toFixed(2)}`;
  }
  return world;
}

function createScenePositionHud(container) {
  const hud = document.createElement('div');
  hud.id = 'hero-scene-pos-hud';
  hud.setAttribute('aria-hidden', 'true');
  hud.innerHTML = `
    <div class="hero-scene-pos-hud__row"><span>Treadmill</span><code data-hud="treadmill"></code></div>
    <div class="hero-scene-pos-hud__row"><span>Photo</span><code data-hud="photo"></code></div>
  `;
  container.appendChild(hud);
  const treadmillEl = hud.querySelector('[data-hud="treadmill"]');
  const photoEl = hud.querySelector('[data-hud="photo"]');
  return {
    update(treadmillRig, beltPhoto, effectorPhoto) {
      treadmillEl.textContent = formatTreadmillHud(treadmillRig);
      photoEl.textContent = formatPhotoHud(treadmillRig, beltPhoto, effectorPhoto);
    },
  };
}

function initHeroRobot3D() {
  const wrap = document.getElementById(WRAP_ID);
  const stage = document.getElementById(STAGE_ID);
  if (!wrap || !stage) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    /* Still load Collada — scripts.js skips the motion cycle. */
  }

  let renderer;
  let kinematics;
  let cellRig = null;
  let robotMountRig = null;
  let robotModel = null;
  let treadmillRig = null;
  let beltPhoto = null;
  let effectorPhoto = null;
  let effectorNode = null;
  let activeTween = null;
  let rafId = 0;
  let visible = true;
  const tweenParams = {};
  const effectorWorld = new THREE.Vector3();
  const effectorProjected = new THREE.Vector3();
  const overrideFilePromise = loadTeachOverridesFile();

  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    reportHero3dFailure('WebGL unavailable');
    showCssFallback(stage);
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.setClearColor(0x000000, 0);
  wrap.appendChild(renderer.domElement);

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(GROUND_FOG_COLOR, GROUND_FOG_NEAR, GROUND_FOG_FAR);
  const envRT = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRT.texture;

  const sceneRig = new THREE.Group();
  scene.add(sceneRig);

  const groundRig = new THREE.Group();
  groundRig.name = 'ground-rig';
  sceneRig.add(groundRig);

  let textures = createProceduralTextures(renderer);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 500);

  scene.add(new THREE.AmbientLight(0xc5daf2, 0.55));
  scene.add(new THREE.HemisphereLight(0xf0f7ff, 0xdce8f7, 1.55));
  const key = new THREE.DirectionalLight(0xdbeafe, 1.45);
  key.position.set(5, 8, 4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xbfdbfe, 0.75);
  fill.position.set(-4, 3, 3);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0x93c5fd, 0.5);
  rim.position.set(-2, 4, -5);
  scene.add(rim);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    new THREE.MeshStandardMaterial({
      color: GROUND_FOG_COLOR,
      metalness: 0.15,
      roughness: 0.88,
      envMap: scene.environment,
      envMapIntensity: 0.28,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  groundRig.add(floor);

  const grid = new THREE.GridHelper(120, 120, 0xa8c8f0, 0xc5daf2);
  grid.material.transparent = true;
  grid.material.opacity = 0.42;
  grid.frustumCulled = false;
  grid.position.y = 0.015;
  groundRig.add(grid);

  let axisTriad = null;
  let photoPulseTween = null;
  let scenePositionHud = null;
  let teachLivePosEl = null;

  function reframeCamera(vp, { storeLock = false, useLock = true } = {}) {
    if (!cellRig || !robotMountRig || !robotModel) return;
    const enriched = enrichViewport(vp);
    const visualScale = applyCellLayout(cellRig, robotMountRig, enriched);
    applyRobotModelFloor(robotModel);
    frameRobot(robotModel, camera, enriched, visualScale, { storeLock, useLock });
  }

  function stopPhotoPulseTween() {
    if (photoPulseTween) {
      photoPulseTween.stop();
      photoPulseTween = null;
    }
  }

  function setEffectorPhotoPulseMult(mult) {
    if (!effectorPhoto) return;
    const base = effectorPhoto.userData.baseScale ?? 1;
    effectorPhoto.userData.pulseMult = mult;
    effectorPhoto.scale.setScalar(base * mult);
  }

  function tweenEffectorPhotoPulseMult(targetMult, duration, label) {
    return new Promise((resolve) => {
      if (!effectorPhoto?.visible) {
        resolve();
        return;
      }
      stopPhotoPulseTween();
      const state = { mult: effectorPhoto.userData.pulseMult ?? 1 };
      setEffectorPhotoRenderOrder(effectorPhoto, EFFECTOR_PHOTO_RENDER_ORDER + 4);
      photoPulseTween = new TWEEN.Tween(state)
        .to({ mult: targetMult }, duration)
        .easing(TWEEN.Easing.Cubic.InOut)
        .onUpdate(() => setEffectorPhotoPulseMult(state.mult))
        .onComplete(() => {
          photoPulseTween = null;
          setEffectorPhotoPulseMult(targetMult);
          window.dispatchEvent(new CustomEvent('hero-photo-pulse', {
            detail: { phase: 'complete', target: label },
          }));
          resolve();
        })
        .start();
    });
  }

  async function runEffectorPhotoShowcasePulse() {
    if (!effectorPhoto?.visible) {
      window.dispatchEvent(new CustomEvent('hero-photo-pulse', {
        detail: { phase: 'complete', target: 'pulse' },
      }));
      return;
    }
    const duration = armDurationMs();
    await tweenEffectorPhotoPulseMult(SHOW_PHOTO_PULSE_SCALE, duration, 'expand');
    await tweenEffectorPhotoPulseMult(1, duration, 'contract');
    if (effectorPhoto) setEffectorPhotoRenderOrder(effectorPhoto);
    window.dispatchEvent(new CustomEvent('hero-photo-pulse', {
      detail: { phase: 'complete', target: 'pulse' },
    }));
  }

  const heroSection = stage.closest('.hero-3d-section') || stage.closest('.hero-showcase') || stage.closest('.hero--immersive');
  const HERO_TIER_CLASSES = ['mobile', 'tablet', 'desktop', 'widescreen'];

  function readViewport() {
    const rect = wrap.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const layout = heroLayoutMode(width, height);
    return enrichViewport({ width, height, layout, scaleMultiplier: 1 });
  }

  function syncHeroLayoutClass(vp) {
    if (!heroSection) return;
    heroSection.classList.toggle('hero--wide', vp.layout === 'landscape');
    heroSection.classList.toggle('hero--tall', vp.layout === 'portrait');
    for (const tier of HERO_TIER_CLASSES) {
      heroSection.classList.toggle(`hero--${tier}`, vp.tier === tier);
    }
    heroSection.dataset.heroTier = vp.tier;
    heroSection.dataset.heroLayout = vp.layout;
  }

  function updateScenePositionReadouts() {
    if (scenePositionHud) {
      scenePositionHud.update(treadmillRig, beltPhoto, effectorPhoto);
    }
    if (teachLivePosEl) {
      teachLivePosEl.innerHTML = `Treadmill: ${formatTreadmillHud(treadmillRig)}<br>Photo: ${formatPhotoHud(treadmillRig, beltPhoto, effectorPhoto)}`;
    }
  }

  function layoutScene(vp) {
    vp = enrichViewport(vp);
    invalidateCameraFrameLockIfNeeded(vp);
    syncHeroLayoutClass(vp);
    applySceneRigLayout(sceneRig, vp.profile);
    if (cellRig && robotMountRig && robotModel) {
      reframeCamera(vp, { storeLock: !cameraFrameLock, useLock: Boolean(cameraFrameLock) });
    } else if (cellRig && robotMountRig) {
      applyCellLayout(cellRig, robotMountRig, vp);
    }
  }

  function resize() {
    const vp = readViewport();
    if (vp.width < 1 || vp.height < 1) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(vp.width, vp.height, true);
    layoutScene(vp);
  }

  resize();
  new ResizeObserver(resize).observe(wrap);
  if (heroSection) new ResizeObserver(resize).observe(heroSection);
  new IntersectionObserver(
    (entries) => {
      visible = entries[0]?.isIntersecting ?? true;
      if (visible) animate();
    },
    { threshold: 0.1 },
  ).observe(stage);

  function initKinematicsParams() {
    for (const prop in kinematics.joints) {
      if (!kinematics.joints[prop].static) {
        tweenParams[prop] = kinematics.joints[prop].zeroPosition;
      }
    }
  }

  function applyPoseImmediate(pose) {
    if (!kinematics) return;
    const joints = poseJointsOnly(pose);
    for (const prop in kinematics.joints) {
      if (!kinematics.joints[prop].static && joints[prop] !== undefined) {
        tweenParams[prop] = joints[prop];
        kinematics.setJointValue(prop, joints[prop]);
      }
    }
  }

  function applySceneFrame(frame, stageName, { deferAnimatedHandoff = false } = {}) {
    if (!treadmillRig || !frame) return;
    const f = { ...defaultSceneFrame(), ...frame };
    const bounds = beltTravelBounds();

    const mount = treadmillRig.userData.photoMount;
    if (mount) {
      const travel = treadmillRig.userData.beltTravel;
      const mountY = clampPhotoMountY(f.photoMountY);
      if (travel) {
        if (stageName === 'belt') {
          travel.startZ = f.photoMountZ ?? bounds.startZ;
        } else if (stageName === 'pick' || stageName === 'belt-stop') {
          travel.pickZ = f.photoMountZ ?? bounds.pickZ;
        }
        if (travel.mode === 'idle') {
          let mountZ = f.photoMountZ ?? bounds.startZ;
          if (stageName === 'belt' || stageName === 'belt-ready') {
            mountZ = travel.startZ ?? bounds.startZ;
          } else if (stageName === 'pick' || stageName === 'belt-stop') {
            mountZ = travel.pickZ ?? bounds.pickZ;
          }
          mount.position.set(f.photoMountX, mountY, mountZ);
        } else {
          mount.position.x = f.photoMountX;
          mount.position.y = mountY;
        }
      } else {
        mount.position.set(f.photoMountX, mountY, f.photoMountZ);
      }
    }

    if (beltPhoto && (!stageName || BELT_PHOTO_STAGES.has(stageName) || stageName === 'pick' || stageName === 'place')) {
      beltPhoto.rotation.set(
        THREE.MathUtils.degToRad(f.beltPhotoRotX),
        THREE.MathUtils.degToRad(f.beltPhotoRotY),
        THREE.MathUtils.degToRad(f.beltPhotoRotZ),
      );
    }

    if (beltPhoto && stageName && BELT_PHOTO_CARRY_STAGES.has(stageName)) {
      ensureBeltPhotoOnSurface(treadmillRig, beltPhoto);
    }

    if (stageName) {
      const skipCarrySync = deferAnimatedHandoff && (stageName === 'pick' || stageName === 'place');
      if (!skipCarrySync) {
        syncPhotoCarryForStage(stageName, beltPhoto, effectorPhoto, treadmillRig);
      }
    }

    const applyEffectorFrame = shouldApplyEffectorSceneFrame(effectorPhoto, stageName);
    if (applyEffectorFrame) {
      effectorPhoto.position.set(f.effectorPhotoX, f.effectorPhotoY, f.effectorPhotoZ);
      effectorPhoto.rotation.set(
        THREE.MathUtils.degToRad(f.effectorPhotoRotX),
        THREE.MathUtils.degToRad(f.effectorPhotoRotY),
        THREE.MathUtils.degToRad(f.effectorPhotoRotZ),
      );
    }

    if (stageName) updatePhotoStage(stageName, beltPhoto, effectorPhoto);

    if (robotModel) {
      ensureGripperVisible(findNodeByName(robotModel, 'eoat-gripper'));
    }
  }

  function readSceneFrameFromRig() {
    const mount = treadmillRig?.userData?.photoMount;
    return {
      photoMountX: mount?.position.x ?? 0,
      photoMountY: mount?.position.y ?? 0,
      photoMountZ: mount?.position.z ?? 0,
      beltPhotoRotX: THREE.MathUtils.radToDeg(beltPhoto?.rotation.x ?? Math.PI / 2),
      beltPhotoRotY: THREE.MathUtils.radToDeg(beltPhoto?.rotation.y ?? 0),
      beltPhotoRotZ: THREE.MathUtils.radToDeg(beltPhoto?.rotation.z ?? 0),
      effectorPhotoX: effectorPhoto?.position.x ?? 0,
      effectorPhotoY: effectorPhoto?.position.y ?? 0,
      effectorPhotoZ: effectorPhoto?.position.z ?? EFFECTOR_PHOTO_ATTACH_POS.z,
      effectorPhotoRotX: THREE.MathUtils.radToDeg(effectorPhoto?.rotation.x ?? EFFECTOR_PHOTO_ATTACH_ROT.x),
      effectorPhotoRotY: THREE.MathUtils.radToDeg(effectorPhoto?.rotation.y ?? 0),
      effectorPhotoRotZ: THREE.MathUtils.radToDeg(effectorPhoto?.rotation.z ?? 0),
    };
  }

  function applyPose(pose, duration, onComplete) {
    if (!kinematics) return;
    const joints = poseJointsOnly(pose);
    const target = {};
    for (const prop in kinematics.joints) {
      if (!kinematics.joints[prop].static && joints[prop] !== undefined) {
        target[prop] = joints[prop];
      }
    }
    if (activeTween) activeTween.stop();
    activeTween = new TWEEN.Tween(tweenParams)
      .to(target, duration)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate((object) => {
        for (const prop in kinematics.joints) {
          if (!kinematics.joints[prop].static && object[prop] !== undefined) {
            kinematics.setJointValue(prop, object[prop]);
          }
        }
      })
      .onComplete(() => {
        activeTween = null;
        onComplete?.();
      })
      .start();
  }

  window.addEventListener('hero-arm-stage', (event) => {
    const stageName = event.detail?.stage || 'belt';

    if (stageName !== 'show') {
      stopPhotoPulseTween();
      resetEffectorPhotoPulse(effectorPhoto);
    }

    const pose = poseStore[stageName] || poseStore.belt;
    const duration = armDurationMs();
    applySceneFrame(sceneFrameFromPose(pose, stageName), stageName, { deferAnimatedHandoff: true });
    updatePhotoStage(stageName, beltPhoto, effectorPhoto);

    if (stageName === 'pick') {
      applyPose(pose, duration, () => {
        void handoffBeltToEffector(beltPhoto, effectorPhoto, treadmillRig).then(() => {
          const liftPose = poseStore.lift || poseStore.belt;
          applySceneFrame(sceneFrameFromPose(liftPose, 'lift'), 'lift');
        });
      });
    } else if (stageName === 'place') {
      applyPose(pose, duration, () => {
        handoffEffectorToBelt(beltPhoto, effectorPhoto);
        ensureBeltPhotoOnSurface(treadmillRig, beltPhoto);
        updatePhotoStage(stageName, beltPhoto, effectorPhoto);
      });
    } else {
      applyPose(pose, duration);
    }

    // Camera stays locked unless this stage has explicit camera fields in JSON.
    if (poseHasCameraOverride(pose)) {
      const vp = viewportForStage(readViewport(), pose);
      applySceneRigLayout(sceneRig, vp.profile);
      reframeCamera(vp, { storeLock: true, useLock: true });
    }
  });

  window.addEventListener('hero-belt-command', async (event) => {
    if (!treadmillRig) return;
    const travel = treadmillRig.userData.beltTravel;
    if (!travel || travel.mode !== 'idle') return;

    const direction = event.detail?.direction;
    if (direction !== 'forward' && direction !== 'reverse') return;

    const mount = treadmillRig.userData.photoMount;
    if (!mount) return;

    if (direction === 'forward') {
      mount.position.z = travel.startZ;
      if (beltPhoto) {
        beltPhoto.visible = true;
        await assignCyclePhoto(beltPhoto, effectorPhoto);
      }
    } else {
      mount.position.z = travel.pickZ;
      if (beltPhoto) beltPhoto.visible = true;
    }

    travel.mode = direction;
  });

  window.addEventListener('hero-photo-pulse', (event) => {
    if (event.detail?.action === 'start') runEffectorPhotoShowcasePulse();
  });

  const colladaLoader = new ColladaLoader();
  colladaLoader.setResourcePath(MODEL_RESOURCE_PATH);

  const colladaPromise = new Promise((resolve, reject) => {
    colladaLoader.load(MODEL_URL, resolve, undefined, reject);
  });

  function bootstrapRobotScene(collada) {
    robotModel = collada.scene;
    robotModel.scale.setScalar(MODEL_SCALE);

    prepareRobotMeshes(robotModel);
    enhancePhysicalMaterials(robotModel, scene.environment, textures);

    cellRig = new THREE.Group();
    cellRig.name = 'cell-rig';
    groundRig.add(cellRig);

    robotMountRig = new THREE.Group();
    robotMountRig.name = 'robot-mount';
    cellRig.add(robotMountRig);
    robotMountRig.add(robotModel);

    treadmillRig = createTreadmill(scene.environment);
    robotMountRig.add(treadmillRig);

    function applyBeltLayout(layout) {
      Object.assign(beltLayoutStore, normalizeBeltLayout(layout));
      attachBeltToRobot(robotMountRig, treadmillRig, beltLayoutStore);
    }

    function readBeltLayoutFromRig() {
      return {
        beltOffsetX: treadmillRig.position.x,
        beltOffsetY: treadmillRig.position.y,
        beltOffsetZ: treadmillRig.position.z,
        beltYawDeg: THREE.MathUtils.radToDeg(treadmillRig.rotation.y),
      };
    }

    attachBeltToRobot(robotMountRig, treadmillRig, beltLayoutStore);
    if (POSE_TEACH_MODE) {
      attachAxisTriad(treadmillRig, 0.35);
    }

    beltPhoto = createBeltPhoto(treadmillRig.userData.photoMount, HERO_PHOTO_URL);
    beltPhoto.visible = true;
    initPhotoCycle();
    if (POSE_TEACH_MODE) {
      attachAxisTriad(treadmillRig.userData.photoMount, 0.12);
    }

    kinematics = collada.kinematics;
    initKinematicsParams();
    poseStore = isPoseTeachMode() ? createPoseTeachPanel({
      kinematics,
      tweenParams,
      applyPoseImmediate,
      applyPose,
      getActiveTween: () => activeTween,
      setActiveTween: (t) => { activeTween = t; },
      readViewport,
      layoutScene,
      applySceneFrame,
      readSceneFrame: readSceneFrameFromRig,
      getBeltSpeed: () => treadmillBeltSpeed,
      setBeltSpeed: (v) => { treadmillBeltSpeed = v; },
      applyBeltLayout,
      readBeltLayoutFromRig,
      initialPoseStore: poseStore,
      initialLayoutStore: layoutOverrideStore,
      initialBeltSpeed: treadmillBeltSpeed,
      initialBeltLayout: beltLayoutStore,
    }) : poseStore;
    applyPoseImmediate(poseStore.belt);
    applySceneFrame(sceneFrameFromPose(poseStore.belt, 'belt'), 'belt');
    const vp = readViewport();
    placeRobot(robotModel);
    if (POSE_TEACH_MODE) {
      axisTriad = attachAxisTriad(robotModel, 0.7, new THREE.Vector3(0, -0.02, 0));
    }
    attachEffectorGripper(robotModel, scene.environment);
    effectorPhoto = attachEffectorPhoto(robotModel, HERO_PHOTO_URL);
    if (POSE_TEACH_MODE) {
      ensureGripperVisible(findNodeByName(robotModel, 'eoat-gripper'));
      const gripper = findNodeByName(robotModel, 'eoat-gripper');
      if (gripper) attachAxisTriad(gripper, 0.12);
    }
    applySceneFrame(sceneFrameFromPose(poseStore.belt, 'belt'), 'belt');
    if (POSE_TEACH_MODE && effectorPhoto) {
      attachAxisTriad(effectorPhoto, 0.1);
    }
    updatePhotoStage('belt', beltPhoto, effectorPhoto);

    scenePositionHud = POSE_TEACH_MODE ? createScenePositionHud(wrap) : null;
    teachLivePosEl = document.getElementById('hero-teach-live-pos');
    if (window.__heroPoseTeach) {
      window.__heroPoseTeach.updateLivePositions = updateScenePositionReadouts;
    }

    const effector = findVacuumTipNode(robotModel);
    if (POSE_TEACH_MODE && effector) {
      attachAxisTriad(effector, 0.22 * 0.3);
    }
    effectorNode = effector;
    cameraFrameLock = null;
    layoutScene(vp);
    resize();
    renderer.render(scene, camera);
    markReady(stage);
    animate();
  }

  Promise.all([
    loadRobotTextures(renderer).catch(() => null),
    overrideFilePromise.catch(() => null),
    colladaPromise,
  ]).then(([loaded, fileData, collada]) => {
    if (loaded) textures = loaded;
    const stores = loadTeachStores(fileData);
    poseStore = stores.poses;
    layoutOverrideStore = stores.layouts;
    treadmillBeltSpeed = stores.beltSpeed;
    Object.assign(beltLayoutStore, stores.beltLayout);
    try {
      bootstrapRobotScene(collada);
    } catch (err) {
      reportHero3dFailure(err);
      showCssFallback(stage);
    }
  }).catch((err) => {
    reportHero3dFailure(err);
    try {
      pmremGenerator.dispose();
      envRT.dispose();
      renderer.dispose();
    } catch (_) { /* already torn down */ }
    showCssFallback(stage);
  });

  function updateEffectorProxy() {
    const proxy = document.getElementById(PROXY_ID);
    if (!proxy || !effectorNode) return;
    effectorNode.updateWorldMatrix(true, false);
    effectorNode.getWorldPosition(effectorWorld);
    effectorProjected.copy(effectorWorld).project(camera);
    const { width, height } = wrap.getBoundingClientRect();
    if (width < 1 || height < 1) return;
    proxy.style.left = `${(effectorProjected.x * 0.5 + 0.5) * width}px`;
    proxy.style.top = `${(-effectorProjected.y * 0.5 + 0.5) * height}px`;
  }

  let loopStarted = false;

  function sceneNeedsAnimation() {
    if (window.__heroCycleActive) return true;
    if (visible) return true;
    if (activeTween) return true;
    if (photoPulseTween) return true;
    const travel = treadmillRig?.userData?.beltTravel;
    return Boolean(travel && travel.mode !== 'idle');
  }

  function animate() {
    if (loopStarted) return;
    loopStarted = true;
    const tick = () => {
      rafId = requestAnimationFrame(tick);
      if (!sceneNeedsAnimation()) return;
      TWEEN.update();
      const feed = tickBeltFeed(treadmillRig, beltPhoto);
      if (feed.texDelta !== 0 && treadmillRig?.userData.beltTexture) {
        scrollBeltTextureOffset(treadmillRig.userData.beltTexture, feed.texDelta);
      }
      updateEffectorProxy();
      updateScenePositionReadouts();
      renderer.render(scene, camera);
    };
    tick();
  }
}

try {
initHeroRobot3D();
} catch (err) {
  console.error('hero-robot-3d init failed:', err);
}
