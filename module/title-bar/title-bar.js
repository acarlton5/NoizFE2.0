// module/title-bar/title-bar.js
// Compact gradient title bar inspired by the Discord DM header reference.
// Renders a fixed banner with the NOIZ badge on the left and utility icons on the right.

const ACTIONS = [
  { id: 'notifications', icon: 'notification', label: 'Notifications' },
  { id: 'settings', icon: 'settings', label: 'Settings' },
];

export default async function init({ root }) {
  root.innerHTML = `
    <header class="title-bar" role="banner">
      <div class="title-bar__brand" aria-label="NOIZ home">
        <span class="title-bar__logo" aria-hidden="true">
          <svg class="title-bar__logo-mark" width="20" height="28" focusable="false">
            <use href="#svg-logo-vikinger"></use>
          </svg>
        </span>
        <span class="title-bar__name">NOIZ</span>
      </div>
      <div class="title-bar__actions" role="toolbar" aria-label="Title bar actions">
        ${ACTIONS.map(({ id, icon, label }) => `
          <button class="title-bar__action" type="button" data-action="${id}" aria-label="${label}">
            <svg class="title-bar__action-icon" width="20" height="20" focusable="false">
              <use href="#svg-${icon}"></use>
            </svg>
          </button>
        `).join('')}
      </div>
    </header>
  `;

  return {
    focus() {
      root.querySelector('.title-bar__action')?.focus();
    }
  };
}
