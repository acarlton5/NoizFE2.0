import { getUserByToken } from '../users.js';

const SAMPLE_CONVERSATIONS = {
  'marina-valentine': [
    { id: 'm1', author: 'other', text: 'Hey hey! Ready for the art drop tonight?', timestamp: 'Yesterday • 7:42 PM', read: false },
    { id: 'm2', author: 'self', text: 'Absolutely. I have a new pack to show you.', timestamp: 'Yesterday • 7:45 PM', read: true },
    { id: 'm3', author: 'other', text: 'Let\'s sync 30 before. I\'ll open the stage in Emerald.', timestamp: 'Yesterday • 7:46 PM', read: false }
  ],
  'neko-bebop': [
    { id: 'n1', author: 'other', text: 'Queueing for ranked? Lobby is open.', timestamp: 'Today • 3:12 PM', read: false },
    { id: 'n2', author: 'self', text: 'Give me 5. Swapping over now.', timestamp: 'Today • 3:13 PM', read: true }
  ],
  'nick-grissom': [
    { id: 'g1', author: 'other', text: 'Uploaded the new mix to the drive.', timestamp: 'Monday • 11:18 AM', read: false },
    { id: 'g2', author: 'self', text: 'Listening now, the drop at 1:25 is nasty 🔥', timestamp: 'Monday • 11:20 AM', read: true }
  ],
  'sarah-diamond': [
    { id: 's1', author: 'self', text: 'Appreciate the notes on the overlay revamp!', timestamp: 'Last Friday • 10:02 PM', read: true },
    { id: 's2', author: 'other', text: 'Anytime! Ping me if you want a new alert animation.', timestamp: 'Last Friday • 10:03 PM', read: false }
  ]
};

const escapeHtml = (value = '') =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatTimestamp = (date = new Date()) => {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

const renderMessage = (msg, index, messages, selfUser, targetUser) => {
  const previous = index > 0 ? messages[index - 1] : null;
  const sameAuthor = previous && previous.author === msg.author;
  const isSelf = msg.author === 'self';
  const user = isSelf ? selfUser : targetUser;
  const avatarMarkup = sameAuthor
    ? '<span class="dm-message__avatar-placeholder"></span>'
    : `<span class="dm-message__avatar avatar-wrap" style="--avi-width:34px; --avi-height:34px; ${user?.frame ? `--frame:url('${user.frame}')` : ''};">
        <img class="avatar-image" src="${user?.avatar || ''}" alt="${user?.name || ''}" />
      </span>`;
  const header = sameAuthor
    ? ''
    : `<header class="dm-message__header">
        <span class="dm-message__author">${user?.name || 'Member'}</span>
        <time class="dm-message__time">${msg.timestamp}</time>
      </header>`;

  return `
    <article class="dm-message${isSelf ? ' dm-message--self' : ''}${sameAuthor ? ' dm-message--chained' : ''}">
      ${avatarMarkup}
      <div class="dm-message__bubble">
        ${header}
        <div class="dm-message__content">${escapeHtml(msg.text)}</div>
      </div>
    </article>
  `;
};

const renderConversation = (conversation, selfUser, targetUser) => {
  if (!conversation || !conversation.messages.length) {
    return '<div class="dm-message dm-message--empty">No messages yet — start the conversation!</div>';
  }
  return conversation.messages
    .map((msg, index) => renderMessage(msg, index, conversation.messages, selfUser, targetUser))
    .join('');
};

export default async function init({ hub, root, utils, props }) {
  const loggedToken = await fetch('/data/logged-in.json').then((r) => r.json()).catch(() => null);
  const selfUser = loggedToken ? await getUserByToken(loggedToken) : null;

  const conversations = new Map(
    Object.entries(SAMPLE_CONVERSATIONS).map(([token, messages]) => [
      token,
      {
        messages: messages.map((msg) => ({ ...msg })),
      }
    ])
  );

  const state = {
    activeToken: props?.user?.token || null,
    activeUser: props?.user || null,
  };

  function ensureConversation(token) {
    if (!token) return;
    if (!conversations.has(token)) {
      conversations.set(token, {
        messages: [
          {
            id: `${token}-welcome`,
            author: 'other',
            text: "This is the beginning of your conversation.",
            timestamp: 'Just now',
            read: false
          }
        ]
      });
    }
  }

  function unreadTotal() {
    let total = 0;
    conversations.forEach((entry) => {
      total += entry.messages.filter((msg) => msg.author !== 'self' && msg.read === false).length;
    });
    return total;
  }

  function markConversationRead(token) {
    const entry = conversations.get(token);
    if (!entry) return;
    entry.messages = entry.messages.map((msg) =>
      msg.author === 'other' ? { ...msg, read: true } : msg
    );
  }

  function render() {
    const conversation = state.activeToken ? conversations.get(state.activeToken) : null;
    const targetUser = state.activeUser;

    if (!conversation || !targetUser) {
      root.innerHTML = `
        <section class="dm-view dm-view--empty">
          <div class="dm-empty">
            <h1>Select a direct message</h1>
            <p>Pick a friend from the left rail to load your chat history.</p>
          </div>
        </section>
      `;
      return;
    }

    root.innerHTML = `
      <section class="dm-view">
        <header class="dm-view__intro">
          <div class="dm-view__title">
            <h1>${escapeHtml(targetUser.name || 'Direct Message')}</h1>
            <p>This is the beginning of your message history with <strong>${escapeHtml(targetUser.name || '')}</strong>.</p>
          </div>
          <div class="dm-view__actions">
            <button type="button" class="dm-view__pill" data-action="add-friend">Add Friend</button>
            <button type="button" class="dm-view__pill" data-action="block">Block</button>
            <button type="button" class="dm-view__pill dm-view__pill--accent" data-action="report">Report Spam</button>
          </div>
        </header>
        <div class="dm-view__history" data-role="scroller">
          ${renderConversation(conversation, selfUser, targetUser)}
        </div>
        <form class="dm-view__composer" data-role="composer">
          <div class="composer__field">
            <textarea rows="1" placeholder="Message @${escapeHtml(targetUser.token || 'friend')}" data-role="input"></textarea>
            <div class="composer__toolbar">
              <button type="button" data-action="emoji" aria-label="Add emoji">😊</button>
              <button type="button" data-action="upload" aria-label="Upload file">+</button>
              <button type="submit" class="composer__send">Send</button>
            </div>
          </div>
        </form>
      </section>
    `;

    const scroller = root.querySelector('[data-role="scroller"]');
    if (scroller) {
      requestAnimationFrame(() => {
        scroller.scrollTop = scroller.scrollHeight;
      });
    }
  }

  function setActive(user) {
    if (!user?.token) return;
    state.activeToken = user.token;
    state.activeUser = user;
    ensureConversation(user.token);
    markConversationRead(user.token);
    render();
    hub.emit('messages:unreadChanged', unreadTotal());
  }

  utils.delegate(root, 'submit', '[data-role="composer"]', (event, form) => {
    event.preventDefault();
    if (!state.activeToken) return;
    const textarea = form.querySelector('[data-role="input"]');
    const value = textarea?.value?.trim();
    if (!value) return;
    const entry = conversations.get(state.activeToken);
    const id = `${state.activeToken}-${Date.now()}`;
    entry.messages.push({
      id,
      author: 'self',
      text: value,
      timestamp: `Today • ${formatTimestamp(new Date())}`,
      read: true
    });
    textarea.value = '';
    render();
  });

  utils.delegate(root, 'input', '[data-role="input"]', (event, textarea) => {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  });

  const off = hub.on('dm:selected', (user) => {
    setActive(user);
  });
  utils.onCleanup(off);

  if (state.activeToken && state.activeUser) {
    ensureConversation(state.activeToken);
    markConversationRead(state.activeToken);
  } else {
    const nav = await hub.require('navigation').catch(() => null);
    const active = nav?.getActiveDM?.();
    if (active) {
      state.activeToken = active.token;
      state.activeUser = active;
      ensureConversation(active.token);
      markConversationRead(active.token);
    }
  }

  render();
  hub.emit('messages:unreadChanged', unreadTotal());

  return {
    open() {
      render();
      const scroller = root.querySelector('[data-role="scroller"]');
      scroller?.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' });
    },
    getUnread() {
      return unreadTotal();
    }
  };
}
