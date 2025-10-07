# NOIZ

A modular, Bootstrap 5–powered starter for building responsive social/streaming UIs. Each feature is a small module that mounts into a `<module data-module="...">` tag.

## Project Structure
```
.
├── index.html      # Page skeleton with <module> mount points
├── app.js          # Module loader, service loader, and event bus
├── app.css         # Global styles + module imports
├── modules-enabled.json # Lists modules to mount and services to preload
├── module/         # One folder per module
│   └── <name>/
│       ├── <name>.js           # UI logic; generates markup dynamically (no separate HTML)
│       └── <name>.service.js   # Optional service API loaded at startup
├── data/           # JSON fixtures that drive the UI
├── images/         # Static assets
└── package.json    # npm scripts
```

## Module Services
- During startup, `app.js` reads `modules-enabled.json` and eagerly imports `<module>/<name>.service.js` when present.
- Each service registers its API with the global `hub`, letting other modules call it before the corresponding UI is mounted.

## Getting Started
1. Run `npm start` to launch a local static server via [`live-server`](https://www.npmjs.com/package/live-server) on `http://127.0.0.1:5173/` without opening a browser.
2. Open `http://127.0.0.1:5173/` in your browser to view `index.html`.

## Development Guidelines
- Build layouts with Bootstrap's grid (`container[-fluid]`, `row`, `col-*`).
- Prefer responsive utilities; avoid fixed pixel widths or heights.
- Test layouts on small screens using browser DevTools' device mode.
- See [AGENTS.md](AGENTS.md) for complete contributing rules.

## Scripts
- `npm start` – serve the project locally with `live-server` on port 5173.
- `npm test` – placeholder tests; run before committing.

Happy hacking!
