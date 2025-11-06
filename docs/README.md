# NOIZ Developer Documentation

> **Version:** 1.0
> **Maintained by:** NOIZ Interface Systems Team
> **Core Systems:** Scaffold · Hub · RITES · Modules

---

## ⚡ Overview

**NOIZ** is a next-generation live streaming and creator platform built around modular systems, real-time interactions, and adaptive layouts.

Every layer — from UI to event flow — is defined by four unified systems:

| Core Layer   | Description                                                                                                |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| **Scaffold** | The visual and structural foundation of NOIZ. Establishes responsive layout zones and module mount points. |
| **Hub**      | The logical bridge between modules and agents. Routes data, syncs state, and enforces security context.    |
| **RITES**    | The **Right-in-Time Event System** delivering contextual, latency-sensitive events across the platform.    |
| **Modules**  | Self-contained feature blocks that extend the platform. Built using Bootstrap 5 and the NOIZ dev API.      |

Together they form the **NOIZ Interface Stack (NIS)** — a unified architecture for building responsive, real-time, creator-centric experiences.

---

## 🧱 Architecture Overview

```
┌─────────────────────────────┐
│         Scaffold             │
│  (UI Layout & Components)    │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│            Hub              │
│  (State & Event Routing)    │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│           RITES             │
│ (Right-in-Time Event System)│
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│          Modules            │
│   (Extendable Features)     │
└─────────────────────────────┘
```

Each module connects to the Hub, subscribes to RITES events, and mounts within the Scaffold using standard `data-module` targets.

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/noiz-dev/core.git
cd core
```

### 2. Run the Scaffold Demo

Open the local sandbox:

```
scaffoldDemo.html
```

Use the **Dev Bar** to toggle immersion modes and test module visibility.

### 3. Register a Test Module

Create `/modules/example/` with:

```js
NOIZ.module.register("example", (ctx) => {
  const el = document.createElement("div");
  el.className = "p-3 border rounded text-light";
  el.textContent = "Hello from Example Module!";
  ctx.mount(el);
  ctx.on("stream.started", (e) => console.log("Stream started:", e));
});
```

---

## 🧩 Development Stack

| Component         | Description                                                       |
| ----------------- | ----------------------------------------------------------------- |
| **Bootstrap 5.3** | Core CSS and grid framework for all layouts.                      |
| **NOIZ Scaffold** | Defines responsive sections (`main`, `sidebar`, etc.).            |
| **NOIZ Hub**      | Event and state mediator between UI and agents.                   |
| **NOIZ RITES**    | The Right-in-Time Event System powering contextual communication. |
| **NOIZ Modules**  | Extend functionality by registering modules dynamically.          |

---

## ⚙️ RITES (Right-in-Time Event System)

RITES delivers context-aware updates *exactly when relevant*.
Instead of blind real-time streams, RITES dispatches selective, filtered event payloads to active modules and users based on visibility, context, and priority.

```js
ctx.on("chat.message", (data) => console.log(data.text));
ctx.emit("asset.used", { id: "sticker_fox01" });
```

See the full [RITES Reference](./EventsReference.md) for supported events.

---

## 🧩 Module Lifecycle

All modules must:

1. Register through `NOIZ.module.register(id, handler)`.
2. Mount into the Scaffold (`ctx.mount()`).
3. Subscribe to or emit RITES events via the Hub.
4. Support full teardown via `ctx.onUnmount()`.

See [ModuleGuide.md](./ModuleGuide.md) for examples.

---

## 🧠 Layout Integration (Scaffold)

Refer to [Scaffolding.md](./Scaffolding.md) for layout standards.

| Section       | Use Case                              |
| ------------- | ------------------------------------- |
| `main`        | Primary content or feature area       |
| `sidebar`     | Secondary UI or chat panels           |
| `main-header` | Stream titles, toolbars, navigation   |
| `nav-pane`    | Creator or channel context navigation |
| `rail`        | System navigation (immutable)         |

> **Warning:** Hiding or re-rendering the `rail` is forbidden and may cause module rejection.

---

## 🧰 Dev Bar Presets

The `scaffoldDemo.html` Dev Bar simulates environment states:

| Preset       | Description                                    |
| ------------ | ---------------------------------------------- |
| `default`    | Full layout visible                            |
| `immerse`    | Stream-focused mode (nav hidden, rail visible) |
| `chat-focus` | Emphasized chat experience                     |
| `compact`    | Debugging/minimal mode                         |

---

## 🧾 Module Compliance Checklist

* ✅ Follows Scaffold layout conventions
* ✅ Integrates with RITES event API
* ✅ Does not modify rail or app-bar containers
* ✅ Uses platform color tokens and ARIA labeling
* ✅ Responsive under 992px breakpoint

---

## 🔒 Reserved Events and Restrictions

| Event             | Rule                               |
| ----------------- | ---------------------------------- |
| `rail.hidden`     | Prohibited — system identity layer |
| `layout.override` | Reserved for Interface Systems     |
| `hub.shutdown`    | Maintenance only                   |

---

## 🧭 References

| Document                                   | Description                        |
| ------------------------------------------ | ---------------------------------- |
| [Scaffolding.md](./Scaffolding.md)         | Canonical layout and structure     |
| [ModuleGuide.md](./ModuleGuide.md)         | Module development and lifecycle   |
| [EventsReference.md](./EventsReference.md) | RITES event catalogue              |
| [scaffoldDemo.html](./scaffoldDemo.html)   | Interactive sandbox for developers |

---

## 💬 Maintainers

**Interface Systems Team**
`ui@noiz.gg`

**Systems Team**
`systems@noiz.gg`

---

> “Right-in-Time, not Real-Time — because context matters.”
