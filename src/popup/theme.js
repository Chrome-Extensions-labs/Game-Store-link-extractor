import { THEME_STORAGE_KEY, THEMES } from './constants.js';

const SCHEME_QUERY = '(prefers-color-scheme: dark)';

function readPreference() {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === THEMES.DARK || value === THEMES.LIGHT ? value : null;
  } catch {
    // Storage can be disabled by policy; the OS preference remains usable.
    return null;
  }
}

function writePreference(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Non-fatal: the toggle still applies for the current popup session.
  }
}

export function initializeThemeToggle(toggle) {
  const scheme = window.matchMedia(SCHEME_QUERY);
  const effectiveTheme = () => readPreference() ?? (scheme.matches ? THEMES.DARK : THEMES.LIGHT);

  const apply = () => {
    const isDark = effectiveTheme() === THEMES.DARK;
    document.documentElement.dataset.theme = isDark ? THEMES.DARK : THEMES.LIGHT;
    toggle.textContent = isDark ? '☀️ Light' : '🌙 Dark';
    toggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    toggle.setAttribute('aria-pressed', String(isDark));
  };

  apply();

  toggle.addEventListener('click', () => {
    const next = effectiveTheme() === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    writePreference(next);
    apply();
  });

  // Follow the OS until the user makes an explicit choice.
  scheme.addEventListener('change', apply);
}
