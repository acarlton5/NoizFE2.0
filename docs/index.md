# NOIZ Developer Documentation Index

Welcome to the **NOIZ Runtime Documentation Suite**.
This index links to all major contributor and developer guides that define how modules, layout, and runtime events work.

---

## 📘 Core Documents

| Document                                 | Purpose                                                                   |
| ---------------------------------------- | ------------------------------------------------------------------------- |
| [README.md](README.md)                   | Overview of the NOIZ modular architecture and project purpose.            |
| [CONTRIBUTE.md](CONTRIBUTE.md)           | Contribution rules, environment setup, PR and linting standards.          |
| [AGENTS.md](AGENTS.md)                   | Internal agent (module) structure, lifecycle, and communication policy.   |
| [ModuleGuide.md](ModuleGuide.md)         | In-depth reference for writing modules — UI, API, routing, and cleanup.   |
| [Scaffolding.md](Scaffolding.md)         | Explanation of the 4-column layout, layout presets, and hub interactions. |
| [EventsReference.md](EventsReference.md) | Complete event and hub API list for communication between modules.        |

---

## 🧩 Module Architecture Summary

NOIZ operates on a modular runtime:

* Each `<module data-module="name">` tag dynamically loads a module JS and CSS file.
* Modules expose optional API and routing capabilities through the **Hub**.
* Layout and lifecycle are automatically handled by `app.js`.

| Layer      | Role                                                             |
| ---------- | ---------------------------------------------------------------- |
| **Hub**    | Core event and API bus for inter-module communication.           |
| **Router** | Hash-based navigation system.                                    |
| **Layout** | Controls column visibility, width, and preset states.            |
| **App.js** | Bootstraps modules, manages unloads, and logs state transitions. |

---

## 🧭 Quick Reference Commands

### Layout Manipulation

```js
await hub.request('layout:left:collapse');
await hub.request('layout:right:wide');
await hub.request('layout:immerse:on');
```

### Hub API Communication

```js
hub.register('quest@1.start', async (payload) => {...});
hub.request('quest@1.start', { id: 1 });
```

### Module Lifecycle

```js
return {
  unregister,
  async dispose() {
    hub.unregisterAll('example');
  }
};
```

---

## 🧱 Developer Workflow

1. Run a local server (e.g., `vite` or `live-server`).
2. Modify or add modules in `/modules/<name>/`.
3. Test layout transitions using hub layout APIs.
4. Verify cleanup, routing, and event registration.
5. Submit PR following `CONTRIBUTE.md`.

---

## 🧭 Suggested Reading Order

1. **README.md** — High-level understanding.
2. **Scaffolding.md** — Learn the layout system.
3. **ModuleGuide.md** — Build and integrate a module.
4. **AGENTS.md** — Understand lifecycle and API consistency.
5. **EventsReference.md** — Explore available events.
6. **CONTRIBUTE.md** — Review PR standards.

---

> 🌀 The NOIZ framework is designed for **modularity**, **clarity**, and **safety**.
> Every module is replaceable, composable, and never interferes with another.
> Build clean. Log clean. Dispose clean.
