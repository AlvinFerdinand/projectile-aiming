import { LEVEL_GENERATION, OBSTACLES, PHYSICS, TARGET, WORLD } from './config.js';
import { expandRect, rectsOverlap } from './collision.js';
import { ShotOutcome, traceShot } from './shot.js';
import { Target } from './target.js';
import { lerp, randomRange, toRadians } from './utils/math.js';

/**
 * Builds a random level for the given number. Candidates are rejected until one
 * is proven solvable, so obstacles can never fully seal off the target.
 */
export function createLevel(number) {
  const difficulty = difficultyFor(number);

  for (let attempt = 0; attempt < LEVEL_GENERATION.maxAttempts; attempt++) {
    const level = buildLevel(number, difficulty);
    if (isSolvable(level)) return level;
  }

  return buildLevel(number, { ...difficulty, obstacleCount: 0 });
}

function difficultyFor(number) {
  const stage = number - 1;
  const movingStage = number - TARGET.movingFromLevel;
  const isMoving = movingStage >= 0;

  return {
    obstacleCount: Math.min(1 + Math.floor(stage / OBSTACLES.levelsPerExtra), OBSTACLES.maxCount),
    targetRadius: Math.max(TARGET.baseRadius - stage * TARGET.radiusStep, TARGET.minRadius),
    amplitude: isMoving
      ? Math.min((movingStage + 1) * TARGET.amplitudeStep, TARGET.maxAmplitude)
      : 0,
    frequency: isMoving
      ? Math.min(TARGET.baseFrequency + movingStage * TARGET.frequencyStep, TARGET.maxFrequency)
      : 0,
  };
}

function buildLevel(number, difficulty) {
  const target = createTarget(difficulty);
  const obstacles = placeObstacles(difficulty.obstacleCount, target.bounds);
  return { number, target, obstacles };
}

function createTarget({ targetRadius, amplitude, frequency }) {
  const { area } = TARGET;
  return new Target({
    x: randomRange(area.minX, area.maxX),
    y: randomRange(area.minY + amplitude, area.maxY - amplitude),
    radius: targetRadius,
    amplitude,
    frequency,
    phase: randomRange(0, Math.PI * 2),
  });
}

function placeObstacles(count, targetBounds) {
  const obstacles = [];

  for (let attempt = 0; attempt < OBSTACLES.placementAttempts && obstacles.length < count; attempt++) {
    const candidate = randomObstacle();
    const padded = expandRect(candidate, OBSTACLES.clearance);
    const collides = [targetBounds, ...obstacles].some((rect) => rectsOverlap(padded, rect));
    if (!collides) obstacles.push(candidate);
  }

  return obstacles;
}

function randomObstacle() {
  const width = randomRange(OBSTACLES.minWidth, OBSTACLES.maxWidth);
  const height = randomRange(OBSTACLES.minHeight, OBSTACLES.maxHeight);
  const x = randomRange(OBSTACLES.minX, OBSTACLES.maxX - width);
  const isGrounded = Math.random() < 0.5;
  const y = isGrounded
    ? WORLD.height - height
    : randomRange(OBSTACLES.floatingMargin, WORLD.height - height - OBSTACLES.floatingMargin);

  return { x, y, width, height };
}

/** Brute-force search over a grid of launch angles and powers for any shot that lands. */
function isSolvable({ target, obstacles }) {
  const goal = { x: target.baseX, y: target.baseY, radius: target.radius };
  const { angleSamples, powerSamples, minAngleDeg, maxAngleDeg, maxFlightTime } = LEVEL_GENERATION;

  for (let a = 0; a < angleSamples; a++) {
    const angle = toRadians(lerp(minAngleDeg, maxAngleDeg, a / (angleSamples - 1)));

    for (let p = 1; p <= powerSamples; p++) {
      const speed = (PHYSICS.maxLaunchSpeed * p) / powerSamples;
      const velocity = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
      const { outcome } = traceShot({ velocity, target: goal, obstacles, duration: maxFlightTime });
      if (outcome === ShotOutcome.HIT) return true;
    }
  }

  return false;
}
