import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');
const manifest = JSON.parse(read('manifest.json'));
const pkg = JSON.parse(read('package.json'));

test('manifest requests the minimum viable permissions', () => {
  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual([...manifest.permissions].sort(), ['activeTab', 'scripting']);
  // Page access comes from the user gesture that opened the popup, not from
  // standing host permissions.
  assert.equal(manifest.host_permissions, undefined);
});

test('version stays in sync with package metadata and documentation', () => {
  assert.match(manifest.version, /^\d{1,5}(\.\d{1,5}){0,3}$/);
  assert.equal(manifest.version, pkg.version);
  assert.ok(read('README.md').includes(`Version-${manifest.version}`));
});

test('every asset referenced by the manifest exists', () => {
  const assets = [
    manifest.action.default_popup,
    manifest.action.default_icon['128'],
    manifest.icons['128'],
  ];
  for (const asset of assets) {
    assert.ok(existsSync(path.join(root, asset)), `${asset} is missing`);
  }
});

test('the popup only references bundled scripts and styles', () => {
  const html = read('popup.html');
  const references = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css|png))"/g)].map((match) => match[1]);
  assert.ok(references.length >= 2);
  for (const reference of references) {
    assert.ok(existsSync(path.join(root, reference)), `${reference} is missing`);
  }
  assert.match(html, /<script type="module"/);
});
