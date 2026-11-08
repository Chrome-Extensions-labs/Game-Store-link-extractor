// Minimal anchor/document doubles for exercising the injected collector.
// `closest` resolves the selector list used by STORE_EXTRACTION_CONFIG against
// symbolic ancestor names declared by each test.
export function createAnchor({ href, visible = true, ancestors = [] }) {
  return {
    href,
    getClientRects: () => (visible ? [{ width: 10, height: 10 }] : []),
    closest(selector) {
      const selectors = selector.split(',').map((part) => part.trim());
      return ancestors.some((ancestor) => selectors.includes(ancestor)) ? { tagName: 'DIV' } : null;
    },
  };
}

export function createDocument(anchors, baseURI) {
  return {
    baseURI,
    querySelectorAll: () => anchors,
  };
}
