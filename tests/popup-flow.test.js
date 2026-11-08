import test from 'node:test';
import assert from 'node:assert/strict';

import { createPopupDom } from './popup-dom.js';
import { createAnchor, createDocument } from './dom-stub.js';

const PLAY_URL = 'https://play.google.com/store/search?q=puzzle';
const TAB_DOCUMENT = createDocument([
  createAnchor({ href: 'https://play.google.com/store/apps/details?id=com.example.beta' }),
  createAnchor({ href: 'https://play.google.com/store/apps/details?id=com.example.alpha' }),
], PLAY_URL);

const dom = createPopupDom();
const copied = [];
const blobs = [];
let injections = 0;

Object.defineProperty(globalThis, 'document', { value: dom.document, configurable: true, writable: true });
Object.defineProperty(globalThis, 'window', { value: dom.window, configurable: true, writable: true });
Object.defineProperty(globalThis, 'localStorage', { value: dom.localStorage, configurable: true, writable: true });
Object.defineProperty(globalThis, 'navigator', {
  value: { clipboard: { writeText: async (text) => copied.push(text) } },
  configurable: true,
  writable: true,
});

URL.createObjectURL = (blob) => {
  blobs.push(blob);
  return 'blob:test';
};
URL.revokeObjectURL = () => {};

globalThis.chrome = {
  tabs: { query: async () => [{ id: 42, url: PLAY_URL }] },
  scripting: {
    executeScript: async ({ func, args }) => {
      injections += 1;
      const previous = globalThis.document;
      globalThis.document = TAB_DOCUMENT;
      try {
        return [{ result: func(...args) }];
      } finally {
        globalThis.document = previous;
      }
    },
  },
};

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

await import('../src/popup/main.js');
await flush();

test('extracts on open, renders canonical links and enables export', () => {
  assert.equal(injections, 1);
  assert.equal(dom.elements.count.textContent, '2');
  assert.equal(
    dom.elements.result.value,
    'https://play.google.com/store/apps/details?id=com.example.alpha\n'
      + 'https://play.google.com/store/apps/details?id=com.example.beta',
  );
  assert.equal(dom.elements['store-label'].textContent, 'Google Play');
  assert.equal(dom.elements.status.dataset.tone, 'success');
  assert.equal(dom.elements.copy.disabled, false);
  assert.equal(dom.elements.run.disabled, false);
  assert.equal(dom.elements['error-msg'].classList.contains('hidden'), true);
});

test('theme toggle persists an explicit choice', async () => {
  const toggle = dom.elements['theme-toggle'];
  assert.equal(toggle.getAttribute('aria-pressed'), 'false');

  await toggle.dispatch('click');
  assert.equal(toggle.getAttribute('aria-pressed'), 'true');
  assert.equal(toggle.textContent, '☀️ Light');
  assert.equal(dom.storage.get('theme'), 'dark');
  assert.equal(dom.document.documentElement.dataset.theme, 'dark');
});

test('copy uses the edited list and updates the status', async () => {
  dom.elements.result.value = 'https://play.google.com/store/apps/details?id=com.example.custom';
  await dom.elements.result.dispatch('input');
  assert.equal(dom.elements.count.textContent, '1');

  await dom.elements.copy.dispatch('click');
  assert.equal(copied.at(-1), 'https://play.google.com/store/apps/details?id=com.example.custom');
  assert.equal(dom.elements.copy.textContent, 'Copied!');
  assert.equal(dom.elements.status.textContent, 'Copied to clipboard.');
});

test('download produces a dated plain-text file', async () => {
  await dom.elements.download.dispatch('click');
  assert.equal(blobs.length, 1);
  assert.equal(blobs[0].type, 'text/plain;charset=utf-8');
  assert.match(dom.created.at(-1).download, /^google-play-links-\d{4}-\d{2}-\d{2}\.txt$/);
});

test('clear resets the result and disables export actions', async () => {
  await dom.elements.clear.dispatch('click');
  assert.equal(dom.elements.result.value, '');
  assert.equal(dom.elements.count.textContent, '0');
  assert.equal(dom.elements.copy.disabled, true);
  assert.equal(dom.elements.run.disabled, false);
});

test('Ctrl+Enter re-runs extraction against the active tab', async () => {
  const before = injections;
  await dom.listeners.dispatch('keydown', { ctrlKey: true, key: 'Enter', preventDefault() {} });
  await flush();
  assert.equal(injections, before + 1);
  assert.equal(dom.elements.count.textContent, '2');
});

test('an unsupported page explains why extraction is unavailable', async () => {
  const previousQuery = globalThis.chrome.tabs.query;
  globalThis.chrome.tabs.query = async () => [{ id: 42, url: 'https://example.com/' }];
  try {
    await dom.elements.run.dispatch('click');
    await flush();
    assert.equal(dom.elements.run.disabled, true);
    assert.equal(dom.elements.status.textContent, 'Unsupported site');
    assert.equal(dom.elements['error-msg'].classList.contains('hidden'), false);
  } finally {
    globalThis.chrome.tabs.query = previousQuery;
  }
});
