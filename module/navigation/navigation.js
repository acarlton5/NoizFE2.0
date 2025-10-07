import { getUserByToken } from '../users.js';

const SERVER_GROUPS = [
  { id: 'discover', name: 'Discover NOIZ', badge: 'images/home-icon.svg', accent: '#5865f2' },
  { id: 'events', name: 'Events', badge: 'images/ui/category.png', accent: '#f471ff' },
  { id: 'creator-hub', name: 'Creator Hub', badge: 'images/ui/channel_mod.png', accent: '#ffb347' },
  { id: 'raids', name: 'Raid Party', badge: 'images/ui/members.png', accent: '#72ffb6' }
];

const FALLBACK_DM_TOKENS = [
  'marina-valentine',
  'neko-bebop',
  'nick-grissom',
  'sarah-diamond'
];

const profileAttrs = (user = {}) =>
  `data-profile-name="${user.name || ''}" data-profile-token="${user.token || ''}" data-profile-avatar="${user.avatar || ''}" data-profile-banner="${user.banner || ''}" data-profile-accent="${user.accent || ''}" data-profile-frame="${user.frame || ''}" data-profile-bio="${user.bio || ''}" data-profile-since="${user.memberSince || ''}" data-profile-connections="${(user.connections || []).join(',')}" data-profile-badges="${(user.badges || []).join(',')}" data-profile-streaming="${user.streaming ? 'true' : 'false'}"`;

const presenceLabel = (user = {}) => {
  const status = user.status || {};
  if (status.streaming) return 'Streaming';
  if (status.online && Object.keys(status.online).length) {
    const [activity] = Object.values(status.online);
    return activity || 'Online';
  }
  if (status.away !== null && status.away !== undefined) return 'Idle';
  if (status.dnd !== null && status.dnd !== undefined) return 'Busy';
  return 'Offline';
};

const presenceClass = (user = {}) => {
  const status = user.status || {};
  if (status.streaming) return 'status--streaming';
  if (status.online && Object.keys(status.online).length) return 'status--online';
  if (status.away !== null && status.away !== undefined) return 'status--idle';
  if (status.dnd !== null && status.dnd !== undefined) return 'status--dnd';
  return 'status--offline';
};

export default async function init({ hub, root, utils }) {
  let config = {};
  try {
    const res = await fetch('modules-enabled.json');
    config = await res.json();
  } catch (err) {
    console.error('[NOIZ] Failed to load modules-enabled.json', err);
  }

  const pageLinks = Object.values(config)
    .filter((m) => m.status === 'enabled' && m.navigation)
    .map((m) => ({
      title: m.name.charAt(0).toUpperCase() + m.name.slice(1),
      module: m.name,
      icon: `#svg-${m.icon}`
    }));

  const loggedToken = await fetch('/data/logged-in.json').then((r) => r.json()).catch(() => null);
  const currentUser = loggedToken ? await getUserByToken(loggedToken) : null;

  const dmTokens = Array.from(
    new Set([
      ...(currentUser?.subscribedTo || []),
      ...(currentUser?.following || []),
      ...FALLBACK_DM_TOKENS
    ])
  ).filter((token) => token && token !== currentUser?.token);

  const dmUsers = (await Promise.all(dmTokens.map(getUserByToken))).filter(Boolean);
  const dmMap = new Map(dmUsers.map((user) => [user.token, user]));

  let activeToken = dmUsers[0]?.token || null;
  const state = {
    query: ''
  };

  function render() {
    const filteredUsers = dmUsers.filter((user) => {
      if (!state.query) return true;
      const q = state.query.toLowerCase();
      return (
        user.name.toLowerCase().includes(q) ||
        user.token.toLowerCase().includes(q)
      );
    });

    root.innerHTML = `
      <div class="nav-shell">
        <aside class="nav-server-rail" aria-label="Server navigation">
          <button class="server-pill server-pill--home" type="button" aria-label="NOIZ Home">
            <img src="images/logo_badge.svg" alt="" />
          </button>
          <div class="server-divider"></div>
          <ul class="server-list">
            ${SERVER_GROUPS.map((group) => `
              <li>
                <button class="server-pill" type="button" data-server="${group.id}" aria-label="${group.name}" style="--server-accent:${group.accent}">
                  ${group.badge ? `<img src="${group.badge}" alt="" />` : `<span>${group.name.charAt(0)}</span>`}
                </button>
              </li>
            `).join('')}
          </ul>
          <button class="server-pill server-pill--add" type="button" aria-label="Add server">
            <span>+</span>
          </button>
        </aside>
        <section class="channel-column" aria-label="Direct messages">
          <header class="channel-column__header">
            <h2>Direct Messages</h2>
            <button type="button" class="channel-column__new" aria-label="Create message">+</button>
          </header>
          <div class="channel-column__search">
            <svg width="16" height="16" aria-hidden="true"><use xlink:href="#svg-magnifying-glass"></use></svg>
            <input type="search" placeholder="Find or start a conversation" value="${state.query.replace(/"/g, '&quot;')}" data-role="dm-search" />
          </div>
          <ul class="channel-list" data-role="dm-list">
            ${filteredUsers.map((user) => {
              const active = user.token === activeToken;
              return `
                <li>
                  <button type="button" class="channel-item${active ? ' active' : ''}" data-dm-token="${user.token}" ${profileAttrs(user)}>
                    <span class="channel-avatar avatar-wrap" style="--avi-width:32px; --avi-height:32px; --frame:url('${user.frame || ''}');">
                      <img class="avatar-image" src="${user.avatar}" alt="${user.name}" />
                    </span>
                    <span class="channel-meta">
                      <span class="channel-name">${user.name}</span>
                      <span class="channel-status ${presenceClass(user)}">
                        <span class="status-indicator"></span>
                        ${presenceLabel(user)}
                      </span>
                    </span>
                    <span class="channel-badge" aria-hidden="true"></span>
                  </button>
                </li>
              `;
            }).join('')}
            ${filteredUsers.length === 0 ? '<li class="channel-empty">No matches found</li>' : ''}
          </ul>
          ${pageLinks.length ? `
            <div class="channel-section">
              <h3 class="channel-section__title">Navigation</h3>
              <ul class="channel-list channel-list--pages" data-role="page-list">
                ${pageLinks.map((link) => `
                  <li>
                    <button type="button" class="channel-item" data-module="${link.module}">
                      <span class="channel-icon"><svg width="18" height="18" aria-hidden="true"><use xlink:href="${link.icon}"></use></svg></span>
                      <span class="channel-name">${link.title}</span>
                    </button>
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
        </section>
      </div>
    `;
  }

  function setActive(token, { emit = true, load = false } = {}) {
    if (!token || !dmMap.has(token)) return;
    activeToken = token;
    root.querySelectorAll('[data-dm-token]').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-dm-token') === activeToken);
    });
    const activeUser = dmMap.get(activeToken);
    if (emit && activeUser) {
      hub.emit('dm:selected', activeUser);
    }
    if (load && activeUser && window?.LoadMainModule) {
      window.LoadMainModule('messages', { user: activeUser });
    }
  }

  render();
  if (activeToken) {
    setActive(activeToken, { emit: true, load: true });
  }

  utils.delegate(root, 'click', '[data-dm-token]', (event, button) => {
    const token = button.getAttribute('data-dm-token');
    setActive(token, { emit: true, load: true });
  });

  utils.delegate(root, 'click', '[data-module]', (event, button) => {
    const mod = button.getAttribute('data-module');
    if (mod && window?.LoadMainModule) {
      window.LoadMainModule(mod);
    }
  });

  utils.delegate(root, 'input', '[data-role="dm-search"]', (event, input) => {
    state.query = input.value || '';
    render();
    setActive(activeToken, { emit: false, load: false });
  });

  const api = {
    getActiveDM() {
      return activeToken ? dmMap.get(activeToken) : null;
    },
    setActiveDM(token) {
      setActive(token, { emit: true, load: true });
    },
    listDMs() {
      return dmUsers.slice();
    }
  };

  return api;
}
