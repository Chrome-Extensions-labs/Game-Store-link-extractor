/**
 * Executed inside the active tab, not inside the extension. chrome.scripting
 * serializes the function source, so module imports and outer-scope helpers do
 * not survive the trip: all dependencies live here and store rules arrive as
 * a structured-cloned `config` argument.
 */
export function extractStoreLinks(config) {
  if (!config || !Array.isArray(config.allowedHosts) || typeof config.idPattern !== 'string') {
    return [];
  }

  const allowedHosts = new Set(config.allowedHosts);
  const idPattern = new RegExp(config.idPattern);
  const pathPattern = config.idSource === 'path' ? new RegExp(config.idPathPattern) : null;
  const links = new Set();

  const isRendered = (element) => {
    // getClientRects() also covers position:fixed anchors, whose offsetParent is null.
    return element.getClientRects().length > 0;
  };

  const readAppId = (url) => {
    if (pathPattern) {
      return url.pathname.match(pathPattern)?.[1] ?? null;
    }
    const value = url.searchParams.get(config.idParam);
    return value === null ? null : value.trim();
  };

  for (const anchor of document.querySelectorAll(config.anchorSelector)) {
    if (!isRendered(anchor)) {
      continue;
    }
    if (config.ignoredAncestors && anchor.closest(config.ignoredAncestors)) {
      continue;
    }

    let url;
    try {
      url = new URL(anchor.href, document.baseURI);
    } catch {
      continue;
    }

    if (url.protocol !== 'https:' || !allowedHosts.has(url.hostname)) {
      continue;
    }
    if (!url.pathname.includes(config.requiredPathFragment)) {
      continue;
    }

    const appId = readAppId(url);
    // Validated identifiers contain no whitespace or URL delimiters, so the
    // result stays exactly one canonical URL per line.
    if (appId && idPattern.test(appId)) {
      links.add(config.canonicalTemplate.replace('{id}', appId));
    }
  }

  return [...links].sort();
}
