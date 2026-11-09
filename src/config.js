export const WORLD = Object.freeze({ width: 960, height: 540 });

export const PHYSICS = Object.freeze({
  fixedTimeStep: 1 / 120,
  gravity: 900,
  maxLaunchSpeed: 1100,
  maxSubstepDistance: 6,
});

export const ROUND = Object.freeze({ duration: 60 });

export const LAUNCHER = Object.freeze({ x: 120, y: 400, radius: 16 });

export const PROJECTILE = Object.freeze({ radius: 9 });

export const AIM = Object.freeze({
  maxPull: 180,
  minPull: 20,
  previewDuration: 0.5,
  previewPointSpacing: 4,
});

export const TARGET = Object.freeze({
  area: Object.freeze({ minX: 520, maxX: 900, minY: 90, maxY: 450 }),
  baseRadius: 30,
  minRadius: 18,
  radiusStep: 2,
  movingFromLevel: 2,
  amplitudeStep: 15,
  maxAmplitude: 90,
  baseFrequency: 1.2,
  frequencyStep: 0.1,
  maxFrequency: 2.5,
});

export const OBSTACLES = Object.freeze({
  maxCount: 4,
  levelsPerExtra: 2,
  minWidth: 26,
  maxWidth: 44,
  minHeight: 90,
  maxHeight: 220,
  minX: 260,
  maxX: 880,
  floatingMargin: 70,
  clearance: 24,
  placementAttempts: 40,
});

export const LEVEL_GENERATION = Object.freeze({
  maxAttempts: 30,
  angleSamples: 28,
  powerSamples: 14,
  minAngleDeg: -85,
  maxAngleDeg: 30,
  maxFlightTime: 3,
});

export const FEEDBACK = Object.freeze({ popupDuration: 0.7, popupRise: 40 });
