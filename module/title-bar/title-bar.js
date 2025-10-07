// module/title-bar/title-bar.js
// Discord-inspired direct message header rebuilt to mirror the supplied reference.
// Pulls the logged-in user and first connection to surface a conversation identity
// with accent-driven styling and utility controls only (no navigation changes yet).

const ACTION_GROUPS = [
  [
    { id: 'voice', icon: 'streams', label: 'Start voice call' },
    { id: 'video', icon: 'newsfeed', label: 'Start video call' },
    { id: 'pin', icon: 'notification', label: 'View pinned messages' },
    { id: 'add-friends', icon: 'friend', label: 'Add friends to DM' }
  ],
  [
    { id: 'inbox', icon: 'comment', label: 'Inbox' },
    { id: 'help', icon: 'settings', label: 'User settings' }
  ]
];

const DEFAULT_ACCENT = '#7a5cff';

function hexToRgb(hex) {
  const value = hex?.replace('#', '');
  if (!value || value.length !== 6) {
    return { r: 90, g: 76, b: 190 };
  }
  const int = parseInt(value, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255
  };
}

function gradientFromAccent(accent) {
  const { r, g, b } = hexToRgb(accent || DEFAULT_ACCENT);
  return `linear-gradient(135deg, rgba(24, 18, 36, 0.95) 0%, rgba(34, 22, 54, 0.96) 40%, rgba(${r}, ${g}, ${b}, 0.95) 100%)`;
}

function statusFromProfile(status = {}) {
  if (status.streaming) {
    return { state: 'streaming', text: status.streaming.title || 'Streaming' };
  }
  if (status.online) {
    const detail = typeof status.online === 'string' ? status.online : status.online.watching;
    return { state: 'online', text: detail ? `Online — ${detail}` : 'Online' };
  }
  if (status.dnd) {
    return { state: 'dnd', text: typeof status.dnd === 'string' ? status.dnd : 'Do Not Disturb' };
  }
  if (status.away) {
    const detail = typeof status.away === 'string' ? status.away : status.away.playing;
    return { state: 'idle', text: detail ? `Idle — ${detail}` : 'Idle' };
  }
  return { state: 'offline', text: 'Offline' };
}

function renderActions() {
  const groups = ACTION_GROUPS.map(group => `
    <div class="title-bar__action-group" role="group">
      ${group.map(({ id, icon, label }) => `
        <button class="title-bar__action" type="button" data-action="${id}" aria-label="${label}">
          <svg class="title-bar__action-icon" width="20" height="20" focusable="false">
            <use href="#svg-${icon}"></use>
          </svg>
        </button>
      `).join('')}
    </div>
  `).join('');

  return `
    <div class="title-bar__actions" role="toolbar" aria-label="Conversation actions">
      ${groups}
    </div>
  `;
}

export default async function init({ root }) {
  const [{ getUserByToken }] = await Promise.all([
    import('../users.js')
  ]);

  const loggedInToken = await fetch('/data/logged-in.json').then(res => res.json());
  const viewer = await getUserByToken(loggedInToken);
  const partnerToken = viewer.following?.[0] || viewer.followers?.[0] || loggedInToken;
  const partner = await getUserByToken(partnerToken);

  const accent = partner.accent || DEFAULT_ACCENT;
  const gradient = gradientFromAccent(accent);
  const status = statusFromProfile(partner.status);
  const badge = partner.BadgeID ? partner.BadgeID.toUpperCase() : null;

  root.innerHTML = `
    <header class="title-bar" role="banner" style="--title-bar-gradient: ${gradient}; --title-bar-accent: ${accent};">
      <div class="title-bar__primary">
        <button class="title-bar__back" type="button" aria-label="Open conversation list">
          <svg class="title-bar__back-icon" width="16" height="16" focusable="false">
            <use href="#svg-back-arrow"></use>
          </svg>
        </button>
        <div class="title-bar__avatar" aria-hidden="true">
          <span class="title-bar__avatar-ring"></span>
          <img src="${partner.avatar}" alt="${partner.name} avatar" loading="lazy"/>
          <span class="title-bar__presence" data-state="${status.state}"></span>
        </div>
        <div class="title-bar__identity">
          <div class="title-bar__title-row">
            <span class="title-bar__name">${partner.name}</span>
            ${badge ? `<span class="title-bar__tag">${badge}</span>` : ''}
          </div>
          <p class="title-bar__status" data-state="${status.state}">
            <span class="title-bar__status-dot"></span>
            <span class="title-bar__status-text">${status.text}</span>
          </p>
        </div>
      </div>
      <div class="title-bar__secondary">
        ${renderActions()}
        <label class="title-bar__search" aria-label="Search conversations">
          <input class="title-bar__search-input" type="search" placeholder="Search" spellcheck="false"/>
          <svg class="title-bar__search-icon" width="18" height="18" focusable="false">
            <use href="#svg-magnifying-glass"></use>
          </svg>
        </label>
      </div>
    </header>
  `;

  return {
    focus() {
      root.querySelector('.title-bar__back')?.focus();
    }
  };
}
