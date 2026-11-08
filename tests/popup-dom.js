// Small DOM double for driving the popup controller outside a browser.
// Only the surface used by src/popup/* is implemented.
class FakeNode {
  constructor(id = '') {
    this.id = id;
    this.textContent = '';
    this.value = '';
    this.disabled = false;
    this.hidden = false;
    this.dataset = {};
    this.attributes = {};
    this.listeners = new Map();
    const classes = new Set();
    this.classList = {
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name),
      contains: (name) => classes.has(name),
    };
  }

  addEventListener(type, handler) {
    const handlers = this.listeners.get(type) ?? [];
    handlers.push(handler);
    this.listeners.set(type, handlers);
  }

  dispatch(type, event = {}) {
    return Promise.all((this.listeners.get(type) ?? []).map((handler) => handler(event)));
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }

  getAttribute(name) {
    return this.attributes[name] ?? null;
  }

  focus() {}
  select() {}
  remove() {}
  click() { return this.dispatch('click'); }
}

export function createPopupDom() {
  const ids = [
    'run', 'copy', 'download', 'clear', 'theme-toggle',
    'status', 'store-label', 'count', 'result', 'error-msg',
  ];
  const elements = Object.fromEntries(ids.map((id) => [id, new FakeNode(id)]));
  elements['error-msg'].classList.add('hidden');

  const listeners = new FakeNode('root');
  const created = [];
  const storage = new Map();

  const document = {
    documentElement: new FakeNode('html'),
    body: { append: () => {} },
    getElementById: (id) => elements[id] ?? null,
    createElement: (tag) => {
      const node = new FakeNode(tag);
      created.push(node);
      return node;
    },
    execCommand: () => true,
    addEventListener: (type, handler) => listeners.addEventListener(type, handler),
  };

  const window = {
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    addEventListener: (type, handler) => listeners.addEventListener(type, handler),
  };

  const localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  };

  return { elements, document, window, localStorage, created, listeners, storage };
}
