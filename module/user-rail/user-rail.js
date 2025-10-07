import { getUserByToken } from '../users.js';

const presenceDetails = (user = {}) => {
  const status = user.status || {};
  if (status.streaming) {
    return { label: 'Streaming', cls: 'status--streaming' };
  }
  if (status.online && Object.keys(status.online).length) {
    return { label: 'Online', cls: 'status--online' };
  }
  if (status.away !== null && status.away !== undefined) {
    return { label: 'Idle', cls: 'status--idle' };
  }
  if (status.dnd !== null && status.dnd !== undefined) {
    return { label: 'Busy', cls: 'status--dnd' };
  }
  return { label: 'Offline', cls: 'status--offline' };
};

const renderBadge = (badge) => {
  if (!badge) return '';
  if (typeof badge === 'string') {
    return `<span class="member-card__badge"><img src="${badge}" alt="" /></span>`;
  }
  if (badge?.icon) {
    return `<span class="member-card__badge" title="${badge.name || ''}"><img src="${badge.icon}" alt="${badge.name || ''}" /></span>`;
  }
  return '';
};

export default async function init({ hub, root, utils }) {
  root.innerHTML = `
    <aside class="member-sidebar" aria-label="Member details">
      <div class="member-card" data-role="card">
        <div class="member-card__hero">
          <div class="member-card__banner" data-role="banner"></div>
          <span class="member-card__avatar avatar-wrap" data-role="avatar" style="--avi-width:72px; --avi-height:72px;">
            <img class="avatar-image" alt="" />
          </span>
        </div>
        <div class="member-card__body">
          <div class="member-card__identity">
            <div class="member-card__name-group">
              <h2 class="member-card__name" data-role="name">Select a conversation</h2>
              <span class="member-card__tag" data-role="handle"></span>
            </div>
            <span class="member-card__presence status--offline" data-role="presence">
              <span class="status-indicator"></span>
              <span data-role="presence-text">Offline</span>
            </span>
          </div>
          <p class="member-card__bio" data-role="bio">Choose a direct message from the list to view profile details.</p>
          <div class="member-card__stats" data-role="stats"></div>
          <div class="member-card__section" data-role="mutual-section">
            <h3>Mutual Topics</h3>
            <ul class="member-card__mutuals" data-role="mutuals"></ul>
          </div>
          <div class="member-card__section" data-role="badges-section">
            <h3>Badges</h3>
            <div class="member-card__badges" data-role="badges"></div>
          </div>
          <div class="member-card__footer">
            <button class="member-card__primary" type="button">Send Message</button>
            <button class="member-card__secondary" type="button">View Profile</button>
          </div>
        </div>
      </div>
    </aside>
  `;

  const card = root.querySelector('[data-role="card"]');
  const banner = root.querySelector('[data-role="banner"]');
  const avatar = root.querySelector('[data-role="avatar"]');
  const avatarImg = avatar.querySelector('img');
  const nameEl = root.querySelector('[data-role="name"]');
  const handleEl = root.querySelector('[data-role="handle"]');
  const presenceEl = root.querySelector('[data-role="presence"]');
  const presenceText = root.querySelector('[data-role="presence-text"]');
  const bioEl = root.querySelector('[data-role="bio"]');
  const badgesWrap = root.querySelector('[data-role="badges"]');
  const mutualList = root.querySelector('[data-role="mutuals"]');
  const mutualSection = root.querySelector('[data-role="mutual-section"]');
  const badgesSection = root.querySelector('[data-role="badges-section"]');
  const statsWrap = root.querySelector('[data-role="stats"]');
  const primaryBtn = root.querySelector('.member-card__primary');
  const secondaryBtn = root.querySelector('.member-card__secondary');

  let activeUser = null;

  function applyUser(user) {
    activeUser = user || null;
    if (!user) {
      card.classList.add('is-empty');
      banner.style.removeProperty('--banner-image');
      avatar.style.removeProperty('--frame');
      avatarImg.removeAttribute('src');
      avatarImg.alt = '';
      nameEl.textContent = 'Select a conversation';
      handleEl.textContent = '';
      presenceEl.className = 'member-card__presence status--offline';
      presenceText.textContent = 'Offline';
      bioEl.textContent = 'Choose a direct message from the list to view profile details.';
      mutualList.innerHTML = '';
      mutualSection.style.display = 'none';
      badgesWrap.innerHTML = '';
      badgesSection.style.display = 'none';
      statsWrap.innerHTML = '';
      primaryBtn.disabled = true;
      secondaryBtn.disabled = true;
      return;
    }

    card.classList.remove('is-empty');
    primaryBtn.disabled = false;
    secondaryBtn.disabled = false;

    if (user.banner) {
      banner.style.setProperty('--banner-image', `url('${user.banner}')`);
    } else {
      banner.style.removeProperty('--banner-image');
    }
    if (user.frame) {
      avatar.style.setProperty('--frame', `url('${user.frame}')`);
    } else {
      avatar.style.removeProperty('--frame');
    }
    if (user.avatar) {
      avatarImg.src = user.avatar;
      avatarImg.alt = user.name || '';
    }

    card.style.setProperty('--accent', user.accent || '#5865f2');
    nameEl.textContent = user.name || 'Unknown user';
    handleEl.textContent = user.token ? `@${user.token}` : '';

    const presence = presenceDetails(user);
    presenceEl.className = `member-card__presence ${presence.cls}`;
    presenceText.textContent = presence.label;

    bioEl.textContent = user.bio || 'No bio provided yet.';

    const mutuals = Array.isArray(user.topics)
      ? user.topics.map((topic) => topic?.name).filter(Boolean)
      : [];
    if (mutuals.length) {
      mutualSection.style.display = '';
      mutualList.innerHTML = mutuals
        .map((topic) => `<li class="member-card__mutual">#${topic}</li>`)
        .join('');
    } else {
      mutualSection.style.display = 'none';
      mutualList.innerHTML = '';
    }

    const earned = Array.isArray(user['earned-badges']) ? user['earned-badges'] : [];
    const simpleBadges = Array.isArray(user.badges) ? user.badges : [];
    const badgeMarkup = earned.length
      ? earned.slice(0, 6).map(renderBadge).join('')
      : simpleBadges.slice(0, 6).map(renderBadge).join('');
    if (badgeMarkup) {
      badgesWrap.innerHTML = badgeMarkup;
      badgesSection.style.display = '';
    } else {
      badgesWrap.innerHTML = '';
      badgesSection.style.display = 'none';
    }

    const stats = [];
    if (user.memberSince) {
      stats.push(`<div class="member-card__stat"><span class="label">Member since</span><span class="value">${user.memberSince}</span></div>`);
    }
    if (Array.isArray(user.connections) && user.connections.length) {
      stats.push(`<div class="member-card__stat"><span class="label">Connections</span><div class="value value--icons">${user.connections
        .slice(0, 4)
        .map((url) => `<img src="${url}" alt="" />`)
        .join('')}</div></div>`);
    }
    statsWrap.innerHTML = stats.join('');
  }

  const off = hub.on('dm:selected', (user) => {
    applyUser(user);
  });
  utils.onCleanup(off);

  hub.require('navigation').then((nav) => {
    try {
      const active = nav?.getActiveDM?.();
      if (active) {
        applyUser(active);
      }
    } catch (err) {
      console.warn('[NOIZ] user rail could not fetch active DM', err);
    }
  });

  utils.delegate(root, 'click', '.member-card__primary', () => {
    if (activeUser?.token && window?.LoadMainModule) {
      window.LoadMainModule('messages', { user: activeUser });
    }
  });

  utils.delegate(root, 'click', '.member-card__secondary', async () => {
    if (!activeUser?.token) return;
    const full = await getUserByToken(activeUser.token);
    window.LoadMainModule?.('profile', { user: full });
  });

  applyUser(null);

  return {};
}
