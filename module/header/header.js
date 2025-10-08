import { getUserByToken } from '../users.js';

const ACTION_ICONS = [
  { id: 'threads', label: 'Threads', icon: 'threads' },
  { id: 'notifications', label: 'Inbox', icon: 'bell' },
  { id: 'help', label: 'Help', icon: 'help' }
];

const iconSvg = (name) => {
  switch (name) {
    case 'threads':
      return '<path d="M4 4h16v4H4zm0 6h10v4H4zm12 6h-2v-4h2zm4-6h-4v-4h4z" />';
    case 'bell':
      return '<path d="M12 2a4 4 0 0 0-4 4v1.09C6.28 8.17 5 10.34 5 13v5h14v-5c0-2.66-1.28-4.83-3-5.91V6a4 4 0 0 0-4-4zm0 20a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22z" />';
    case 'help':
      return '<path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-.2 5.5a3 3 0 0 1 3.2 3 2.64 2.64 0 0 1-1.44 2.35c-.92.48-1.16.79-1.16 1.65h-2a3.23 3.23 0 0 1 1.86-3c.67-.33.94-.62.94-1.08a1 1 0 0 0-1.4-.92 1.22 1.22 0 0 0-.74 1.15h-2A3.16 3.16 0 0 1 11.8 7.5zm.2 9a1.5 1.5 0 1 1-1.5 1.5A1.5 1.5 0 0 1 12 16.5z" />';
    default:
      return '';
  }
};

export default async function init({ hub, root }) {
  const loggedToken = await fetch('/data/logged-in.json').then((res) => res.json()).catch(() => null);
  const user = loggedToken ? await getUserByToken(loggedToken) : null;

  root.innerHTML = `
    <header class="noiz-topbar" data-role="header">
      <div class="noiz-topbar__left">
        <button class="guild-switcher" type="button" aria-haspopup="true" aria-expanded="false">
          <span class="guild-switcher__name">GG Circle</span>
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 7l5 6 5-6z" /></svg>
        </button>
        <div class="topbar-divider"></div>
        <button class="topbar-pill" type="button" aria-label="Create channel">+</button>
        <button class="topbar-pill" type="button" aria-label="Server settings">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 3h-2l-.35 2.06a6 6 0 0 0-1.64.94L6.94 4.7 5.3 6.34l1.3 2.07a6 6 0 0 0-.91 1.62L3 10.99v2l2.07.35a6 6 0 0 0 .94 1.64l-1.24 2.07 1.64 1.64 2.07-1.24a6 6 0 0 0 1.62.91L11 21h2l.35-2.07a6 6 0 0 0 1.64-.91l2.07 1.24 1.64-1.64-1.24-2.07a6 6 0 0 0 .91-1.62L21 13v-2l-2.07-.35a6 6 0 0 0-.94-1.64l1.24-2.07-1.64-1.64-2.07 1.24a6 6 0 0 0-1.62-.91zM12 9a3 3 0 1 1-3 3 3 3 0 0 1 3-3z" /></svg>
        </button>
        <button class="topbar-pill" type="button" aria-label="Open server guide">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 4 16 8-16 8 4-8z" /></svg>
        </button>
      </div>
      <div class="noiz-topbar__right">
        <div class="topbar-search">
          <input type="search" placeholder="Search" aria-label="Search server" />
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 3a7.5 7.5 0 1 1-4.88 13.17l-3.3 3.29-1.42-1.41 3.3-3.3A7.5 7.5 0 0 1 10.5 3zm0 2a5.5 5.5 0 1 0 5.5 5.5 5.51 5.51 0 0 0-5.5-5.5z" /></svg>
        </div>
        <div class="topbar-actions" role="group" aria-label="Quick actions">
          ${ACTION_ICONS.map((action) => `
            <button class="topbar-icon" type="button" aria-label="${action.label}">
              <svg viewBox="0 0 24 24" aria-hidden="true">${iconSvg(action.icon)}</svg>
            </button>
          `).join('')}
        </div>
        ${user ? `
        <button class="user-pill" type="button" data-profile-name="${user.name}" data-profile-token="${user.token}" data-profile-avatar="${user.avatar}" data-profile-banner="${user.banner}" data-profile-accent="${user.accent}" data-profile-frame="${user.frame}" data-profile-bio="${user.bio || ''}" data-profile-since="${user.memberSince || ''}" data-profile-connections="${(user.connections || []).join(',')}" data-profile-badges="${(user.badges || []).join(',')}" data-profile-streaming="${user.streaming ? 'true' : 'false'}">
          <span class="user-pill__text">
            <span class="user-pill__name">${user.name}</span>
            <span class="user-pill__status">@${user.username || 'you'}</span>
          </span>
          <span class="avatar-wrap user-pill__avatar" style="--avi-width:32px; --avi-height:32px; --frame:url('${user.frame || ''}')">
            <img class="avatar-image" src="${user.avatar}" alt="${user.name}">
          </span>
        </button>` : ''}
      </div>
    </header>
  `;

  if (user) {
    const pill = root.querySelector('.user-pill');
    pill?.addEventListener('click', (event) => {
      const rect = pill.getBoundingClientRect();
      hub.api['mini-profile']
        ?.show(
          user,
          rect.left + rect.width / 2 + window.scrollX,
          rect.bottom + window.scrollY
        )
        .catch(() => {});
      event.preventDefault();
    });
  }

  return {
    async setTitle() {
      return undefined;
    }
  };
}
