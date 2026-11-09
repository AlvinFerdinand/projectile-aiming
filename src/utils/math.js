export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const lerp = (from, to, t) => from + (to - from) * t;

export const randomRange = (min, max) => min + Math.random() * (max - min);

export const toRadians = (degrees) => (degrees * Math.PI) / 180;

export const vectorLength = ({ x, y }) => Math.hypot(x, y);

export function clampVectorLength(vector, maxLength) {
  const length = vectorLength(vector);
  if (length <= maxLength) return { x: vector.x, y: vector.y };

  const factor = maxLength / length;
  return { x: vector.x * factor, y: vector.y * factor };
}
