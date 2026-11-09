import { LAUNCHER, PHYSICS, PROJECTILE, WORLD } from './config.js';
import { circleOverlapsRect, circlesOverlap } from './collision.js';
import { advanceBody, createBody } from './physics.js';

export const ShotOutcome = Object.freeze({
  HIT: 'hit',
  BLOCKED: 'blocked',
  OUT_OF_BOUNDS: 'out-of-bounds',
});

export function createProjectile(velocity) {
  return createBody(LAUNCHER, velocity, PROJECTILE.radius);
}

export function detectImpact(body, target, obstacles) {
  if (circlesOverlap(body, target)) return ShotOutcome.HIT;
  if (obstacles.some((obstacle) => circleOverlapsRect(body, obstacle))) return ShotOutcome.BLOCKED;
  if (isOutOfBounds(body)) return ShotOutcome.OUT_OF_BOUNDS;
  return null;
}

/**
 * Simulates a shot with exactly the same integrator as the live projectile.
 * Used both for the aiming preview and for verifying that a level is solvable.
 */
export function traceShot({ velocity, target, obstacles, duration, pointSpacing = 0 }) {
  const body = createProjectile(velocity);
  const points = [];
  const steps = Math.ceil(duration / PHYSICS.fixedTimeStep);

  for (let step = 1; step <= steps; step++) {
    const outcome = advanceBody(body, PHYSICS.fixedTimeStep, (current) =>
      detectImpact(current, target, obstacles),
    );
    if (outcome) return { outcome, points };

    if (pointSpacing > 0 && step % pointSpacing === 0) {
      points.push({ x: body.x, y: body.y });
    }
  }

  return { outcome: null, points };
}

// The top edge is open so high lobs can leave the screen and fall back in.
function isOutOfBounds({ x, y, radius }) {
  return x < -radius || x > WORLD.width + radius || y > WORLD.height + radius;
}
