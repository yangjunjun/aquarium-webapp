export const THEME_IDS = ['nature', 'scifi', 'cthulhu'];
export function normalizeTheme(value) {
  return THEME_IDS.includes(value) ? value : 'nature';
}
export function readPreferences(value = {}) {
  return {
    theme: normalizeTheme(value.theme),
    reducedMotion: typeof value.reducedMotion === 'boolean' ? value.reducedMotion : null,
  };
}
export function resolveReducedMotion(preference, systemPreference) {
  return typeof preference === 'boolean' ? preference : Boolean(systemPreference);
}

// Only the view preference changes; resident and food collections keep their identity.
export function selectTheme(state, value) {
  const next = normalizeTheme(value);
  if (state.theme === next) return false;
  state.theme = next;
  return true;
}
export function advanceTransition(progress, dt, { paused = false, reducedMotion = false } = {}) {
  if (reducedMotion) return 1;
  if (paused) return progress;
  return Math.min(1, progress + Math.max(0, dt) / .5);
}
