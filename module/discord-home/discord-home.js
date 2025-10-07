const CHANNEL_GROUPS = [
  {
    name: 'Text Channels',
    items: [
      { id: 'welcome', label: 'welcome', icon: '#', unread: 3 },
      { id: 'announcements', label: 'announcements', icon: '#', badge: 'new' },
      { id: 'general', label: 'general', icon: '#', active: true },
      { id: 'resources', label: 'resources', icon: '#', muted: true }
    ]
  },
  {
    name: 'Voice Channels',
    items: [
      { id: 'stage', label: 'Stage Live', icon: '🔊' },
      { id: 'lobby', label: 'Lobby', icon: '🔊' }
    ]
  }
];

const MESSAGES = [
  {
    id: 'm1',
    author: {
      name: 'Admin Gaming',
      role: 'Admin',
      color: '#EB459E',
      avatar: 'images/avatars/avatar-1.jpg'
    },
    timestamp: 'Today at 4:37 PM',
    body: [
      'Yo! Quick check-in—what stack are we leaning into for this take? React + modular JS like before?'
    ]
  },
  {
    id: 'm2',
    author: {
      name: 'NOIZ',
      role: 'Owner',
      color: '#5865F2',
      avatar: 'images/logo.png'
    },
    timestamp: 'Today at 4:39 PM',
    body: [
      'Let’s rebuild the hub using the Discord-style layout from the mock.',
      'Key beats to cover:',
      [
        'Server rail with badges + tooltips',
        'Channel column with clear section labels',
        'Message history styled like the screenshot',
        'Members list on the right with presence states'
      ],
      'If we keep things componentized we can still hot-swap modules later.'
    ]
  },
  {
    id: 'm3',
    author: {
      name: 'Admin Gaming',
      role: 'Admin',
      color: '#EB459E',
      avatar: 'images/avatars/avatar-1.jpg'
    },
    timestamp: 'Today at 4:41 PM',
    body: [
      'Perfect. I’ll mirror the thread preview and composer from the shot and keep the palette matched to dark mode.'
    ],
    thread: {
      title: 'Sprint 12 Handoff',
      replies: 6,
      participants: [
        { name: 'Nova', avatar: 'images/avatars/avatar-3.jpg' },
        { name: 'Dex', avatar: 'images/avatars/avatar-4.jpg' }
      ]
    }
  }
];

const MEMBER_GROUPS = [
  {
    title: 'Admin — 2',
    members: [
      { name: 'Admin Gaming', status: 'online', activity: 'Reviewing layout', avatar: 'images/avatars/avatar-1.jpg' },
      { name: 'NOIZ', status: 'online', activity: 'Sketching UI', avatar: 'images/logo.png' }
    ]
  },
  {
    title: 'Moderators — 2',
    members: [
      { name: 'Nova', status: 'online', activity: 'In Figma', avatar: 'images/avatars/avatar-3.jpg' },
      { name: 'Dex', status: 'idle', activity: 'Editing copy', avatar: 'images/avatars/avatar-4.jpg' }
    ]
  },
  {
    title: 'Members — 4',
    members: [
      { name: 'Luma', status: 'online', activity: 'Listening to synthwave', avatar: 'images/avatars/avatar-8.jpg' },
      { name: 'Kai', status: 'dnd', activity: 'Pairing on API', avatar: 'images/avatars/avatar-7.jpg' },
      { name: 'Miko', status: 'offline', activity: 'Offline', avatar: 'images/avatars/avatar-6.jpg' },
      { name: 'Iris', status: 'offline', activity: 'Offline', avatar: 'images/avatars/avatar-5.jpg' }
    ]
  }
];

const renderMessageBody = (blocks) =>
  blocks
    .map((block) => {
      if (Array.isArray(block)) {
        return `
          <ul class="message__list">
            ${block.map((item) => `<li>${item}</li>`).join('')}
          </ul>
        `;
      }
      return `<p>${block}</p>`;
    })
    .join('');

const renderMessage = (message) => `
  <article class="message" data-message-id="${message.id}">
    <div class="message__avatar">
      <img src="${message.author.avatar}" alt="${message.author.name}">
    </div>
    <div class="message__content">
      <header class="message__meta">
        <span class="message__author" style="color:${message.author.color}">${message.author.name}</span>
        <span class="message__role">${message.author.role}</span>
        <time class="message__time">${message.timestamp}</time>
      </header>
      <div class="message__body">
        ${renderMessageBody(message.body)}
      </div>
      ${message.thread ? `
        <div class="thread-preview">
          <div class="thread-preview__avatars">
            ${message.thread.participants
              .map(
                (participant, index) => `
                  <span class="thread-preview__avatar" style="z-index:${10 - index}">
                    <img src="${participant.avatar}" alt="${participant.name}">
                  </span>
                `
              )
              .join('')}
          </div>
          <div class="thread-preview__content">
            <p class="thread-preview__title">${message.thread.title}</p>
            <p class="thread-preview__meta">${message.thread.replies} replies • Last reply 1h ago</p>
          </div>
          <button class="thread-preview__cta" type="button">View Thread</button>
        </div>
      ` : ''}
    </div>
  </article>
`;

const renderChannelGroup = (group) => `
  <section class="channel-group">
    <header class="channel-group__header">
      <button type="button" class="channel-group__toggle" aria-label="Collapse ${group.name}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l8 7-8 7z" /></svg>
      </button>
      <span>${group.name}</span>
    </header>
    <ul class="channel-group__list">
      ${group.items
        .map((channel) => `
          <li>
            <button class="channel" type="button" data-channel-id="${channel.id}" ${channel.active ? 'aria-current="true"' : ''}>
              <span class="channel__icon">${channel.icon === '#' ? '<span>#</span>' : channel.icon}</span>
              <span class="channel__label">${channel.label}</span>
              ${channel.badge ? `<span class="channel__badge">${channel.badge}</span>` : ''}
              ${channel.unread ? `<span class="channel__unread">${channel.unread}</span>` : ''}
              ${channel.muted ? '<svg class="channel__muted" viewBox="0 0 24 24" aria-hidden="true"><path d="m16 3-4 4H8v6h4l4 4zM5 4l14 14-1.5 1.5L3.5 5.5z" /></svg>' : ''}
            </button>
          </li>
        `)
        .join('')}
    </ul>
  </section>
`;

const renderMemberGroup = (group) => `
  <section class="member-group">
    <h3 class="member-group__title">${group.title}</h3>
    <ul class="member-group__list">
      ${group.members
        .map(
          (member) => `
            <li class="member" data-status="${member.status}">
              <div class="member__avatar">
                <img src="${member.avatar}" alt="${member.name}">
                <span class="member__presence"></span>
              </div>
              <div class="member__body">
                <p class="member__name">${member.name}</p>
                <p class="member__activity">${member.activity}</p>
              </div>
            </li>
          `
        )
        .join('')}
    </ul>
  </section>
`;

export default async function init({ root, utils }) {
  root.innerHTML = `
    <div class="discord-shell">
      <aside class="discord-shell__column discord-shell__column--channels">
        <div class="channel-header">
          <div class="channel-header__title">Boost this server</div>
          <button class="channel-header__cta" type="button">Get Nitro</button>
        </div>
        <div class="channel-scroll">
          ${CHANNEL_GROUPS.map(renderChannelGroup).join('')}
        </div>
      </aside>
      <section class="discord-shell__column discord-shell__column--chat">
        <header class="chat-header">
          <div class="chat-header__left">
            <span class="chat-header__symbol">#</span>
            <div>
              <h1 class="chat-header__title">general</h1>
              <p class="chat-header__subtitle">Design chatter • bring the energy</p>
            </div>
          </div>
          <div class="chat-header__actions">
            <button type="button" class="chat-header__icon" aria-label="View pinned messages">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a6 6 0 0 1 6 6v3h1a1 1 0 0 1 .7 1.71L17 15.41V20a1 1 0 0 1-1.45.89L12 19.12l-3.55 1.77A1 1 0 0 1 7 20v-4.59l-2.7-2.7A1 1 0 0 1 5 11h1V8a6 6 0 0 1 6-6z" /></svg>
            </button>
            <button type="button" class="chat-header__icon" aria-label="Open notifications">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 21h4v2h-4zm2-20a6 6 0 0 1 6 6v4l1.29 1.29a1 1 0 0 1-.7 1.71H5.41a1 1 0 0 1-.7-1.71L6 11V7a6 6 0 0 1 6-6z" /></svg>
            </button>
            <button type="button" class="chat-header__cta">Create Thread</button>
          </div>
        </header>
        <div class="chat-log" data-role="chat-log">
          <div class="chat-divider">Thursday, February 22, 2024</div>
          ${MESSAGES.map(renderMessage).join('')}
        </div>
        <footer class="composer">
          <div class="composer__toolbar">
            <button type="button" aria-label="Upload file">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a5 5 0 0 1 5 5v2h1a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3h-2v-2h2a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-1v2l-5-4-5 4v-2H6a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2v2H6a3 3 0 0 1-3-3v-4a3 3 0 0 1 3-3h1V8a5 5 0 0 1 5-5z" /></svg>
            </button>
            <button type="button" aria-label="Send gift">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c1.31 0 2.43.83 3.06 2H19a2 2 0 0 1 1.99 2.26l-.8 6A2 2 0 0 1 18.21 13H5.79a2 2 0 0 1-1.98-1.74l-.8-6A2 2 0 0 1 5 5h3.94C9.57 3.83 10.69 3 12 3zm-1 14H5a2 2 0 0 1-2-2v-1.59A4 4 0 0 0 5.79 15H11zm2 0h5.21A4 4 0 0 0 21 13.41V15a2 2 0 0 1-2 2h-5z" /></svg>
            </button>
            <button type="button" aria-label="Use sticker">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 0 1 8-8h4a4 4 0 0 1 4 4v4a8 8 0 0 1-8 8H8a4 4 0 0 1-4-4zm5-2a1 1 0 1 0-1-1 1 1 0 0 0 1 1zm6 0a1 1 0 1 0-1-1 1 1 0 0 0 1 1zm-7 3.5a4 4 0 0 0 7 0z" /></svg>
            </button>
          </div>
          <div class="composer__input">
            <input type="text" placeholder="Message #general" aria-label="Message input" />
          </div>
          <div class="composer__toolbar composer__toolbar--right">
            <button type="button" aria-label="Attach emoji">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-4 8a1.5 1.5 0 1 1 1.5-1.5A1.5 1.5 0 0 1 8 10zm8 0a1.5 1.5 0 1 1 1.5-1.5A1.5 1.5 0 0 1 16 10zm-4 7a5 5 0 0 1-4.47-2.72l1.74-1A3 3 0 0 0 12 15a3 3 0 0 0 2.73-1.71l1.74 1A5 5 0 0 1 12 17z" /></svg>
            </button>
            <button type="button" class="composer__send" aria-label="Send message">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m2 21 21-9L2 3v7l15 2-15 2z" /></svg>
            </button>
          </div>
        </footer>
      </section>
      <aside class="discord-shell__column discord-shell__column--members">
        <div class="member-scroll">
          ${MEMBER_GROUPS.map(renderMemberGroup).join('')}
        </div>
      </aside>
    </div>
  `;

  utils.delegate(root, 'click', '.channel', (_event, button) => {
    root.querySelectorAll('.channel[aria-current="true"]').forEach((active) => {
      active.removeAttribute('aria-current');
    });
    button.setAttribute('aria-current', 'true');
  });

  const log = root.querySelector('[data-role="chat-log"]');
  log?.scrollTo({ top: log.scrollHeight });

  return {};
}
