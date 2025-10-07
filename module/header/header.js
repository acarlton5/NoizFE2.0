const presenceDetails = (user = {}) => {
  const status = user.status || {};
  if (status.streaming) {
    return {
      label: status.streaming.title || 'Streaming',
      cls: 'status--streaming'
    };
  }
  if (status.online && Object.keys(status.online).length) {
    const [activity] = Object.values(status.online);
    return {
      label: activity ? activity : 'Online',
      cls: 'status--online'
    };
  }
  if (status.away !== null && status.away !== undefined) {
    return {
      label: 'Idle',
      cls: 'status--idle'
    };
  }
  if (status.dnd !== null && status.dnd !== undefined) {
    return {
      label: 'Busy',
      cls: 'status--dnd'
    };
  }
  return {
    label: 'Offline',
    cls: 'status--offline'
  };
};

const inlineIcon = {
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.62 10.79a15.053 15.053 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24 11.72 11.72 0 0 0 3.68.59 1 1 0 0 1 1 1v3.67a1 1 0 0 1-1 1C11.3 21.2 2.8 12.7 2.8 2.9a1 1 0 0 1 1-1H7.5a1 1 0 0 1 1 1 11.72 11.72 0 0 0 .59 3.68 1 1 0 0 1-.24 1.01l-2.23 2.2Z"/></svg>',
  video: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17 10.5V7a2 2 0 0 0-2-2H5A2 2 0 0 0 3 7v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3.5l3.553 2.665A1 1 0 0 0 22 15.35v-6.7a1 1 0 0 0-1.447-.816L17 10.5Z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9.586 13 7.05 15.536a1 1 0 0 0 .707 1.707H11v5a1 1 0 1 0 2 0v-5h3.243a1 1 0 0 0 .707-1.707L15.414 13 19 9.414V7a1 1 0 0 0-1-1h-1V4a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v2H6a1 1 0 0 0-1 1v2.414L9.586 13Z"/></svg>',
  add: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 5a1 1 0 0 1 1 1v5h5a1 1 0 0 1 0 2h-5v5a1 1 0 0 1-2 0v-5H6a1 1 0 1 1 0-2h5V6a1 1 0 0 1 1-1Z"/></svg>',
  inbox: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 4a2 2 0 0 0-2 2v7h4.586l2 2H15.4l2-2H22V6a2 2 0 0 0-2-2H4Zm18 11h-4.7l-2 2H8.4l-2-2H2v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3Z"/></svg>'
};

export default async function init({ hub, root, utils }) {
  root.innerHTML = `
    <header class="title-bar" data-role="header">
      <div class="title-bar__left">
        <div class="title-bar__section">
          <span class="title-bar__section-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v9h-4.382l-2 2H10.38l-2-2H4V5Zm0 11h3.618l2 2h4.764l2-2H20v3a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-3Z"/></svg>
          </span>
          <span class="title-bar__section-label">Direct Message</span>
        </div>
        <div class="title-bar__channel">
          <span class="title-bar__avatar avatar-wrap" data-role="channel-avatar" style="--avi-width:36px; --avi-height:36px;">
            <img class="avatar-image" alt="" />
          </span>
          <div class="title-bar__text">
            <span class="title-bar__name" data-role="channel-name">Direct Message</span>
            <span class="title-bar__status status--offline" data-role="channel-status">
              <span class="status-indicator"></span>
              <span data-role="channel-status-text">Offline</span>
            </span>
          </div>
        </div>
      </div>
      <div class="title-bar__actions">
        <button class="title-bar__action" type="button" aria-label="Start voice call">${inlineIcon.phone}</button>
        <button class="title-bar__action" type="button" aria-label="Start video call">${inlineIcon.video}</button>
        <button class="title-bar__action" type="button" aria-label="Pinned messages">${inlineIcon.pin}</button>
        <button class="title-bar__action" type="button" aria-label="Add friend">${inlineIcon.add}</button>
        <button class="title-bar__action" type="button" aria-label="Inbox">${inlineIcon.inbox}</button>
        <div class="title-bar__divider" role="presentation"></div>
        <label class="title-bar__search" aria-label="Search messages">
          <svg width="16" height="16" aria-hidden="true"><use xlink:href="#svg-magnifying-glass"></use></svg>
          <input type="search" placeholder="Search" />
        </label>
      </div>
    </header>
  `;

  const titleBar = root.querySelector('.title-bar');
  const avatarWrap = root.querySelector('[data-role="channel-avatar"]');
  const avatarImage = avatarWrap.querySelector('img');
  const channelName = root.querySelector('[data-role="channel-name"]');
  const statusWrap = root.querySelector('[data-role="channel-status"]');
  const statusText = root.querySelector('[data-role="channel-status-text"]');

  const state = {
    manualTitle: null,
    activeUser: null
  };

  function applyTitle() {
    if (state.manualTitle) {
      channelName.textContent = state.manualTitle;
      return;
    }
    channelName.textContent = state.activeUser?.name || 'Direct Message';
  }

  function applyUser(user) {
    state.activeUser = user || null;
    if (user?.avatar) {
      avatarImage.src = user.avatar;
      avatarImage.alt = user.name || '';
    }
    if (user?.frame) {
      avatarWrap.style.setProperty('--frame', `url('${user.frame}')`);
    } else {
      avatarWrap.style.removeProperty('--frame');
    }
    if (user?.accent) {
      titleBar.style.setProperty('--channel-accent', user.accent);
    } else {
      titleBar.style.removeProperty('--channel-accent');
    }

    const presence = presenceDetails(user);
    statusWrap.className = `title-bar__status ${presence.cls}`;
    statusText.textContent = presence.label;
    applyTitle();
  }

  const api = {
    setTitle(title) {
      state.manualTitle = title || null;
      applyTitle();
      return state.manualTitle;
    },
    clearTitle() {
      state.manualTitle = null;
      applyTitle();
    }
  };

  const off = hub.on('dm:selected', (user) => {
    state.manualTitle = null;
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
      console.warn('[NOIZ] header could not fetch active DM', err);
    }
  });

  applyUser(null);

  return api;
}
