## Module Authoring Guidelines

### 1. Philosophy

NOIZ is **module-first**. Every feature is a self-contained folder:

```
module/<name>/
  ├─ <name>.js          # UI logic – exports async init({root, props, hub})
  ├─ <name>.css         # Scoped styles for this module only
  └─ <name>.service.js  # (Optional) non-UI API & routes
```

Modules are mounted into `<module data-module="…">` tags found in `index.html`
or injected by other modules at runtime.

---

### 2. Authoring Rules

| Area              | Guideline                                                                                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **JS entry**      | Always **default-export `async function init({ root, props, hub })`**. Build all markup in JS; no extra HTML file.                                                  |
| **Scoped CSS**    | Use a wrapper class prefix like `.noiz-<module>` for all selectors; never style global tags.                                                                        |
| **Props**         | Accept `props` via the `data-props='{"…"}'` attribute; parse JSON inside `init`.                                                                                    |
| **Service API**   | If your feature has background logic or needs to expose APIs/routes before UI mounts, put them in `<name>.service.js` and **register with `hub`** inside that file. |
| **Routing**       | Export a `routes(hub)` function from your JS or service to add path handlers (e.g. `#/live?id=123`).                                                                |
| **Child modules** | Use `await hub.loadModule('child-name', targetElement, {…})` to mount sub-components such as chat-pane inside Live.                                                 |
| **Cleanup**       | If you create timers or observers, return a cleanup function from `init` or call `hub.unload(root)` before re-mounting.                                             |

---

### 3. Layout Standards

* Page grid: **Bootstrap 5, mobile-first**

  ```
  container-fluid > row >
      rail-left | sidebar-left | main-center | sidebar-right
  ```
* Use **BS5 utilities & grid classes**. Avoid fixed `px` widths unless behind a media query.
* All rails/sidebars must support **`height:100%` + `overflow-y:auto`** so only the column scrolls.
* Test at common break-points (≥1200 px, 992 px, 768 px, 576 px).
* **Responsive first:** collapse or stack gracefully on small screens.

---

### 4. Styling Conventions

* Declare CSS inside your module’s `.css` file; import is handled by `app.css` at build.
* Prefix module rules: `.noiz-chat-pane …`, `.noiz-live …` etc.
* Never override Bootstrap globally; extend via utilities or wrapper class.
* Expose theme knobs with CSS variables if you need dynamic sizing/colors.
* Example avatar wrapper:

  ```html
  <div class="avatar-wrap" style="--avi-width:32px; --avi-height:32px;"></div>
  ```

---

### 5. Event Bus (`hub`)

Modules communicate only through the **global `hub`**:

```js
hub.emit('ui:openLive', { id:'chan-42' });
hub.on('ui:immersive:on', () => …);
```

Common events available:

* `ui:openLive` / `ui:closeLive` – swap center/right to live view
* `ui:immersive:on` / `ui:immersive:off` – collapse left rails, widen live-chat
* `channel-sidebar:open` – user picked a channel
* Custom events per module are allowed; namespace them (`chat:…`, `live-chat:…`).

---

### 6. Testing & QA

* Use **browser DevTools device emulation** (e.g. iPhone 12) before PR.
* Check scroll containment: no double scrollbars.
* Verify unload/re-load of your module leaves no timers or listeners behind.
* `npm test` is a placeholder; still run it to pass CI.

---

