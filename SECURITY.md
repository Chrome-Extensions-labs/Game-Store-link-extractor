# Security Policy

Please do not open a public issue for a vulnerability. Report it privately through the repository's **Security → Report a vulnerability** tab, or via [Discussions](https://github.com/OstinUA/OstinUA/discussions/categories/reporting-a-vulnerability), so there is time to fix it before disclosure.

Include a description, reproduction steps, the impact you see, and — if you have one — a suggested fix. Reports are acknowledged within a few days and credited in the release notes if you want.

## Design notes

The extension follows a deliberately small attack surface:

- **Least privilege.** Only `activeTab` and `scripting` are declared. Page access is granted by the user gesture that opens the popup and expires when the tab navigates; no persistent host permissions are held.
- **Strict routing.** Only `https://play.google.com` and `https://apps.apple.com` are recognised. Subdomains, lookalike hosts and non-HTTPS URLs are rejected before any injection takes place.
- **No dynamic code.** The collector is a packaged function injected via `chrome.scripting`; the popup never uses `eval`, `innerHTML` or remote scripts. MV3's default extension-page CSP applies.
- **Validated output.** App identifiers are matched against strict patterns before canonical URLs are reconstructed, so page content cannot inject extra lines, markup or unexpected hosts into the results.
- **Local only.** No backend, no telemetry, no outbound requests. Only the theme preference is stored, in `localStorage` of the extension page.
- **Pinned CI dependencies.** GitHub Actions are pinned to commit SHAs and run with the narrowest permissions required.

Changing any of the above should be treated as a security-relevant change and reviewed accordingly.

## Scope

This policy covers all public repositories under the [OstinUA](https://github.com/OstinUA) account and the organizations managed by it. Vulnerabilities in third-party dependencies should be reported to their maintainers. Issues requiring physical device access and social engineering are out of scope.

Thank you for helping keep the project and its users safe.
