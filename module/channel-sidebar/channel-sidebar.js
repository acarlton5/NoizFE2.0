import { getUserByToken } from '../users.js';

const DM_CHANNELS = [
  {
    token: 'marina-valentine',
    status: 'Designing stream overlays',
    unread: 3,
    accent: '#7c5dff'
  },
  {
    token: 'nick-grissom',
    status: 'Grinding ranked matches',
    unread: 0,
    accent: '#54d8ff'
  },
  {
    token: 'neko-bebop',
    status: 'Listening to synthwave',
    unread: 8,
    accent: '#ff72b6'
  },
  {
    token: 'sarah-diamond',
    status: 'On call • Mod sync',
    unread: 1,
    accent: '#ffa76d'
  }
];

const FAVORITES = ['marina-valentine', 'neko-bebop'];

const profileData = (u = {}) =>
  `data-profile-name="${u.name || ''}" data-profile-token="${u.token || ''}" data-profile-avatar="${u.avatar || ''}" data-profile-banner="${u.banner || ''}" data-profile-accent="${u.accent || ''}" data-profile-frame="${u.frame || ''}" data-profile-bio="${u.bio || ''}" data-profile-since="${u.memberSince || ''}" data-profile-connections="${(u.connections || []).join(',')}" data-profile-badges="${(u.badges || []).join(',')}" data-profile-streaming="${u.streaming ? 'true' : 'false'}"`;

const renderChannel = (user, meta = {}, active = false) => {
  if (!user) return '';
  const { status = '', unread = 0, accent = user.accent || '#6c5dff' } = meta;
  return `
    <li class="channel-sidebar__item${active ? ' is-active' : ''}" style="--accent:${accent}" ${profileData(user)}>
      <div class="avatar-wrap channel-sidebar__avatar" style="--avi-width:40px; --avi-height:40px; --frame:url('${user.frame}')">
        <img class="avatar-image" src="${user.avatar}" alt="${user.name}">
      </div>
      <div class="channel-sidebar__meta">
        <div class="channel-sidebar__name-row">
          <span class="channel-sidebar__name">${user.name}</span>
          ${FAVORITES.includes(user.token) ? '<svg class="channel-sidebar__favorite" aria-hidden="true" width="10" height="10"><use href="#svg-star"></use></svg>' : ''}
          ${unread > 0 ? `<span class="channel-sidebar__badge">${unread}</span>` : ''}
        </div>
        <span class="channel-sidebar__status">${status}</span>
      </div>
    </li>
  `;
};

export default async function init({ root }) {
  let currentUser = null;
  try {
    const loggedToken = await fetch('/data/logged-in.json').then((res) => res.json());
    currentUser = loggedToken ? await getUserByToken(loggedToken) : null;
  } catch (err) {
    console.warn('[channel-sidebar] failed to load logged-in user', err);
  }

  const dmUsers = (await Promise.all(DM_CHANNELS.map(({ token }) => getUserByToken(token)))).filter(Boolean);

  const markup = `
    <aside class="channel-sidebar">
      <header class="channel-sidebar__header">
        <div class="channel-sidebar__space">
          <span class="channel-sidebar__space-name">NOIZ Creators</span>
          <button type="button" class="channel-sidebar__dropdown" aria-label="Switch workspace">
            <svg width="12" height="12" aria-hidden="true"><use href="#svg-small-arrow"></use></svg>
          </button>
        </div>
        <div class="channel-sidebar__header-actions">
          <button type="button" class="channel-sidebar__icon-btn" aria-label="Create channel">
            <svg width="14" height="14" aria-hidden="true"><use href="#svg-plus"></use></svg>
          </button>
          <button type="button" class="channel-sidebar__icon-btn" aria-label="Inbox">
            <svg width="18" height="18" aria-hidden="true"><use href="#svg-messages"></use></svg>
          </button>
        </div>
      </header>
      <div class="channel-sidebar__search">
        <svg class="channel-sidebar__search-icon" width="16" height="16" aria-hidden="true"><use href="#svg-magnifying-glass"></use></svg>
        <input type="search" placeholder="Search or start a chat" aria-label="Search direct messages">
      </div>
      <section class="channel-sidebar__section">
        <div class="channel-sidebar__section-header">
          <span>Direct Messages</span>
          <button type="button" class="channel-sidebar__icon-btn" aria-label="New message">
            <svg width="12" height="12" aria-hidden="true"><use href="#svg-plus-small"></use></svg>
          </button>
        </div>
        <ul class="channel-sidebar__list">
          ${dmUsers.map((user, index) => {
            const meta = DM_CHANNELS.find((entry) => entry.token === user.token) || {};
            return renderChannel(user, meta, index === 0);
          }).join('')}
        </ul>
      </section>
      ${currentUser ? `
        <footer class="channel-sidebar__footer" ${profileData(currentUser)}>
          <div class="avatar-wrap channel-sidebar__footer-avatar" style="--avi-width:36px; --avi-height:36px; --frame:url('${currentUser.frame}')">
            <img class="avatar-image" src="${currentUser.avatar}" alt="${currentUser.name}">
          </div>
          <div class="channel-sidebar__footer-meta">
            <span class="channel-sidebar__footer-name">${currentUser.name}</span>
            <span class="channel-sidebar__footer-status">Online • ${currentUser.status?.online?.watching || 'Ready to chat'}</span>
          </div>
          <button type="button" class="channel-sidebar__icon-btn" aria-label="User settings">
            <svg width="16" height="16" aria-hidden="true"><use href="#svg-settings"></use></svg>
          </button>
        </footer>
      ` : ''}
    </aside>
  `;

  root.innerHTML = markup;

  return {};
}
