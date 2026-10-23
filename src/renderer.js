import nature from './themes/nature.js';
import scifi from './themes/scifi.js';
import cthulhu from './themes/cthulhu.js';
import { normalizeTheme } from './preferences.js';

export const THEMES = {
  nature: { name: '自然溪流', subtitle: 'FOREST STREAM', description: '光穿过水草，生活慢慢发生。', food: '鱼食', ambient: '水草轻摇，气泡上升', badge: '森林溪流 · FRESHWATER', tag: '01 / ORGANIC' },
  scifi: { name: '科幻实验舱', subtitle: 'ORBITAL HABITAT', description: '漂浮在轨道上的微型生态实验。', food: '营养胶囊', ambient: '能量循环，生命信号稳定', badge: '轨道实验舱 · SECTOR 07', tag: '02 / SYNTHETIC' },
  cthulhu: { name: '克苏鲁深海', subtitle: 'THE SUNKEN UNKNOWN', description: '遗迹仍在呼吸，深处有谁醒着。', food: '幽光碎屑', ambient: '孢子漂浮，遗迹沉睡', badge: '沉没之城 · ABYSSAL ZONE', tag: '03 / ANCIENT' },
};
const renderers = { nature, scifi, cthulhu };
export const availableThemes = Object.keys(renderers);

export function createScenery(seed = 26023) {
  function random() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
  return {
    bubbles: Array.from({length: 36}, () => ({ x: random(), y: random(), r: 1 + random() * 2, s: .02 + random() * .03 })),
    plants: Array.from({length: 44}, (_, i) => ({ x: i < 22 ? .02 + random() * .24 : .73 + random() * .26, height: .12 + random() * .32, phase: random() * 6, width: 4 + random() * 8 })),
  };
}
export function drawScene(ctx, scene) {
  if (scene.w <= 0 || scene.h <= 0) return;
  const painter = renderers[normalizeTheme(scene.theme)] || nature;
  const s = { ...scene, decorTime: scene.reducedMotion ? 0 : scene.time };
  ctx.save();
  painter.background(ctx, s);
  for (const food of scene.food) { ctx.save();painter.food(ctx, food, s);ctx.restore(); }
  for (const fish of scene.fish) { ctx.save();painter.fish(ctx, fish, s);ctx.restore(); }
  for (const crab of scene.crabs) { ctx.save();painter.crab(ctx, crab, s);ctx.restore(); }
  const shade = ctx.createRadialGradient(scene.w * .5, scene.h * .4, 0, scene.w * .5, scene.h * .4, Math.max(scene.w, scene.h) * .72);
  shade.addColorStop(0, '#00000000');shade.addColorStop(1, scene.night ? '#02071388' : '#03151944');
  ctx.fillStyle = shade;ctx.fillRect(0, 0, scene.w, scene.h);
  ctx.restore();
}
