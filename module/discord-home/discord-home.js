import { getUserByToken } from '../users.js';

const BOOST_GOAL = {
  current: 9,
  total: 28
};

const CHANNEL_GROUPS = [
  {
    name: 'Welcome',
    items: [
      { id: 'welcome', icon: '📫', iconType: 'emoji', separator: '│', label: 'welcome' },
      { id: 'rules', icon: '📜', iconType: 'emoji', separator: '│', label: 'rules' },
      { id: 'introductions', icon: '👋', iconType: 'emoji', separator: '│', label: 'introductions' },
      { id: 'new-joiners', icon: '✨', iconType: 'emoji', separator: '│', label: 'new-joiners' }
    ]
  },
  {
    name: 'Important',
    items: [
      { id: 'announcements', icon: '📌', iconType: 'emoji', separator: '│', label: 'announcements' },
      { id: 'creator-events', icon: '🎉', iconType: 'emoji', separator: '│', label: 'creator-events' },
      { id: 'prediction-card-game', icon: '🃏', iconType: 'emoji', separator: '│', label: 'prediction-card-game' }
    ]
  },
  {
    name: 'Community',
    items: [
      {
        id: 'general',
        iconSvg: 'chatBubble',
        iconType: 'hash',
        prefix: '#',
        label: 'general',
        active: true,
        accent: '#6d6afc',
        metaIcon: 'threads'
      },
      { id: 'general-creators', icon: '🎨', iconType: 'emoji', separator: '│', label: 'general-creators' },
      { id: 'creator-studio', icon: '🎬', iconType: 'emoji', separator: '│', label: 'creator-events' },
      { id: 'the-good-stuff', icon: '🤝', iconType: 'emoji', separator: '│', label: 'the-good-stuff' },
      { id: 'clips', icon: '📼', iconType: 'emoji', separator: '│', label: 'clips' },
      { id: 'going-live', icon: '📡', iconType: 'emoji', separator: '│', label: 'going-live' },
      { id: 'memes', icon: '😂', iconType: 'emoji', separator: '│', label: 'memes' },
      { id: 'twitch-extension-beta', icon: '🧪', iconType: 'emoji', separator: '│', label: 'twitch-extension-beta' },
      { id: 'discord-community-talk', icon: '💬', iconType: 'emoji', separator: '│', label: 'discord-community-talk' }
    ]
  },
  {
    name: 'Support',
    items: [
      { id: 'feedback', icon: '📝', iconType: 'emoji', separator: '│', label: 'feedback' },
      { id: 'bug-reports', icon: '🪲', iconType: 'emoji', separator: '│', label: 'bug-reports' }
    ]
  }
];

const ICONS = {
  chevronDown:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6.29 9.29 5.3 5.3a.999.999 0 0 0 1.41 0l5.3-5.3A1 1 0 0 0 17.59 8H6.41a1 1 0 0 0-.12 1.29Z" /></svg>',
  boost:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a1 1 0 0 1 .9.55l2 4A1 1 0 0 1 14 8h-4L6.73 3.7A1 1 0 0 1 7.5 2H12Zm-6.29 6.7a1 1 0 0 1 1.09.17L10 13h4l3.2 3.53a1 1 0 0 1-.74 1.67H6a1 1 0 0 1-.9-1.45l2.61-5.22-1.64-1.64a1 1 0 0 1 .36-1.66Z" /></svg>',
  hashCircle:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.75 7.5 9.5 9h5l.25-1.5h1.5L15.75 9h2v1.5h-2.25l-.5 3H18v1.5h-2.5l-.25 1.5h-1.5l.25-1.5h-5l-.25 1.5h-1.5l.25-1.5h-2V13.5h2.25l.5-3H6v-1.5h2.5l.25-1.5Zm4 4.5h-5l-.5 3h5Z" /><path d="M12 2a10 10 0 1 1-7.07 2.93A10 10 0 0 1 12 2Zm0 1.5a8.5 8.5 0 1 0 8.5 8.5A8.51 8.51 0 0 0 12 3.5Z" /></svg>',
  arrowRight:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 11h9.59l-4.3-4.29L12 5l7 7-7 7-1.71-1.71L14.59 13H5z" /></svg>',
  threads:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12a3 3 0 0 1 3 3v5.76a8.24 8.24 0 0 1-8.24 8.24H7.66l-3.32 3.32A.75.75 0 0 1 3 22.25v-3.25A8 8 0 0 1 2 12V6a3 3 0 0 1 3-3Zm0 1.5A1.5 1.5 0 0 0 4.5 6v6a6.5 6.5 0 0 0 1.75 4.44.75.75 0 0 1 .2.5v1.64l2.28-2.28a.75.75 0 0 1 .53-.22h4.5A6.74 6.74 0 0 0 19.5 11V6A1.5 1.5 0 0 0 18 4.5Z" /></svg>',
  chatBubble:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.5c4.69 0 8.5 3.13 8.5 7s-3.81 7-8.5 7a10 10 0 0 1-2.93-.43l-3.72 2.21a.75.75 0 0 1-1.13-.65v-3.34a6.5 6.5 0 0 1-3.22-5.51c0-3.87 3.81-7 8.5-7Zm0 1.5c-3.87 0-7 2.47-7 5.5a5 5 0 0 0 2.72 4.25.75.75 0 0 1 .39.66v2l2.66-1.57a.75.75 0 0 1 .6-.07A8.6 8.6 0 0 0 12 17c3.87 0 7-2.47 7-5.5S15.87 6 12 6Z" /></svg>'
};

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

const renderChannel = (channel) => {
  if (channel.type === 'dm') {
    const accent = channel.accent || '#5865f2';
    const frame = channel.frame || `conic-gradient(from 90deg, ${accent}, transparent)`;
    const activeAttr = channel.active ? 'aria-current="true"' : '';
    return `
      <li>
        <button
          class="channel channel--dm"
          type="button"
          data-channel-id="${channel.id}"
          ${activeAttr}
          data-status="${channel.status || 'offline'}"
          style="--dm-accent:${accent};"
        >
          <span class="channel-dm__accent" aria-hidden="true"></span>
          <span class="channel-dm__media">
            <span class="avatar-wrap" style="--avi-width:36px; --avi-height:36px; --frame:${frame}; --frame-bleed:18%;">
              <img class="avatar-image" src="${channel.avatar}" alt="${channel.label}">
            </span>
            <span class="channel-dm__presence" aria-hidden="true"></span>
          </span>
          <span class="channel__label">${channel.label}</span>
        </button>
      </li>
    `;
  }

  const classes = ['channel'];
  const activeAttr = channel.active ? 'aria-current="true"' : '';
  const glyphClasses = ['channel__glyph'];
  if (channel.iconType) {
    glyphClasses.push(`channel__glyph--${channel.iconType}`);
  }

  const channelStyle = channel.accent ? ` style="--channel-accent:${channel.accent};"` : '';
  const metaIcon = channel.metaIcon ? `<span class="channel__meta" aria-hidden="true">${ICONS[channel.metaIcon] || ''}</span>` : '';

  const glyphMarkup = channel.iconSvg ? ICONS[channel.iconSvg] || channel.iconSvg : channel.icon || '#';

  return `
    <li>
      <button class="${classes.join(' ')}" type="button" data-channel-id="${channel.id}" ${activeAttr}${channelStyle}>
        <span class="${glyphClasses.join(' ')}">${glyphMarkup}</span>
        ${channel.separator ? `<span class="channel__separator">${channel.separator}</span>` : ''}
        <span class="channel__label">
          ${channel.prefix ? `<span class="channel__label-prefix">${channel.prefix}</span>` : ''}
          <span class="channel__label-text">${channel.label}</span>
        </span>
        ${metaIcon}
      </button>
    </li>
  `;
};

const renderChannelGroup = (group) => `
  <section class="channel-group">
    <header class="channel-group__header">
      <button type="button" class="channel-group__toggle" aria-label="Collapse ${group.name}">
        ${ICONS.chevronDown}
      </button>
      <span>${group.name}</span>
    </header>
    <ul class="channel-group__list">
      ${group.items.map((channel) => renderChannel(channel)).join('')}
    </ul>
  </section>
`;

const renderChannelHero = (user) => {
  const accent = user?.accent || '#5865f2';
  const bannerStyle = user?.banner ? ` style="--hero-banner:url('${user.banner}');"` : '';
  const frameStyle = user?.frame ? `--frame:url('${user.frame}');` : '--frame:none;';
  const avatar = user?.avatar || 'images/avatars/avatar-2.jpg';
  const name = user?.name || 'Noice Member';
  const subtitle = user?.bio || 'Channeling the community energy.';

  return `
    <div class="channel-hero" style="--hero-accent:${accent};">
      <div class="channel-hero__banner"${bannerStyle}></div>
      <div class="channel-hero__overlay"></div>
      <div class="channel-hero__content">
        <button class="channel-hero__server" type="button">
          <span class="channel-hero__server-name">Noice</span>
          ${ICONS.chevronDown}
        </button>
        <div class="channel-hero__profile">
          <span class="avatar-wrap channel-hero__avatar" style="--avi-width:72px; --avi-height:72px; --frame-bleed:24%; --frame-opacity:1; ${frameStyle}">
            <img class="avatar-image" src="${avatar}" alt="${name}">
          </span>
          <div class="channel-hero__meta">
            <p class="channel-hero__label">${name}</p>
            <p class="channel-hero__subtitle">${subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  `;
};

const renderBoostGoal = (accent) => {
  const percent = Math.min(100, Math.round((BOOST_GOAL.current / BOOST_GOAL.total) * 100));
  return `
    <div class="channel-boost" style="--boost-accent:${accent}; --boost-progress:${percent}%;">
      <button class="channel-boost__cta" type="button">
        <span class="channel-boost__icon">${ICONS.boost}</span>
        <span class="channel-boost__text">Boost Goal</span>
      </button>
      <div class="channel-boost__progress">
        <span class="channel-boost__count">${BOOST_GOAL.current}/${BOOST_GOAL.total} Boosts</span>
        <div class="channel-boost__bar"><span></span></div>
      </div>
    </div>
  `;
};

const renderChannelsDirectory = () => `
  <button class="channel-directory" type="button">
    <span class="channel-directory__icon">${ICONS.hashCircle}</span>
    <span class="channel-directory__label">Channels & Roles</span>
    <span class="channel-directory__chevron">${ICONS.arrowRight}</span>
  </button>
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
  const loggedToken = await fetch('/data/logged-in.json').then((r) => r.json()).catch(() => null);
  const currentUser = loggedToken ? await getUserByToken(loggedToken).catch(() => null) : null;
  const accent = currentUser?.accent || '#5865f2';

  root.innerHTML = `
    <div class="discord-shell">
      <aside class="discord-shell__column discord-shell__column--channels">
        <div class="channel-sidebar">
          ${renderChannelHero(currentUser)}
          <div class="channel-sidebar__body">
            ${renderBoostGoal(accent)}
            ${renderChannelsDirectory()}
            <div class="channel-scroll">
              ${CHANNEL_GROUPS.map(renderChannelGroup).join('')}
            </div>
          </div>
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
