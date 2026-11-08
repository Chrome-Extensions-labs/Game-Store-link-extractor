import { STORE_TYPES } from '../popup/constants.js';

// Plain data only: these rules are structured-cloned into the tab as an
// executeScript argument, so functions, RegExp objects and class instances
// cannot be used here.
export const STORE_EXTRACTION_CONFIG = Object.freeze({
  [STORE_TYPES.GOOGLE_PLAY]: Object.freeze({
    anchorSelector: 'a[href*="/store/apps/details"]',
    allowedHosts: Object.freeze(['play.google.com']),
    requiredPathFragment: '/store/apps/details',
    ignoredAncestors: 'footer, nav, [role="navigation"]',
    idSource: 'query',
    idParam: 'id',
    idPattern: '^[A-Za-z0-9_]+(?:\\.[A-Za-z0-9_]+)+$',
    canonicalTemplate: 'https://play.google.com/store/apps/details?id={id}',
  }),
  [STORE_TYPES.APPLE_APP_STORE]: Object.freeze({
    anchorSelector: 'a[href*="/app/"], a[href*="/id"]',
    allowedHosts: Object.freeze(['apps.apple.com']),
    requiredPathFragment: '/app/',
    ignoredAncestors: 'footer, nav, #globalnav, [role="navigation"]',
    idSource: 'path',
    idPathPattern: '/id(\\d+)/?$',
    idPattern: '^\\d{1,20}$',
    canonicalTemplate: 'https://apps.apple.com/app/id{id}',
  }),
});
