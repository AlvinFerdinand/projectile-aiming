import { PHYSICS, ROUND, WORLD } from './config.js';
import { DragInput } from './core/drag-input.js';
import { GameLoop } from './core/game-loop.js';
import { Viewport } from './core/viewport.js';
import { Game } from './game.js';
import { Overlay } from './overlay.js';
import { Renderer } from './renderer.js';

const canvas = document.getElementById('game');
const viewport = new Viewport(canvas, WORLD);
const renderer = new Renderer(viewport.context);
const overlay = new Overlay(document.querySelector('[data-overlay]'));
const game = new Game({ onRoundEnd: showResult });

new DragInput(canvas, (x, y) => viewport.toWorld(x, y), {
  onStart: (point) => game.beginAim(point),
  onMove: (point) => game.updateAim(point),
  onEnd: (point) => game.releaseAim(point),
  onCancel: () => game.cancelAim(),
});

new GameLoop({
  fixedTimeStep: PHYSICS.fixedTimeStep,
  update: (dt) => game.update(dt),
  render: () => renderer.render(game),
}).start();

showIntro();

function startRound() {
  overlay.hide();
  game.start();
}

function showIntro() {
  overlay.show({
    title: 'Projectile Aiming',
    lines: [
      'Tarik layar ke arah berlawanan, lalu lepas untuk melempar.',
      `Kenai target sebanyak mungkin dalam ${ROUND.duration} detik.`,
    ],
    actionLabel: 'Mulai',
    onAction: startRound,
  });
}

function showResult({ hits, shots, level }) {
  const accuracy = shots === 0 ? 0 : Math.round((hits / shots) * 100);

  overlay.show({
    title: 'Waktu Habis',
    lines: [
      `Skor: ${hits}`,
      `Tembakan: ${shots}`,
      `Akurasi: ${accuracy}%`,
      `Level tercapai: ${level}`,
    ],
    actionLabel: 'Main Lagi',
    onAction: startRound,
  });
}
