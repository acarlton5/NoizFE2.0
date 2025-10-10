# EventsReference — Hub, Layout & Module Events

This document lists all **event topics** and **API requests** that power inter-module communication in NOIZ. Every module communicates through the **hub** — never via direct DOM or global variables.

---

## 🧩 Hub Event Model

The hub provides a consistent interface for three communication patterns:

| Pattern                 | Description                                | Example                                           |
| ----------------------- | ------------------------------------------ | ------------------------------------------------- |
| **Request/Response**    | One-to-one RPC-style calls (async).        | `await hub.request('quest@1.start', { id: 42 });` |
| **Publish/Subscribe**   | One-to-many event broadcast.               | `hub.publish('quest:progress', { xp: 100 });`     |
| **Register/Unregister** | Define an API endpoint callable by others. | `hub.register('quest@1.start', handlerFn);`       |

---

## 🔌 Layout API Events

All layout actions should use these hub requests — no direct `body.classList` modifications.

### **Layout Requests**

```js
await hub.request('layout:set', { left, chan, right, preset });
```

| Parameter | Type                  | Description                        |
| --------- | --------------------- | ---------------------------------- |
| `left`    | `'collapsed'`         | Collapse or expand rail.           |
| `chan`    | `'hidden'`            | Hide or show channel sidebar.      |
| `right`   | `'hidden'` | `'wide'` | Hide, show, or widen right column. |
| `preset`  | `'immerse'`           | Applies immersive layout preset.   |

### **Shorthand Aliases**

```js
await hub.request('layout:left:collapse');
await hub.request('layout:left:expand');
await hub.request('layout:chan:hide');
await hub.request('layout:chan:show');
await hub.request('layout:right:hide');
await hub.request('layout:right:show');
await hub.request('layout:right:wide');
await hub.request('layout:immerse:on');
await hub.request('layout:immerse:off');
```

### **Layout Broadcast Events**

| Event            | Payload          | Description                            |
| ---------------- | ---------------- | -------------------------------------- |
| `layout:changed` | `{ classFlags }` | Fired when layout class state changes. |

Modules can listen to this event:

```js
hub.subscribe('layout:changed', (flags) => console.log('Layout updated', flags));
```

---

## 🧭 Router Events

### Navigation

* **Event:** `router:changed`
* **Payload:** `{ hash, params }`
* **Description:** Published when a hash-based navigation is completed.

### Usage Example

```js
hub.subscribe('router:changed', ({ hash, params }) => {
  console.log('Navigated to', hash, params);
});
```

### Programmatic Routing

```js
router.navigate('#/profile/noiz');
```

---

## 🧬 Module Lifecycle Events

The runtime emits these events automatically as modules load/unload:

| Event             | Payload    | Description                                                     |
| ----------------- | ---------- | --------------------------------------------------------------- |
| `module:ready`    | `{ name }` | Triggered when a module has been fully mounted and initialized. |
| `module:teardown` | `{ name }` | Triggered when a module is unmounted and disposed.              |

Example:

```js
hub.subscribe('module:ready', ({ name }) => console.log(`Module ${name} is live.`));
```

---

## ⚙️ Example Domain APIs

Below are **convention examples** for APIs exposed by specific modules — these help standardize naming and communication.

### Channel Sidebar

| API                              | Description                             | Example                       |
| -------------------------------- | --------------------------------------- | ----------------------------- |
| `sidebar:slot@1.offer`           | Offer a new render slot inside sidebar. | `{ slot: 'top', id, render }` |
| `sidebar:slot@1.remove`          | Remove a previously offered slot.       | `{ id }`                      |
| `sidebar:questbar@1.setProgress` | Update quest progress bar.              | `{ percent }`                 |

### Quest System

| API                | Description                         |
| ------------------ | ----------------------------------- |
| `quest@1.start`    | Begin a quest run.                  |
| `quest@1.update`   | Update progress.                    |
| `quest@1.complete` | Finish a quest and trigger rewards. |

### Chat Module

| API              | Description                           |
| ---------------- | ------------------------------------- |
| `chat@1.send`    | Send a new message to active channel. |
| `chat@1.clear`   | Clear current chat messages.          |
| `chat@1.history` | Load prior messages.                  |

---

## 🔍 Event Naming Conventions

| Type            | Format                          | Example                |
| --------------- | ------------------------------- | ---------------------- |
| **API**         | `module@version.method`         | `quest@1.start`        |
| **Topic/Event** | `namespace:action`              | `layout:changed`       |
| **Slot/Event**  | `namespace:slot@version.method` | `sidebar:slot@1.offer` |

---

## ✅ Best Practices

* **Prefix everything** with a module or domain name (e.g., `chat`, `quest`, `sidebar`).
* **Version your APIs** to avoid breaking changes (`@1`, `@2`, etc.).
* **Never throw** in registered handlers — return `{ ok: false, error }` instead.
* **Keep payloads minimal** and descriptive.
* **Always unregister** event handlers during module disposal.

---

## 📋 Common Event Flow Example

```js
// Quest module starts a run
await hub.request('quest@1.start', { id: 9 });

// Sidebar listens for quest updates
hub.subscribe('quest:progress', ({ xp }) => {
  const percent = Math.min(1, xp / 100);
  hub.request('sidebar:questbar@1.setProgress', { percent });
});

// Layout updates trigger visual transitions
hub.subscribe('layout:changed', (flags) => {
  if (flags['immerse']) document.body.classList.add('live-mode');
});
```

---

> 🧭 **Summary:** Events drive the NOIZ frontend. APIs communicate intent; events communicate change. Respect namespaces, versioning, and cleanup to keep modules isolated yet fully synchronized.
