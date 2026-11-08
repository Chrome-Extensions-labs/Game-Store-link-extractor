import { MESSAGES, STATUS, STORE_BADGES, STORE_LABELS } from './constants.js';
import { executeInTab, getActiveTab } from './chrome-api.js';
import {
  clearNotice,
  flashButtonLabel,
  getPopupElements,
  hasResults,
  renderLinks,
  setStatus,
  setStoreLabel,
  showError,
  showHint,
  syncControls,
  updateCount,
} from './dom.js';
import { copyToClipboard, downloadText } from './result-actions.js';
import { detectStoreType } from './store-detection.js';
import { initializeThemeToggle } from './theme.js';
import { extractStoreLinks, STORE_EXTRACTION_CONFIG } from '../extractors/index.js';

const RESTRICTED_PAGE_PATTERN = /cannot access|not allowed|permission|chrome:\/\//i;

function describeExtractionError(error) {
  const message = error instanceof Error ? error.message : String(error);
  return RESTRICTED_PAGE_PATTERN.test(message)
    ? MESSAGES.permissionDenied
    : MESSAGES.extractionFailed;
}

function bootstrap() {
  const elements = getPopupElements();
  initializeThemeToggle(elements.themeToggle);

  const state = {
    storeType: null,
    busy: false,
    mounted: true,
  };

  const syncUi = () => {
    syncControls(elements, {
      storeType: state.storeType,
      busy: state.busy,
      hasLinks: hasResults(elements),
    });
  };

  async function runExtraction() {
    if (state.busy) {
      return;
    }

    state.busy = true;
    // Re-resolve the tab on every run: it may have navigated since the popup opened.
    state.storeType = null;
    clearNotice(elements);
    setStoreLabel(elements, '—');
    setStatus(elements, STATUS.checking, 'neutral');
    syncUi();

    try {
      const tab = await getActiveTab();
      if (!tab?.id || !tab.url) {
        showError(elements, MESSAGES.noTab);
        setStatus(elements, STATUS.unavailable, 'error');
        return;
      }

      const storeType = detectStoreType(tab.url);
      if (!storeType) {
        showError(elements, MESSAGES.unsupportedSite);
        setStatus(elements, STATUS.unsupported, 'error');
        return;
      }

      state.storeType = storeType;
      setStoreLabel(elements, STORE_BADGES[storeType]);
      setStatus(elements, `${STORE_LABELS[storeType]} · ${STATUS.extracting}`, 'busy');
      syncUi();

      const links = await executeInTab(tab.id, extractStoreLinks, STORE_EXTRACTION_CONFIG[storeType]);
      if (!state.mounted) {
        return;
      }

      renderLinks(elements, links);
      updateCount(elements);

      if (links.length === 0) {
        showHint(elements, MESSAGES.empty);
        setStatus(elements, STATUS.empty, 'neutral');
      } else {
        setStatus(elements, `${STORE_LABELS[storeType]} · ${STATUS.ready}`, 'success');
      }
    } catch (error) {
      if (!state.mounted) {
        return;
      }
      console.error('Game Store Link Extractor: extraction failed.', error);
      showError(elements, describeExtractionError(error));
      setStatus(elements, STATUS.failed, 'error');
    } finally {
      state.busy = false;
      if (state.mounted) {
        syncUi();
      }
    }
  }

  const triggerExtraction = () => {
    runExtraction().catch((error) => {
      console.error('Game Store Link Extractor: unexpected failure.', error);
    });
  };

  elements.runButton.addEventListener('click', triggerExtraction);

  elements.resultField.addEventListener('input', () => {
    updateCount(elements);
    syncUi();
  });

  elements.copyButton.addEventListener('click', async () => {
    const text = elements.resultField.value.trim();
    if (!text) {
      return;
    }

    const copied = await copyToClipboard(text, elements.resultField);
    if (!state.mounted) {
      return;
    }

    if (copied) {
      clearNotice(elements);
      setStatus(elements, MESSAGES.copied, 'success');
      flashButtonLabel(elements.copyButton, 'Copied!');
    } else {
      showError(elements, MESSAGES.copyFailed);
    }
  });

  elements.downloadButton.addEventListener('click', () => {
    const text = elements.resultField.value.trim();
    if (!text) {
      return;
    }

    downloadText(text, STORE_BADGES[state.storeType] ?? 'store');
    setStatus(elements, MESSAGES.downloaded, 'success');
    flashButtonLabel(elements.downloadButton, 'Saved!');
  });

  elements.clearButton.addEventListener('click', () => {
    elements.resultField.value = '';
    updateCount(elements);
    clearNotice(elements);
    setStatus(elements, MESSAGES.cleared, 'neutral');
    syncUi();
    elements.resultField.focus();
  });

  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      triggerExtraction();
    }
  });

  window.addEventListener('pagehide', () => {
    state.mounted = false;
  }, { once: true });

  syncUi();
  triggerExtraction();
}

try {
  bootstrap();
} catch (error) {
  console.error('Game Store Link Extractor: popup initialization failed.', error);
  const fallback = document.getElementById('error-msg');
  if (fallback) {
    fallback.textContent = MESSAGES.initializationFailed;
    fallback.dataset.tone = 'error';
    fallback.classList.remove('hidden');
  }
}
