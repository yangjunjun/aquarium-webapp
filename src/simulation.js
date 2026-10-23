export const MAX_FISH = 24;
export const MAX_FOOD = 70;
export const SPECIES = ['#e7aa62', '#8bc7bd', '#e3caaa'];
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export function createFish(index = 0) {
  return { x: .15 + Math.random() * .7, y: .2 + Math.random() * .5, vx: (Math.random() > .5 ? 1 : -1) * .035, vy: 0, size: 18 + Math.random() * 12, species: index % 3, phase: Math.random() * Math.PI * 2 };
}
export function loadState(raw) {
  try {
    const s = JSON.parse(raw);
    if (s?.version !== 1 || !Array.isArray(s.fish) || s.fish.length < 1 || s.fish.length > MAX_FISH) return null;
    if (!s.fish.every(f => ['x','y','vx','vy','size','phase','species'].every(k => Number.isFinite(f[k])) && f.x >= .04 && f.x <= .96 && f.y >= .1 && f.y <= .84 && f.size >= 18 && f.size <= 30 && Number.isInteger(f.species) && f.species >= 0 && f.species < 3 && Math.abs(f.vx) <= .2 && Math.abs(f.vy) <= .2)) return null;
    return { fish: s.fish, night: s.night === true };
  } catch { return null; }
}
export function feed(food, x = .5, y = .12) {
  for (let i = 0; i < 12 && food.length < MAX_FOOD; i++) food.push({ x: clamp(x + (Math.random() - .5) * .09, .05, .95), y: clamp(y + Math.random() * .025, .1, .79), age: 0 });
}
export function update(fish, food, dt, time) {
  dt = clamp(dt, 0, .05);
  for (let i = food.length - 1; i >= 0; i--) {
    food[i].y += dt * .025; food[i].age += dt;
    if (food[i].y > .84 || food[i].age > 24) food.splice(i, 1);
  }
  for (const f of fish) {
    let closest = -1, distance = Infinity;
    for (let i = 0; i < food.length; i++) {
      const d = Math.hypot(food[i].x - f.x, food[i].y - f.y);
      if (d < distance) { distance = d; closest = i; }
    }
    if (closest >= 0) {
      const target = food[closest];
      f.vx += ((target.x - f.x) / Math.max(distance, .001) * .11 - f.vx) * dt * 2;
      f.vy += ((target.y - f.y) / Math.max(distance, .001) * .11 - f.vy) * dt * 2;
      if (distance < .024) food.splice(closest, 1);
    } else {
      const dir = f.vx >= 0 ? 1 : -1;
      f.vx += (dir * .035 - f.vx) * dt;
      f.vy += (Math.sin(time * .5 + f.phase) * .018 - f.vy) * dt;
    }
    if (f.x < .07) f.vx = Math.abs(f.vx) + dt * .02;
    if (f.x > .93) f.vx = -Math.abs(f.vx) - dt * .02;
    if (f.y < .14) f.vy = Math.abs(f.vy) + dt * .02;
    if (f.y > .78) f.vy = -Math.abs(f.vy) - dt * .02;
    f.x = clamp(f.x + f.vx * dt, .04, .96); f.y = clamp(f.y + f.vy * dt, .1, .84);
  }
}
