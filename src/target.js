/** A circular target that optionally oscillates vertically around its base position. */
export class Target {
  constructor({ x, y, radius, amplitude = 0, frequency = 0, phase = 0 }) {
    this.baseX = x;
    this.baseY = y;
    this.radius = radius;
    this.amplitude = amplitude;
    this.frequency = frequency;
    this.phase = phase;
    this.elapsed = 0;

    this.x = x;
    this.y = this.verticalPositionAt(0);
  }

  get isMoving() {
    return this.amplitude > 0;
  }

  /** The full area the target can occupy while moving. */
  get bounds() {
    return {
      x: this.baseX - this.radius,
      y: this.baseY - this.amplitude - this.radius,
      width: this.radius * 2,
      height: (this.amplitude + this.radius) * 2,
    };
  }

  update(dt) {
    this.elapsed += dt;
    this.y = this.verticalPositionAt(this.elapsed);
  }

  verticalPositionAt(time) {
    return this.baseY + Math.sin(time * this.frequency + this.phase) * this.amplitude;
  }
}
