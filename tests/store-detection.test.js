import test from 'node:test';
import assert from 'node:assert/strict';

import { detectStoreType } from '../src/popup/store-detection.js';
import { STORE_TYPES } from '../src/popup/constants.js';

test('recognises first-party store origins over HTTPS', () => {
  assert.equal(
    detectStoreType('https://play.google.com/store/search?q=puzzle&c=apps'),
    STORE_TYPES.GOOGLE_PLAY,
  );
  assert.equal(
    detectStoreType('https://apps.apple.com/us/search?term=puzzle'),
    STORE_TYPES.APPLE_APP_STORE,
  );
  assert.equal(
    detectStoreType('HTTPS://PLAY.GOOGLE.COM/store/apps/details?id=com.example.game'),
    STORE_TYPES.GOOGLE_PLAY,
  );
});

test('rejects lookalike hosts, subdomains and non-HTTPS schemes', () => {
  const rejected = [
    'http://play.google.com/store/search?q=puzzle',
    'https://play.google.com.evil.example/store/search',
    'https://evil.play.google.com/store/search',
    'https://apps.apple.com.evil.example/us/app/id42',
    'https://sub.apps.apple.com/us/app/id42',
    'file:///tmp/store.html',
    'chrome://extensions/',
  ];
  for (const url of rejected) {
    assert.equal(detectStoreType(url), null, url);
  }
});

test('does not resolve Object.prototype keys as store hosts', () => {
  assert.equal(detectStoreType('https://constructor/'), null);
  assert.equal(detectStoreType('https://__proto__/'), null);
  assert.equal(detectStoreType('https://toString/'), null);
});

test('returns null for missing or malformed input', () => {
  for (const value of [undefined, null, '', 42, {}, 'not a url', 'https://']) {
    assert.equal(detectStoreType(value), null);
  }
});
