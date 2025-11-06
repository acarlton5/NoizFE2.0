# Contribute to NOIZ

> **Version:** 1.0
> **Maintainers:** NOIZ Interface Systems Team & Systems Team
> **Scope:** How to propose changes, add modules, and land PRs that meet NOIZ standards.

---

## 1) Philosophy

* **Scaffold First** — modules live *inside* the canonical layout.
* **RITES by Default** — subscribe/emit events via the Hub; no ad-hoc buses.
* **Accessible & Performant** — usable by keyboard, fast on mid-range devices.
* **Predictable Bootstrap** — Bootstrap 5.3 utilities, vanilla JS. No extra frameworks.

---

## 2) What You Can Contribute

* New **modules** (feature panels, tools, overlays).
* Improvements to **Scaffold** (standards, tokens, docs).
* **RITES** event additions (with schema + use-cases).
* **Docs** (guides, examples, FAQs).
* Developer tooling (lint rules, CI checks, Dev Bar helpers).

---

## 3) Workflow

1. **Create an Issue**

   * Use the template matching your change type (bug, module, docs).
   * Include screenshots or short clips if UI-related.

2. **Branch**

   * `feat/<short-name>` for features, `fix/<short-name>` for fixes, `docs/<short-name>` for docs.

3. **Develop**

   * Follow [ModuleGuide.md](./ModuleGuide.md) and [Scaffolding.md](./Scaffolding.md).
   * Test locally with `scaffoldDemo.html` and Dev Bar presets.

4. **Lint / Test**

   * Ensure `npm run lint` (if configured) passes.
   * Manually verify accessibility and 992px breakpoint behavior.

5. **Pull Request**

   * PR title: `feat: …`, `fix: …`, `docs: …`, `chore: …`.
   * Fill the PR checklist (below).
   * Link the issue (`Closes #123`).

6. **Review & Iterate**

   * Address comments with additional commits (`fixup!` allowed).
   * Squash on merge unless history is instructive.

---

## 4) Coding Standards

* **Frameworks:** Bootstrap 5.3 utilities; vanilla JS/ES modules.
* **Styling:** Use scaffold tokens (`--c-text`, `--c-main`, etc.). Avoid global overrides.
* **Events:** Use **RITES** (`ctx.on`, `ctx.emit`); payloads match [EventsReference.md](./EventsReference.md).
* **Files:**

  ```
  /modules/<id>/
    module.json
    main.js
    style.css
  ```
* **Naming:** Kebab-case for module ids and file names.
* **Accessibility:** ARIA labels for controls; keyboard focus visible.
* **Performance:** ≤300ms initial mount; defer heavy work.

---

## 5) Non-Negotiables (Hard Rules)

* ❌ **Do not hide or remount the Rail.**

  * The Rail is part of NOIZ identity/navigation.
  * Modules attempting to hide or alter it will be rejected.

* ❌ **Do not modify App-Bar geometry or force page-level CSS** (e.g., overriding `.row`, `.col-*`).

* ❌ **No external UI frameworks** (Tailwind/React/etc.) without prior approval.

* ❌ **No unvetted RITES events.** New events require a schema proposal (see §7).

---

## 6) PR Checklist (include in your PR body)

* [ ] Targets valid scaffold region(s) (`main`, `sidebar`, `main-header`, `nav-pane`).
* [ ] Uses Bootstrap 5.3 utilities; no external frameworks.
* [ ] Integrates with **RITES** (only approved events).
* [ ] Does **not** alter Rail/App-Bar.
* [ ] Accessible: semantic roles, labels, focus.
* [ ] Responsive across the 992px breakpoint.
* [ ] Passes **Dev Bar** presets: `default`, `immerse`, `chat-focus`, `compact`.
* [ ] Meets performance target (≤300ms bootstrap).
* [ ] Includes screenshots (desktop + mobile).
* [ ] Updated docs if behavior/contract changed.

---

## 7) Proposing New RITES Events

1. Open an issue: **“RITES Proposal: `<category.name>`”**
2. Provide:

   * **Use case** and expected consumers (modules/agents).
   * **Payload schema** (fields, types, optional/required).
   * **Security context** (who may emit/receive).
   * **Versioning** impact (semver; breaking vs additive).
3. Link to a test module or demo reproducing the flow.
4. Await Systems Team sign-off.

---

## 8) Module Certification

Before merge to mainline builds, modules must pass:

* **Scaffold Compliance** (zones + geometry intact).
* **RITES Compliance** (approved events only).
* **Accessibility Audit** (labels/contrast/focus).
* **Dev Bar Scenarios** (no layout shift across presets).
* **Performance** (bootstrap + interaction smoothness).

> Failing any gate = changes requested. Persistent violations may be closed.

---

## 9) Commit Messages

* `feat: add stream goal tracker`
* `fix: sidebar overflow on <992px`
* `docs: clarify RITES goal.* payloads`
* `chore: lint rules for aria-* attributes`

Use “imperative mood”; present tense.

---

## 10) Security & Reporting

* Report vulnerabilities privately to `security@noiz.gg`.
* Use the “security” issue template only if instructed.
* Never post exploit details publicly before a fix is released.

---

## 11) Contacts

* **Interface Systems Team:** `ui@noiz.gg`
* **Systems Team:** `systems@noiz.gg`

> “Right-in-Time, not Real-Time — because context matters.”
