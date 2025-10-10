# AGENTS — NOIZ Runtime & Module Lifecycle

This document explains how **app.js**, the **hub**, the **router**, and the **layout controller** work together to mount and coordinate modules. It reflects the **unified single-file module model**: each module implements UI, API, and Routes in one JS file.

---

## 🧠 Mental Model

* `index.html` declares mount points via `<module data-module="name">`.
* `app.js` scans those tags and loads `/module/<name>/<name>.js` and `/module/<name>/<name>.css`.
* Each module’s `default export init({ root, hub, router, layout })` is called.
* Modules **own only their root**. Cross-module communication happens via **hub APIs** and **events**.

---

## 🧩 app.js Responsibilities

1. **Discovery & Mounting**

   * Query all `<module[data-module]>` elements in `index.html`.
   * Attach module CSS (`/module/<name>/<name>.css`) if present.
   * Dynamically import module JS (`/module/<name>/<name>.js`).
   * Call `init()` with `{ root, hub, router, layout }`.

2. **Lifecycle Management**

   * Keep a registry of mounted modules and their disposers.
   * On teardown, call `dispose()`, run all `unregister` functions, and detach CSS.
   * Publish lifecycle events: `module:ready` and `module:teardown`.

3. **Shared Systems**

   * Provide the **hub** (APIs + pub/sub).
   * Provide the **router** (hash-based; `#/x/:id`).
   * Provide the **layout controller** (authoritative layout state & helpers).

4. **Error Isolation**

   * Modules that fail to mount are logged and skipped.
   * The app never hard-crashes due to a single module.

---

## 🔌 Hub — Capability & Event Bus

### API (request/response)

```js
const off = hub.register("namespace:feature@1.method", async (payload) => {
  // ... do work ...
  return { ok: true, data };
});

const res = await hub.request("namespace:feature@1.method", { foo: "bar" });
```

* **Register** returns an **unregister** function; store it and call during `dispose()`.
* **Version your APIs** (`@1`) to avoid breaking changes.
* **unregisterAll(name)** is automatically called when a module unmounts.

### Pub/Sub

```js
const unsub = hub.subscribe("quest:progress", (data) => { /* update UI */ });
hub.publish("quest:progress", { xp, goal });
```

* Avoid noisy global topics; prefer namespacing: `ui:*`, `quest:*`, `sidebar:*`.

---

## 🗺️ Router — Hash-based Navigation

### Register Routes

```js
router.register({
  path: "#/c/:channel",
  onEnter: ({ channel }) => loadChannel(channel),
  onLeave: () => saveScroll()
});
```

* Parameter tokens `:name` are exposed via `params`.
* Multiple modules can register routes. The first match wins.

### Navigate Programmatically

```js
router.navigate("#/c/general");
```

### Router Event

* `router:changed` `{ hash, params }` is published by the runtime after a successful navigation.

---

## 🧱 Layout Controller — Authoritative State

Modules **never** set `body.classList` directly. Use hub APIs to manipulate layout.

### Core API

```js
await hub.request("layout:set", { left, chan, right, preset });
```

| Parameter | Type                  | Description                        |
| --------- | --------------------- | ---------------------------------- |
| `left`    | `'collapsed'`         | Collapse or expand rail.           |
| `chan`    | `'hidden'`            | Hide or show channel sidebar.      |
| `right`   | `'hidden'` | `'wide'` | Hide, show, or widen right column. |
| `preset`  | `'immerse'`           | Applies immersive layout preset.   |

### Shorthand Helpers

```js
await hub.request("layout:left:collapse");
await hub.request("layout:left:expand");
await hub.request("layout:chan:hide");
await hub.request("layout:chan:show");
await hub.request("layout:right:hide");
await hub.request("layout:right:show");
await hub.request("layout:right:wide");
await hub.request("layout:immerse:on");
await hub.request("layout:immerse:off");
```

### Change Notifications

* Runtime publishes `layout:changed` with the current class flags so listeners can adapt.

| Class            | Effect                                              |
| ---------------- | --------------------------------------------------- |
| `left-collapsed` | Collapses the rail column.                          |
| `chan-hidden`    | Hides the channel sidebar.                          |
| `right-hidden`   | Hides the right column.                             |
| `right-wide`     | Expands the right column for chat or quests.        |
| `immerse`        | Hides rail + channel; focuses on main + wide right. |

---

## 🧬 Module File (Unified) — Structure & Lifecycle

**Path:** `/module/<name>/<name>.js`

```js
export default async function init({ root, hub, router, layout }) {
  console.groupCollapsed('[Example] Mounting module...');

  // 1) UI — render and wire events
  root.innerHTML = `
    <section class="noiz-<name>">
      <button data-act="go-wide">Right Wide</button>
      <div class="questbar" data-questbar hidden>
        <div class="fill" data-qb-fill></div>
      </div>
    </section>
  `;

  root.querySelector('[data-act="go-wide"]').onclick = () => hub.request('layout:right:wide');

  // 2) API — register capabilities for others to call
  const unregister = [];
  unregister.push(hub.register("<name>@1.ping", async ({ msg }) => ({ ok: true, echo: msg })));

  // 3) Routes — optional
  router.register({
    path: "#/example",
    onEnter: () => console.log('[Example] Enter route'),
    onLeave: () => console.log('[Example] Leave route')
  });

  // 4) Teardown — clean listeners/timers; unregister APIs
  return {
    unregister,
    async dispose() {
      console.groupCollapsed('[Example] Disposing module...');
      // remove observers, intervals, etc.
    }
  };
}
```

**CSS:** `/module/<name>/<name>.css` — scope selectors (e.g., `.noiz-<name>`) and avoid globals.

---

## 🔒 Ownership & Security Rules

* **View ownership**: a module renders only within its `root`.
* **Data ownership**: the module that registers an API is the source of truth for that domain.
* **Cross-module access**: call capabilities; do not query or mutate other modules’ DOM.
* **Slots**: shared surfaces (e.g., channel sidebar top) must expose explicit APIs to accept external content. The surface owner decides rendering.

---

## 🧹 Teardown Discipline

Every module must:

* Return `{ unregister, dispose }` and clear all listeners/observers.
* Use `hub.unregisterAll(<name>)` for global cleanup if supported.
* Avoid leaving timers, intervals, or pending requests running.

---

## 🧪 Logging & Debugging

* Prefix all console messages with `[ModuleName]`.
* Use `console.groupCollapsed()` for lifecycle groups (mounting, routing, disposing).
* Avoid raw `console.log()` spam.
* Keep debug messages descriptive (e.g., `[Quest] updated progress 0.4`).

---

## 🔁 Lifecycle Events (Emitted by Runtime)

* `module:ready` `{ name }` — after module UI + API are registered.
* `module:teardown` `{ name }` — when a module is disposed.
* `router:changed` `{ hash, params }` — on successful navigation.
* `layout:changed` `{ classFlags }` — after layout update.

---

## ✅ Checklists

**Before mounting a new module:**

* [ ] File path is `/module/<name>/<name>.js` and `/module/<name>/<name>.css`.
* [ ] All selectors are scoped under `.noiz-<name>`.
* [ ] APIs are versioned (`@1`) and namespaced.

**Before merging a PR:**

* [ ] No sibling DOM access.
* [ ] `dispose()` cleans everything.
* [ ] Module works in all layout states.
* [ ] Keyboard/focus flows are preserved.
* [ ] No module CSS leaked into global scaffold.
* [ ] Console logs are grouped and prefixed.
