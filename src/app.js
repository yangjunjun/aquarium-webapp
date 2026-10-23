import { createFish, createCrab, updateCrabs, loadState, feed, update, MAX_FISH } from './simulation.js';
import { normalizeTheme, resolveReducedMotion } from './preferences.js';
import { THEMES, availableThemes, createScenery, drawScene } from './renderer.js';

const $ = id => document.getElementById(id);
const canvas = $('tank'), ctx = canvas.getContext('2d'), shell = canvas.closest('.tank-shell');
const mediaMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let stored;
try { stored = loadState(localStorage.getItem('aquarium-v1')); } catch { /* Storage may be disabled. */ }
const state = {
  fish: stored?.fish ?? Array.from({length: 8}, (_, i) => createFish(i)),
  crabs: stored?.crabs ?? [createCrab(0), createCrab(1)],
  night: stored?.night ?? false,
  theme: stored?.theme ?? 'nature',
  reducedMotion: stored?.reducedMotion ?? null,
};
let paused = false, food = [], time = 0, previous = null, w = 0, h = 0;
let noticeTimer, storageWarned = false;
const scenery = createScenery();
const reducedMotion = () => resolveReducedMotion(state.reducedMotion, mediaMotion.matches);
function notify(message) {
  $('notice').textContent = message;
  $('tank-status').textContent = message;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => { $('notice').textContent = ''; $('tank-status').textContent = THEMES[state.theme].subtitle; }, 3500);
}
function save() {
  try { localStorage.setItem('aquarium-v1', JSON.stringify({version: 1, ...state})); }
  catch {
    $('save-status').textContent = '保存不可用 · 当前会话仍可继续';
    if (!storageWarned) { storageWarned = true; notify('浏览器未允许保存，当前鱼缸仍可正常使用'); }
  }
}
function syncStats() {
  $('count').textContent = state.fish.length;
  $('add').disabled = state.fish.length >= MAX_FISH;
  $('feed').disabled = paused;
  $('activity').textContent = paused ? '时光暂停' : food.length ? '开饭啦' : '悠然游弋';
  $('food-count').textContent = food.length ? `还有 ${food.length} 粒${THEMES[state.theme].food}正在下沉` : THEMES[state.theme].ambient;
}
function refresh() {
  const theme = THEMES[state.theme];
  document.body.dataset.theme = state.theme;
  document.body.classList.toggle('night', state.night);
  $('world-description').textContent = theme.description;
  $('world-badge').textContent = theme.badge;
  $('mode-label').textContent = `${state.night ? '幽暗' : '明亮'} / ${theme.name}`;
  $('theme-select').value = state.theme;
  $('hint').textContent = paused ? '继续后即可投喂' : `点击水面，撒下一点${theme.food}`;
  $('paused').hidden = !paused;
  for (const button of document.querySelectorAll('[data-action="pause"]')) {
    button.textContent = paused ? '▷ 继续' : 'Ⅱ 暂停';button.setAttribute('aria-pressed', String(paused));
  }
  for (const button of document.querySelectorAll('[data-action="light"]')) {
    button.textContent = state.night ? '☾ 幽暗' : '☼ 明亮';button.setAttribute('aria-pressed', String(state.night));
  }
  $('motion').textContent = `减少动态：${reducedMotion() ? '开' : '关'}`;
  $('motion').setAttribute('aria-pressed', String(reducedMotion()));
  for (const card of document.querySelectorAll('.theme-card')) card.setAttribute('aria-pressed', String(card.dataset.theme === state.theme));
  syncStats();
}
function chooseTheme(id) {
  const theme = normalizeTheme(id);
  if (!availableThemes.includes(theme) || theme === state.theme) return;
  state.theme = theme;
  save();refresh();notify(`已进入${THEMES[theme].name}`);
}
for (const [id, theme] of Object.entries(THEMES)) {
  const button = document.createElement('button');
  button.type = 'button';button.className = 'theme-card';button.dataset.theme = id;
  button.setAttribute('aria-pressed', 'false');button.disabled = !availableThemes.includes(id);
  button.innerHTML = `<span class="theme-art"><canvas width="320" height="110" aria-hidden="true"></canvas><span class="theme-number">${theme.tag}</span></span><span class="theme-copy"><strong>${theme.name}</strong><small>${theme.subtitle}</small><span>${theme.description}</span></span><span class="theme-check" aria-hidden="true">✓</span>`;
  button.addEventListener('click', () => chooseTheme(id));$('theme-cards').append(button);
  const option = document.createElement('option');option.value = id;option.textContent = theme.name;option.disabled = button.disabled;$('theme-select').append(option);
}
$('theme-select').addEventListener('change', e => chooseTheme(e.target.value));
function giveFood(x, y) {
  if (paused) return notify('先继续水下时光，再投喂吧');
  feed(food, x, y);syncStats();
}
$('feed').onclick = () => giveFood(.3 + Math.random() * .4, .12);
canvas.addEventListener('pointerdown', e => { const r = canvas.getBoundingClientRect();giveFood((e.clientX-r.left)/r.width, (e.clientY-r.top)/r.height); });
canvas.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault();giveFood(.5, .12); } });
$('add').onclick = () => {
  if (state.fish.length >= MAX_FISH) return;
  state.fish.push(createFish(state.fish.length));save();syncStats();notify('新伙伴加入了鱼缸');
};
for (const button of document.querySelectorAll('[data-action]')) button.onclick = () => {
  if (button.dataset.action === 'pause') paused = !paused;
  if (button.dataset.action === 'light') { state.night = !state.night;save(); }
  refresh();
};
$('motion').onclick = () => { state.reducedMotion = !reducedMotion();save();refresh(); };
mediaMotion.addEventListener('change', refresh);
$('clear').onclick = () => { food = [];syncStats();notify('剩余鱼食已清理'); };
$('reset').onclick = () => {
  if (!confirm('恢复 8 尾鱼和 2 只螃蟹？当前主题与动态偏好会保留。')) return;
  state.fish = Array.from({length: 8}, (_, i) => createFish(i));state.crabs = [createCrab(0), createCrab(1)];
  food = [];paused = false;save();refresh();notify('居民已恢复初始状态');
};
function syncFullscreen() {
  const active = document.fullscreenElement === shell || shell.classList.contains('is-expanded');
  $('fullscreen').textContent = active ? '⛶ 退出全屏' : '⛶ 全屏';
  $('fullscreen').setAttribute('aria-pressed', String(active));
  $('fullscreen').setAttribute('aria-label', active ? '退出鱼缸全屏' : '全屏查看鱼缸');
}
function closeExpanded() { shell.classList.remove('is-expanded');document.body.classList.remove('tank-expanded');syncFullscreen();$('fullscreen').focus(); }
$('fullscreen').onclick = async () => {
  try {
    if (document.fullscreenElement === shell) await document.exitFullscreen();
    else if (shell.classList.contains('is-expanded')) closeExpanded();
    else if (shell.requestFullscreen && document.fullscreenEnabled) await shell.requestFullscreen();
    else { shell.classList.add('is-expanded');document.body.classList.add('tank-expanded'); }
  } catch { shell.classList.add('is-expanded');document.body.classList.add('tank-expanded'); }
  syncFullscreen();
};
document.addEventListener('fullscreenchange', syncFullscreen);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && shell.classList.contains('is-expanded')) closeExpanded(); });
new ResizeObserver(() => {
  const r = canvas.getBoundingClientRect();w = r.width;h = r.height;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);canvas.width = Math.round(w*dpr);canvas.height = Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
}).observe(canvas);
function frame(now) {
  const dt = previous === null ? 0 : Math.max(0, Math.min((now-previous)/1000, .05));previous = now;
  if (!paused && !document.hidden) { time += dt;update(state.fish,food,dt,time);updateCrabs(state.crabs,dt); }
  if (!document.hidden) drawScene(ctx, {...state, ...scenery, food, time, w, h, reducedMotion: reducedMotion()});
  requestAnimationFrame(frame);
}
document.addEventListener('visibilitychange', () => { previous = null;if (document.hidden) save(); });
setInterval(syncStats, 500);setInterval(save, 5000);window.addEventListener('pagehide', save);
refresh();requestAnimationFrame(frame);
