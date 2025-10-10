/* =====================================================================
   NOIZ APP CORE (Unified Module Model w/ Console Logging + Layout Helpers)
   ===================================================================== */

const NOIZ = (function () {
  const log = (...args) => console.log("%c[NOIZ]", "color:#F907FC;font-weight:bold", ...args);

  /* ----------------------- tiny event hub ------------------------ */
  const topics = new Map();
  const apis = new Map();

  function publish(topic, payload) {
    log("📢 publish →", topic, payload);
    const subs = topics.get(topic);
    if (!subs) return;
    for (const fn of subs) try { fn(payload); } catch (e) { console.error(e); }
  }
  function subscribe(topic, fn) {
    if (!topics.has(topic)) topics.set(topic, new Set());
    topics.get(topic).add(fn);
    log("👂 subscribed to", topic);
    return () => {
      topics.get(topic)?.delete(fn);
      log("❌ unsubscribed from", topic);
    };
  }

  function register(name, fn) {
    if (apis.has(name)) console.warn("[hub] ⚠ overriding API:", name);
    apis.set(name, fn);
    log("🧩 registered API:", name);
    return () => {
      apis.delete(name);
      log("🗑️ unregistered API:", name);
    };
  }

  async function request(name, payload) {
    log("📡 request →", name, payload);
    const fn = apis.get(name);
    if (!fn) throw new Error(`[hub] ❌ API not found: ${name}`);
    const res = await fn(payload ?? {});
    log("✅ response ←", name, res);
    return res;
  }

  /* ------------------------- router ------------------------------ */
  const routes = [];
  let current = null;

  function registerRoute(def) {
    routes.push(def);
    log("🗺️ registered route:", def.path);
    return () => {
      const i = routes.indexOf(def);
      if (i >= 0) routes.splice(i, 1);
      log("🗑️ unregistered route:", def.path);
    };
  }

  function matchRoute(hash) {
    for (const r of routes) {
      const rx = new RegExp("^" + r.path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        .replace(/:([a-zA-Z0-9_]+)/g, "(?<$1>[^/]+)") + "$");
      const m = rx.exec(hash);
      if (m) return { def: r, params: m.groups ?? {} };
    }
    return null;
  }

  async function navigate(toHash) {
    log("🧭 navigating →", toHash);
    const target = matchRoute(toHash || location.hash || "#/");
    if (!target) return log("⚠ no route matched for", toHash);

    if (current?.def?.onLeave) {
      log("🚪 leaving route:", current.def.path);
      try { await current.def.onLeave(current.params); } catch (e) { console.error(e); }
    }
    current = target;
    if (current.def.onEnter) {
      log("🚪 entering route:", current.def.path, current.params);
      try { await current.def.onEnter(current.params); } catch (e) { console.error(e); }
    }
    publish("router:changed", { hash: toHash, params: current.params });
  }

  window.addEventListener("hashchange", () => navigate(location.hash));

  /* ---------------------- css loader ----------------------------- */
  const cssLinks = new Map();

  function attachCSS(name, href) {
    if (cssLinks.has(name)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.module = name;
    document.head.appendChild(link);
    cssLinks.set(name, link);
    log(`🎨 CSS attached for ${name} (${href})`);
  }
  function detachCSS(name) {
    const link = cssLinks.get(name);
    if (link) {
      link.remove();
      cssLinks.delete(name);
      log(`🧽 CSS detached for ${name}`);
    }
  }

  /* ---------------------- layout controller ---------------------- */
  const LAYOUT = {
    set(partial = {}) {
      const body = document.body;
      const classes = new Set(body.className.split(/\s+/).filter(Boolean));
      function on(c, yes) { yes ? classes.add(c) : classes.delete(c); }

      if (partial.preset === "immerse") {
        classes.clear(); classes.add("immerse");
        log("🎬 Layout preset: IMMERSIVE");
      } else {
        if ("left" in partial) on("left-collapsed", partial.left === "collapsed");
        if ("chan" in partial) on("chan-hidden", partial.chan === "hidden");
        if ("right" in partial) {
          on("right-hidden", partial.right === "hidden");
          on("right-wide", partial.right === "wide");
          if (partial.right === "hidden") classes.delete("right-wide");
        }
      }
      body.className = Array.from(classes).join(" ");
      const state = Object.fromEntries([...classes].map(c => [c, true]));
      publish("layout:changed", state);
      log("🧱 layout set:", [...classes]);
      return state;
    }
  };

  // Base API
  register("layout:set", async (payload) => (LAYOUT.set(payload), { ok: true }));

  // ---------- Shorthand helper APIs (monkey-proof) ----------
  // Left rail
  register("layout:left:collapse", async () => ({ ok:true, state: LAYOUT.set({ left:"collapsed" }) }));
  register("layout:left:expand",   async () => ({ ok:true, state: LAYOUT.set({ left:undefined }) }));

  // Channel sidebar
  register("layout:chan:hide",     async () => ({ ok:true, state: LAYOUT.set({ chan:"hidden" }) }));
  register("layout:chan:show",     async () => ({ ok:true, state: LAYOUT.set({ chan:undefined }) }));

  // Right sidebar
  register("layout:right:hide",    async () => ({ ok:true, state: LAYOUT.set({ right:"hidden" }) }));
  register("layout:right:show",    async () => ({ ok:true, state: LAYOUT.set({ right:undefined }) }));
  register("layout:right:wide",    async () => ({ ok:true, state: LAYOUT.set({ right:"wide" }) }));

  // Preset: Immerse (live)
  register("layout:immerse:on",    async () => ({ ok:true, state: LAYOUT.set({ preset:"immerse" }) }));
  register("layout:immerse:off",   async () => ({ ok:true, state: LAYOUT.set({ left:undefined, chan:undefined, right:undefined }) }));

  /* ---------------------- module loader -------------------------- */
  const mounts = [];

  async function loadModule(name, el) {
    log(`🚀 Loading module: ${name}`);

    attachCSS(name, `module/${name}/${name}.css`);

    let mod;
    try {
      mod = await import(`./module/${name}/${name}.js`);
      log(`📦 Imported module: ${name}`);
    } catch (e) {
      console.error(`[module] ❌ failed to import ${name}`, e);
      detachCSS(name);
      return;
    }

    if (typeof mod.default !== "function") {
      console.error(`[module] ${name} missing default export`);
      return;
    }

    const api = await mod.default({
      root: el,
      hub: { publish, subscribe, register, request },
      router: {
        register: (def) => registerRoute({ ...def, module: name }),
        navigate: (hash) => navigate(hash)
      },
      layout: LAYOUT
    });

    const dispose = async () => {
      log(`🧹 Disposing module: ${name}`);
      try { api?.dispose && (await api.dispose()); } catch (e) { console.error(e); }
      if (Array.isArray(api?.unregister)) {
        for (const off of api.unregister) try { off(); } catch {}
      }
      detachCSS(name);
    };

    mounts.push({ name, el, dispose });
    publish("module:ready", { name });
    log(`✅ Module ready: ${name}`);
    return { dispose };
  }

  async function unloadAll() {
    log("🧩 Unloading all modules...");
    while (mounts.length) {
      const m = mounts.pop();
      await m.dispose();
      publish("module:teardown", { name: m.name });
      log(`💥 Module torn down: ${m.name}`);
    }
  }

  /* --------------------- public surface -------------------------- */
  return {
    hub: { publish, subscribe, register, request },
    css: { attachCSS, detachCSS },
    router: { register: registerRoute, navigate },
    layout: LAYOUT,
    boot: async function boot() {
      log("🟢 Booting NOIZ app...");
      const points = [...document.querySelectorAll("module[data-module]")];
      for (const mp of points) {
        const name = mp.dataset.module?.trim();
        if (!name) continue;
        await loadModule(name, mp);
      }
      await navigate(location.hash || "#/");
      log("🎉 NOIZ boot complete!");
    },
    unloadAll
  };
})();

window.NOIZ = NOIZ;
NOIZ.boot().catch(err => console.error("Boot failed", err));
