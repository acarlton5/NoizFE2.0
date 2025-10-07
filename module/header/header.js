// module/header/header.js
// Minimal title bar inspired by the provided reference image.

export default async function init({ root, hub }) {
  root.innerHTML = `
    <header class="title-bar" data-role="header">
      <div class="title-bar__leading">
        <button class="title-bar__rail-toggle" type="button" aria-label="Toggle navigation" data-role="rail-toggle">
          <span class="title-bar__rail-indicator"></span>
        </button>
      </div>
      <div class="title-bar__title" data-role="header-title">Noiz</div>
      <div class="title-bar__actions">
        <button class="title-bar__action" type="button" aria-label="Notifications">
          <svg class="title-bar__icon" width="18" height="18"><use xlink:href="#svg-bell"></use></svg>
        </button>
        <button class="title-bar__action" type="button" aria-label="User settings">
          <svg class="title-bar__icon" width="18" height="18"><use xlink:href="#svg-cog"></use></svg>
        </button>
      </div>
    </header>
  `;

  const toggle = root.querySelector('[data-role="rail-toggle"]');
  if (toggle && hub?.emit) {
    toggle.addEventListener('click', () => {
      hub.emit('navigation:toggle');
    });
  }
}

