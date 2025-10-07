import { getUserByToken } from '../users.js';

const DEFAULT_CONTEXT = {
  name: 'NOICE Creators',
  status: 'All things overlays, plugins and collabs',
  groups: [
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
  ]
};

const profileData = (u = {}) =>
  `data-profile-name="${u.name || ''}" data-profile-token="${u.token || ''}" data-profile-avatar="${u.avatar || ''}" data-profile-banner="${u.banner || ''}" data-profile-accent="${u.accent || ''}" data-profile-frame="${u.frame || ''}" data-profile-bio="${u.bio || ''}" data-profile-since="${u.memberSince || ''}" data-profile-connections="${(u.connections || []).join(',')}" data-profile-badges="${(u.badges || []).join(',')}" data-profile-streaming="${u.streaming ? 'true' : 'false'}"`;

const unique = (arr = []) => Array.from(new Set(arr.filter(Boolean)));

const normaliseName = (user) => (user?.name || '').split(' ')[0] || user?.name || 'Creator';

const slugify = (value = '') =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'channel';

const buildVoiceParticipants = (user) => {
  const pool = unique([user?.token, ...(user?.followers || []), ...(user?.following || []), ...(user?.subscribers || [])]);
  return pool.slice(0, 4).map((token, index) => ({
    token,
    status: index === 0 && user?.streaming ? 'Streaming' : 'Online'
  }));
};

const buildContextForUser = (user) => {
  if (!user) return DEFAULT_CONTEXT;
  const firstName = normaliseName(user);
  const slug = slugify(user.token || firstName);
  const accent = user.accent;
  const unread = user.hasNotification ? 3 : 0;
  const participants = buildVoiceParticipants(user);

  const voiceChannels = participants.length
    ? [
        {
          type: 'voice',
          name: `${firstName}'s Studio`,
          users: participants
        },
        { type: 'voice', name: 'Collab Lab' }
      ]
    : DEFAULT_CONTEXT.groups.find((group) => group.label === 'VOICE CHANNELS')?.channels || [];

  return {
    name: `${user.name}`,
    status: user.bio || DEFAULT_CONTEXT.status,
    groups: [
      {
        label: `${firstName.toUpperCase()} — CHANNELS`,
        channels: [
          { type: 'text', name: `${slug}-general`, active: true, accent },
          { type: 'text', name: `${slug}-updates`, unread, accent },
          { type: 'text', name: `${slug}-media` }
        ]
      },
      {
        label: 'COMMUNITY',
        channels: [
          { type: 'text', name: 'content-feedback', unread: (user.followers || []).length > 5 ? 5 : 0 },
          { type: 'text', name: 'share-your-work', mention: !!user.streaming },
          { type: 'text', name: 'events-hub' }
        ]
      },
      {
        label: 'VOICE CHANNELS',
        channels: voiceChannels
      }
    ]
  };
};

const collectVoiceTokens = (context) =>
  context.groups
    .flatMap((group) => group.channels)
    .filter((channel) => channel.type === 'voice' && Array.isArray(channel.users))
    .flatMap((channel) => channel.users.map((entry) => entry.token))
    .filter(Boolean);

const renderChannel = (channel, usersByToken = {}) => {
  const stateClass = [
    channel.active ? 'is-active' : '',
    channel.mention ? 'has-mention' : '',
    channel.unread && !channel.active ? 'has-unread' : ''
  ]
    .filter(Boolean)
    .join(' ');

  const accentStyle = channel.accent ? ` style="--accent:${channel.accent}"` : '';

  return `
    <li class="channel-sidebar__channel ${stateClass}"${accentStyle}>
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

const renderSidebar = (root, context, usersByToken) => {
  root.innerHTML = `
    <aside class="channel-sidebar">
      <header class="channel-sidebar__header">
        <button type="button" class="channel-sidebar__space" aria-label="Workspace menu">
          <span class="channel-sidebar__space-name">${context.name}</span>
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
      <p class="channel-sidebar__status">${context.status}</p>
      <div class="channel-sidebar__search">
        <svg class="channel-sidebar__search-icon" width="16" height="16" aria-hidden="true"><use href="#svg-magnifying-glass"></use></svg>
        <input type="search" placeholder="Search" aria-label="Search channels">
      </div>
      <div class="channel-sidebar__scroll">
        ${context.groups
          .map(
            (group) => `
              <section class="channel-sidebar__section">
                <header class="channel-sidebar__section-header">
                  <span>${group.label}</span>
                  <button type="button" class="channel-sidebar__icon-btn" aria-label="Add channel to ${group.label}">
                    <svg width="12" height="12" aria-hidden="true"><use href="#svg-plus-small"></use></svg>
                  </button>
                </header>
                <ul class="channel-sidebar__list">
                  ${group.channels.map((channel) => renderChannel(channel, usersByToken)).join('')}
                </ul>
              </section>
            `
          )
          .join('')}
      </div>
    </aside>
  `;
};

const userCache = new Map();

const hydrateUsers = async (tokens = []) => {
  const missing = tokens.filter((token) => token && !userCache.has(token));
  if (missing.length) {
    const fetched = await Promise.all(missing.map((token) => getUserByToken(token)));
    fetched.filter(Boolean).forEach((user) => {
      userCache.set(user.token, user);
    });
  }

  return tokens.reduce((acc, token) => {
    const user = token ? userCache.get(token) : null;
    if (user) acc[token] = user;
    return acc;
  }, {});
};

export default async function init({ root }) {
  const initialTokens = collectVoiceTokens(DEFAULT_CONTEXT);
  const initialUsers = await hydrateUsers(initialTokens);
  renderSidebar(root, DEFAULT_CONTEXT, initialUsers);

  return {
    async loadForUser(user) {
      const context = buildContextForUser(user);
      const voiceTokens = collectVoiceTokens(context);
      const usersByToken = await hydrateUsers(voiceTokens);
      renderSidebar(root, context, usersByToken);
    }
  };
}
