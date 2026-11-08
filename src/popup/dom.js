const ELEMENT_IDS = Object.freeze({
  runButton: 'run',
  copyButton: 'copy',
  downloadButton: 'download',
  clearButton: 'clear',
  themeToggle: 'theme-toggle',
  status: 'status',
  storeLabel: 'store-label',
  count: 'count',
  resultField: 'result',
  notice: 'error-msg',
});

export function getPopupElements() {
  const elements = {};

  for (const [key, id] of Object.entries(ELEMENT_IDS)) {
    const node = document.getElementById(id);
    if (!node) {
      throw new Error(`Popup markup is missing #${id}`);
    }
    elements[key] = node;
  }

  return elements;
}

export function setStatus(elements, text, tone = 'neutral') {
  elements.status.textContent = text;
  elements.status.dataset.tone = tone;
}

export function setStoreLabel(elements, label) {
  elements.storeLabel.textContent = label;
}

function setNotice(elements, message, tone) {
  const notice = elements.notice;
  notice.textContent = message;
  notice.dataset.tone = tone;
  notice.setAttribute('role', tone === 'error' ? 'alert' : 'status');
  notice.classList.remove('hidden');
}

export function showError(elements, message) {
  setNotice(elements, message, 'error');
}

export function showHint(elements, message) {
  setNotice(elements, message, 'info');
}

export function clearNotice(elements) {
  // Clear the text as well: hidden content is re-announced by some screen
  // readers when the element becomes visible again.
  elements.notice.textContent = '';
  elements.notice.classList.add('hidden');
}

export function renderLinks(elements, links) {
  elements.resultField.value = links.join('\n');
}

export function hasResults(elements) {
  return elements.resultField.value.trim().length > 0;
}

export function updateCount(elements) {
  const lines = elements.resultField.value.split('\n').filter((line) => line.trim() !== '');
  elements.count.textContent = String(lines.length);
}

export function syncControls(elements, { storeType, busy, hasLinks }) {
  elements.runButton.disabled = !storeType || busy;
  elements.runButton.textContent = busy ? 'Extracting…' : 'Extract links';
  elements.runButton.setAttribute('aria-busy', String(busy));

  for (const button of [elements.copyButton, elements.downloadButton, elements.clearButton]) {
    button.disabled = !hasLinks;
  }
}

const feedbackTimers = new WeakMap();

export function flashButtonLabel(button, label) {
  const idleLabel = button.dataset.idleLabel ?? button.textContent;
  button.dataset.idleLabel = idleLabel;
  button.textContent = label;

  clearTimeout(feedbackTimers.get(button));
  feedbackTimers.set(button, setTimeout(() => {
    button.textContent = idleLabel;
  }, 1400));
}
