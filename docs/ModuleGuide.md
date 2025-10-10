# Module Development Guide

This guide explains how to create, structure, and manage modules in the NOIZ runtime. It defines conventions for file organization, API exposure, routing, and cleanup to ensure all modules work predictably and safely within the unified framework.

---

## 🧱 Core Concepts

Each module is **self-contained**. It owns its own UI, API, and routes. Modules communicate with each other only through the **hub**.

```
/module/<name>/<name>.js
/module/<name>/<name>.css
```

> ⚠️ `service.js` files have been retired — all APIs and routes now live in the module’s JS file.

---

## 🧩 Module Structure

Each module exports a single async function `init({ root, hub, router, layout })`.

```js
export default async function init({ root, hub, router, layout }) {
  console.groupCollapsed('[Example] Mounting...');

  // Render UI
  root.innerHTML = `
    <section class="noiz-example">
      <h2>Example Module</h2>
      <button data-act="ping">Ping Hub</button>
    </section>
  `;

  // Handle local events
  root.querySelector('[data-act="ping"]').onclick = async () => {
    const response = await hub.request('example@1.echo', { msg: 'Hello!' });
    console.log(response);
  };

  // Register APIs for others
  const unregister = [];
  unregister.push(
    hub.register('example@1.echo', async ({ msg }) => ({ ok: true, echo: msg }))
  );

  // Optional routes
  router.register({
    path: '#/example',
    onEnter: () => console.log('[Example] Enter'),
    onLeave: () => console.log('[Example] Leave')
  });

  // Cleanup
  return {
    unregister,
    async dispose() {
      console.groupCollapsed('[Example] Disposing...');
      // Remove listeners, timers, etc.
    }
  };
}
```

---

## 🧰 CSS Rules

Each module must have its own `.css` file scoped under `.noiz-<module>`.

```css
.noiz-example {
  padding: 1rem;
}

.noiz-example button {
  background: var(--noiz-accent);
  color: white;
  border-radius: 0.5rem;
}
```

> ❌ Do **not** apply global selectors like `body`, `main`, or `.container` in module CSS.

---

## 🔌 API Guidelines

Modules register APIs using the hub.
Each capability should be versioned and namespaced.

```js
hub.register('quest@1.start', async ({ id }) => startQuest(id));
await hub.request('quest@1.start', { id: 5 });
```

* Namespace = module name.
* Version = `@1`, `@2`, etc.
* Method = feature name.

### Example Pattern

```
[module]@[version].[method]
quest@1.start
quest@1.complete
sidebar@1.toggle
```

Use `hub.unregisterAll(name)` during teardown to remove all handlers registered by the module.

---

## 🗺️ Routing Rules

Modules can register URL routes via the router.
These use hash-based navigation (`#/path`), automatically triggering on change.

```js
router.register({
  path: '#/profile/:user',
  onEnter: ({ user }) => loadProfile(user),
  onLeave: clearProfile
});
```

You can programmatically navigate using:

```js
router.navigate('#/home');
```

---

## 🧭 Layout Interaction

Modules can change or query layout state using the hub.

```js
await hub.request('layout:right:wide');
await hub.request('layout:left:collapse');
await hub.request('layout:immerse:on');
```

| Call                   | Description                               |
| ---------------------- | ----------------------------------------- |
| `layout:left:collapse` | Collapses the server rail                 |
| `layout:left:expand`   | Expands the server rail                   |
| `layout:right:wide`    | Makes right sidebar wide                  |
| `layout:right:hide`    | Hides the right sidebar                   |
| `layout:immerse:on`    | Hides left + channel for immersive layout |

---

## 🔄 Lifecycle Requirements

### Mount

* Called when the module loads.
* Receives `root`, `hub`, `router`, `layout`.
* Should register event handlers and APIs.

### Dispose

* Called when module is unloaded or replaced.
* Must unregister all hub APIs and listeners.
* Should remove any DOM event bindings or observers.

Example:

```js
return {
  unregister,
  async dispose() {
    hub.unregisterAll('example');
    console.log('[Example] disposed');
  }
};
```

---

## 🧹 Cleanup Checklist

Before finalizing a module:

* [ ] All listeners removed.
* [ ] All observers disconnected.
* [ ] All intervals cleared.
* [ ] All hub APIs unregistered.
* [ ] Scoped CSS only.

---

## 🧩 Best Practices

* Use BS5 classes for layout (`row`, `col`, `container-fluid`).
* Use relative units (%, rem) — avoid fixed pixels.
* Always design for mobile-first.
* Keep JS modular and self-contained.
* Avoid direct CSS animations; prefer `prefers-reduced-motion` friendly transitions.

---

## 🧪 Debugging

Use grouped logs to trace lifecycle steps.

```js
console.groupCollapsed('[ModuleName] Lifecycle');
console.log('Mounting UI...');
console.log('Registering APIs...');
console.groupEnd();
```

Use `hub.publish('debug:state', { module, status })` to send module debug info to the console monitor.

---

## ✅ Pre-Merge Review

Before submitting a PR:

* [ ] Module follows naming convention.
* [ ] Scoped CSS only.
* [ ] Uses hub APIs exclusively for communication.
* [ ] Properly cleans up in `dispose()`.
* [ ] Uses grouped logs.
* [ ] Tested all layout states.

> 🧩 Keep modules atomic, descriptive, and clean. Each one should tell its own story.
