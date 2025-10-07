import { buildProfileCard } from '../profile/profile-view.js';
import { getUserByToken } from '../users.js';

export default async function init({ hub, root, utils }) {
  root.innerHTML = `
    <div class="profile-overlay" role="dialog" aria-modal="true" aria-hidden="true">
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
  const { setLoading } = view;
  const cardPanel = view.elements.panel;
  if (cardPanel) {
    cardPanel.setAttribute('tabindex', '-1');
  }

  const prefetchCache = new Map();
  const resolvedTokens = new Set();
  const warmedTokens = new Set();

  const prefetchToken = (token) => {
    if (!token) return null;
    if (prefetchCache.has(token)) {
      return prefetchCache.get(token);
    }
    warmedTokens.add(token);
    const request = getUserByToken(token)
      .then((data) => {
        resolvedTokens.add(token);
        return data;
      })
      .catch((error) => {
        prefetchCache.delete(token);
        resolvedTokens.delete(token);
        warmedTokens.delete(token);
        throw error;
      });
    prefetchCache.set(token, request);
    return request;
  };

  const warmElementToken = (el) => {
    if (!el || !el.dataset) return;
    const token = el.dataset.profileToken;
    if (!token || warmedTokens.has(token)) return;
    prefetchToken(token);
  };

  const scanForTokens = (scope = document) => {
    if (!scope) return;
    if (scope.querySelectorAll) {
      let warmedCount = 0;
      const limit = scope === document ? 24 : Infinity;
      scope.querySelectorAll('[data-profile-token]').forEach((element) => {
        if (scope === document && warmedCount >= limit) return;
        const token = element.dataset ? element.dataset.profileToken : null;
        if (!token || warmedTokens.has(token)) return;
        prefetchToken(token);
        warmedCount += 1;
      });
    }
    if (scope !== document && scope.dataset && scope.dataset.profileToken) {
      warmElementToken(scope);
    }
  };

  scanForTokens(document);

  const observer = new MutationObserver((records) => {
    records.forEach((record) => {
      record.addedNodes.forEach((node) => {
        if (!node || node.nodeType !== 1) return;
        const el = /** @type {Element} */ (node);
        warmElementToken(el);
        if (el.querySelectorAll) {
          el.querySelectorAll('[data-profile-token]').forEach(warmElementToken);
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
  utils.onCleanup(() => observer.disconnect());

  utils.delegate(document, 'mouseover', '[data-profile-token]', (event, el) => {
    warmElementToken(el);
  });

  let loadSequence = 0;
  let currentTicket = 0;

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

  function show(user = {}) {
    overlay.classList.add('visible');
    overlay.setAttribute('aria-hidden', 'false');

    view.updateUser(user);

    const ticket = ++loadSequence;
    currentTicket = ticket;

    if (user && user.token) {
      const token = user.token;
      const request = prefetchToken(token);
      const shouldShowLoader = !resolvedTokens.has(token);
      setLoading(shouldShowLoader);
      if (request) {
        request
          .then((full) => view.updateUser({ ...user, ...full }))
          .catch(() => {})
          .finally(() => {
            if (currentTicket === ticket) {
              setLoading(false);
            }
          });
      } else if (currentTicket === ticket) {
        setLoading(false);
      }
    } else if (currentTicket === ticket) {
      setLoading(false);
    }

    if (cardPanel) {
      cardPanel.focus({ preventScroll: true });
    }
  }

  function hide() {
    overlay.classList.remove('visible');
    overlay.setAttribute('aria-hidden', 'true');
    currentTicket = 0;
    setLoading(false);
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
