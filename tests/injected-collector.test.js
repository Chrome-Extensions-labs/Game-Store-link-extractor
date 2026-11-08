import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';

import { extractStoreLinks } from '../src/extractors/injected-collector.js';
import { STORE_EXTRACTION_CONFIG } from '../src/extractors/store-config.js';
import { STORE_TYPES } from '../src/popup/constants.js';
import { createAnchor, createDocument } from './dom-stub.js';

const PLAY = STORE_EXTRACTION_CONFIG[STORE_TYPES.GOOGLE_PLAY];
const APPLE = STORE_EXTRACTION_CONFIG[STORE_TYPES.APPLE_APP_STORE];
const PLAY_BASE = 'https://play.google.com/store/search?q=puzzle';
const APPLE_BASE = 'https://apps.apple.com/us/search?term=puzzle';

// Mirrors chrome.scripting: only the function source and structured-cloned
// arguments cross into the tab. A reference to any module-scope helper would
// throw here, which is the regression this suite guards against.
function runInTabIsolation(config, anchors, baseURI) {
  const sandbox = { document: createDocument(anchors, baseURI), URL };
  const injected = vm.runInNewContext(`(${extractStoreLinks.toString()})`, sandbox);
  const clonedConfig = JSON.parse(JSON.stringify(config));
  return [...injected(clonedConfig)];
}

test('store rules are structured-cloneable data', () => {
  for (const config of Object.values(STORE_EXTRACTION_CONFIG)) {
    assert.deepEqual(JSON.parse(JSON.stringify(config)), config);
    assert.equal(typeof config.idPattern, 'string');
    assert.equal(typeof config.canonicalTemplate, 'string');
    assert.ok(Array.isArray(config.allowedHosts));
  }
});

test('Google Play links are canonicalized, deduplicated and sorted', () => {
  const anchors = [
    createAnchor({ href: 'https://play.google.com/store/apps/details?id=com.example.beta&gl=US' }),
    createAnchor({ href: 'https://play.google.com/store/apps/details?id=com.example.alpha&hl=en' }),
    createAnchor({ href: 'https://play.google.com/store/apps/details?id=com.example.beta' }),
  ];

  assert.deepEqual(runInTabIsolation(PLAY, anchors, PLAY_BASE), [
    'https://play.google.com/store/apps/details?id=com.example.alpha',
    'https://play.google.com/store/apps/details?id=com.example.beta',
  ]);
});

test('relative Google Play hrefs resolve against the document base', () => {
  const anchors = [createAnchor({ href: '/store/apps/details?id=com.example.game' })];
  assert.deepEqual(runInTabIsolation(PLAY, anchors, PLAY_BASE), [
    'https://play.google.com/store/apps/details?id=com.example.game',
  ]);
});

test('Google Play rejects foreign hosts, unrelated paths and malformed ids', () => {
  const anchors = [
    createAnchor({ href: 'https://evil.example/store/apps/details?id=com.example.game' }),
    createAnchor({ href: 'https://play.google.com/store/search?q=com.example.game' }),
    createAnchor({ href: 'https://play.google.com/store/apps/details?id=not-a-package' }),
    createAnchor({ href: 'https://play.google.com/store/apps/details?id=' }),
    createAnchor({ href: 'https://play.google.com/store/apps/details?id=com.example%0Ahttps://evil.example' }),
    createAnchor({ href: 'javascript:alert(1)' }),
  ];

  assert.deepEqual(runInTabIsolation(PLAY, anchors, PLAY_BASE), []);
});

test('hidden anchors and navigation blocks are skipped', () => {
  const anchors = [
    createAnchor({ href: 'https://play.google.com/store/apps/details?id=com.example.hidden', visible: false }),
    createAnchor({ href: 'https://play.google.com/store/apps/details?id=com.example.footer', ancestors: ['footer'] }),
    createAnchor({ href: 'https://play.google.com/store/apps/details?id=com.example.nav', ancestors: ['[role="navigation"]'] }),
    createAnchor({ href: 'https://play.google.com/store/apps/details?id=com.example.visible' }),
  ];

  assert.deepEqual(runInTabIsolation(PLAY, anchors, PLAY_BASE), [
    'https://play.google.com/store/apps/details?id=com.example.visible',
  ]);
});

test('Apple links collapse locale and query variants to one canonical URL', () => {
  const anchors = [
    createAnchor({ href: 'https://apps.apple.com/us/app/example/id123456?mt=8' }),
    createAnchor({ href: '/de/app/beispiel/id123456' }),
    createAnchor({ href: 'https://apps.apple.com/app/id987654321' }),
  ];

  assert.deepEqual(runInTabIsolation(APPLE, anchors, APPLE_BASE), [
    'https://apps.apple.com/app/id123456',
    'https://apps.apple.com/app/id987654321',
  ]);
});

test('Apple rejects developer pages, non-numeric ids and foreign hosts', () => {
  const anchors = [
    createAnchor({ href: 'https://apps.apple.com/us/developer/example/id123456' }),
    createAnchor({ href: 'https://apps.apple.com/app/id123456/extra' }),
    createAnchor({ href: 'https://evil.example/us/app/example/id123456' }),
    createAnchor({ href: 'https://apps.apple.com/app/id123456%0Ahttps://evil.example' }),
  ];

  // The app id must terminate the path: /app/ alone is not sufficient, and a
  // percent-encoded newline must never survive as a second output line.
  assert.deepEqual(runInTabIsolation(APPLE, anchors, APPLE_BASE), []);
});

test('an invalid rule set produces no links instead of throwing', () => {
  const anchors = [createAnchor({ href: 'https://play.google.com/store/apps/details?id=com.example.game' })];
  assert.deepEqual(runInTabIsolation({}, anchors, PLAY_BASE), []);
});
