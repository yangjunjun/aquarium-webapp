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
