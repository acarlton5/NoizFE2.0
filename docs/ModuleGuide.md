# NOIZ Module Development Guide

> **Version:** 1.0
> **Status:** Canonical
> **Audience:** Developers building modular features for NOIZ
> **Maintainers:** NOIZ Interface Systems Team

---

## Overview

The NOIZ platform uses a modular architecture where every feature — from chat and quests to creator dashboards — is implemented as a **module** that plugs into the live **Scaffold** and interacts through the **Hub** and **Real-Time Event System (v1)**.

Each module is self-contained, responsive, and compliant with NOIZ’s UI and event conventions.

---

## Module Structure

A NOIZ module follows a predictable file and metadata structure:

```
/modules/
 └── example-module/
      ├── module.json
      ├── main.js
      ├── style.css
      └── assets/
```

### `module.json`

Defines metadata, dependencies, and mount points.

```json
{
  "name": "example-module",
  "displayName": "Example Module",
  "version": "1.0.0",
  "description": "Demonstrates a scaffold-integrated module.",
  "author": "Interface Systems Team",
  "entry": "main.js",
  "style": "style.css",
  "mount": {
    "target": "main",
    "position": "after"
  },
  "events": ["user.login", "stream.started", "chat.message"]
}
```

### `main.js`

Handles initialization, registration, and event subscription.

```js
NOIZ.module.register("example-module", (ctx) => {
  const el = document.createElement("div");
  el.className = "example-box p-3";
  el.textContent = "Hello from Example Module!";
  ctx.mount(el);

  ctx.on("user.login", (data) => {
    console.log("User logged in:", data.username);
  });
});
```

### `style.css`

Applies scoped visuals, respecting NOIZ’s color system.

```css
.example-box {
  background: var(--c-main);
  border: 1px solid #00000033;
  border-radius: 6px;
  color: var(--c-text);
}
```

---

## Mounting to the Scaffold

Modules are **mounted dynamically** into the existing layout using `data-module` targets defined in the [Scaffolding Standard](./Scaffolding.md).

| Target        | Description                        | Usage                            |
| ------------- | ---------------------------------- | -------------------------------- |
| `main`        | Primary content body               | Most standard modules            |
| `sidebar`     | Chat, stats, or secondary UI       | Modules that complement main     |
| `main-header` | Contextual toolbar or navigation   | Stream title / controls          |
| `nav-pane`    | Server/creator-specific navigation | Optional                         |
| `rail`        | Reserved (cannot be modified)      | ❌ **Do not attach modules here** |

> Modules must *never* alter scaffold geometry or reposition core layout containers.

---

## Event System Integration

Modules communicate through the **NOIZ Real-Time Event System (v1)**, which delivers state changes from both users and system agents.

Each module can **listen to**, **emit**, and **transform** events.

### Listening for Events

```js
ctx.on("chat.message", (payload) => {
  console.log(`[Chat] ${payload.user}: ${payload.text}`);
});
```

### Emitting Events

```js
ctx.emit("user.asset.used", { assetId: "123", type: "sticker" });
```

### Common Event Categories

| Category    | Examples                            |
| ----------- | ----------------------------------- |
| `user.*`    | login, logout, questCompleted       |
| `chat.*`    | message, deleted, cleared           |
| `stream.*`  | started, ended, titleUpdated        |
| `support.*` | subscription, gifted, goalCompleted |

> Refer to [EventsReference.md](./EventsReference.md) for full schema details.

---

## Lifecycle Methods

Modules use lifecycle hooks to safely initialize and unmount.

```js
NOIZ.module.register("example", (ctx) => {
  ctx.onReady(() => console.log("Module ready"));
  ctx.onUnmount(() => console.log("Module destroyed"));
});
```

---

## Dev Bar Testing Presets

The [Scaffolding Demo](./scaffoldDemo.html) includes a built-in **Dev Bar** that allows quick testing of immersion and layout states.

| Preset       | Rail | Nav | Sidebar | Use Case        |
| ------------ | ---- | --- | ------- | --------------- |
| `default`    | ✅    | ✅   | ✅       | Standard mode   |
| `immerse`    | ✅    | ❌   | ✅       | Streaming focus |
| `chat-focus` | ✅    | ✅   | ✅       | Viewer chat UX  |
| `compact`    | ❌    | ❌   | ✅       | Debugging mode  |

You can toggle these states to test how your module behaves in each environment.

> ⚠️ **Policy:** Hiding the Rail is not permitted.
> Any module that attempts to override or disable the Rail will be rejected during review.

---

## Accessibility & Compliance

* Use semantic HTML elements (no div-only interfaces).
* Provide ARIA labels for any custom controls.
* Avoid forcing colors; rely on `var(--c-text)`, `var(--c-main)`, etc.
* All modules must support dark mode by default.
* Respect the platform’s `prefers-reduced-motion` setting.

---

## Certification & Review

Before a module can be included in an official NOIZ release, it must pass validation against these checks:

| Requirement           | Description                                    |
| --------------------- | ---------------------------------------------- |
| ✅ Scaffold Compliance | Uses proper `data-module` targets              |
| ✅ Event Compliance    | Emits and listens only to approved event types |
| ✅ Layout Stability    | Does not alter scaffold geometry               |
| ✅ Accessibility       | Meets ARIA & color contrast requirements       |
| ✅ Responsiveness      | Works at <992px and ≥992px breakpoints         |
| ✅ Performance         | Loads within 300ms on initial render           |

> Modules failing these requirements will not be certified for deployment.

---

## Example: Minimal Module

```js
NOIZ.module.register("toast-tester", (ctx) => {
  const btn = document.createElement("button");
  btn.className = "btn btn-light";
  btn.textContent = "Show Toast";
  btn.onclick = () => ctx.emit("toast.show", { message: "Hello NOIZ!" });
  ctx.mount(btn);
});
```

This example:

* Mounts to the `main` section.
* Emits an event to the notification system (`toast.show`).
* Uses platform theming and Bootstrap utilities.

---

## File References

| File                                         | Purpose                            |
| -------------------------------------------- | ---------------------------------- |
| [`Scaffolding.md`](./Scaffolding.md)         | Layout and structure documentation |
| [`EventsReference.md`](./EventsReference.md) | Complete list of real-time events  |
| [`scaffoldDemo.html`](./scaffoldDemo.html)   | Interactive layout testing sandbox |

---

## Developer Contact

For module integration assistance or review requests, contact:
**Interface Systems Team** — https://discord.gg/wpmuzCMQ
