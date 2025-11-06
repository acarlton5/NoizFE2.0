# NOIZ Module Development Guide

> **Version:** 1.0
> **Status:** Canonical
> **Audience:** Developers building modular features for NOIZ
> **Maintainers:** NOIZ Interface Systems Team

---

## Overview

The NOIZ platform is built from **modules** that mount into the **Scaffold**, coordinate state via the **Hub**, and react to the **RITES** (**R**ight-**I**n-**T**ime **E**vent **S**ystem).

Each module is self-contained, responsive, accessible, and certified against NOIZ standards.

---

## Module Structure

```
/modules/
 └── example-module/
      ├── module.json
      ├── main.js
      ├── style.css
      └── assets/
```

### `module.json`

```json
{
  "name": "example-module",
  "displayName": "Example Module",
  "version": "1.0.0",
  "description": "Demonstrates a scaffold-integrated module.",
  "entry": "main.js",
  "style": "style.css",
  "mount": { "target": "main", "position": "after" },
  "events": ["user.login", "stream.started", "chat.message"],
  "requires": { "rites": ">=1.0.0 <2.0.0" }
}
```

### `main.js`

```js
NOIZ.module.register("example-module", (ctx) => {
  const el = document.createElement("div");
  el.className = "example-box p-3";
  el.setAttribute("role", "region");
  el.setAttribute("aria-label", "Example Module");
  el.textContent = "Hello from Example Module!";
  ctx.mount(el); // Mounts into module.json.mount.target (default: main)

  // RITES subscriptions
  ctx.on("user.login", (u) => console.log("Welcome", u.username));
  ctx.on("chat.message", (m) => console.log(`[Chat] ${m.user}: ${m.text}`));

  // Emit RITES events
  el.addEventListener("click", () => ctx.emit("toast.show", { message: "Hi from module" }));

  ctx.onReady(() => {/* post-mount work */});
  ctx.onUnmount(() => {/* cleanup */});
});
```

### `style.css`

```css
.example-box{
  background: var(--c-main);
  color: var(--c-text);
  border: 1px solid #00000033;
  border-radius: .5rem;
}
```

---

## Mounting to the Scaffold

Use **data-module targets** defined in [Scaffolding.md](./Scaffolding.md):

| Target        | Description               | Typical Use              |
| ------------- | ------------------------- | ------------------------ |
| `main`        | Primary content region    | Core feature UIs         |
| `sidebar`     | Secondary column          | Chat, stats, tools       |
| `main-header` | Toolbar/header above main | Titles, quick actions    |
| `nav-pane`    | Context navigation        | Channel/sections nav     |
| `rail`        | **Reserved**              | ❌ Do not mount or modify |

> Modules must **not** reposition, hide, or resize scaffold containers.

---

## RITES Integration

**RITES** delivers context-aware events only when relevant.

### Listen

```js
ctx.on("stream.started", (info) => { /* update UI */ });
```

### Emit

```js
ctx.emit("asset.used", { itemId: "sticker_fox01" });
```

### Wildcards

```js
ctx.on("stream.*", handleStreamEvents);
```

See the full catalog in [EventsReference.md](./EventsReference.md).

---

## Lifecycle Hooks

```js
NOIZ.module.register("id", (ctx) => {
  ctx.onReady(() => {/* DOM is mounted */});
  ctx.onUnmount(() => {/* remove timers, listeners */});
});
```

---

## Dev Bar Presets (scaffoldDemo.html)

The demo includes a floating Dev Bar:

| Preset       | Rail | Nav | Sidebar    | Use Case      |
| ------------ | ---- | --- | ---------- | ------------- |
| `default`    | ✅    | ✅   | ✅          | Baseline      |
| `immerse`    | ✅    | ❌   | ✅ (wider)  | Stream focus  |
| `chat-focus` | ✅    | ✅   | ✅ (wider)  | Chat emphasis |
| `compact`    | ❌    | ❌   | ✅ (narrow) | Debug/minimal |

> **Policy:** Hiding the **Rail** is not permitted by modules. The compact preset exists for internal debugging only.

---

## Accessibility & UX

* Semantic HTML; label interactive controls.
* Provide ARIA where needed; respect `prefers-reduced-motion`.
* Use platform tokens: `--c-text`, `--c-main`, etc.
* Keyboard-friendly: visible focus, logical tab order.
* Avoid layout thrash (batch DOM writes; use `requestAnimationFrame` if needed).

---

## Performance Targets

* Bootstrap in ≤ **300ms** on mid-range hardware.
* Defer network work; lazy-render heavy subtrees.
* Avoid global reflows; prefer `overflow-auto` inside module panels.

---

## Certification Checklist

* [ ] Uses valid scaffold target(s); no geometry changes.
* [ ] RITES: only approved events; correct payloads.
* [ ] Rail untouched; App-Bar untouched.
* [ ] Accessible (labels, roles, focus).
* [ ] Responsive at **992px** breakpoint.
* [ ] Passes Dev Bar presets with no layout shift.
* [ ] Performance within target.

---

## References

* [Scaffolding.md](./Scaffolding.md)
* [EventsReference.md](./EventsReference.md)
* [scaffoldDemo.html](./scaffoldDemo.html)

**Contact:** Interface Systems Team — `ui@noiz.gg`
