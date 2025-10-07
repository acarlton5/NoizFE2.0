// module/header/header.js
// Minimal title bar inspired by the provided reference image.

export default async function init({ root }) {
  root.innerHTML = `
    <header class="title-bar" data-role="header">
      <div class="title-bar__brand">
        <span class="title-bar__logo" aria-hidden="true">
          <img class="title-bar__logo-mark" src="images/logo_badge.svg" alt="" />
        </span>
        <span class="title-bar__wordmark" data-role="header-title">NOIZ</span>
      </div>
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
}

