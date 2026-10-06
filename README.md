# Game Store Link Extractor
  <img src="https://readme-typing-svg.herokuapp.com?font=JetBrains+Mono&size=24&pause=1000&color=2F4F4F&center=true&vCenter=true&width=900&lines=Game+Store+Link+Extractor;Manifest+V3+Chrome+Extension+for+ASO+and+Research+Workflows;Scrape+clean+app+URLs+from+Google+Play+and+Apple+App+Store" alt="Typing SVG" />

**Production-minded Chrome Extension that pulls clean app URLs from Google Play and Apple App Store search pages with dedupe and noise filtering built in.**

[![Gist](https://img.shields.io/badge/gist.github-version_of_this_repository-DCDCDC?style=for-the-badge&logo=github)](https://gist.github.com/OstinUA/0e3a90ba518e0c6bac3311f14f0f7f5e)

[![Chrome Store](https://img.shields.io/badge/platform-Chrome_Extension-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)](https://chromewebstore.google.com/search/OstinUA)
[![Chrome Portfolio](https://img.shields.io/badge/Chrome_Web_Store-Portfolio-34A853?style=for-the-badge&logo=google-chrome&logoColor=white)](https://devs-in-exile.pages.dev/extensions)

[![Manifest](https://img.shields.io/badge/Manifest-V3-1a73e8?style=for-the-badge&logo=googlechrome)](manifest.json)
[![Version](https://img.shields.io/badge/Version-3.2-2f4f4f?style=for-the-badge)](manifest.json)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-f7df1e?style=for-the-badge&logo=javascript&logoColor=1f1f1f)](popup.js)
[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue?style=for-the-badge)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Chrome_Extension-4285f4?style=for-the-badge&logo=googlechrome&logoColor=white)](manifest.json)

> [!NOTE]
> This repo currently ships as an unpacked extension workflow (Developer Mode) and is not published to the Chrome Web Store.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Technical Block](#technical-block)
  - [Project Structure](#project-structure)
  - [Key Design Decisions](#key-design-decisions)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Usage](#usage)
  - [Google Play Flow](#google-play-flow)
  - [Apple App Store Flow](#apple-app-store-flow)
- [Configuration](#configuration)
- [License](#license)
- [Contacts](#contacts)

## Features

- **Dual-store extraction pipeline**: supports `play.google.com` and `apps.apple.com` in one popup flow.
- **Runtime store detection**: auto-detects active tab domain and wires the right extraction strategy.
- **Visible-only scraping**: ignores hidden nodes via `offsetParent !== null` checks.
- **DOM noise suppression**: excludes footer/global navigation blocks to avoid junk URLs.
- **Deterministic deduplication**: normalizes entities by app identifier using `Set` semantics.
- **Canonical URL generation**:
  - Google Play links normalize to `https://play.google.com/store/apps/details?id=<APP_ID>`.
  - Apple links normalize to `https://apps.apple.com/app/id<APP_ID>` (without locale segment noise).
- **Clipboard-ready output**: extracted links are shown in a textarea, line-by-line, for instant export.
- **Real-time counter**: popup shows number of extracted records.

> [!TIP]
> Scroll the search results page before running extraction so lazy-loaded cards are present in the DOM and can be collected.

## Technology Stack

- **Language**: JavaScript (ES6+)
- **Platform**: Chrome Extension, Manifest V3
- **Chrome APIs**:
  - `chrome.tabs.query`
  - `chrome.scripting.executeScript`
- **Permissions**:
  - `activeTab`
  - `scripting`
- **Host permissions**:
  - `https://play.google.com/*`
  - `https://apps.apple.com/*`
- **UI layer**: lightweight popup (`popup.html` + inline styles)

## Technical Block

### Project Structure

```text
.
├── icons/
│   └── icon128.png             # Extension icon
├── CONTRIBUTING.md             # Contribution guide
├── LICENSE                     # GPL-3.0 license
├── manifest.json               # MV3 metadata, permissions, action config
├── popup.html                  # Popup UI shell
├── src/
│   ├── extractors/             # Store-specific extraction functions
│   └── popup/                  # Popup UI controller and modules
└── README.md                   # Project docs
```

### Key Design Decisions

1. **Zero backend by design**  
   Extraction runs directly in the active tab context. No server, no external API, no telemetry.

2. **Function injection strategy**  
   The popup dynamically injects the extraction function for the detected store (`extractGooglePlayLinks` or `extractAppleStoreLinks`) to keep logic isolated and explicit.

3. **ID-first canonicalization**  
   Instead of trusting raw anchors, the code extracts stable app identifiers and reconstructs canonical URLs. This lowers duplicate and region-specific URL variance.

4. **Defensive parsing**  
   URL parsing operations are protected from malformed links to avoid hard failures during scraping sessions.

> [!IMPORTANT]
> This extension depends on current store DOM patterns. If Google/Apple rework their markup, selectors may need a hotfix.

## Getting Started

### Prerequisites

Make sure you have:

- **Google Chrome** (recent stable build)
- **Git** (for cloning/updating the repository)
- Optional: a GitHub account if you want to fork and contribute

### Installation

```bash
# 1) Clone the repo
git clone https://github.com/OstinUA/Game-Play-Search-Extractor.git

# 2) Enter project directory
cd Game-Play-Search-Extractor

# 3) Open Chrome extension management page
# chrome://extensions/

# 4) Enable Developer mode (top-right toggle)

# 5) Load unpacked extension
# Click "Load unpacked" and select this project directory
```

> [!WARNING]
> If you move or rename the local folder after loading unpacked, Chrome will lose track of the extension path. Reload from `chrome://extensions/`.

## Testing

There is no heavyweight automated test suite yet, so validation is currently **manual + behavior-driven**.

Recommended smoke-check routine:

```bash
# Optional sanity check: verify extension metadata is valid JSON
python -m json.tool manifest.json > /dev/null
```

Manual verification checklist:

1. Open a Google Play search page, scroll, run extraction, verify non-zero result count.
2. Confirm all Play links match canonical `details?id=` format.
3. Open an Apple App Store listing/search page, scroll, run extraction.
4. Confirm generated Apple links follow `https://apps.apple.com/app/id...` format.
5. Confirm duplicates are removed across repeated cards/blocks.
6. Confirm unsupported domains show disabled button + error state.

## Deployment

This project is currently deployed as a **source-distributed Chrome extension**.

Typical production-ish distribution paths:

- **Unpacked internal distribution** (fastest for teams and ASO operators)
- **Private release bundles** via Git tags/releases
- **Chrome Web Store packaging** (future-ready option if publishing is needed)

Build notes:

- There is no bundler/minifier stage required for runtime.
- Release discipline can be handled with semantic version bumps in `manifest.json`.
- CI can be added later for linting, metadata validation, and release packaging.

## Usage

### Google Play Flow

```text
1) Open https://play.google.com/store/search
2) Run your query and scroll to hydrate more result cards
3) Click extension icon
4) Verify status shows "Google Play Store"
5) Click "Extract Links"
6) Copy normalized links from textarea output
```

### Apple App Store Flow

```text
1) Open an apps.apple.com app listing or search-related page
2) Ensure app cards are visible in viewport/result blocks
3) Click extension icon
4) Verify status shows "Apple App Store"
5) Click "Extract Links"
6) Copy normalized links from textarea output
```

> [!TIP]
> The popup UI is fully in English and now includes a dark/light theme switch in the top-right corner.

## Configuration

This extension does not require `.env` files or runtime secrets.

Configuration surface is defined in `manifest.json`:

- `version`: release/version tracking
- `permissions`: `activeTab`, `scripting`
- `host_permissions`: allowed target domains for script injection
- `action.default_popup`: popup entrypoint
- `icons`: extension assets

If you add a new supported store domain, you need to update both:

1. `host_permissions` in `manifest.json`
2. Domain routing + extraction logic in `popup.js`

## License

Distributed under the **GPL-3.0** license. See [`LICENSE`](LICENSE) for legal details.

## Contacts

## ❤️ Support the Project

If you find this tool useful, consider leaving a ⭐ on GitHub or supporting the author directly:

[![Patreon](https://img.shields.io/badge/Patreon-OstinFCT-f96854?style=flat-square&logo=patreon)](https://www.patreon.com/OstinFCT)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-fctostin-29abe0?style=flat-square&logo=ko-fi)](https://ko-fi.com/fctostin)
[![Boosty](https://img.shields.io/badge/Boosty-Support-f15f2c?style=flat-square)](https://boosty.to/ostinfct)
[![YouTube](https://img.shields.io/badge/YouTube-FCT--Ostin-red?style=flat-square&logo=youtube)](https://www.youtube.com/@FCT-Ostin)
[![Telegram](https://img.shields.io/badge/Telegram-FCTostin-2ca5e0?style=flat-square&logo=telegram)](https://t.me/FCTostin)
