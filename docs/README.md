# NOIZ Frontend

NOIZ uses a **4-column adaptive scaffold** and **unified single-file module architecture**. Each module controls its own UI, API, and Routes while communicating with others through a central hub. No external dependencies beyond **Bootstrap 5** are required for layout and responsiveness.

---

## 🔧 Architecture Overview

Each module contains:

* **UI** – Renders inside its assigned `<module>` mount point.
* **API** – Exposes functions callable by other modules through the hub.
* **Routes** – Handles deep linking and navigation (`#/c/:channel`, etc.).

### File Layout

```
/module/<name>/
  <name>.js     # UI + API + Routes
  <name>.css    # Scoped CSS only
```

### Runtime Files

```
index.html      # Mount points defined here
app.js          # Scans, loads, and mounts modules dynamically
app.css         # Global scaffold and layout (no module-specific styles)
modules-enabled.json # Optional preload list
```

---

## 🧩 The Core Systems

### `app.js`

The central runtime handles:

* Loading and unloading module JS and CSS dynamically.
* Passing runtime context to each module (`hub`, `router`, `layout`).
* Handling cross-module communication and cleanup.

### `hub`

The **event and API bus** for module communication:

```js
hub.register("quest@1.start", async (data) => {...});
await hub.request("quest@1.start", { id: 42 });
hub.publish("layout:changed", { right: 'wide' });
```

### `router`

Manages hash-based navigation and route bindings:

```js
router.register({ path: '#/profile/:user', onEnter: loadProfile });
router.navigate('#/profile/noizdev');
```

### `layout`

The **layout controller** governs the adaptive 4-column grid used throughout NOIZ.
The grid columns are:

```
rail | channel | main | right
```

Each column can expand, collapse, or hide entirely depending on the app state or active module.

The layout system is driven by CSS body classes managed by `app.js`, and no module should modify them directly. Instead, all state changes must be made via **hub layout requests**.

#### Example usage:

```js
// Collapse the server rail (leftmost column)
await hub.request('layout:left:collapse');

// Expand the right column for wide content, e.g., chat or quest tracking
await hub.request('layout:right:wide');

// Enable immersive layout — hides rail + channel, focuses on main + wide right (used for live streams)
await hub.request('layout:immerse:on');

// Revert immersive mode
await hub.request('layout:immerse:off');
```

#### Notes:

* Layout commands can be combined for complex transitions.
* The system automatically adjusts column widths to maintain fluid spacing.
* Modules can listen for layout changes using `hub.subscribe('layout:changed', cb)`.
* The goal is **dynamic modular adaptability**: if one part hides, others fluidly expand.

---

## 🧠 Module Principles

| Rule               | Description                                                |
| ------------------ | ---------------------------------------------------------- |
| **Isolation**      | Each module owns only its own DOM root.                    |
| **Communication**  | Use hub requests/events for all cross-module interactions. |
| **Scoped CSS**     | Only style within your `.noiz-<module>` namespace.         |
| **Cleanup**        | Return `dispose()` and unregister functions.               |
| **Versioned APIs** | Example: `questbar@1.setProgress`.                         |

---

## 🏗️ Scaffolding System

Adaptive 4-column layout controlled via CSS variables:

```
rail | channel | main | right
```

* Collapsible and resizable columns.
* Dynamic presets (like `immerse` for live streaming).
* Body classes define current layout state (handled by layout controller).

Example states:

```js
await hub.request('layout:set', { left: 'collapsed', right: 'wide' });
await hub.request('layout:immerse:on');
```

---

## 🚀 Quick Start (Hello NOIZ)

```js
// /module/example/example.js
export default async function init({ root, hub }) {
  root.innerHTML = `<button class="btn btn-primary">Ping!</button>`;
  root.querySelector('button').onclick = async () => {
    const res = await hub.request('example@1.ping', { msg: 'Hello NOIZ' });
    alert(res.echo);
  };

  const unregister = [hub.register('example@1.ping', async ({ msg }) => ({ echo: msg }))];
  return { unregister, dispose() { console.log('example disposed'); } };
}
```

---

## 🧩 Key Directories

| Path       | Description                              |
| ---------- | ---------------------------------------- |
| `/module/` | All app modules live here.               |
| `/docs/`   | Developer and contributor documentation. |
| `/assets/` | Shared images, fonts, and icons.         |
| `/`        | Root files (index.html, app.js, etc.).   |

---

## 🧭 Next Steps

1. Read `AGENTS.md` for details on lifecycle and system internals.
2. See `ModuleGuide.md` for creating your first module.
3. Check `Scaffolding.md` for understanding layout behavior.
4. Reference `EventsReference.md` for all hub and layout events.

---

> 💡 **Tip:** The goal is modular simplicity. If you need to talk to another module — ask the hub, not the DOM.
