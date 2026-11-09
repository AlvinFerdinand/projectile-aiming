const MAX_FRAME_TIME = 0.25;

/**
 * Fixed-timestep loop: simulation always advances in equal steps so physics
 * behaves identically on 60 Hz and 120 Hz screens, while rendering runs once
 * per animation frame.
 */
export class GameLoop {
  constructor({ fixedTimeStep, update, render }) {
    this.fixedTimeStep = fixedTimeStep;
    this.update = update;
    this.render = render;
    this.accumulator = 0;
    this.lastTime = 0;
    this.tick = this.tick.bind(this);
  }

  start() {
    this.lastTime = performance.now();
    requestAnimationFrame(this.tick);
  }

  tick(now) {
    const frameTime = Math.min((now - this.lastTime) / 1000, MAX_FRAME_TIME);
    this.lastTime = now;
    this.accumulator += frameTime;

    while (this.accumulator >= this.fixedTimeStep) {
      this.update(this.fixedTimeStep);
      this.accumulator -= this.fixedTimeStep;
    }

    this.render();
    requestAnimationFrame(this.tick);
  }
}
