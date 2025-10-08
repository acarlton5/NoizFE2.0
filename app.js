(() => {
  const apis = new Map();
  const routes = new Map();
  const guards = new Map();
  const jsCache = new Map();
  const cssLinks = new Set();

  const hub = {
    register(name, api) { if (name) apis.set(name, Object.freeze(api || {})); },
    api: (name) => apis.get(name),

    registerRoute(path, handler, { allow } = {}) {
      routes.set(path, handler);
      if (allow) guards.set(path, { allow });
    },

    navigate(path) {
      if (!path.startsWith('#')) path = '#/' + path.replace(/^#?\/?/, '');
      location.hash = path;
    },

    emit(type, detail) { window.dispatchEvent(new CustomEvent(type, { detail })); },
    on(type, fn) { window.addEventListener(type, fn); return () => window.removeEventListener(type, fn); },

    async loadModule(name, mountPoint, props = {}) {
      await ensureCss(name);
      const mod = await ensureJs(name);
      if (mountPoint && mod?.init) await mod.init({ root: mountPoint, props, hub });
      return mod;
    },
    unload(mountPoint) { if (mountPoint) mountPoint.innerHTML = ''; }
  };

  Object.defineProperty(window, 'noiz', { value: { hub }, writable: false });

  const jsPath  = (n) => `./module/${n}/${n}.js`;
  const cssHref = (n) => `./module/${n}/${n}.css`;

  async function ensureCss(name) {
    const href = cssHref(name);
    if (cssLinks.has(href)) return;
    try {
      const res = await fetch(href, { method: 'HEAD', cache: 'no-store' });
      if (!res.ok) return; // no css file -> skip
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onerror = () => link.remove();
      document.head.appendChild(link);
      cssLinks.add(href);
    } catch { /* ignore */ }
  }

  async function ensureJs(name) {
    if (jsCache.has(name)) return jsCache.get(name);
    let mod;
    try {
      mod = (await import(/* @vite-ignore */ jsPath(name))).default;
    } catch (e) {
      console.error(`[noiz] failed to import module "${name}"`, e);
      return null;
    }
    if (!mod || typeof mod !== 'object') {
      console.warn(`[noiz] module "${name}" must default-export an object { init, api?, routes? }`);
      return null;
    }
    if (typeof mod.api === 'function') hub.register(name, mod.api(hub) || {});
    if (typeof mod.routes === 'function') {
      for (const r of (mod.routes(hub) || [])) hub.registerRoute(r.path, r.handler, { allow: r.allow });
    }
    jsCache.set(name, mod);
    return mod;
  }

  async function mountTag(el) {
    const name = el.dataset.module?.trim();
    if (!name) return;
    await ensureCss(name);
    const mod = await ensureJs(name);
    if (!mod?.init) return;

    let props = {};
    if (el.dataset.props) { try { props = JSON.parse(el.dataset.props); } catch {} }

    try { await mod.init({ root: el, props, hub }); }
    catch (e) { console.error(`[noiz] init failed for "${name}"`, e); }
  }

  function scanAndMount(root = document) {
    root.querySelectorAll('module[data-module]').forEach(mountTag);
  }

  function parseHash() {
    const raw = location.hash.replace(/^#\/?/, '');
    const [p, q] = raw.split('?');
    const params = Object.fromEntries(new URLSearchParams(q || ''));
    return { path: '/' + (p || ''), params };
  }

  async function onRoute() {
    const { path, params } = parseHash();
    const handler = routes.get(path);
    if (!handler) return;
    const gate = guards.get(path);
    if (gate?.allow && gate.allow({ hub, params }) === false) return;
    try { await handler({ params, hub }); }
    catch (e) { console.error('[noiz] route error', path, e); }
  }

  (async function boot() {
    scanAndMount();
    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        m.addedNodes.forEach((n) => {
          if (n.nodeType === 1) {
            if (n.matches?.('module[data-module]')) mountTag(n);
            scanAndMount(n);
          }
        });
      }
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    window.addEventListener('hashchange', onRoute);
    onRoute();
  })();
})();
