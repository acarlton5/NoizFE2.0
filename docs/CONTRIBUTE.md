# Contributing to NOIZ

Welcome to the **NOIZ Modular Frontend Runtime** project! 🌀
This document explains how to set up your local environment, create and test modules, and submit contributions correctly.

---

## 🧱 Overview

NOIZ uses a **modular runtime architecture** built on **Bootstrap 5**, powered by a unified `app.js` loader and a shared event/API hub.
Each module lives in its own folder and manages its own UI, API, and routing — isolated yet able to communicate through the hub.

### Folder Structure

```
/module/<name>/<name>.js
/module/<name>/<name>.css
/docs/
```

> ⚠️ No more `services.js` files — all logic, routes, and APIs are unified into the main module JS file.

---

## 🧰 Local Setup

### Requirements

* **Node.js 20+**
* **NPM** or **PNPM**
* A local server such as `live-server` or `vite`.

### Steps

```bash
npm install
npm run dev
```

This runs a local server and watches for file changes.

---

## 🧩 Creating a Module

Every module must export a **default async function** with the following signature:

```js
export default async function init({ root, hub, router, layout }) {
  // mount UI
  root.innerHTML = `<section class="noiz-example">Hello</section>`;

  // register an API capability
  const unregister = [];
  unregister.push(hub.register('example@1.echo', async (data) => data));

  return {
    unregister,
    async dispose() {
      // teardown logic
    }
  };
}
```

### Rules

* **Return** `{ unregister, dispose }`.
* **Scope CSS** under `.noiz-<name>` to avoid global leaks.
* Never modify global DOM elements outside your `root`.

---

## 🛰️ Communication Between Modules

Modules communicate via the **Hub** API:

```js
hub.request('quest@1.start', { questId });
hub.publish('ui:notification', { message: 'Quest started!' });
```

### Guidelines

* Always **namespace** your APIs: `module@version.method`.
* Never directly manipulate another module’s DOM.
* Use `hub.unregisterAll(name)` in `dispose()` for cleanup.

---

## 🧭 Layout Control

Use hub requests to manipulate layout states dynamically.

```js
await hub.request('layout:left:collapse');
await hub.request('layout:right:wide');
await hub.request('layout:immerse:on');
```

### Common States

| Column  | Options          | Description                               |
| ------- | ---------------- | ----------------------------------------- |
| Left    | `collapsed`      | Collapses the rail.                       |
| Channel | `hidden`         | Hides the channel sidebar.                |
| Right   | `wide`, `hidden` | Expands or hides right column.            |
| Preset  | `immerse`        | Hides left + channel for streaming focus. |

---

## 🧪 Testing & Debugging

* Use `console.groupCollapsed('[ModuleName]')` for lifecycle logs.
* Avoid noisy unscoped logs.
* Log all lifecycle steps: mount, render, register, route, dispose.

Example:

```js
console.groupCollapsed('[Quest] Mounting');
console.log('Registering routes...');
console.groupEnd();
```

---

## 🧹 Cleanup Discipline

* Clear all intervals, observers, and listeners in `dispose()`.
* Use `hub.unregisterAll(name)` for full cleanup.
* Never leave stale listeners or state.

---

## 🧩 Linting & Code Style

* 2-space indentation.
* Semicolons required.
* CamelCase for variables.
* `PascalCase` for modules.
* Follow **Conventional Commits**:

  * `feat:` new feature
  * `fix:` bug fix
  * `refactor:` internal improvement
  * `docs:` documentation update

---

## 🧱 Pull Requests

Each PR must:

* Pass `npm run lint`.
* Contain **scoped CSS** and self-contained module files.
* Update relevant documentation under `/docs`.
* Avoid touching core files (`app.js`, `index.html`, `app.css`) unless absolutely required.

### PR Title Format

```
feat(module): add quest progress bar
fix(router): correct param parsing
```

---

## 🔒 Security & Isolation Rules

* No direct network calls outside platform endpoints.
* No `eval()` or inline `<script>` tags.
* Avoid global `window` assignments.
* Use **hub**, **router**, or **layout** for all communication.

---

## 📘 Documentation Contributions

All new features or modules must include matching docs in `/docs`.

Each doc should:

* Use Markdown (`.md`).
* Be tagged with its role (`Guide`, `Policy`, `Reference`).
* Include usage examples.

---

## 🏁 Summary

* Modules are **self-contained** and **scoped**.
* Cross-module interactions happen only through **hub APIs**.
* Layout is controlled centrally by **hub → layout** requests.
* Logging is structured, not spammy.
* Documentation is mandatory for new capabilities.

> 🧩 Remember: A module should mount clean, run clean, and dispose clean — no leftovers, no globals.
