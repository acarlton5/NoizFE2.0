const ACTIONS = [
  { id: 'notifications', icon: 'notification', label: 'Notifications' },
  { id: 'settings', icon: 'settings', label: 'Settings' }
];

export default function init({ root }) {
  root.innerHTML = `
    <header class="title-bar" role="banner">
      <div class="title-bar__brand">
        <span class="title-bar__badge" aria-hidden="true">
          <span class="title-bar__badge-ring"></span>
          <img src="images/logo_badge.svg" alt="NOIZ" class="title-bar__badge-icon">
        </span>
        <span class="title-bar__name" aria-label="NOIZ">NOIZ</span>
      </div>
      <div class="title-bar__actions" role="toolbar" aria-label="Title bar actions">
        ${ACTIONS.map(({ id, icon, label }) => `
          <button class="title-bar__action" type="button" data-action="${id}" aria-label="${label}">
            <svg class="title-bar__action-icon" width="16" height="16" focusable="false">
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
