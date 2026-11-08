function buildFileName(label) {
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${slug || 'store'}-links-${new Date().toISOString().slice(0, 10)}.txt`;
}

export async function copyToClipboard(text, textarea) {
  if (!text) {
    return false;
  }

  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error('Clipboard API unavailable');
    }
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Deprecated, but still the only fallback when the async API is blocked.
    // Both paths run inside a click handler, so transient activation is present.
    textarea.focus();
    textarea.select();
    try {
      return document.execCommand('copy');
    } catch {
      return false;
    }
  }
}

export function downloadText(text, label) {
  if (!text) {
    return;
  }

  const blob = new Blob([`${text}\n`], { type: 'text/plain;charset=utf-8' });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = buildFileName(label);
  anchor.hidden = true;

  document.body.append(anchor);
  anchor.click();
  anchor.remove();

  // Chrome resolves the download asynchronously; revoking in this tick cancels it.
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
