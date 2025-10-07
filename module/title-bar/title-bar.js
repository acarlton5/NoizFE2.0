const CHANNEL = {
  name: 'general-chat',
  topic: 'Creator HQ • share updates, plugin drops, collabs'
};

const ACTION_GROUPS = [
  {
    id: 'threads',
    icon: 'comment',
    label: 'Threads'
  },
  {
    id: 'notifications',
    icon: 'notification',
    label: 'Notification settings'
  },
  {
    id: 'pinned',
    icon: 'pinned',
    label: 'Pinned messages'
  },
  {
    id: 'members',
    icon: 'members',
    label: 'Member list'
  }
];

const UTILITY_ACTIONS = [
  { id: 'inbox', icon: 'messages', label: 'Inbox' },
  { id: 'help', icon: 'info', label: 'Help' }
];

export default function init({ root }) {
  root.innerHTML = `
    <header class="title-bar" role="banner">
      <div class="title-bar__main" aria-live="polite">
        <span class="title-bar__hash" aria-hidden="true">#</span>
        <div class="title-bar__meta">
          <h1 class="title-bar__channel">${CHANNEL.name}</h1>
          <p class="title-bar__topic">${CHANNEL.topic}</p>
        </div>
      </div>
      <div class="title-bar__actions" role="toolbar" aria-label="Channel actions">
        <div class="title-bar__action-group">
          ${ACTION_GROUPS.map(
            ({ id, icon, label }) => `
              <button class="title-bar__action" type="button" data-action="${id}" aria-label="${label}">
                <svg class="title-bar__action-icon" width="16" height="16" focusable="false">
                  <use href="#svg-${icon}"></use>
                </svg>
              </button>
            `
          ).join('')}
        </div>
        <label class="title-bar__search" aria-label="Search">
          <svg class="title-bar__search-icon" width="16" height="16" focusable="false" aria-hidden="true">
            <use href="#svg-magnifying-glass"></use>
          </svg>
          <input type="search" placeholder="Search" />
        </label>
        <div class="title-bar__action-group title-bar__action-group--utility">
          ${UTILITY_ACTIONS.map(
            ({ id, icon, label }) => `
              <button class="title-bar__action" type="button" data-action="${id}" aria-label="${label}">
                <svg class="title-bar__action-icon" width="16" height="16" focusable="false">
                  <use href="#svg-${icon}"></use>
                </svg>
              </button>
            `
          ).join('')}
        </div>
      </div>
    </header>
  `;

  return {
    focus() {
      root.querySelector('.title-bar__action')?.focus();
    }
  };
}
