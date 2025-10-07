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

const fallbackAccent = '#7c5dff';

const readProfileFromElement = (element, map) => {
  const token = element?.dataset?.profileToken;
  if (!token) return null;
  if (map.has(token)) return map.get(token);
  return {
    token,
    name: element?.dataset?.profileName || '',
    avatar: element?.dataset?.profileAvatar || '',
    banner: element?.dataset?.profileBanner || '',
    accent: element?.dataset?.profileAccent || '',
    frame: element?.dataset?.profileFrame || '',
    bio: element?.dataset?.profileBio || '',
    memberSince: element?.dataset?.profileSince || '',
    connections: (element?.dataset?.profileConnections || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    badges: (element?.dataset?.profileBadges || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    streaming: element?.dataset?.profileStreaming === 'true'
  };
};

const applyAccent = (accent) => {
  if (accent) {
    document.documentElement.style.setProperty('--color-accent', accent);
  } else {
    document.documentElement.style.removeProperty('--color-accent');
  }
};

const syncChannelSidebar = async (hub, user) => {
  if (!user) return;
  try {
    const api = await hub.require('channel-sidebar');
    if (typeof api?.loadForUser === 'function') {
      await api.loadForUser(user);
    }
  } catch (err) {
    console.warn('[navigation] failed to sync channel sidebar', err);
  }
};

export default async function init({ hub, root, utils }) {
  let currentUser = null;
  try {
    const loggedToken = await fetch('/data/logged-in.json').then((res) => res.json());
    currentUser = loggedToken ? await getUserByToken(loggedToken) : null;
  } catch (err) {
    console.warn('[navigation] failed to load logged-in user', err);
  }

  if (currentUser?.accent) {
    document.documentElement.style.setProperty('--color-accent-user', currentUser.accent);
  } else {
    document.documentElement.style.removeProperty('--color-accent-user');
  }

  const servers = (await Promise.all(SERVER_TOKENS.map((token) => getUserByToken(token)))).filter(Boolean);

  const userMap = new Map();
  servers.forEach((server) => {
    if (server?.token) userMap.set(server.token, server);
  });
  if (currentUser?.token) {
    userMap.set(currentUser.token, currentUser);
  }

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
              <li class="server-rail__entry${index === 0 ? ' is-active' : ''}" style="--accent:${server.accent || fallbackAccent}" ${profileData(server)}>
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
          <button class="server-rail__item server-rail__item--me" type="button" aria-label="${currentUser.name}">
            <div class="avatar-wrap" style="--avi-width:40px; --avi-height:40px; --frame:url('${currentUser.frame}')">
              <img class="avatar-image" src="${currentUser.avatar}" alt="${currentUser.name}">
            </div>
          </button>
        </div>
      ` : ''}
    </nav>
  `;

  const meNode = root.querySelector('.server-rail__me');
  const staticLists = root.querySelectorAll('.server-rail__list--static .server-rail__entry');
  staticLists.forEach((entry) => entry.classList.remove('is-active'));

  let activeElement = root.querySelector('.server-rail__entry.is-active') || null;

  const activate = async (element) => {
    if (!element) return;
    if (activeElement === element) return;
    if (activeElement) activeElement.classList.remove('is-active');
    if (meNode && activeElement === meNode) {
      meNode.classList.remove('is-active');
    }
    activeElement = element;
    activeElement.classList.add('is-active');

    const profile = readProfileFromElement(activeElement, userMap);
    const accent = profile?.accent || fallbackAccent;
    applyAccent(accent);
    await syncChannelSidebar(hub, profile);
  };

  utils.delegate(root, 'click', '.server-rail__list .server-rail__item', async (event, target) => {
    const entry = target.closest('.server-rail__entry');
    if (!entry || entry.dataset.item) return;
    event.preventDefault();
    if (meNode) meNode.classList.remove('is-active');
    await activate(entry);
  });

  if (meNode) {
    utils.listen(meNode, 'click', async (event) => {
      event.preventDefault();
      if (activeElement && activeElement !== meNode) {
        activeElement.classList.remove('is-active');
      }
      meNode.classList.add('is-active');
      activeElement = meNode;
      const profile = readProfileFromElement(meNode, userMap) || currentUser;
      const accent = profile?.accent || currentUser?.accent || fallbackAccent;
      applyAccent(accent);
      await syncChannelSidebar(hub, profile);
    });
  }

  const initialProfile = activeElement
    ? readProfileFromElement(activeElement, userMap)
    : servers[0] || currentUser;
  applyAccent(initialProfile?.accent || fallbackAccent);
  await syncChannelSidebar(hub, initialProfile);

  return {};
}
