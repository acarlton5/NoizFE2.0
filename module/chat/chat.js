import { getUserByToken } from '../users.js';

const CHANNEL_INFO = {
  name: '#general-creators',
  topic: 'Announcements, plugin drops and collabs for the NOIZ creator crew.',
  members: 28,
  pinned: 12
};

const MESSAGE_FLOW = [
  {
    token: 'marina-valentine',
    timestamp: 'Today at 4:26 PM',
    role: 'Creative Director',
    accent: '#7c5dff',
    content: [
      'Finished polishing the “Luminous Pulse” overlay pack. Uploaded the layered files in <span class="conversation__mention">#assets</span> if you want to remix it.',
      'Thinking we should demo it in tomorrow’s showcase. Thoughts?'
    ]
  },
  {
    token: 'nick-grissom',
    timestamp: 'Today at 4:30 PM',
    role: 'Community Lead',
    accent: '#54d8ff',
    content: [
      'Overlay looks crisp! I can handle the showcase walkthrough. Will prep a short run-through with the macro deck tonight.'
    ],
    reactions: [
      { emoji: '🔥', count: 6 },
      { emoji: '🎨', count: 3 }
    ]
  },
  {
    token: 'neko-bebop',
    timestamp: 'Today at 4:32 PM',
    role: 'Motion Artist',
    accent: '#ff72b6',
    content: [
      'Looped in a particle burst transition that pairs with the overlay. Dropped the MP4 + After Effects file in <span class="conversation__mention">/Particles/Shared</span>.',
      'Need audio cues? I can whip some up fast.'
    ],
    attachments: [
      {
        label: 'Bebop_ParticleBurst_v2.aep',
        meta: 'After Effects project · 46.2 MB'
      }
    ]
  },
  {
    token: 'sarah-diamond',
    timestamp: 'Today at 4:35 PM',
    role: 'Live Ops',
    accent: '#ffa76d',
    content: [
      'Scheduled the showcase event for <strong>tomorrow 2 PM PT</strong>. Invited the partners list + pinned the deck outline.',
      'Let me know if we need a backup stream route; I can mirror to NOIZ main.'
    ]
  }
];

const COMPOSER_ACTIONS = [
  { id: 'add', icon: '#svg-plus', label: 'Add attachment' },
  { id: 'gif', icon: '#svg-gif', label: 'Add a GIF' },
  { id: 'emoji', icon: '#svg-status', label: 'Select emoji' }
];

const profileData = (u = {}) =>
  `data-profile-name="${u.name || ''}" data-profile-token="${u.token || ''}" data-profile-avatar="${u.avatar || ''}" data-profile-banner="${u.banner || ''}" data-profile-accent="${u.accent || ''}" data-profile-frame="${u.frame || ''}" data-profile-bio="${u.bio || ''}" data-profile-since="${u.memberSince || ''}" data-profile-connections="${(u.connections || []).join(',')}" data-profile-badges="${(u.badges || []).join(',')}" data-profile-streaming="${u.streaming ? 'true' : 'false'}"`;

const renderMessage = (user, message) => {
  if (!user) return '';
  return `
    <li class="conversation__message" ${profileData(user)}>
      <div class="avatar-wrap conversation__avatar" style="--avi-width:44px; --avi-height:44px; --frame:url('${user.frame}')">
        <img class="avatar-image" src="${user.avatar}" alt="${user.name}">
      </div>
      <div class="conversation__bubble">
        <header class="conversation__header">
          <span class="conversation__author" style="color:${message.accent || user.accent || '#7c5dff'}">${user.name}</span>
          ${message.role ? `<span class="conversation__role">${message.role}</span>` : ''}
          <time class="conversation__timestamp" datetime="${message.timestamp}">${message.timestamp}</time>
        </header>
        <div class="conversation__body">
          ${message.content.map((line) => `<p>${line}</p>`).join('')}
          ${message.attachments ? `
            <div class="conversation__attachments">
              ${message.attachments
                .map(
                  (file) => `
                    <article class="conversation__attachment">
                      <div class="conversation__attachment-icon">📁</div>
                      <div class="conversation__attachment-meta">
                        <span class="conversation__attachment-name">${file.label}</span>
                        <span class="conversation__attachment-info">${file.meta}</span>
                      </div>
                      <button type="button" class="conversation__attachment-action">Download</button>
                    </article>
                  `
                )
                .join('')}
            </div>
          ` : ''}
          ${message.reactions ? `
            <div class="conversation__reactions">
              ${message.reactions
                .map((reaction) => `
                  <button class="conversation__reaction" type="button">
                    <span class="conversation__reaction-emoji">${reaction.emoji}</span>
                    <span class="conversation__reaction-count">${reaction.count}</span>
                  </button>
                `)
                .join('')}
            </div>
          ` : ''}
        </div>
      </div>
    </li>
  `;
};

export default async function init({ root }) {
  const users = await Promise.all(
    MESSAGE_FLOW.map(async (entry) => ({
      user: await getUserByToken(entry.token),
      entry
    }))
  );

  root.innerHTML = `
    <section class="conversation">
      <header class="conversation__channel">
        <div class="conversation__channel-meta">
          <div class="conversation__channel-title">
            <span class="conversation__channel-badge">${CHANNEL_INFO.name}</span>
            <button type="button" class="conversation__channel-favorite" aria-label="Mark channel favourite">
              <svg width="14" height="14" aria-hidden="true"><use href="#svg-star"></use></svg>
            </button>
          </div>
          <p class="conversation__topic">${CHANNEL_INFO.topic}</p>
        </div>
        <div class="conversation__channel-actions">
          <button type="button" class="conversation__channel-pill">
            <svg width="16" height="16" aria-hidden="true"><use href="#svg-pinned"></use></svg>
            <span>${CHANNEL_INFO.pinned} pinned</span>
          </button>
          <button type="button" class="conversation__channel-pill">
            <svg width="16" height="16" aria-hidden="true"><use href="#svg-members"></use></svg>
            <span>${CHANNEL_INFO.members} online</span>
          </button>
          <button type="button" class="conversation__channel-icon" aria-label="Notifications">
            <svg width="18" height="18" aria-hidden="true"><use href="#svg-notification"></use></svg>
          </button>
          <button type="button" class="conversation__channel-icon" aria-label="More options">
            <svg width="18" height="18" aria-hidden="true"><use href="#svg-more-dots"></use></svg>
          </button>
        </div>
      </header>
      <div class="conversation__scroll" data-role="scroll">
        <div class="conversation__divider"><span>Today</span></div>
        <ul class="conversation__feed">
          ${users.map(({ user, entry }) => renderMessage(user, entry)).join('')}
        </ul>
      </div>
      <form class="conversation__composer" novalidate>
        <div class="conversation__composer-actions">
          ${COMPOSER_ACTIONS.map(
            (action) => `
              <button class="conversation__composer-btn" type="button" aria-label="${action.label}">
                <svg width="18" height="18" aria-hidden="true"><use href="${action.icon}"></use></svg>
              </button>
            `
          ).join('')}
        </div>
        <div class="conversation__composer-field">
          <textarea placeholder="Message ${CHANNEL_INFO.name}" rows="1"></textarea>
        </div>
        <button class="conversation__composer-send" type="submit" aria-label="Send message">
          <svg width="18" height="18" aria-hidden="true"><use href="#svg-send-message"></use></svg>
        </button>
      </form>
    </section>
  `;

  const textarea = root.querySelector('.conversation__composer textarea');
  if (textarea) {
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(120, textarea.scrollHeight)}px`;
    });
  }

  return {};
}
