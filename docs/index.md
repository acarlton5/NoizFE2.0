# NOIZ Developer Portal

> **Welcome to the NOIZ Interface Stack (NIS)**
> *Scaffold · Hub · RITES · Modules*

---

## ⚡ What Is NOIZ?

**NOIZ** is a modular, creator-first live platform built to merge community, interactivity, and performance.
The system is powered by a unified development architecture known as the **NOIZ Interface Stack (NIS)** — composed of:

| Core Layer   | Purpose                                                                            |
| ------------ | ---------------------------------------------------------------------------------- |
| **Scaffold** | The visual foundation — defines layout zones for modules.                          |
| **Hub**      | The logical bridge — routes data and state between modules and backend agents.     |
| **RITES**    | The *Right-in-Time Event System* — delivers contextual events exactly when needed. |
| **Modules**  | Plug-in feature components that expand NOIZ functionality.                         |

Together, these define how creators, viewers, and developers experience NOIZ in real time.

---

## 🧭 Architecture Snapshot

```
[ Interface Layer ] → Scaffold → Modules
[ Data Layer ] → Hub → RITES
```

* **Scaffold** handles structure and responsiveness.
* **Hub** coordinates logic and permissions.
* **RITES** synchronizes contextual events (Right-in-Time).
* **Modules** build the features users interact with.

---

## 🚀 Get Started

1. **Run the Scaffold Demo**
   Open `scaffoldDemo.html` to explore the layout and Dev Bar tools.

2. **Create a Module**
   Drop a new folder into `/modules/` and register your script:

   ```js
   NOIZ.module.register("hello-world", (ctx) => {
     const el = document.createElement("div");
     el.className = "p-3 text-light";
     el.textContent = "Hello from NOIZ!";
     ctx.mount(el);
   });
   ```

3. **Connect to RITES**
   Listen and emit contextual events:

   ```js
   ctx.on("chat.message", (msg) => console.log(msg.text));
   ctx.emit("asset.used", { itemId: "frame_neon" });
   ```

---

## 🧩 Core Documents

| File                                       | Description                 |
| ------------------------------------------ | --------------------------- |
| [README.md](./README.md)                   | Full developer introduction |
| [Scaffolding.md](./Scaffolding.md)         | Canonical layout and zones  |
| [ModuleGuide.md](./ModuleGuide.md)         | Build and register modules  |
| [EventsReference.md](./EventsReference.md) | RITES event catalogue       |
| [scaffoldDemo.html](./scaffoldDemo.html)   | Interactive testing sandbox |

---

## 🧠 Key Principles

* **Right-in-Time, not Real-Time** — deliver only what matters, when it matters.
* **Scaffold First** — every module lives inside the defined layout zones.
* **Never Hide the Rail** — it anchors NOIZ identity and navigation.
* **Accessible by Default** — follow ARIA and Bootstrap standards.
* **Modular Forever** — all features should be detachable, composable, and theme-safe.

---

## 🛠 Maintainers

**Interface Systems Team** — `ui@noiz.gg`
**Systems Team** — `systems@noiz.gg`

---

> “Build with context. Stream with purpose. Power it all with RITES.”
> — *NOIZ Interface Systems Team*
