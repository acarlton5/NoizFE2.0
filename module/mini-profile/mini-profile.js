import { getUserByToken } from '../users.js';

export default async function init({ hub, root, utils }) {
  const loggedIn = await fetch('/data/logged-in.json').then(r => r.json()).catch(() => null);

  const icons = {
    follow:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/><path fill-rule="evenodd" d="M12 14a7 7 0 0 0-7 7 .75.75 0 0 0 1.5 0 5.5 5.5 0 0 1 11 0 .75.75 0 0 0 1.5 0 7 7 0 0 0-7-7Z" clip-rule="evenodd"/><path d="M19 7a1 1 0 1 0 0-2h-1V4a1 1 0 1 0-2 0v1h-1a1 1 0 1 0 0 2h1v1a1 1 0 1 0 2 0V7h1Z"/></svg>',
    support:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M11.645 20.353a.75.75 0 0 0 .71 0 45.956 45.956 0 0 0 1.035-.62c1.588-.977 3.267-2.015 4.825-3.152C21.247 14.73 23 12.537 23 9.943 23 7.206 20.955 5 18.352 5c-1.542 0-3.01.876-3.708 2.18a.75.75 0 0 1-1.288 0C12.655 5.876 11.187 5 9.645 5 7.043 5 5 7.206 5 9.943c0 2.594 1.753 4.786 3.785 6.638 1.558 1.137 3.237 2.175 4.825 3.152.345.212.689.42 1.035.62Z" clip-rule="evenodd"/></svg>',
    shop:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M7.5 6v.75H5.513c-.964 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 0 0 4.25 22.5h15.5a1.875 1.875 0 0 0 1.865-2.071l-1.263-12a1.875 1.875 0 0 0-1.865-1.679H16.5V6a4.5 4.5 0 1 0-9 0ZM12 3a3 3 0 0 0-3 3v.75h6V6a3 3 0 0 0-3-3Zm-3 8.25a3 3 0 1 0 6 0v-.75a.75.75 0 0 1 1.5 0v.75a4.5 4.5 0 1 1-9 0v-.75a.75.75 0 0 1 1.5 0v.75Z" clip-rule="evenodd"/></svg>',
    stream:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 3.5v17l14-8.5-14-8.5Z"/></svg>'
  };
  root.innerHTML = `
    <div class="mini-profile hidden" role="dialog" aria-modal="false" aria-hidden="true">
      <div class="mp-banner"></div>
      <div class="mp-accent"></div>
      <div class="mp-body">
        <div class="mp-avatar"><img alt="" /></div>
        <h2 class="mp-name"></h2>
        <p class="mp-tagline"></p>
        <div class="mp-badges"></div>
        <div class="mp-actions"></div>
        <div class="mp-section mp-about-section">
          <h3>About Me</h3>
          <p class="mp-about"></p>
        </div>
        <div class="mp-section mp-member">
          <h3>Member Since</h3>
          <p class="mp-member-date"></p>
        </div>
        <div class="mp-section mp-connections">
          <h3>Connections</h3>
          <div class="mp-conn-list"></div>
        </div>
        <div class="mp-section mp-activity">
          <h3>Activity</h3>
          <ul class="mp-activity-list"></ul>
        </div>
      </div>
    </div>
  `;

  const card = root.querySelector('.mini-profile');
  const banner = card.querySelector('.mp-banner');
  const avatarImg = card.querySelector('.mp-avatar img');
  const nameEl = card.querySelector('.mp-name');
  const tagEl = card.querySelector('.mp-tagline');
  const actions = card.querySelector('.mp-actions');
  const badgesEl = card.querySelector('.mp-badges');
  const aboutSection = card.querySelector('.mp-about-section');
  const aboutEl = card.querySelector('.mp-about');
  const memberDateEl = card.querySelector('.mp-member-date');
  const connList = card.querySelector('.mp-conn-list');
  const activitySection = card.querySelector('.mp-activity');
  const activityList = card.querySelector('.mp-activity-list');

  let tooltip;
  function showTooltip(el) {
    const title = el.getAttribute('aria-label');
    if (!title) return;
    tooltip = document.createElement('div');
    tooltip.className = 'navigation-small-tooltip';
    tooltip.textContent = title;
    tooltip.style.zIndex = '2100';
    document.body.appendChild(tooltip);
    const rect = el.getBoundingClientRect();
    tooltip.style.top = `${rect.top + rect.height / 2}px`;
    tooltip.style.left = `${rect.right}px`;
    requestAnimationFrame(() => tooltip.classList.add('visible'));
  }
  function hideTooltip() {
    if (tooltip) {
      tooltip.remove();
      tooltip = null;
    }
  }

  utils.delegate(actions, 'mouseover', '.mp-action', (e, el) => showTooltip(el));
  utils.delegate(actions, 'mouseout', '.mp-action', hideTooltip);

  function activityCards(user = {}) {
    const cards = [];
    const status = user.status || {};

    if (status.streaming) {
      const s = status.streaming;
      cards.push(
        `<li class="activity-card streaming">${
          s.thumbnailId ? `<img src="${s.thumbnailId}" alt="" />` : ''
        }<div class="act-info"><strong>${s.title || 'Streaming'}</strong>${
          s.viewers ? `<span>${s.viewers} viewers</span>` : ''
        }</div><button class="act-btn watch">Watch</button></li>`
      );
    } else if (status.online) {
      const entries = Object.entries(status.online).filter(([k, v]) => v);
      if (entries.length) {
        const [k, v] = entries[0];
        const btn =
          k === 'watching'
            ? '<button class="act-btn join">Join</button>'
            : '';
        cards.push(
          `<li class="activity-card online"><div class="act-info"><strong>${
            k.charAt(0).toUpperCase() + k.slice(1)
          }</strong><span>${v}</span></div>${btn}</li>`
        );
      } else {
        cards.push(
          '<li class="activity-card online"><div class="act-info"><strong>Online</strong></div></li>'
        );
      }
    } else if (status.away !== null) {
      cards.push(
        '<li class="activity-card away"><div class="act-info"><strong>Away</strong></div></li>'
      );
    } else if (status.dnd !== null) {
      cards.push(
        '<li class="activity-card dnd"><div class="act-info"><strong>Do Not Disturb</strong></div></li>'
      );
    }

    if (user.hosting) {
      const h = user.hosting;
      cards.push(
        `<li class="activity-card hosting">${
          h.thumbnailId ? `<img src="${h.thumbnailId}" alt="" />` : ''
        }<div class="act-info"><strong>Hosting ${h.title || ''}</strong></div></li>`
      );
    }

    return cards;
  }

  function fill(user = {}) {
    card.style.setProperty('--accent', user.accent || '#5865f2');
    card.style.setProperty('--frame', user.frame ? `url('${user.frame}')` : 'none');
    banner.style.backgroundImage = user.banner ? `url("${user.banner}")` : 'none';
    avatarImg.src = user.avatar || '';
    avatarImg.alt = user.name || '';
    nameEl.textContent = user.name || '';
    if (user.token) {
      tagEl.textContent = `@${user.token}`;
      tagEl.style.display = 'block';
    } else {
      tagEl.textContent = '';
      tagEl.style.display = 'none';
    }

    actions.innerHTML = '';
    const isSelf = user.token === loggedIn;
    if (!isSelf) {
      actions.innerHTML += `<button class="mp-action follow" aria-label="Follow">${icons.follow}</button>`;
      actions.innerHTML += `<button class="mp-action support" aria-label="Support">${icons.support}</button>`;
    }
    actions.innerHTML += `<button class="mp-action shop" aria-label="Shop">${icons.shop}</button>`;
    if (user.streaming) {
      actions.innerHTML += `<button class="mp-action stream" aria-label="View Stream">${icons.stream}</button>`;
    }
    if (user.badges && user.badges.length) {
      badgesEl.innerHTML = user.badges.slice(0,5).map((b) => `<img src="${b}" alt="badge" />`).join('');
      badgesEl.style.display = 'flex';
    } else {
      badgesEl.innerHTML = '';
      badgesEl.style.display = 'none';
    }
    if (user.bio) {
      aboutEl.textContent = user.bio;
      aboutSection.style.display = 'block';
    } else {
      aboutEl.textContent = '';
      aboutSection.style.display = 'none';
    }
    if (user.memberSince) {
      memberDateEl.textContent = user.memberSince;
      memberDateEl.closest('.mp-member').style.display = 'block';
    } else {
      memberDateEl.textContent = '';
      memberDateEl.closest('.mp-member').style.display = 'none';
    }
    if (user.connections && user.connections.length) {
      connList.innerHTML = user.connections
        .map((c) => `<img src="${c}" alt="connection" />`)
        .join('');
      connList.closest('.mp-connections').style.display = 'block';
    } else {
      connList.innerHTML = '';
      connList.closest('.mp-connections').style.display = 'none';
    }

    const acts = activityCards(user);
    if (acts.length) {
      activityList.innerHTML = acts.join('');
      activitySection.style.display = 'block';
    } else {
      activityList.innerHTML = '';
      activitySection.style.display = 'none';
    }
  }

  function position(x, y) {
    const mpW = card.offsetWidth;
    const mpH = card.offsetHeight;
    let left = x + 8;
    if (left + mpW > window.innerWidth - 8) left = x - mpW - 8;
    if (left < 8) left = 8;
    let top = y;
    if (top + mpH > window.innerHeight - 8) top = window.innerHeight - mpH - 8;
    if (top < 8) top = 8;
    card.style.left = `${left}px`;
    card.style.top = `${top}px`;
  }

  async function show(user, x, y) {
    if (user && user.token) {
      const full = await getUserByToken(user.token).catch(() => ({}));
      user = { ...full, ...user };
    }
    user.streaming = user.streaming || !!(user.status && user.status.streaming);
    fill(user);
    position(x, y);
    card.classList.add('visible');
    card.classList.remove('hidden');
  }

  function hide() {
    hideTooltip();
    card.classList.remove('visible');
    card.classList.add('hidden');
  }

  utils.listen(document, 'click', (e) => {
    if (!card.classList.contains('visible')) return;
    if (!card.contains(e.target)) hide();
  });

  utils.listen(document, 'keydown', (e) => {
    if (e.key === 'Escape') hide();
  });

  utils.delegate(document, 'contextmenu', '[data-profile-name]', (e, el) => {
    e.preventDefault();
    const user = {
      name: el.dataset.profileName,
      token: el.dataset.profileToken,
      avatar: el.dataset.profileAvatar,
      banner: el.dataset.profileBanner,
      accent: el.dataset.profileAccent,
      frame: el.dataset.profileFrame,
      bio: el.dataset.profileBio,
      memberSince: el.dataset.profileSince,
      connections: el.dataset.profileConnections
        ? el.dataset.profileConnections.split(',')
        : [],
      badges: el.dataset.profileBadges
        ? el.dataset.profileBadges.split(',')
        : [],
      streaming: el.dataset.profileStreaming === 'true'
    };
    show(user, e.pageX, e.pageY);
  });

  return { show, hide };
}
