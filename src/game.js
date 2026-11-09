import { AIM, FEEDBACK, ROUND } from './config.js';
import { createLevel } from './level.js';
import { advanceBody, launchVelocity } from './physics.js';
import { ShotOutcome, createProjectile, detectImpact, traceShot } from './shot.js';
import { clampVectorLength, vectorLength } from './utils/math.js';

export const GameState = Object.freeze({
  IDLE: 'idle',
  PLAYING: 'playing',
  FINISHED: 'finished',
});

/**
 * Owns all gameplay state and rules. It knows nothing about rendering or DOM
 * input; callers feed it world-space points and a fixed time step.
 */
export class Game {
  constructor({ onRoundEnd }) {
    this.onRoundEnd = onRoundEnd;
    this.state = GameState.IDLE;
    this.reset();
  }

  /** Only one projectile may be in flight; the next shot waits for it to resolve. */
  get isReloading() {
    return this.projectile !== null;
  }

  start() {
    this.reset();
    this.state = GameState.PLAYING;
  }

  reset() {
    this.timeLeft = ROUND.duration;
    this.hits = 0;
    this.shots = 0;
    this.level = createLevel(1);
    this.projectile = null;
    this.aim = null;
    this.popups = [];
  }

  beginAim(point) {
    if (this.state !== GameState.PLAYING) return;
    this.aim = { origin: point, pull: { x: 0, y: 0 }, preview: [] };
  }

  updateAim(point) {
    if (!this.aim) return;
    this.aim.pull = this.pullTowards(point);
    this.refreshAimPreview();
  }

  releaseAim(point) {
    if (!this.aim) return;

    const pull = this.pullTowards(point);
    this.aim = null;

    if (this.isReloading || vectorLength(pull) < AIM.minPull) return;
    this.fire(launchVelocity(pull));
  }

  cancelAim() {
    this.aim = null;
  }

  update(dt) {
    if (this.state !== GameState.PLAYING) return;

    this.timeLeft = Math.max(0, this.timeLeft - dt);
    this.level.target.update(dt);
    this.updateProjectile(dt);
    this.updatePopups(dt);

    if (this.timeLeft === 0) this.finish();
  }

  pullTowards(point) {
    const { origin } = this.aim;
    return clampVectorLength({ x: origin.x - point.x, y: origin.y - point.y }, AIM.maxPull);
  }

  refreshAimPreview() {
    const { target, obstacles } = this.level;
    this.aim.preview = traceShot({
      velocity: launchVelocity(this.aim.pull),
      target,
      obstacles,
      duration: AIM.previewDuration,
      pointSpacing: AIM.previewPointSpacing,
    }).points;
  }

  fire(velocity) {
    this.projectile = createProjectile(velocity);
    this.shots += 1;
  }

  updateProjectile(dt) {
    if (!this.projectile) return;

    const { target, obstacles } = this.level;
    const outcome = advanceBody(this.projectile, dt, (body) =>
      detectImpact(body, target, obstacles),
    );
    if (!outcome) return;

    this.projectile = null;
    if (outcome === ShotOutcome.HIT) this.registerHit(target);
  }

  registerHit(target) {
    this.hits += 1;
    this.popups.push({ x: target.x, y: target.y, age: 0 });
    this.level = createLevel(this.level.number + 1);
    if (this.aim) this.refreshAimPreview();
  }

  updatePopups(dt) {
    for (const popup of this.popups) popup.age += dt;
    this.popups = this.popups.filter((popup) => popup.age < FEEDBACK.popupDuration);
  }

  finish() {
    this.state = GameState.FINISHED;
    this.projectile = null;
    this.aim = null;
    this.onRoundEnd({ hits: this.hits, shots: this.shots, level: this.level.number });
  }
}
