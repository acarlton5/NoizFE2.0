import { buildProfileCard } from '../profile/profile-view.js';
import { getUserByToken } from '../users.js';

export default async function init({ hub, root, utils }) {
  root.innerHTML = `
    <div class="profile-overlay hidden" role="dialog" aria-modal="true" aria-hidden="true">
      <div class="profile-overlay-panel">
        <button type="button" class="profile-overlay-close" aria-label="Close profile">×</button>
        <div class="profile-overlay-body"></div>
      </div>
    </div>
  `;

  const overlay = root.querySelector('.profile-overlay');
  const body = root.querySelector('.profile-overlay-body');
  const closeBtn = root.querySelector('.profile-overlay-close');

  const view = buildProfileCard(body, { variant: 'overlay' });
  const cardPanel = view.elements.panel;
  if (cardPanel) {
    cardPanel.setAttribute('tabindex', '-1');
  }

  const applyUnread = (count = 0) => view.updateUnread(count);
  try {
    const unread = await hub.api.messages.getUnread();
    applyUnread(unread);
  } catch (err) {
    applyUnread(0);
  }

  const off = hub.on('messages:unreadChanged', applyUnread);
  utils.onCleanup(off);

  const messageBtn = view.elements.messageBtn;
  if (messageBtn) {
    utils.listen(messageBtn, 'click', (event) => {
      event.preventDefault();
      if (typeof window.LoadMainModule === 'function') {
        window.LoadMainModule('messages');
      }
      hide();
    });
  }

  let hideTimer;
  utils.onCleanup(() => window.clearTimeout(hideTimer));
  const hideWithDelay = () => {
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => {
      overlay.classList.add('hidden');
    }, 200);
  };

  function show(user = {}) {
    window.clearTimeout(hideTimer);
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => overlay.classList.add('visible'));

    view.updateUser(user);

    if (user && user.token) {
      getUserByToken(user.token)
        .then((full) => view.updateUser({ ...full, ...user }))
        .catch(() => {});
    }

    if (cardPanel) {
      cardPanel.focus({ preventScroll: true });
    }
  }

  function hide() {
    overlay.classList.remove('visible');
    overlay.setAttribute('aria-hidden', 'true');
    hideWithDelay();
  }

  utils.listen(closeBtn, 'click', hide);
  utils.listen(overlay, 'click', (event) => {
    if (event.target === overlay) hide();
  });
  utils.listen(document, 'keydown', (event) => {
    if (event.key === 'Escape') hide();
  });

  utils.delegate(document, 'click', '[data-profile-name]', (event, el) => {
    if (event.button !== 0) return;
    event.preventDefault();
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
        ? el.dataset.profileConnections.split(',').filter(Boolean)
        : [],
      badges: el.dataset.profileBadges
        ? el.dataset.profileBadges.split(',').filter(Boolean)
        : [],
      topics: [],
      status: {},
    };
    if (el.dataset.profileStreaming === 'true') {
      user.status = { streaming: { title: 'Streaming' } };
    }
    show(user);
  });

  return { show, hide };
}
