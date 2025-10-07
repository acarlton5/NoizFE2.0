// app.js
// NOIZ Hub + Loader with lifecycle-safe modules and optional per-module CSS loading.
import { getUserByToken } from './module/users.js';

class ModuleHub {
  constructor() {
    this._modules = new Map();    // name -> { api, root, props, ready, meta, cleanups: Set<fn> }
    this._waiters = new Map();    // name -> [resolve(api)]
    this._listeners = new Map();  // event -> Set<fn>
    this.api = new Proxy({}, this._apiProxyHandler());
  }

  /* ---------- Events ---------- */
  on(event, fn) {
    if (!this._listeners.has(event)) this._listeners.set(event, new Set());
    this._listeners.get(event).add(fn);
    return () => this.off(event, fn);
  }
  once(event, fn) {
    const off = this.on(event, (...args) => { off(); fn(...args); });
    return off;
  }
  off(event, fn) {
    const set = this._listeners.get(event);
    if (set) set.delete(fn);
  }
  emit(event, ...args) {
    const set = this._listeners.get(event);
    if (set) for (const fn of set) fn(...args);
  }

  /* ---------- Registry / Capabilities ---------- */
  register(name, api = {}, meta = {}) {
    const entry = this._modules.get(name) || {};
    entry.api = { ...(entry.api || {}), ...api };
    entry.meta = { ...(entry.meta || {}), ...meta };
    entry.ready = true;
    this._modules.set(name, entry);

    const waiters = this._waiters.get(name);
    if (waiters && waiters.length) {
      waiters.forEach(resolve => resolve(entry.api));
      this._waiters.delete(name);
    }

    this.emit(`module:ready:${name}`, entry.api, { name, meta: entry.meta });
    this.emit(`module:ready`, name, entry.api, { name, meta: entry.meta });
  }

  extend(name, partialApi = {}) {
    const entry = this._modules.get(name) || { api: {}, ready: false, cleanups: new Set() };
    entry.api = { ...(entry.api || {}), ...partialApi };
    this._modules.set(name, entry);
    if (entry.ready) this.emit(`module:extended:${name}`, entry.api);
    return entry.api;
  }

  get(name) {
    const entry = this._modules.get(name);
    return entry && entry.ready ? entry.api : undefined;
  }
  async require(name) {
    const existing = this.get(name);
    if (existing) return existing;
    return new Promise(resolve => {
      if (!this._waiters.has(name)) this._waiters.set(name, []);
      this._waiters.get(name).push(resolve);
    });
  }
  isReady(name) {
    const entry = this._modules.get(name);
    return !!(entry && entry.ready);
  }
  list() { return Array.from(this._modules.keys()); }

  /* ---------- Cleanup ---------- */
  _ensureEntry(name) {
    const entry = this._modules.get(name) || {};
    if (!entry.cleanups) entry.cleanups = new Set();
    this._modules.set(name, entry);
    return entry;
  }
  addCleanup(name, fn) {
    const entry = this._ensureEntry(name);
    entry.cleanups.add(fn);
    return () => entry.cleanups.delete(fn);
  }
  async destroy(name) {
    const entry = this._modules.get(name);
    if (!entry) return;
    // run cleanups
    if (entry.cleanups) {
      for (const fn of Array.from(entry.cleanups)) {
        try { fn(); } catch {}
      }
      entry.cleanups.clear();
    }
    // optional: call api.destroy() if provided
    if (entry.api && typeof entry.api.destroy === 'function') {
      try { await entry.api.destroy(); } catch {}
    }
    entry.ready = false;
    this._modules.delete(name);
    this.emit(`module:destroyed:${name}`);
  }

  /* ---------- Calls via "path" ---------- */
  async call(path, ...args) {
    const [ns, ...rest] = path.split('.');
    const fnName = rest.join('.');
    const api = this.get(ns) || await this.require(ns);
    const fn = this._resolvePath(api, fnName);
    if (typeof fn !== 'function') throw new Error(`[NOIZ] hub.call("${path}") not a function`);
    return fn(...args);
  }
  _resolvePath(obj, path) {
    if (!path) return obj;
    return path.split('.').reduce((acc, key) => acc?.[key], obj);
  }

  /* ---------- api Proxy (live, awaitable) ---------- */
  _apiProxyHandler() {
    const hub = this;
    return {
      get(_t, modName) {
        return new Proxy({}, {
          get(_t2, method) {
            return async (...args) => {
              const api = hub.get(modName) || await hub.require(modName);
              const fn = api?.[method];
              if (typeof fn !== 'function') {
                throw new Error(`[NOIZ] hub.api.${String(modName)}.${String(method)} is not a function`);
              }
              return fn(...args);
            };
          }
        });
      }
    };
  }
}

/* ---------- Loader ---------- */
const hub = new ModuleHub();

// Load service modules early so their APIs are available via hub.require().
// Only modules with `services: true` in modules-enabled.json are loaded.
async function loadServices() {
  let config = {};
  try {
    const res = await fetch('/modules-enabled.json');
    config = await res.json();
  } catch (err) {
    console.error('[NOIZ] Failed to load modules-enabled.json', err);
  }

  const enabled = Object.values(config).filter(m => m?.status === 'enabled' && m?.services);
  for (const { name } of enabled) {
    try {
      const svc = await import(`/module/${name}/${name}.service.js`);
      if (typeof svc?.default === 'function') {
        const api = await svc.default({ hub });
        if (api) hub.register(name, api);
      } else if (svc && typeof svc === 'object') {
        hub.register(name, svc);
      }
    } catch (_err) {
      // ignore missing or broken service modules
    }
  }
}
await loadServices();

// Determine the currently mounted main module, ignoring persistent overlays
let activeMainModule =
  document
    .querySelector('main module[data-module]:not([data-module="profile-overlay"])')
    ?.getAttribute('data-module') ||
  null;
async function LoadMainModule(name, props = {}) {
  if (!name) return;

  let targetHash = `#/${name}`;
  if (name === 'profile') {
    const token = props?.user?.token;
    if (token) targetHash = `#/profile/${token}`;
  }
  if (name === 'doc') {
    const slug = props?.slug;
    if (slug) targetHash = `#/doc/${slug}`;
  }
  if (window.location.hash !== targetHash) {
    window.history.pushState(null, '', targetHash);
  }
  const main = document.querySelector('main');
  if (name === activeMainModule) {
    const existing = main.querySelector(`module[data-module="${name}"]`);
    let currentToken;
    let nextToken;
    if (name === 'profile') {
      currentToken = parseProps(existing).user?.token;
      nextToken = props?.user?.token;
    } else if (name === 'doc') {
      currentToken = parseProps(existing).slug;
      nextToken = props?.slug;
    }
    if (currentToken === nextToken) return;
    await hub.destroy(name);
    existing?.remove();
  } else if (activeMainModule) {
    await hub.destroy(activeMainModule);
    main
      .querySelector(`module[data-module="${activeMainModule}"]`)
      ?.remove();
  }
  const node = document.createElement('module');
  node.setAttribute('data-module', name);
  node.setAttribute('data-css', 'true');
  if (props && Object.keys(props).length) {
    node.setAttribute('data-props', JSON.stringify(props));
  }
  main.appendChild(node);
  activeMainModule = name;
}
window.LoadMainModule = LoadMainModule;

function parseProps(node) {
  const raw = node.getAttribute('data-props');
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

const loadedCssHrefs = new Set();
function loadModuleCssOnce(name) {
  const href = `/module/${name}/${name}.css`;
  if (loadedCssHrefs.has(href)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.onload = () => loadedCssHrefs.add(href);
  link.onerror = () => { /* missing CSS is fine */ };
  document.head.appendChild(link);
}

async function mountNode(node) {
  const name = node.getAttribute('data-module');
  if (!name) return;

  // prevent double-mount
  const exists = hub._modules.get(name);
  if (exists?.root) return;

  // optional per-module CSS (toggle via data-css="true")
  if (node.getAttribute('data-css') === 'true') {
    loadModuleCssOnce(name);
  }

  const fileBase = `/module/${name}/${name}.js`;
  try {
    const mod = await import(fileBase);
    const init = mod?.default;
    if (typeof init !== 'function') {
      console.error(`[NOIZ] Module "${name}" missing default export init().`);
      return;
    }

    const entry = hub._modules.get(name) || {};
    entry.root = node;
    entry.props = parseProps(node);
    entry.ready = false;
    if (!entry.cleanups) entry.cleanups = new Set();
    hub._modules.set(name, entry);

    // Scoped helpers for safe listeners and timers
    const controller = new AbortController();
    const onCleanup = (fn) => hub.addCleanup(name, fn);

    // Clean up on destroy: abort listeners
    onCleanup(() => controller.abort());

    const utils = {
      onCleanup,
      // Scoped addEventListener (auto-removed on cleanup)
      listen(el, type, handler, options) {
        el.addEventListener(type, handler, { signal: controller.signal, ...(options || {}) });
      },
      // Event delegation utility
      delegate(el, type, selector, handler, options) {
        const wrapped = (e) => {
          const target = e.target.closest(selector);
          if (target && el.contains(target)) handler(e, target);
        };
        el.addEventListener(type, wrapped, { signal: controller.signal, ...(options || {}) });
      },
      // Scoped interval/timeout
      setInterval(fn, ms) {
        const id = window.setInterval(fn, ms);
        onCleanup(() => clearInterval(id));
        return id;
      },
      setTimeout(fn, ms) {
        const id = window.setTimeout(fn, ms);
        onCleanup(() => clearTimeout(id));
        return id;
      },
      // Optional CSS loader if a module wants to pull CSS itself
      loadCssOnce: () => loadModuleCssOnce(name),
    };

    const api = await init({ hub, root: node, props: entry.props, utils }) || {};
    // If module returns destroy(), ensure it’s called on teardown
    if (typeof api.destroy === 'function') onCleanup(() => api.destroy());
    hub.register(name, api, { mountedAt: Date.now() });
  } catch (err) {
    console.error(`[NOIZ] Failed to load module "${name}" from ${fileBase}`, err);
  }
}

async function mountAll() {
  const nodes = document.querySelectorAll('module[data-module]');
  for (const node of nodes) await mountNode(node);
  hub.emit('mount:complete');
}

const observer = new MutationObserver(muts => {
  muts.forEach(m => {
    m.addedNodes?.forEach(n => {
      if (n.nodeType === 1 && n.tagName.toLowerCase() === 'module' && n.hasAttribute('data-module')) {
        mountNode(n);
      }
    });
  });
});
observer.observe(document.documentElement, { childList: true, subtree: true });

await mountAll();

// Disable native context menu and emit event for custom context modules
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  hub.emit('contextmenu', e);
});

async function handleRoute() {
  const path = window.location.pathname;
  const hash = window.location.hash.slice(1); // remove leading '#'
  const route = hash || path;
  const match = route.match(/^\/([^/]+)(?:\/([^/]+))?/);
  if (match) {
    const mod = match[1];
    const token = match[2];
    if (mod === 'profile') {
      if (token) {
        const user = await getUserByToken(decodeURIComponent(token));
        LoadMainModule('profile', user ? { user } : {});
      } else {
        try {
          const loggedToken = await fetch('/data/logged-in.json').then(r => r.json());
          const user = loggedToken ? await getUserByToken(loggedToken) : null;
          LoadMainModule('profile', user ? { user } : {});
        } catch {
          LoadMainModule('profile');
        }
      }
    } else if (mod === 'doc') {
      if (token) {
        LoadMainModule('doc', { slug: decodeURIComponent(token) });
      } else {
        LoadMainModule('doc');
      }
    } else {
      LoadMainModule(mod);
    }
  }
}
window.addEventListener("popstate", () => { handleRoute(); });
window.addEventListener("hashchange", () => { handleRoute(); });
handleRoute();

// Expose for debugging
window.NOIZ = { hub };
