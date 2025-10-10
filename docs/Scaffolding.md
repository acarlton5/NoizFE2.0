# NOIZ Scaffolding Guide

The NOIZ runtime uses a **four-column responsive layout** designed for dynamic module mounting. This document explains the structure, behavior, and lifecycle of the scaffold — how it adapts to module states and how modules interact with it through the Hub.

---

## 🧱 Overview

The scaffold defines the core UI regions for NOIZ. Each region is a `<module>` mount point, which loads dynamically via `app.js`.

```
+-----------------------------------------------------------+
| app-header                                                |
+-----------------------------------------------------------+
| server-rail | channel-sidebar | main | right-sidebar      |
+-----------------------------------------------------------+
```

Each section adjusts automatically depending on module visibility and layout state.

---

## 🧩 Column Structure

| Column              | ID / Mount Point                         | Purpose                                                  |
| ------------------- | ---------------------------------------- | -------------------------------------------------------- |
| 1️⃣ Server Rail     | `<module data-module="server-rail">`     | Displays followed servers/channels, home, and user icon. |
| 2️⃣ Channel Sidebar | `<module data-module="channel-sidebar">` | Lists channels, categories, or context navigation.       |
| 3️⃣ Main            | `<module data-module="main">`            | The central module for stream/video/chat/etc.            |
| 4️⃣ Right Sidebar   | `<module data-module="right-sidebar">`   | Used for member lists, chat panels, or quest tracking.   |

Each column is fluid and adjusts width based on hidden or wide states.

---

## 🧭 Layout Behavior

The **Hub layout API** manages column state transitions. Modules request layout changes via `hub.request()` calls.

### Layout API Reference

```js
await hub.request('layout:left:collapse');
await hub.request('layout:right:wide');
await hub.request('layout:right:hide');
await hub.request('layout:immerse:on');
```

### Preset States

| Preset              | Description                                                                  |
| ------------------- | ---------------------------------------------------------------------------- |
| **Default**         | All columns visible in standard width.                                       |
| **Immerse Mode**    | Collapses left + channel columns for full-width viewing (used in Live view). |
| **Right Wide Mode** | Expands the right sidebar for active chats or secondary UIs.                 |
| **Compact Mode**    | Collapses all but the main content area.                                     |

---

## 🧮 Responsive Behavior

The scaffold is mobile-first, using Bootstrap 5 grid utilities.

* Columns stack on small screens.
* Hidden columns automatically expand the remaining space.
* All transitions are animated with CSS variables for smoothness.

### Example:

If the **server rail** is collapsed:

```js
hub.request('layout:left:collapse');
```

Then `channel-sidebar` expands to occupy the released space.

If the **right sidebar** is hidden:

```js
hub.request('layout:right:hide');
```

Then `main` auto-expands to fill the full width.

---

## 🧠 Internal Rules

* The scaffold listens for layout updates via hub events:

  ```js
  hub.on('layout:update', (state) => adjustColumns(state));
  ```
* CSS grid or flex automatically adapts column proportions.
* Each module mounts inside its own column container and cannot modify sibling columns directly.

---

## ⚙️ CSS Layering

All layout definitions belong in `app.css`, scoped under generic layout selectors:

```css
.layout {
  display: grid;
  grid-template-columns: var(--width-left) var(--width-channel) 1fr var(--width-right);
  grid-template-rows: auto 1fr;
  height: 100vh;
}

.layout.immerse {
  --width-left: 0;
  --width-channel: 0;
}

.layout.right-wide {
  --width-right: 400px;
}
```

> ❌ Module-specific CSS should never define layout widths or flex logic.

---

## 🔄 State Transitions

### Hidden Columns

When a column is hidden, its corresponding `<module>` element remains in the DOM but visually collapsed.
This prevents remounting on every toggle and preserves module state.

```css
.column.hidden {
  width: 0;
  opacity: 0;
  pointer-events: none;
}
```

### Animation Flow

Each toggle triggers a `transitionend` event for other modules to listen for resize or refresh events.

```js
hub.publish('layout:changed', { left: false, right: true });
```

---

## 🧩 Interaction Between Modules and Layout

Each module can request adjustments or listen for layout events:

```js
hub.on('layout:changed', ({ left, right }) => {
  if (right) adjustChatScroll();
});
```

Modules must **not** directly manipulate the scaffold’s CSS or DOM. All requests go through the hub.

---

## 🧹 Cleanup and Safety

* Layout changes should always revert cleanly when modules unload.
* Temporary layout overrides (e.g. Live Stream mode) must unregister their hub listeners on dispose.

Example:

```js
const off = hub.on('layout:changed', syncUI);
return () => off();
```

---

## 🧩 Summary

* The scaffold defines the **core layout containers**.
* All adjustments happen via the **Hub layout API**.
* Columns **expand, collapse, or hide** based on module requests.
* Modules **cannot modify sibling containers directly**.
* CSS and logic are separated for predictable, composable behavior.

> 💡 Think of the scaffold as the stage — modules are the actors. The stage defines where the play happens, but never changes the script.
