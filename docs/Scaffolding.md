# NOIZ Scaffolding Standard

> **Version:** 1.0
> **Status:** Canonical
> **Audience:** Internal NOIZ Developers & Module Authors

---

## Overview

The NOIZ scaffolding defines the **base structure** and **responsive layout model** used across the platform (dashboard, streaming, discovery, and extensions). It ensures consistent module behavior, full-height alignment, and predictable responsive design between desktop and mobile.

Every module plugs into this scaffold using standard data attributes (`data-module="..."`) and naming conventions.

---

## Layout Structure

```
APP-BAR
PAGE
 ├── RAIL
 ├── NAV-PANE
 └── CONTENT-STACK
      ├── MAIN-HEADER
      ├── MAIN
      └── SIDEBAR
USER-BAR
TOAST-CONTAINER
MOBILE-RAIL
```

Each section is tagged using `data-module` for clarity and script-based interaction.

| Module ID     | Description                              | Behavior                          |
| ------------- | ---------------------------------------- | --------------------------------- |
| `app-bar`     | Fixed bar at top of viewport             | Always visible, 28px tall         |
| `page`        | Root layout container                    | Fills viewport minus app-bar      |
| `rail`        | Left-most global navigation column       | **Must remain visible**           |
| `nav-pane`    | Channel or context navigation            | Collapsible (offcanvas on mobile) |
| `main-header` | Sub-header for main content              | Flush alignment                   |
| `main`        | Primary content area                     | Scrollable, resizes dynamically   |
| `sidebar`     | Secondary stack (chat, stats, etc.)      | Toggleable                        |
| `user-bar`    | Floating contextual control (user state) | Fixed-bottom left                 |
| `noti`        | Toast/notification host                  | Fixed-top right                   |
| `rail-m`      | Mobile rail (bottom navbar)              | Visible ≤ 991px width             |
| `nav-pane-m`  | Offcanvas overlay for mobile nav         | Fullscreen                        |

---

## Height Rules

* Root `.page` height: `calc(100vh - var(--app-bar-h))`
* Children with `.fill` or `.flex-grow-1` stretch to available space.
* Avoid using viewport units (`vh`) inside scrollable containers.

---

## Responsive Breakpoints

| Size    | Behavior                                                       |
| ------- | -------------------------------------------------------------- |
| ≥ 992px | Desktop layout enabled (`rail`, `nav-pane`, `sidebar` visible) |
| < 992px | Collapses into mobile layout (`rail-m`, offcanvas nav)         |

---

## Naming Conventions

| Desktop Module | Mobile Equivalent |
| -------------- | ----------------- |
| `rail`         | `rail-m`          |
| `nav-pane`     | `nav-pane-m`      |
| `app-bar`      | *same*            |
| `main`         | *same*            |
| `sidebar`      | *same*            |

> **Mobile suffix rule:** append `-m` to mobile versions to maintain consistent naming.

---

## Visibility & Toggle Rules

| Component  | Default        | May be Hidden             | Notes                                                                       |
| ---------- | -------------- | ------------------------- | --------------------------------------------------------------------------- |
| `rail`     | Always visible | **Not recommended**       | Hiding the rail breaks platform consistency and may cause module rejection. |
| `nav-pane` | Visible        | ✅ via immersion or toggle | Offcanvas alternative on mobile                                             |
| `sidebar`  | Visible        | ✅ via toggle              | Resizes main automatically                                                  |

### Visibility Enforcement

A `.force-hidden` class is used to override Bootstrap breakpoint logic.

```css
.force-hidden { display: none !important; }
```

Use sparingly—prefer `hub.request('layout:toggle', {target:'sidebar'})` for runtime control.

---

## Preset Layout States

| Preset         | Rail | Nav-Pane | Sidebar | Ratio | Purpose                         |
| -------------- | ---- | -------- | ------- | ----- | ------------------------------- |
| **default**    | ✅    | ✅        | ✅       | 8:4   | Standard creator layout         |
| **immerse**    | ✅    | ❌        | ✅       | 7:5   | Streaming focus (wider sidebar) |
| **chat-focus** | ✅    | ✅        | ✅       | 7:5   | Chat-driven UI variants         |
| **compact**    | ❌    | ❌        | ✅       | 9:3   | Debug or minimal mode           |

> ⚠️ **Policy:** Modules must not override Rail visibility.
> Exceptions require explicit approval by NOIZ UI Maintainers. Unauthorized use may lead to module denial.

---

## Developer Testing (Dev Bar)

A floating Dev Bar is included in the canonical scaffold for internal QA.
Controls allow toggling regions and simulating preset states.

| Control | Action                                               |
| ------- | ---------------------------------------------------- |
| Presets | Switch between default, immerse, chat-focus, compact |
| Toggles | Hide/show rail, nav-pane, sidebar                    |
| Helpers | Trigger mobile nav, toasts, or reset layout          |

---

## Integration Example

Modules should never modify the scaffold DOM directly.
Instead, communicate with the layout bus:

```js
hub.request('layout:apply', { preset: 'immerse' });
hub.request('layout:toggle', { target: 'sidebar', visible: false });
```

---

## CSS Custom Properties

| Variable                  | Description                  | Default            |
| ------------------------- | ---------------------------- | ------------------ |
| `--app-bar-h`             | Height of app bar            | `28px`             |
| `--mobile-rail-h`         | Height of mobile bottom rail | `64px`             |
| `--c-bg`, `--c-app`, etc. | Theming colors               | Demo defaults only |

---

## Module Guidelines

1. **Do not** reposition or resize the scaffold containers.
2. **Do not** hide the Rail unless explicitly permitted.
3. All module inserts should occur inside the `.main` or `.sidebar` region.
4. Use `overflow-auto` for any scrollable inner content.
5. Support both mobile (`-m`) and desktop layouts.
6. Maintain accessibility compliance (ARIA labels, roles).

---

## Validation Checklist

* [ ] Uses canonical scaffold structure
* [ ] Responsive at 992px breakpoint
* [ ] Rail visible at all times
* [ ] No hardcoded `vh`/`vw` usage
* [ ] Follows `data-module` naming
* [ ] All interactive elements accessible

---

### Appendix: Developer Note

> **Rail Policy:**
> The Rail represents the core of NOIZ’s visual and navigational identity. Hiding or repositioning it creates inconsistent UX and will fail certification unless a justified exception is reviewed and approved by the NOIZ Core UI Team.

---

**Maintainers:** NOIZ Interface Systems Team
**Contact:** (https://discord.gg/wpmuzCMQ)
