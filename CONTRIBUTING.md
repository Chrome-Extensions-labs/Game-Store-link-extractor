# Contributing

Thanks for helping out. Bug reports, fixes, documentation and ideas are all welcome — open an issue first if you want to discuss a larger change.

## Getting set up

```bash
git clone https://github.com/Chrome-Extensions-labs/Game-Store-link-extractor.git
cd Game-Store-link-extractor
npm ci
```

Load the directory as an unpacked extension from `chrome://extensions/` and reload it after each change. There is no build step.

## Before opening a pull request

```bash
npm test
npm run lint
```

Both commands must pass. New behaviour needs a test: URL rules belong in `tests/store-detection.test.js`, extraction rules in `tests/injected-collector.test.js`.

A few conventions:

- Plain ES modules, 2-space indentation, LF line endings, single quotes (see `.editorconfig`).
- Comments explain *why*, not *what*, and are written in English.
- The injected collector in `src/extractors/injected-collector.js` must stay self-contained — Chrome serializes its source into the tab, so module imports do not work there.
- Keep permissions minimal. Do not add host permissions without a documented need.
- Update `README.md` when behaviour changes and bump the version in `manifest.json` and `package.json` together.

## Pull request process

1. Fork the repository and create a branch (`feature/...` or `fix/...`).
2. Make the change with a focused, descriptive commit message.
3. Push to your fork and open a PR; reference the issue it closes.
4. Fill in the PR template, including what you tested on a real store page.

Reviews are friendly and collaborative. If something needs work, we will point to the exact line and help you get it there.
