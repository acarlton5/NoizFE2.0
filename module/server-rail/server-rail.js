import { getUserByToken } from '../users.js';

export default {
  async init({ root, props = {}, hub }) {
    const data = await resolveData(props);
    const activeId = props.activeId ?? data.servers.find(s => s.id !== 'home')?.id ?? 'home';

    root.innerHTML = `
      <aside class="noiz-server-rail d-flex flex-column align-items-center">
        <div class="rail-stack d-flex flex-column align-items-center flex-grow-1 w-100">
          <button class="rail-btn rail-home ${activeId === 'home' ? 'is-active' : ''}" data-action="home" data-id="home" title="NOIZ" style="--accent:${data.homeAccent}">
            <span class="indicator"></span>
            <span class="ring"></span>
            <img class="pfp" src="${data.homeImage}" alt="NOIZ">
          </button>

          <div class="rail-divider"></div>

          <div class="rail-scroll flex-grow-1 d-flex flex-column align-items-center">
            ${data.servers.filter(s => s.id !== 'home').map(s => renderServerBubble(s, activeId)).join('')}
          </div>
        </div>

        <div class="rail-bottom d-flex flex-column align-items-center w-100">
          <div class="rail-divider"></div>

          <button class="rail-btn rail-empty" data-action="add" title="Create / Discover">
            <span class="ring"></span>
            <span class="dot"></span>
          </button>
          <button class="rail-btn rail-empty" data-action="add" title="Create / Discover">
            <span class="ring"></span>
            <span class="dot"></span>
          </button>

          ${renderMeBubble(data.me)}
        </div>
      </aside>
    `;
    // Enable BS5 tooltips on rail buttons (floated to <body>)
    const btns = root.querySelectorAll('.rail-btn');
    for (const b of btns) {
      b.setAttribute('data-bs-toggle', 'tooltip');
      b.setAttribute('data-bs-placement', 'right');
      // use title attr if present, fallback to data-id/name
      if (!b.title) b.title = b.getAttribute('title') || b.dataset.id || '';
      // eslint-disable-next-line no-undef
      new bootstrap.Tooltip(b, {
        container: 'body',
        boundary: document.body,
        customClass: 'noiz-tooltip',
        trigger: 'hover focus'
      });
    }

    // interactions
    root.addEventListener('click', (e) => {
      const btn = e.target.closest('.rail-btn');
      if (!btn) return;
      const action = btn.dataset.action;

      if (action === 'open' || action === 'home') {
        // visual active state
        root.querySelectorAll('.rail-btn.is-active').forEach(n => n.classList.remove('is-active'));
        btn.classList.add('is-active');
        if (action === 'open') {
          hub.emit('server-rail:open', { id: btn.dataset.id });
        } else {
          hub.emit('server-rail:home', { id: btn.dataset.id });
        }
      } else if (action === 'add') {
        hub.emit('server-rail:add');
      } else if (action === 'me') {
        hub.emit('server-rail:me');
      }
    });
  },

  api(hub) {
    return {
      setActive(id) {
        const btn = document.querySelector(`.noiz-server-rail .rail-btn[data-id="${CSS.escape(id)}"]`);
        if (!btn) return;
        document.querySelectorAll('.noiz-server-rail .rail-btn.is-active').forEach(n => n.classList.remove('is-active'));
        btn.classList.add('is-active');
      }
    };
  }
};

function renderServerBubble(server, activeId) {
  if (!server) return '';
  const isActive = server.id === activeId;
  const classes = ['rail-btn', 'rail-server', `rail-${server.source || 'following'}`];
  if (server.unread) classes.push('has-unread');
  if (isActive) classes.push('is-active');
  const status = server.status ? `<span class="status status-${server.status}"></span>` : '';
  const unread = server.unread ? `<span class="badge">${server.unread}</span>` : '';
  return `
    <button class="${classes.join(' ')}" data-action="open" data-id="${server.id}" title="${server.name}" style="--accent:${server.accent}">
      <span class="indicator"></span>
      <span class="ring"></span>
      <img class="pfp" src="${server.img}" alt="${server.name}">
      ${status}
      ${unread}
    </button>
  `;
}

function renderMeBubble(me) {
  if (!me) return '';
  return `
    <button class="rail-btn rail-me" data-action="me" data-id="${me.id || ''}" title="${me.name}" style="--accent:${me.accent}">
      <span class="ring"></span>
      <img class="pfp" src="${me.img}" alt="${me.name}">
      <span class="status status-${me.status}"></span>
    </button>
  `;
}

async function resolveData(props) {
  const homeImage = props.home?.img ?? '/images/logo.png';
  const homeAccent = props.home?.accent ?? '#f907fc';

  if (Array.isArray(props.servers) && props.servers.length) {
    const servers = props.servers.map((server) => normalizeServer(server)).filter(Boolean);
    const me = normalizeMe(props.me);
    return {
      homeImage,
      homeAccent,
      servers: [{ id: 'home', name: 'NOIZ', img: homeImage, accent: homeAccent }, ...servers],
      me
    };
  }

  const loggedInToken = props.loggedIn ?? await fetchLoggedInToken();
  const loggedInUser = loggedInToken ? await safeGetUser(loggedInToken) : null;

  const subscribedTokens = uniqueList(props.subscribedTo ?? loggedInUser?.subscribedTo ?? []);
  const subscribedUsers = await loadUsers(subscribedTokens);
  const subscribedServers = subscribedUsers.map((user) => normalizeServer({
    id: user.token,
    name: user.name,
    img: user.avatar,
    accent: user.accent,
    status: derivePresence(user)
  }, 'subscribed'));

  const subscribedSet = new Set(subscribedTokens);
  const followingTokensRaw = props.following ?? loggedInUser?.following ?? [];
  const followingTokens = uniqueList(followingTokensRaw.filter((token) => token && !subscribedSet.has(token)));
  const followingUsers = await loadUsers(followingTokens);
  const followingServers = followingUsers.map((user) => normalizeServer({
    id: user.token,
    name: user.name,
    img: user.avatar,
    accent: user.accent,
    status: derivePresence(user)
  }, 'following'));

  const me = normalizeMe(loggedInUser ? {
    id: loggedInUser.token,
    name: loggedInUser.name,
    img: loggedInUser.avatar,
    accent: loggedInUser.accent,
    status: derivePresence(loggedInUser)
  } : props.me);

  const servers = [...subscribedServers, ...followingServers].filter(Boolean);

  return {
    homeImage,
    homeAccent,
    servers: [{ id: 'home', name: 'NOIZ', img: homeImage, accent: homeAccent }, ...servers],
    me
  };
}

async function fetchLoggedInToken() {
  try {
    const res = await fetch('/data/logged-in.json', { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('[server-rail] failed to read logged-in user', err);
    return null;
  }
}

async function safeGetUser(token) {
  try {
    return token ? await getUserByToken(token) : null;
  } catch (err) {
    console.warn('[server-rail] failed to load user', token, err);
    return null;
  }
}

async function loadUsers(tokens) {
  if (!Array.isArray(tokens) || !tokens.length) return [];
  const results = await Promise.allSettled(tokens.map((token) => safeGetUser(token)));
  return results
    .filter((r) => r.status === 'fulfilled' && r.value)
    .map((r) => r.value);
}

function normalizeServer(server, source) {
  if (!server) return null;
  const accent = server.accent || (source === 'subscribed' ? '#f907fc' : '#05d6d9');
  return {
    id: server.id,
    name: server.name || server.id,
    img: server.img || '/images/logo.png',
    accent,
    status: server.status || null,
    unread: server.unread ?? null,
    source: source || server.source || null
  };
}

function normalizeMe(me) {
  if (!me) {
    return {
      id: 'me',
      name: 'You',
      img: '/images/me.png',
      accent: '#72ffb6',
      status: 'online'
    };
  }
  return {
    id: me.id ?? me.token ?? 'me',
    name: me.name ?? 'You',
    img: me.img ?? me.avatar ?? '/images/me.png',
    accent: me.accent ?? '#72ffb6',
    status: me.status ?? 'online'
  };
}

function derivePresence(user) {
  const status = user?.status || {};
  if (status.streaming) return 'streaming';
  if (status.dnd) return 'dnd';
  if (status.away) return 'away';
  if (status.online) return 'online';
  return 'offline';
}

function uniqueList(tokens) {
  const seen = new Set();
  const out = [];
  for (const token of tokens || []) {
    if (!token || seen.has(token)) continue;
    seen.add(token);
    out.push(token);
  }
  return out;
}
