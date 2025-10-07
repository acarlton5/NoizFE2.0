const TEMPLATE = `
  <aside class="profile-panel" data-variant="sidebar">
    <div class="profile-scroll">
      <header class="profile-hero">
        <div class="profile-hero-sheen"></div>
        <div class="profile-hero-content">
          <div class="profile-avatar">
            <div class="avatar-wrap" style="--avi-width:88px; --avi-height:88px;">
              <img class="avatar-image" alt="" />
            </div>
          </div>
          <div class="profile-identity">
            <h1 class="profile-name"></h1>
            <p class="profile-handle"></p>
            <span class="profile-status-pill" data-role="presence"></span>
          </div>
        </div>
      </header>
      <div class="profile-content">
        <div class="profile-row profile-actions">
          <button class="profile-action primary">Add Friend</button>
          <button class="profile-action secondary" data-role="message-btn">
            Message
            <span class="profile-unread" data-role="unread"></span>
          </button>
        </div>
        <div class="profile-row profile-badges" data-role="badges"></div>
        <section class="profile-section profile-stats-section">
          <h2>Stats</h2>
          <ul class="profile-stats"></ul>
        </section>
        <section class="profile-section profile-about">
          <h2>About</h2>
          <p class="profile-bio"></p>
        </section>
        <section class="profile-section profile-member">
          <h2>Member Since</h2>
          <p class="profile-member-since"></p>
        </section>
        <section class="profile-section profile-topics">
          <h2>Topics</h2>
          <ul class="profile-topic-list"></ul>
        </section>
        <section class="profile-section profile-earned">
          <h2>Earned Badges</h2>
          <ul class="profile-earned-list"></ul>
        </section>
        <section class="profile-section profile-social">
          <h2>Connections</h2>
          <div class="profile-social-list"></div>
        </section>
      </div>
    </div>
  </aside>
`;

function mixColor(hex, percent) {
  const match = typeof hex === 'string' && hex.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return hex;

  let value = match[1];
  if (value.length === 3) {
    value = value
      .split('')
      .map((c) => c + c)
      .join('');
  }

  const num = parseInt(value, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const target = percent < 0 ? 0 : 255;
  const ratio = Math.min(1, Math.max(0, Math.abs(percent)));
  const mix = (channel) => Math.round((target - channel) * ratio + channel);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

function formatPresence(status = {}) {
  let state = 'offline';
  let label = 'Offline';
  let detail = '';

  if (status.streaming) {
    state = 'streaming';
    label = 'Streaming';
    detail = status.streaming.title || '';
  } else if (status.online) {
    state = 'online';
    label = 'Online';
    const entries = Object.entries(status.online).filter(([, value]) => value);
    if (entries.length) {
      const [activity, value] = entries[0];
      if (activity === 'watching' && typeof value === 'string') {
        detail = `Watching ${value}`;
      } else if (typeof value === 'string') {
        detail = value;
      }
    }
  } else if (status.away !== null && status.away !== undefined) {
    state = 'away';
    label = 'Away';
  } else if (status.dnd !== null && status.dnd !== undefined) {
    state = 'dnd';
    label = 'Do Not Disturb';
  }

  return { state, text: detail ? `${label} · ${detail}` : label };
}

export function buildProfileCard(root, { variant = 'sidebar' } = {}) {
  root.innerHTML = TEMPLATE;

  const panel = root.querySelector('.profile-panel');
  panel.dataset.variant = variant;

  const avatarWrap = root.querySelector('.profile-avatar .avatar-wrap');
  const avatarImg = root.querySelector('.profile-avatar img');
  const nameEl = root.querySelector('.profile-name');
  const handleEl = root.querySelector('.profile-handle');
  const presenceEl = root.querySelector('[data-role="presence"]');
  const statsList = root.querySelector('.profile-stats');
  const badgesWrap = root.querySelector('.profile-badges');
  const socialSection = root.querySelector('.profile-section.profile-social');
  const socialWrap = root.querySelector('.profile-social-list');
  const bioEl = root.querySelector('.profile-bio');
  const memberEl = root.querySelector('.profile-member-since');
  const topicsList = root.querySelector('.profile-topic-list');
  const earnedList = root.querySelector('.profile-earned-list');
  const unreadBadge = root.querySelector('[data-role="unread"]');
  const messageBtn = root.querySelector('[data-role="message-btn"]');

  const updateUnread = (value = 0) => {
    if (!unreadBadge) return;
    const count = Number(value) || 0;
    unreadBadge.textContent = count;
    unreadBadge.hidden = count <= 0;
  };

  const updateUser = (user = {}) => {
    const accent = user.accent || '#5865f2';
    const accentLight = mixColor(accent, 0.35) || accent;
    const accentDark = mixColor(accent, -0.45) || accent;

    panel.style.setProperty('--accent', accent);
    panel.style.setProperty('--accent-light', accentLight);
    panel.style.setProperty('--accent-dark', accentDark);
    panel.style.setProperty('--accent-gradient', `linear-gradient(135deg, ${accentDark}, ${accentLight})`);
    panel.style.setProperty('--banner-image', user.banner ? `url('${user.banner}')` : 'none');

    avatarWrap.style.setProperty('--frame', user.frame ? `url('${user.frame}')` : 'none');
    avatarImg.src = user.avatar || '';
    avatarImg.alt = user.name || 'Profile avatar';

    nameEl.textContent = user.name || 'Unknown User';
    if (user.token) {
      handleEl.textContent = `@${user.token}`;
      handleEl.hidden = false;
    } else {
      handleEl.textContent = '';
      handleEl.hidden = true;
    }

    if (presenceEl) {
      const { state, text } = formatPresence(user.status || {});
      presenceEl.dataset.state = state;
      presenceEl.textContent = text;
    }

    const stats = [
      { label: 'Followers', value: (user.followers || []).length },
      { label: 'Following', value: (user.following || []).length },
      { label: 'Subscribers', value: (user.subscribers || []).length },
      { label: 'Subscribed', value: (user.subscribedTo || []).length }
    ];
    statsList.innerHTML = stats
      .map(
        (stat) => `
          <li class="profile-stat">
            <span class="stat-value">${stat.value}</span>
            <span class="stat-label">${stat.label}</span>
          </li>`
      )
      .join('');

    if (user.badges && user.badges.length) {
      badgesWrap.innerHTML = user.badges
        .slice(0, 8)
        .map((badge) => `<img src="${badge}" alt="badge" loading="lazy" />`)
        .join('');
      badgesWrap.hidden = false;
    } else {
      badgesWrap.innerHTML = '';
      badgesWrap.hidden = true;
    }

    if (user.connections && user.connections.length) {
      socialWrap.innerHTML = user.connections
        .map((icon) => `<img src="${icon}" alt="connection" loading="lazy" />`)
        .join('');
      if (socialSection) socialSection.hidden = false;
    } else {
      socialWrap.innerHTML = '';
      if (socialSection) socialSection.hidden = true;
    }

    bioEl.textContent = user.bio || 'No bio provided yet.';
    memberEl.textContent = user.memberSince || 'Joined recently';

    if (Array.isArray(user.topics) && user.topics.length) {
      topicsList.innerHTML = user.topics
        .map(
          (topic) => `
          <li class="profile-topic">
            <span class="topic-name">${topic.name}</span>
            ${
              topic.permissions && topic.permissions.length
                ? `<span class="topic-perms">${topic.permissions.join(', ')}</span>`
                : ''
            }
          </li>`
        )
        .join('');
    } else {
      topicsList.innerHTML = '<li class="profile-empty">No topics yet.</li>';
    }

    const earned = Array.isArray(user['earned-badges']) ? user['earned-badges'] : [];
    if (earned.length) {
      earnedList.innerHTML = earned
        .map(
          (badge) => `
          <li class="profile-earned-item">
            <img src="${badge.icon}" alt="${badge.name}" loading="lazy" />
            <div class="earned-details">
              <strong>${badge.name}</strong>
              ${badge.description ? `<span>${badge.description}</span>` : ''}
              ${
                badge.awardedOn
                  ? `<span class="earned-meta">Awarded ${badge.awardedOn}${
                      badge.awardedFor ? ` · ${badge.awardedFor}` : ''
                    }</span>`
                  : ''
              }
            </div>
          </li>`
        )
        .join('');
    } else {
      earnedList.innerHTML = '<li class="profile-empty">No earned badges yet.</li>';
    }
  };

  updateUnread(0);

  return {
    updateUser,
    updateUnread,
    elements: {
      messageBtn,
      panel,
    }
  };
}
