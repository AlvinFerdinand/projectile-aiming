/**
 * Maps a fixed logical world size onto whatever screen space is available,
 * keeping the aspect ratio and rendering sharply on high-density displays.
 */
export class Viewport {
  constructor(canvas, { width, height }) {
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    this.context = canvas.getContext('2d');

    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
    this.resize();
  }

  resize() {
    const { clientWidth, clientHeight } = this.canvas.parentElement;
    const scale = Math.min(clientWidth / this.width, clientHeight / this.height);
    const pixelRatio = window.devicePixelRatio || 1;

    this.canvas.style.width = `${this.width * scale}px`;
    this.canvas.style.height = `${this.height * scale}px`;
    this.canvas.width = Math.round(this.width * scale * pixelRatio);
    this.canvas.height = Math.round(this.height * scale * pixelRatio);
    this.context.setTransform(scale * pixelRatio, 0, 0, scale * pixelRatio, 0, 0);
  }

  toWorld(clientX, clientY) {
    const bounds = this.canvas.getBoundingClientRect();
    return {
      x: ((clientX - bounds.left) / bounds.width) * this.width,
      y: ((clientY - bounds.top) / bounds.height) * this.height,
    };
  }
}
