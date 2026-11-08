export const STORE_TYPES = Object.freeze({
  GOOGLE_PLAY: 'google_play',
  APPLE_APP_STORE: 'apple_app_store',
});

export const STORE_LABELS = Object.freeze({
  [STORE_TYPES.GOOGLE_PLAY]: 'Google Play Store',
  [STORE_TYPES.APPLE_APP_STORE]: 'Apple App Store',
});

export const STORE_BADGES = Object.freeze({
  [STORE_TYPES.GOOGLE_PLAY]: 'Google Play',
  [STORE_TYPES.APPLE_APP_STORE]: 'App Store',
});

export const STATUS = Object.freeze({
  checking: 'Checking the active tab…',
  extracting: 'Extracting links…',
  ready: 'Ready to copy',
  empty: 'Nothing found yet',
  unavailable: 'Active tab unavailable',
  unsupported: 'Unsupported site',
  failed: 'Extraction failed',
});

export const MESSAGES = Object.freeze({
  noTab: 'The active tab could not be read. Reopen the popup on a store page.',
  unsupportedSite: 'Open a Google Play or App Store page to extract links.',
  extractionFailed: 'Extraction failed. Reload the store page and try again.',
  permissionDenied: 'Chrome blocked access to this page. Reload the tab and try again.',
  empty: 'No app links on this page yet. Scroll the results to load more cards, then re-extract.',
  initializationFailed: 'The popup could not initialize. Reload the extension and try again.',
  copyFailed: 'Could not access the clipboard. Select the text and press Ctrl+C.',
  copied: 'Copied to clipboard.',
  downloaded: 'Saved as a text file.',
  cleared: 'Results cleared. Run extraction again when ready.',
});

export const THEMES = Object.freeze({
  LIGHT: 'light',
  DARK: 'dark',
});

export const THEME_STORAGE_KEY = 'theme';
