import { STORE_TYPES } from './constants.js';

const STORE_HOSTS = new Map([
  ['play.google.com', STORE_TYPES.GOOGLE_PLAY],
  ['apps.apple.com', STORE_TYPES.APPLE_APP_STORE],
]);

// The activeTab grant is origin-scoped, so only first-party HTTPS origins are
// eligible. Subdomains and lookalike hosts must never reach script injection.
export function detectStoreType(urlString) {
  if (typeof urlString !== 'string' || urlString === '') {
    return null;
  }

  let url;
  try {
    url = new URL(urlString);
  } catch {
    return null;
  }

  if (url.protocol !== 'https:') {
    return null;
  }

  return STORE_HOSTS.get(url.hostname.toLowerCase()) ?? null;
}
