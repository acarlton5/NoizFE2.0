# Contributing Guidelines

This project is built with a mobile-first mindset using Bootstrap 5. Follow these rules for all code.

## Layout & Modules
- `index.html` uses `<module>` elements with `data-module` attributes as mount points. Place each module in `module/<name>/<name>.js`.
- Modules may expose an optional `module/<name>/<name>.service.js` that registers the module's API with `hub`. These services load at startup for entries in `modules-enabled.json` so their functions are available before the UI mounts.
- Build layouts with Bootstrap's grid (`container[-fluid]`, `row`, `col-*`).
- Prefer responsive utility classes and relative units; avoid fixed pixel widths or heights unless guarded by media queries.
- Ensure modules collapse or stack on small viewports. Test changes in browser DevTools' device mode (e.g., iPhone 12).

## Coding Conventions
- JavaScript modules must default-export `async function init({ root, props })`.
- Import module CSS in `app.css`; runtime lazy loading is also supported.
- Keep styles scoped to the module; avoid global selectors.

## Avatar System
- All avatars must use the `avatar-wrap` component.
- Provide `--avi-width`, `--avi-height`, and `--frame` CSS variables to control size and frame.
- Reference `module/navigation/navigation.css` or `module/user-rail/user-rail.css` for examples.

## Testing
- Run `npm test` before committing. The current script prints a placeholder message but ensures the command completes without error.
