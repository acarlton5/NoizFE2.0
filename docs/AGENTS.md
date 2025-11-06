# AGENTS (for Codex)

> **Audience:** Developers prompting Codex (code-gen assistant)
> **Scope:** How to ask Codex for NOIZ-compatible output (Scaffold + RITES + Modules)
> **Version:** 1.0 (canonical)

This guide defines **how to work with Codex** so its output drops directly into NOIZ with minimal edits.

---

## 0) Ground Rules Codex Must Follow

1. **Frameworks:** Use **Bootstrap 5.3** utilities only. No Tailwind/React/etc. Vanilla JS modules or ES6 classes.
2. **Layout:** Respect the **Scaffold**. Mount only into `data-module="main"`, `sidebar`, `main-header`, or `nav-pane`.

   * ❗ **Do not** remove, hide, or re-render `rail`. (Policy: hiding rail may cause module denial.)
3. **Theming:** Use CSS variables from the scaffold (`--c-text`, `--c-main`, etc.). No hard-coded colors beyond subtle borders.
4. **Events:** Integrate the **RITES** API (`ctx.on`, `ctx.emit`). No ad-hoc global buses.
5. **Accessibility:** Semantic HTML, ARIA labels for interactive elements, keyboard focus states.
6. **Performance:** Module bootstrap ≤ 300ms, defer heavy work, avoid layout thrash (batch DOM writes).
7. **Deliverables:** Prefer **single-file** drop-ins when requested. If multi-file, include a file map and final combined snippet.

---

## 1) Repository Expectations (What Codex Should Assume)

```
/docs
  Scaffolding.md
  ModuleGuide.md
  EventsReference.md   (RITES)
  index.md
  README.md
/scaffoldDemo.html     (Dev Bar present)
/modules
  /<your-module>/
    module.json
    main.js
    style.css
```

Codex must generate files that fit this layout.

---

## 2) Canonical Module Skeleton (What to Output)

**module.json**

```json
{
  "name": "example-module",
  "displayName": "Example Module",
  "version": "1.0.0",
  "entry": "main.js",
  "style": "style.css",
  "mount": { "target": "main", "position": "after" },
  "events": ["user.login", "chat.message", "stream.started"],
  "requires": { "rites": ">=1.0.0 <2.0.0" }
}
```

**main.js**

```js
NOIZ.module.register("example-module", (ctx) => {
  // Create root
  const root = document.createElement("section");
  root.className = "example-box p-3";
  root.setAttribute("role", "region");
  root.setAttribute("aria-label", "Example Module");

  // UI
  root.innerHTML = `
    <h2 class="h6 mb-2 text-light">Example Module</h2>
    <button class="btn btn-sm btn-light" id="ex-btn" aria-label="Send test toast">
      Send Toast
    </button>
    <div class="mt-3 small opacity-75" id="ex-log" aria-live="polite"></div>
  `;

  // Mount into scaffold target (module.json.mount.target)
  ctx.mount(root);

  // RITES: listen
  ctx.on("chat.message", (e) => {
    const log = document.getElementById("ex-log");
    if (log) log.textContent = `[chat] ${e.user}: ${e.text}`;
  });

  // RITES: emit
  root.querySelector("#ex-btn").addEventListener("click", () => {
    ctx.emit("toast.show", { message: "Hello NOIZ from Example Module!" });
  });

  // Lifecycle
  ctx.onReady(() => {/* optional post-mount tasks */});
  ctx.onUnmount(() => {/* cleanup */});
});
```

**style.css**

```css
.example-box{
  background: var(--c-main);
  color: var(--c-text);
  border: 1px solid #00000033;
  border-radius: .5rem;
}
```

---

## 3) Prompt Template (Use This When Asking Codex)

Paste this template, fill `[brackets]`, and Codex will produce NOIZ-compliant code.

```
You are Codex writing code for NOIZ. Follow these strict rules:

- Use Bootstrap 5.3 utilities only (no Tailwind/React).
- Respect NOIZ Scaffold. Mount only into: main | sidebar | main-header | nav-pane.
- Do NOT hide or modify the rail. 
- Integrate RITES with ctx.on / ctx.emit.
- Provide accessible HTML (ARIA), and keyboard-friendly controls.
- Optimize for ≤300ms bootstrap.
- Deliver as:
  1) module.json
  2) main.js
  3) style.css
  4) (optional) snippet to drop into scaffoldDemo.html for quick test

Feature request:
[Describe the module’s purpose, inputs, and UI briefly]

Acceptance criteria:
- [List concrete UI states & interactions]
- [List required RITES events to listen/emit]
- [Responsive behavior ≥/< 992px]
- [No layout shifts; no blocking network calls on init]

Now output:
- A short FILE MAP.
- The exact file contents.
- A final combined single-file snippet for quick testing.
```

---

## 4) Acceptance Checklist (What to Verify Before Merging)

* [ ] Uses **Bootstrap 5.3** utilities; no external frameworks.
* [ ] Mounts to valid scaffold target via `ctx.mount`.
* [ ] **Does not** hide or alter the rail/app-bar containers.
* [ ] RITES: `ctx.on` listeners and `ctx.emit` calls match EventsReference.
* [ ] Accessible: semantic elements, labels, keyboard focus.
* [ ] Responsive at 992px breakpoint.
* [ ] Theming via scaffold CSS variables; minimal hard-coded colors.
* [ ] No synchronous heavy work; defers expensive ops; no jank.
* [ ] Clean teardown (`ctx.onUnmount`).

---

## 5) Common Patterns Codex Should Use

### A) Mount into Sidebar with Header Toolbar

```js
NOIZ.module.register("chat-tools", (ctx) => {
  const root = document.createElement("div");
  root.className = "chat-tools d-flex align-items-center gap-2 p-2";
  root.innerHTML = `
    <button class="btn btn-sm btn-outline-light" aria-label="Clear chat">Clear</button>
    <button class="btn btn-sm btn-outline-light" aria-label="Slow mode">Slow</button>
  `;
  ctx.mount(root, { target: "sidebar" });

  root.children[0].onclick = () => ctx.emit("chat.cleared", { channel: "current" });
  root.children[1].onclick = () => ctx.emit("chat.slowMode", { enabled: true });
});
```

### B) Add Controls to Main-Header

```js
NOIZ.module.register("stream-title", (ctx) => {
  const el = document.createElement("div");
  el.className = "d-flex align-items-center gap-2";
  el.innerHTML = `
    <strong id="st-title" class="text-dark">Stream Title</strong>
    <button class="btn btn-sm btn-light" id="st-edit" aria-label="Edit title">✎</button>
  `;
  ctx.mount(el, { target: "main-header" });
  ctx.on("stream.titleUpdated", ({ title }) => {
    document.getElementById("st-title").textContent = title;
  });
});
```

### C) Context-Aware Rendering (Right-in-Time)

```js
NOIZ.module.register("viewer-count", (ctx) => {
  let visible = false;
  const el = document.createElement("div");
  el.className = "badge text-bg-dark";
  el.textContent = "—";

  ctx.mount(el, { target: "main-header" });

  // Receive only when needed (RITES context managed by Hub)
  ctx.on("stream.metricUpdated", (m) => {
    if (!visible) return;
    el.textContent = `👁 ${m.viewers}`;
  });

  // Dev Bar or layout bus could emit this:
  ctx.on("layout.visibility", ({ region, isVisible }) => {
    if (region === "main") visible = isVisible;
  });
});
```

---

## 6) Quick Test Harness (for scaffoldDemo.html)

Ask Codex for an **inline** test block to paste inside `<main data-module="main">` at runtime or to inject via Dev Bar:

```html
<!-- Drop-in test block (temporary) -->
<div id="module-test" class="p-3 border text-light">
  Testing slot — replace by ctx.mount in actual module.
</div>
<script>
  // Simulate a RITES event to verify listeners:
  setTimeout(()=> window.NOIZ?.hub?.emit?.("chat.message", {user:"Morphine", text:"Ping!"}), 1000);
</script>
```

(Use only during rapid prototyping; real modules should mount through `ctx.mount`.)

---

## 7) How to Ask Codex for **Edits** (Diff Mode)

When iterating, prefer explicit diffs:

```
Edit request to Codex:

File: modules/example-module/main.js
Change:
- Add ARIA labels for the 2 buttons.
- Debounce chat input by 250ms.
- Emit "asset.used" after successful action.

Output: show only the changed lines with enough surrounding context.
```

---

## 8) Guardrails & Rejections (What Codex Must Not Do)

* ❌ Hide the **rail** or relocate core scaffold regions.
* ❌ Inject global CSS that breaks Bootstrap (e.g., overriding `.row`, `.col-*`).
* ❌ Use blocking calls on init (e.g., long `fetch` without `await` safeguards).
* ❌ Add libraries/frameworks not approved by the Interface Systems Team.
* ❌ Emit **reserved** events (see EventsReference.md).

---

## 9) Troubleshooting Prompts (Codex Fix-It)

* “The module causes layout shift on mount. **Minimize reflow** and **batch DOM writes**.”
* “Color contrast fails on buttons. Use **var(--c-text)** and **btn-outline-light**.”
* “Listeners not firing. Ensure **ctx.on('chat.message')** and correct payload schema.”
* “Mobile overflow. Add **overflow-auto** and verify 992px breakpoint behavior.”

---

## 10) Credits & Contacts

* **Interface Systems Team** — layout, scaffold, UI standards
* **Systems Team** — RITES & Hub integration

Contact: `ui@noiz.gg` · `systems@noiz.gg`
