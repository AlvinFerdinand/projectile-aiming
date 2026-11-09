/**
 * Single-pointer drag tracking built on Pointer Events, so mouse, touch and
 * pen share one code path. Points are reported in world coordinates.
 */
export class DragInput {
  constructor(element, toWorld, { onStart, onMove, onEnd, onCancel }) {
    this.element = element;
    this.toWorld = toWorld;
    this.handlers = { onStart, onMove, onEnd, onCancel };
    this.pointerId = null;

    element.addEventListener('pointerdown', (event) => this.handlePointerDown(event));
    element.addEventListener('pointermove', (event) => this.handlePointerMove(event));
    element.addEventListener('pointerup', (event) => this.handlePointerUp(event));
    element.addEventListener('pointercancel', (event) => this.handlePointerCancel(event));
    element.addEventListener('contextmenu', (event) => event.preventDefault());
  }

  handlePointerDown(event) {
    if (this.pointerId !== null || !event.isPrimary || event.button !== 0) return;

    event.preventDefault();
    this.element.setPointerCapture(event.pointerId);
    this.pointerId = event.pointerId;
    this.handlers.onStart(this.pointFrom(event));
  }

  handlePointerMove(event) {
    if (!this.isTracking(event)) return;
    this.handlers.onMove(this.pointFrom(event));
  }

  handlePointerUp(event) {
    if (!this.isTracking(event)) return;
    this.release();
    this.handlers.onEnd(this.pointFrom(event));
  }

  handlePointerCancel(event) {
    if (!this.isTracking(event)) return;
    this.release();
    this.handlers.onCancel();
  }

  isTracking(event) {
    return event.pointerId === this.pointerId;
  }

  release() {
    if (this.element.hasPointerCapture(this.pointerId)) {
      this.element.releasePointerCapture(this.pointerId);
    }
    this.pointerId = null;
  }

  pointFrom(event) {
    return this.toWorld(event.clientX, event.clientY);
  }
}
