import { AIM, FEEDBACK, LAUNCHER, PROJECTILE, WORLD } from './config.js';
import { vectorLength } from './utils/math.js';

const COLORS = Object.freeze({
  background: '#121826',
  obstacle: '#4a5670',
  obstacleEdge: '#6b7894',
  targetOuter: '#e85d4a',
  targetInner: '#f5f1e8',
  targetTrack: 'rgba(232, 93, 74, 0.25)',
  launcher: '#f2b33d',
  projectile: '#f5f1e8',
  guide: 'rgba(245, 241, 232, 0.25)',
  text: '#f5f1e8',
  warning: '#e85d4a',
});

const TARGET_RINGS = Object.freeze([
  [1, COLORS.targetOuter],
  [0.66, COLORS.targetInner],
  [0.33, COLORS.targetOuter],
]);

const HUD_FONT = '600 22px system-ui, sans-serif';
const POPUP_FONT = '700 26px system-ui, sans-serif';
const LABEL_FONT = '600 16px system-ui, sans-serif';
const BAND_VISUAL_SCALE = 0.35;
const RELOADING_ALPHA = 0.35;
const WARNING_TIME = 10;

export class Renderer {
  constructor(context) {
    this.ctx = context;
  }

  render(game) {
    const { target, obstacles } = game.level;

    this.drawBackground();
    this.drawObstacles(obstacles);
    this.drawTarget(target);
    this.drawLauncher(game.isReloading);
    if (game.aim) this.drawAim(game.aim, game.isReloading);
    if (game.projectile) this.drawDisc(game.projectile, game.projectile.radius, COLORS.projectile);
    this.drawPopups(game.popups);
    this.drawHud(game);
  }

  drawBackground() {
    this.ctx.fillStyle = COLORS.background;
    this.ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  }

  drawObstacles(obstacles) {
    const { ctx } = this;
    ctx.fillStyle = COLORS.obstacle;
    ctx.strokeStyle = COLORS.obstacleEdge;
    ctx.lineWidth = 2;

    for (const { x, y, width, height } of obstacles) {
      ctx.fillRect(x, y, width, height);
      ctx.strokeRect(x + 1, y + 1, width - 2, height - 2);
    }
  }

  drawTarget(target) {
    if (target.isMoving) {
      this.drawLine(
        { x: target.baseX, y: target.baseY - target.amplitude },
        { x: target.baseX, y: target.baseY + target.amplitude },
        COLORS.targetTrack,
        4,
      );
    }

    for (const [ratio, color] of TARGET_RINGS) {
      this.drawDisc(target, target.radius * ratio, color);
    }
  }

  drawLauncher(isReloading) {
    const { ctx } = this;
    ctx.save();
    ctx.globalAlpha = isReloading ? RELOADING_ALPHA : 1;
    this.drawLine(LAUNCHER, { x: LAUNCHER.x, y: WORLD.height }, COLORS.launcher, 6);
    this.drawDisc(LAUNCHER, LAUNCHER.radius, COLORS.launcher);
    ctx.restore();
  }

  drawAim({ origin, pull, preview }, isReloading) {
    const { ctx } = this;
    const pointer = { x: origin.x - pull.x, y: origin.y - pull.y };
    const pouch = {
      x: LAUNCHER.x - pull.x * BAND_VISUAL_SCALE,
      y: LAUNCHER.y - pull.y * BAND_VISUAL_SCALE,
    };

    ctx.setLineDash([6, 6]);
    this.drawLine(origin, pointer, COLORS.guide, 2);
    ctx.setLineDash([]);
    this.drawDisc(origin, 8, COLORS.guide);

    ctx.save();
    ctx.globalAlpha = isReloading ? RELOADING_ALPHA : 1;
    this.drawLine(LAUNCHER, pouch, COLORS.launcher, 3);
    this.drawDisc(pouch, PROJECTILE.radius, COLORS.projectile);

    preview.forEach((point, index) => {
      ctx.globalAlpha = (isReloading ? RELOADING_ALPHA : 1) * (1 - index / preview.length);
      this.drawDisc(point, 3, COLORS.projectile);
    });
    ctx.restore();

    const power = Math.round((vectorLength(pull) / AIM.maxPull) * 100);
    this.drawText(`${power}%`, LAUNCHER.x, LAUNCHER.y - 44, { font: LABEL_FONT, align: 'center' });
  }

  drawPopups(popups) {
    const { ctx } = this;
    ctx.save();

    for (const { x, y, age } of popups) {
      const progress = age / FEEDBACK.popupDuration;
      ctx.globalAlpha = 1 - progress;
      this.drawText('+1', x, y - FEEDBACK.popupRise * progress, { font: POPUP_FONT, align: 'center' });
    }

    ctx.restore();
  }

  drawHud({ hits, level, timeLeft }) {
    const top = 20;
    const timerColor = timeLeft <= WARNING_TIME ? COLORS.warning : COLORS.text;

    this.drawText(`Skor ${hits}`, 24, top, { align: 'left' });
    this.drawText(`Level ${level.number}`, WORLD.width / 2, top, { align: 'center' });
    this.drawText(`${Math.ceil(timeLeft)} dtk`, WORLD.width - 24, top, {
      align: 'right',
      color: timerColor,
    });
  }

  drawDisc({ x, y }, radius, color) {
    const { ctx } = this;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  drawLine(from, to, color, width) {
    const { ctx } = this;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }

  drawText(text, x, y, { font = HUD_FONT, align = 'left', color = COLORS.text } = {}) {
    const { ctx } = this;
    ctx.font = font;
    ctx.textAlign = align;
    ctx.textBaseline = 'top';
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }
}
