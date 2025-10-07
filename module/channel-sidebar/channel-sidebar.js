import { getUserByToken } from '../users.js';

const SERVER = {
  name: 'NOICE Creators',
  status: 'All things overlays, plugins and collabs'
};

const CHANNEL_GROUPS = [
  {
    label: 'ANNOUNCEMENTS',
    channels: [
      { type: 'text', name: 'general-updates', unread: 2, mention: true },
      { type: 'text', name: 'plugin-drops', unread: 4 }
    ]
  },
  {
    label: 'TEXT CHANNELS',
    channels: [
      { type: 'text', name: 'general-chat', active: true },
      { type: 'text', name: 'content-feedback', unread: 8 },
      { type: 'text', name: 'share-your-work' }
    ]
  },
  {
    label: 'VOICE CHANNELS',
    channels: [
      {
        type: 'voice',
        name: 'Live lounge',
        users: [
          { token: 'nick-grissom', status: 'Streaming' },
          { token: 'neko-bebop', status: 'Idle' }
        ]
      },
      { type: 'voice', name: 'Mod sync', muted: true },
      { type: 'voice', name: 'Creator Q&A' }
    ]
  }
];

const profileData = (u = {}) =>
  `data-profile-name="${u.name || ''}" data-profile-token="${u.token || ''}" data-profile-avatar="${u.avatar || ''}" data-profile-banner="${u.banner || ''}" data-profile-accent="${u.accent || ''}" data-profile-frame="${u.frame || ''}" data-profile-bio="${u.bio || ''}" data-profile-since="${u.memberSince || ''}" data-profile-connections="${(u.connections || []).join(',')}" data-profile-badges="${(u.badges || []).join(',')}" data-profile-streaming="${u.streaming ? 'true' : 'false'}"`;

const renderChannel = (channel, usersByToken = {}) => {
  const stateClass = [
    channel.active ? 'is-active' : '',
    channel.mention ? 'has-mention' : '',
    channel.unread && !channel.active ? 'has-unread' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return `
    <li class="channel-sidebar__channel ${stateClass}">
      <button type="button" class="channel-sidebar__channel-btn">
        <span class="channel-sidebar__channel-icon" aria-hidden="true">
          ${channel.type === 'text' ? '#' : '<svg width="16" height="16"><use href="#svg-streams"></use></svg>'}
        </span>
        <span class="channel-sidebar__channel-name">${channel.name}</span>
        ${channel.unread && !channel.active ? `<span class="channel-sidebar__badge">${channel.unread}</span>` : ''}
        ${channel.mention ? '<span class="channel-sidebar__pill">@</span>' : ''}
      </button>
      ${channel.type === 'voice' && channel.users?.length
        ? `
            <ul class="channel-sidebar__voice-users">
              ${channel.users
                .map((entry) => {
                  const user = usersByToken[entry.token];
                  if (!user) return '';
                  return `
                    <li class="channel-sidebar__voice-user" ${profileData(user)}>
                      <span class="channel-sidebar__voice-presence"></span>
                      <div class="avatar-wrap" style="--avi-width:24px; --avi-height:24px; --frame:url('${user.frame}')">
                        <img class="avatar-image" src="${user.avatar}" alt="${user.name}">
                      </div>
                      <span class="channel-sidebar__voice-name">${user.name}</span>
                    </li>
                  `;
                })
                .join('')}
            </ul>
          `
        : ''}
    </li>
  `;
};

export default async function init({ root }) {
  const voiceTokens = CHANNEL_GROUPS.flatMap((group) =>
    group.channels
      .filter((channel) => channel.type === 'voice' && channel.users)
      .flatMap((channel) => channel.users.map((user) => user.token))
  );

  const uniqueTokens = [...new Set(voiceTokens)];
  const voiceUsers = await Promise.all(uniqueTokens.map((token) => getUserByToken(token)));
  const userMap = voiceUsers.filter(Boolean).reduce((acc, user) => {
    // eslint-disable-next-line no-param-reassign
    acc[user.token] = user;
    return acc;
  }, {});

  root.innerHTML = `
    <aside class="channel-sidebar">
      <header class="channel-sidebar__header">
        <button type="button" class="channel-sidebar__space" aria-label="Workspace menu">
          <span class="channel-sidebar__space-name">${SERVER.name}</span>
          <svg width="12" height="12" aria-hidden="true"><use href="#svg-small-arrow"></use></svg>
        </button>
        <div class="channel-sidebar__header-actions">
          <button type="button" class="channel-sidebar__icon-btn" aria-label="Inbox">
            <svg width="16" height="16" aria-hidden="true"><use href="#svg-messages"></use></svg>
          </button>
          <button type="button" class="channel-sidebar__icon-btn" aria-label="Create channel">
            <svg width="16" height="16" aria-hidden="true"><use href="#svg-plus"></use></svg>
          </button>
        </div>
      </header>
      <p class="channel-sidebar__status">${SERVER.status}</p>
      <div class="channel-sidebar__search">
        <svg class="channel-sidebar__search-icon" width="16" height="16" aria-hidden="true"><use href="#svg-magnifying-glass"></use></svg>
        <input type="search" placeholder="Search" aria-label="Search channels">
      </div>
      <div class="channel-sidebar__scroll">
        ${CHANNEL_GROUPS.map(
          (group) => `
            <section class="channel-sidebar__section">
              <header class="channel-sidebar__section-header">
                <span>${group.label}</span>
                <button type="button" class="channel-sidebar__icon-btn" aria-label="Add channel to ${group.label}">
                  <svg width="12" height="12" aria-hidden="true"><use href="#svg-plus-small"></use></svg>
                </button>
              </header>
              <ul class="channel-sidebar__list">
                ${group.channels.map((channel) => renderChannel(channel, userMap)).join('')}
              </ul>
            </section>
          `
        ).join('')}
      </div>
    </aside>
  `;

  return {};
}
