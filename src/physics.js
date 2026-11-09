import { AIM, PHYSICS } from './config.js';

export function createBody(position, velocity, radius) {
  return { x: position.x, y: position.y, vx: velocity.x, vy: velocity.y, radius };
}

/** Pull distance maps linearly to launch speed; pull direction is launch direction. */
export function launchVelocity(pull) {
  const speedPerPixel = PHYSICS.maxLaunchSpeed / AIM.maxPull;
  return { x: pull.x * speedPerPixel, y: pull.y * speedPerPixel };
}

/**
 * Integrates a body under gravity using semi-implicit Euler. The step is split
 * into substeps so a fast body never moves further than `maxSubstepDistance`
 * between collision checks, which prevents tunnelling through thin obstacles.
 *
 * Returns the first non-null result of `detectCollision`, or null.
 */
export function advanceBody(body, dt, detectCollision) {
  const travel = Math.hypot(body.vx, body.vy) * dt;
  const substeps = Math.max(1, Math.ceil(travel / PHYSICS.maxSubstepDistance));
  const h = dt / substeps;

  for (let i = 0; i < substeps; i++) {
    body.vy += PHYSICS.gravity * h;
    body.x += body.vx * h;
    body.y += body.vy * h;

    const collision = detectCollision(body);
    if (collision) return collision;
  }

  return null;
}
