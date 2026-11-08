export async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab ?? null;
}

export async function executeInTab(tabId, injectedFunction, ...args) {
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    func: injectedFunction,
    args,
  });

  // Only the top frame is targeted, but the API still returns one entry per frame.
  const value = results?.[0]?.result;
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];
}
