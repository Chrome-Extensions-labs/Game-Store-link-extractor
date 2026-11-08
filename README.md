# Game Store Link Extractor

A Manifest V3 Chrome extension for ASO and research work: it collects app links from Google Play and Apple App Store pages, reduces them to canonical URLs, and gives you a clean list to copy or download.

[![Manifest](https://img.shields.io/badge/Manifest-V3-1a73e8?style=flat-square&logo=googlechrome)](manifest.json)
[![Version](https://img.shields.io/badge/Version-3.4.0-2f4f4f?style=flat-square)](manifest.json)
[![Lint and Test](https://github.com/Chrome-Extensions-labs/Game-Store-link-extractor/actions/workflows/lint.yml/badge.svg)](https://github.com/Chrome-Extensions-labs/Game-Store-link-extractor/actions/workflows/lint.yml)
[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue?style=flat-square)](LICENSE)

> This repository ships as an unpacked extension (Developer Mode). It is not published to the Chrome Web Store.

## Features

- Automatic extraction as soon as the popup opens; `Ctrl`/`⌘` + `Enter` or the button re-runs it.
- Store detection limited to the two first-party HTTPS origins.
- Only rendered anchors are collected; footers and navigation blocks are skipped.
- Identifiers are validated before canonical URLs are built:
  - `https://play.google.com/store/apps/details?id=<package>`
  - `https://apps.apple.com/app/id<number>`
- Deduplicated, sorted output with a live line count.
- One-click copy, plain-text download, and clear; the list stays editable in between.
- Light/dark theme follows the OS until an explicit choice is stored locally.
- `Ctrl`/`⌘` + `Shift` + `E` opens the popup from anywhere (configurable in Chrome).

> Store pages lazy-load their result cards. Scroll the page before opening the popup to collect the full list.

## Installation

```bash
git clone https://github.com/Chrome-Extensions-labs/Game-Store-link-extractor.git
cd Game-Store-link-extractor
```

Then open `chrome://extensions/`, enable **Developer mode**, click **Load unpacked**, and select the cloned directory. Reload the extension from that page after pulling changes.

Requires Chrome 116 or newer.

## Permissions and privacy

| Permission | Reason |
| --- | --- |
| `activeTab` | Temporary access to the tab the user invoked the extension on, granted by that gesture. |
| `scripting` | Injects the collector into that tab. |

There are **no host permissions**, no background service worker, no network requests, no analytics and no remote storage. Extraction runs entirely in the tab and the popup; the only persisted value is the local theme preference. See [SECURITY.md](SECURITY.md) for the threat model and how to report issues.

## Development

Node.js 20.19+ is needed for the tooling only — the extension itself has zero runtime dependencies and no build step.

```bash
npm ci
npm test
npm run lint
```

`npm test` uses Node's built-in test runner. It covers store detection, canonicalization, the manifest, the Chrome API wrappers, and the injected collector. The collector tests execute its source in an isolated VM with only cloned arguments, which mirrors Chrome's serialization boundary and catches accidental references to module scope.

### Layout

```text
├── manifest.json                     MV3 metadata and permissions
├── popup.html / src/popup/popup.css  Popup markup and styles
├── src/popup/
│   ├── main.js                       Controller and event wiring
│   ├── chrome-api.js                 chrome.* promise wrappers
│   ├── dom.js                        Element lookup and view updates
│   ├── result-actions.js             Clipboard and file export
│   ├── store-detection.js            URL → store routing
│   ├── theme.js                      Theme state
│   └── constants.js                  Shared labels and messages
├── src/extractors/
│   ├── injected-collector.js         Self-contained function injected into the tab
│   ├── store-config.js               Declarative, cloneable rules per store
│   └── index.js                      Public surface
├── tests/                            Node test suite
└── trigger action/                   GitHub Actions change-analysis helper
```

> `chrome.scripting.executeScript` serializes a function's source, so imports and module-scope helpers are **not** available in the tab. Keep `injected-collector.js` self-contained and pass data through `args`.

### Adding a store

1. Register the host in `STORE_HOSTS` (`src/popup/store-detection.js`).
2. Add a rule set to `STORE_EXTRACTION_CONFIG` (`src/extractors/store-config.js`) and labels in `src/popup/constants.js`.
3. Add cases to `tests/store-detection.test.js` and `tests/injected-collector.test.js`.
4. Update this README and bump the version in both `manifest.json` and `package.json`.

### Manual smoke test

1. Open a Google Play search page, scroll to hydrate results, open the popup.
2. Verify canonical `details?id=` URLs, the counter, copy, download, and clear.
3. Repeat on `apps.apple.com`, including a localized page.
4. Confirm unsupported pages explain why the button is disabled.
5. Toggle the theme, reopen the popup, and confirm the choice persists.

## License

Distributed under the **GPL-3.0** license. See [LICENSE](LICENSE).

## Support

[![Patreon](https://img.shields.io/badge/Patreon-OstinFCT-f96854?style=flat-square&logo=patreon)](https://www.patreon.com/OstinFCT)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-fctostin-29abe0?style=flat-square&logo=ko-fi)](https://ko-fi.com/fctostin)
[![Boosty](https://img.shields.io/badge/Boosty-Support-f15f2c?style=flat-square)](https://boosty.to/ostinfct)
[![YouTube](https://img.shields.io/badge/YouTube-FCT--Ostin-red?style=flat-square&logo=youtube)](https://www.youtube.com/@FCT-Ostin)
[![Telegram](https://img.shields.io/badge/Telegram-FCTostin-2ca5e0?style=flat-square&logo=telegram)](https://t.me/FCTostin)
