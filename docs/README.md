## Project Overview & Dev Workflow

### NOIZ Web App

A **Bootstrap 5 modular streaming UI**.
Every on-screen region is a pluggable module; the shell just mounts them.

---

### 1. Project Layout

```
index.html              # Bootstrap grid w/ <module> mount points
app.js                  # Scans DOM, loads modules & CSS, registers services, hub & routes
app.css                 # Global resets + @imports for each module’s CSS
modules-enabled.json    # Modules & services to preload at startup
module/
  app-header/
  server-rail/
  channel-sidebar/
  chat-pane/
  chat-composer/
  members-rail/
  live/
  live-chat/
  …
data/                   # JSON fixtures
images/                 # Static assets
package.json
```

---

### 2. Startup Flow

1. `index.html` defines all **static mount points**.
2. `app.js` on load:

   * reads `modules-enabled.json`
   * pre-loads each module’s `.service.js`
   * scans page for `<module>` tags
   * loads the corresponding `module/<name>/<name>.js`
   * injects the module’s CSS if present
3. Each module’s `init()` runs with `{ root, props, hub }`.

---

### 3. Adding a Module

```bash
mkdir module/hello
touch module/hello/hello.js module/hello/hello.css
```

**hello.js**

```js
export default async function init({ root, props, hub }) {
  root.innerHTML = `<div class="noiz-hello">Hello ${props.name||'World'}!</div>`;
}
```

In `index.html`

```html
<module data-module="hello" data-props='{"name":"NOIZ"}'></module>
```

---

### 4. Live-View Pattern

* `live` module → video player & meta row in **center column**
* `live-chat` module → right column with chat-pane & composer
* `ui:openLive` event replaces current center/right modules with live ones
* `ui:immersive:on` collapses left rails & widens live-chat
* Leaving live (channel click / route change) → `ui:closeLive` restores original DOM

---

### 5. Coding Standards

* Use **BS5 utilities & grid**; avoid fixed px values.
* Scope all CSS under a `.noiz-<module>` wrapper.
* Avoid cross-module DOM queries except for defined mount points.
* Communicate via `hub.emit/on`; no direct imports of sibling modules.
* Keep everything **mobile-first** and test at major breakpoints.

---

### 6. Dev Commands

* `npm start` – launches [live-server](https://www.npmjs.com/package/live-server) on **[http://127.0.0.1:5173/](http://127.0.0.1:5173/)**
* `npm test` – placeholder check to ensure CI passes
* Preview with DevTools **Device Mode** for responsiveness.

---

### 7. Contributing Checklist

* [ ] Follows **AGENTS.md** authoring rules
* [ ] Responsive verified
* [ ] No global CSS leakage
* [ ] Works after unload/re-load
* [ ] Emits/handles hub events appropriately
* [ ] No console errors or scroll glitches
