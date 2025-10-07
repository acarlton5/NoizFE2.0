import { getUserByToken } from '../users.js';

const SERVER_TOKENS = ['marina-valentine', 'nick-grissom', 'neko-bebop', 'sarah-diamond'];

const STATIC_ITEMS = [
  {
    id: 'discover',
    icon: '#svg-grid',
    label: 'Discover'
  },
  {
    id: 'add',
    icon: '#svg-plus',
    label: 'Add Server'
  }
];

const profileData = (u = {}) =>
  `data-profile-name="${u.name || ''}" data-profile-token="${u.token || ''}" data-profile-avatar="${u.avatar || ''}" data-profile-banner="${u.banner || ''}" data-profile-accent="${u.accent || ''}" data-profile-frame="${u.frame || ''}" data-profile-bio="${u.bio || ''}" data-profile-since="${u.memberSince || ''}" data-profile-connections="${(u.connections || []).join(',')}" data-profile-badges="${(u.badges || []).join(',')}" data-profile-streaming="${u.streaming ? 'true' : 'false'}"`;

export default async function init({ root }) {
  let currentUser = null;
  try {
    const loggedToken = await fetch('/data/logged-in.json').then((res) => res.json());
    currentUser = loggedToken ? await getUserByToken(loggedToken) : null;
  } catch (err) {
    console.warn('[navigation] failed to load logged-in user', err);
  }

  const servers = (await Promise.all(SERVER_TOKENS.map((token) => getUserByToken(token)))).filter(Boolean);

  root.innerHTML = `
    <nav class="server-rail" aria-label="Servers">
      <button class="server-rail__item server-rail__item--brand" type="button" aria-label="NOIZ Home">
        <img src="images/logo_badge.svg" alt="NOIZ" class="server-rail__brand-icon"/>
        <span class="server-rail__brand-name">NOIZ</span>
      </button>
      <div class="server-rail__divider" role="presentation"></div>
      <ul class="server-rail__list">
        ${servers
          .map(
            (server, index) => `
              <li class="server-rail__entry${index === 0 ? ' is-active' : ''}" style="--accent:${server.accent || '#7c5dff'}" ${profileData(server)}>
                <button class="server-rail__item" type="button" aria-label="${server.name}">
                  <div class="avatar-wrap" style="--avi-width:46px; --avi-height:46px; --frame:url('${server.frame}')">
                    <img class="avatar-image" src="${server.avatar}" alt="${server.name}">
                  </div>
                </button>
              </li>
            `
          )
          .join('')}
      </ul>
      <div class="server-rail__divider server-rail__divider--faded" role="presentation"></div>
      <ul class="server-rail__list server-rail__list--static">
        ${STATIC_ITEMS.map(
          (item) => `
            <li class="server-rail__entry" data-item="${item.id}">
              <button class="server-rail__item server-rail__item--icon" type="button" aria-label="${item.label}">
                <svg aria-hidden="true" width="22" height="22"><use href="${item.icon}"></use></svg>
              </button>
            </li>
          `
        ).join('')}
      </ul>
      ${currentUser ? `
        <div class="server-rail__me" ${profileData(currentUser)}>
          <div class="avatar-wrap" style="--avi-width:40px; --avi-height:40px; --frame:url('${currentUser.frame}')">
            <img class="avatar-image" src="${currentUser.avatar}" alt="${currentUser.name}">
          </div>
          <span class="server-rail__me-name">${currentUser.name}</span>
        </div>
      ` : ''}
    </nav>
  `;

  return {};
}
