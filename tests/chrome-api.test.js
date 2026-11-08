import test from 'node:test';
import assert from 'node:assert/strict';

import { executeInTab, getActiveTab } from '../src/popup/chrome-api.js';

function withChrome(mock) {
  const previous = globalThis.chrome;
  globalThis.chrome = mock;
  return () => {
    if (previous === undefined) {
      delete globalThis.chrome;
    } else {
      globalThis.chrome = previous;
    }
  };
}

test('getActiveTab returns the first tab or null', async () => {
  let restore = withChrome({ tabs: { query: async () => [{ id: 7, url: 'https://play.google.com/' }] } });
  try {
    assert.equal((await getActiveTab()).id, 7);
  } finally {
    restore();
  }

  restore = withChrome({ tabs: { query: async () => [] } });
  try {
    assert.equal(await getActiveTab(), null);
  } finally {
    restore();
  }
});

test('executeInTab passes arguments through and keeps only string results', async () => {
  let captured;
  const restore = withChrome({
    scripting: {
      executeScript: async (options) => {
        captured = options;
        return [{ result: ['https://example.com/a', 42, null, 'https://example.com/b'] }];
      },
    },
  });

  try {
    const func = () => [];
    const links = await executeInTab(7, func, 'payload');
    assert.equal(captured.target.tabId, 7);
    assert.equal(captured.func, func);
    assert.deepEqual(captured.args, ['payload']);
    assert.deepEqual(links, ['https://example.com/a', 'https://example.com/b']);
  } finally {
    restore();
  }
});

test('executeInTab tolerates empty or malformed injection responses', async () => {
  const restore = withChrome({
    scripting: {
      executeScript: async () => [{ result: undefined }],
    },
  });

  try {
    assert.deepEqual(await executeInTab(7, () => []), []);
  } finally {
    restore();
  }
});
