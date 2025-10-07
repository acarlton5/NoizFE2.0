// module/chat/chat.js
// Simple sidebar chat module with mock data and basic send capability

import { getUserByToken } from '../users.js';

const profileData = (u = {}) =>
  `data-profile-name="${u.name || ''}" data-profile-token="${u.token || ''}" data-profile-avatar="${u.avatar || ''}" data-profile-banner="${u.banner || ''}" data-profile-accent="${u.accent || ''}" data-profile-frame="${u.frame || ''}" data-profile-bio="${u.bio || ''}" data-profile-since="${u.memberSince || ''}" data-profile-connections="${(u.connections || []).join(',')}" data-profile-badges="${(u.badges || []).join(',')}" data-profile-streaming="${u.streaming ? 'true' : 'false'}"`;

const messageTpl = (m) => {
  const u = m.user || {};
  if (m.type === 'donation') {
    return `
      <div class="chat-donation">
        <div class="donation-header">
          <span class="name" ${profileData(u)}>${u.name || ''}</span>
          <span class="amount">${m.amount}</span>
        </div>
        ${m.text ? `<div class="donation-text">${m.text}</div>` : ''}
      </div>
    `;
  }
  if (m.type === 'sticker') {
    return `
      <div class="chat-message sticker">
        <span class="msg-avatar avatar-wrap" ${profileData(u)}>
          ${u.avatar ? `<img class="avatar-image" src="${u.avatar}" alt="${u.name || ''}">` : `<span class="avatar-letter" style="background:${u.accent || '#933'}">${(u.name || '?')[0]}</span>`}
        </span>
        <div class="msg-body">
        <div class="msg-header">
          <span class="name" style="color:${m.color || u.accent || '#333'}" ${profileData(u)}>${u.name || ''}</span>
          <span class="time">${m.time}</span>
        </div>
          <div class="sticker-meta">
            ${m.badge ? `<img class="sticker-badge" src="${m.badge}" alt="badge" />` : ''}
            <span class="amount">${m.amount || ''}</span>
          </div>
          <img class="sticker" src="${m.sticker}" alt="sticker" />
        </div>
      </div>
    `;
  }
  return `
      <div class="chat-message">
        <span class="msg-avatar avatar-wrap" ${profileData(u)}>
          ${u.avatar ? `<img class="avatar-image" src="${u.avatar}" alt="${u.name || ''}">` : `<span class="avatar-letter" style="background:${u.accent || '#933'}">${(u.name || '?')[0]}</span>`}
        </span>
        <div class="msg-body">
          <div class="msg-header">
            <div class="user-meta">
              <span class="name" style="color:${m.color || u.accent || '#333'}" ${profileData(u)}>${u.name || ''}</span>
              ${m.badges && m.badges.length ? `<span class="badges">${m.badges.slice(0,5).map((b) => `<img src="${b}" alt="badge" />`).join('')}</span>` : ''}
            </div>
            <span class="time">${m.time}</span>
        </div>
        <div class="text">${m.text}</div>
      </div>
    </div>
  `;
};

const EMOTE_SETS = [
  {
    global: true,
    emotes: [
      'images/badges/dev.png',
      'images/badges/mod.png',
      'images/badges/partner.png'
    ]
  },
  {
    streamer: {
      name: 'SampleStreamer',
      avatar: 'images/logo.png'
    },
    emotes: [
      'images/badges/vip.png',
      'images/badges/artist.png',
      'images/badges/sub.png',
      'images/badges/clipper.png'
    ]
  },
  {
    streamer: {
      name: 'AnotherStreamer',
      avatar: 'images/logo.png'
    },
    emotes: [
      'images/badges/trophy.svg',
      'images/badges/gifter.png',
      'images/badges/bot.png'
    ]
  }
];

const renderEmoteDrawer = () =>
  EMOTE_SETS.map((set) => {
    const header = set.global
      ? `<div class="emote-set-header"><img class="streamer-avatar" src="images/logo.png" alt="NOIZ" /><span class="streamer-name">Global</span></div>`
      : `<div class="emote-set-header"><img class="streamer-avatar" src="${set.streamer.avatar}" alt="${set.streamer.name}" /><span class="streamer-name">${set.streamer.name}</span></div>`;
    const emotes = set.emotes
      .map((url) => `<button type="button" class="emote" data-url="${url}"><img src="${url}" alt="emote" /></button>`)
      .join('');
    return `<div class="emote-set">${header}<div class="emote-list">${emotes}</div></div>`;
  }).join('');
 
const BADGE_URLS = [
  'images/badges/dev.png',
  'images/badges/mod.png',
  'images/badges/partner.png',
  'images/badges/vip.png',
  'images/badges/artist.png',
  'images/badges/sub.png',
  'images/badges/clipper.png',
  'images/badges/trophy.svg',
  'images/badges/gifter.png',
  'images/badges/bot.png',
  'images/badges/bugDCT.svg',
  'images/badges/heart.svg'
];

const RESONANCE_STICKERS = [
  'images/resonances/001/catch_em.gif',
  'images/resonances/002/pipe_smash.gif',
  'images/resonances/003/wazzup.gif',
  'images/resonances/004/erase_this_from_my_mind.gif',
  'images/resonances/005/super_saiyan.gif',
  'images/resonances/006/pat_pat.gif',
  'images/resonances/007/repo_duck!.gif',
  'images/resonances/008/bubble_pop.gif',
  'images/resonances/009/water_balloon.gif',
  'images/resonances/010/super_splasher.gif',
  'images/resonances/011/we_have_a_problem.gif',
  'images/resonances/012/up_to_11.gif',
  'images/resonances/013/party_popper.gif',
  'images/resonances/014/party_horn.gif',
  'images/resonances/015/arctic_snowball.gif',
  'images/resonances/016/tomato_toss.gif',
  'images/resonances/017/ghostly_boo.gif',
  'images/resonances/018/unidab.gif',
  'images/resonances/019/play_puppet.gif',
  'images/resonances/020/best_friend.gif',
  'images/resonances/021/clown_around.gif',
  'images/resonances/022/pyramid_head.gif',
  'images/resonances/023/leather_man.gif',
  'images/resonances/024/friday_slasher.gif',
  'images/resonances/025/the_screamer.gif',
  'images/resonances/026/halloween_treat.gif',
  'images/resonances/027/nightmare.gif',
  'images/resonances/028/easter_egg_splat.gif'
];

const RESONANCE_ITEMS = RESONANCE_STICKERS.map((sticker, i) => ({
  sticker,
  amount: `${(i + 1) * 100}`,
  badge: BADGE_URLS[8 + (i % 4)],
  effects: ['Sound FX', 'Visual FX', 'Chat FX', 'Sticker']
}));

const renderResonanceDrawer = () =>
  `<div class="resonance-grid">${RESONANCE_ITEMS.map(
    (item, i) => `
      <button type="button" class="resonance-item" data-index="${i}" data-sticker="${item.sticker}">
        <img class="resonance-sticker" src="${item.sticker}" alt="sticker" />
        <div class="resonance-cost">
          <img class="resonance-badge" src="${item.badge}" alt="badge" />
          <span class="amount">${item.amount}</span>
        </div>
      </button>
    `
  ).join('')}</div>`;

const tpl = (messages) => `
  <div class="chat-header">
    <div class="title">Live chat</div>
    <div class="meta">Top chat • 283K</div>
  </div>
  <div class="chat-dono-scroller" data-role="dono-scroller"></div>
  <div class="chat-body" data-role="list">
    ${messages.map(messageTpl).join('')}
  </div>
  <form class="chat-form" data-role="form">
    <div class="chat-drawer emote-drawer" data-role="emote-drawer">
      ${renderEmoteDrawer()}
    </div>
    <div class="chat-drawer resonance-drawer" data-role="resonance-drawer">
      <div class="emote-set-header">
        <img class="resonance-icon" src="images/logo_badge.svg" alt="resonance" />
        <span class="streamer-name">Resonances</span>
      </div>
      ${renderResonanceDrawer()}
    </div>
    <div class="chat-drawer resonance-use-drawer" data-role="resonance-use-drawer">
      <div class="resonance-use-content">
        <img class="resonance-use-sticker" data-role="resonance-use-sticker" src="" alt="resonance" />
        <ul class="resonance-use-effects" data-role="resonance-use-effects"></ul>
        <div class="resonance-use-actions">
          <button type="button" class="resonance-cancel-btn">Cancel</button>
          <button type="button" class="resonance-use-btn">Use</button>
        </div>
      </div>
    </div>
    <div class="chat-input-group">
      <div class="chat-input-top">
        <div class="chat-avatar">A</div>
        <div class="chat-input-wrapper">
          <div class="chat-user">Anon</div>
          <input type="text" class="chat-input" data-role="input" placeholder="Chat..." maxlength="200" />
        </div>
      </div>
      <div class="chat-input-bottom">
        <span class="chat-count" data-role="count">0/200</span>
        <div class="chat-actions">
          <div class="chat-tools">
            <button type="button" class="chat-emoji-btn" aria-label="Emoji">😊</button>
            <button type="button" class="chat-money-btn" aria-label="Send a tip">💲</button>
          </div>
          <button type="submit" class="chat-send-btn" aria-label="Send">
            <svg class="chat-send-icon" viewBox="0 0 24 24">
              <path d="M2 21L23 12 2 3v7l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </form>
  <button type="button" class="chat-hide btn btn-link" data-action="hide">Hide chat</button>
`;

export default async function init({ root, utils }) {
  const tokens = ['john-viking', 'marina-valentine', 'neko-bebop', 'nick-grissom', 'sarah-diamond'];
  const users = Object.fromEntries(await Promise.all(tokens.map(async (s) => [s, await getUserByToken(s)])));

  let messages = [
    {
      time: '9:58 AM',
      user: users['john-viking'],
      color: '#07b',
      text: 'wow',
      badges: [BADGE_URLS[0], BADGE_URLS[1], BADGE_URLS[2], BADGE_URLS[3], BADGE_URLS[4]]
    },
    {
      time: '9:58 AM',
      user: users['marina-valentine'],
      color: '#0a0',
      text: 'more pushups!',
      badges: [BADGE_URLS[5], BADGE_URLS[6]]
    },
    {
      time: '9:58 AM',
      user: users['neko-bebop'],
      color: '#c00',
      text: 'great play!',
      badges: [BADGE_URLS[7]]
    },
    {
      time: '9:58 AM',
      user: users['nick-grissom'],
      color: '#b80',
      text: "how's everyone on the eh team doing?",
      badges: [BADGE_URLS[8], BADGE_URLS[9], BADGE_URLS[10]]
    },
    {
      time: '9:58 AM',
      user: users['sarah-diamond'],
      color: '#609',
      text: 'awesome! 👏'
    },
    {
      time: '9:59 AM',
      user: users['neko-bebop'],
      color: '#333',
      type: 'sticker',
      sticker: 'images/resonances/001/catch_em.gif',
      amount: '100',
      badge: BADGE_URLS[11]
    },
    {
      type: 'donation',
      time: '9:59 AM',
      user: users['marina-valentine'],
      amount: '$5.00',
      text: 'BRAVO 🦊'
    }
  ];

  let donoScroller, emoteDrawer, resonanceDrawer, resonanceUseDrawer;
  let selectedResonance = null;

  function render() {
    root.innerHTML = tpl(messages);
    const list = root.querySelector('[data-role="list"]');
    list.scrollTop = list.scrollHeight;
    donoScroller = root.querySelector('[data-role="dono-scroller"]');
    emoteDrawer = root.querySelector('[data-role="emote-drawer"]');
    resonanceDrawer = root.querySelector('[data-role="resonance-drawer"]');
    resonanceUseDrawer = root.querySelector('[data-role="resonance-use-drawer"]');
  }

  render();
  messages.filter((m) => m.type === 'donation').forEach(spawnDonation);

  utils.delegate(root, 'submit', '[data-role="form"]', (e) => {
    e.preventDefault();
    const input = root.querySelector('[data-role="input"]');
    const text = input.value.trim();
    if (!text) return;
    messages.push({
      time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      user: { name: 'Anon', token: 'anon', accent: '#333' },
      color: '#333',
      text
    });
    input.value = '';
    render();
  });

  utils.delegate(root, 'input', '[data-role="input"]', (e) => {
    const counter = root.querySelector('[data-role="count"]');
    counter.textContent = `${e.target.value.length}/200`;
  });


  utils.delegate(root, 'click', '[data-action="hide"]', () => {
    root.style.display = 'none';
  });

  utils.delegate(root, 'click', '.chat-emoji-btn', () => {
    const isOpen = emoteDrawer.classList.contains('open');
    emoteDrawer.classList.remove('open');
    resonanceDrawer.classList.remove('open');
    if (!isOpen) emoteDrawer.classList.add('open');
  });

  utils.delegate(root, 'click', '.chat-money-btn', () => {
    const isOpen = resonanceDrawer.classList.contains('open');
    emoteDrawer.classList.remove('open');
    resonanceDrawer.classList.remove('open');
    resonanceUseDrawer.classList.remove('open');
    if (!isOpen) resonanceDrawer.classList.add('open');
  });

  utils.delegate(root, 'click', '.resonance-item', (e) => {
    const idx = parseInt(e.target.closest('.resonance-item').dataset.index, 10);
    const item = RESONANCE_ITEMS[idx];
    const sticker = resonanceUseDrawer.querySelector('[data-role="resonance-use-sticker"]');
    const effects = resonanceUseDrawer.querySelector('[data-role="resonance-use-effects"]');
    sticker.src = item.sticker;
    effects.innerHTML = item.effects.map((f) => `<li>${f}</li>`).join('');
    resonanceDrawer.classList.remove('open');
    emoteDrawer.classList.remove('open');
    resonanceUseDrawer.classList.add('open');
    selectedResonance = item;
  });

  utils.delegate(root, 'click', '.resonance-cancel-btn', () => {
    resonanceUseDrawer.classList.remove('open');
    resonanceDrawer.classList.add('open');
  });

  utils.delegate(root, 'click', '.resonance-use-btn', () => {
    if (!selectedResonance) return;
      messages.push({
        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        user: { name: 'Anon', token: 'anon', accent: '#333' },
        type: 'sticker',
        sticker: selectedResonance.sticker,
        amount: selectedResonance.amount,
        badge: selectedResonance.badge
      });
    resonanceUseDrawer.classList.remove('open');
    render();
  });

  function spawnDonation({ user, amount, duration = 5000, accent } = {}) {
    if (!donoScroller) return;
    const pill = document.createElement('div');
    pill.className = 'dono-pill';
    if (accent) pill.style.setProperty('--accent', accent);
    pill.innerHTML = `
      <span class="avatar">${(user || '?')[0]}</span>
      <span class="amount">${amount}</span>
      <div class="dono-timer"></div>`;
    const timer = pill.querySelector('.dono-timer');
    donoScroller.appendChild(pill);
    donoScroller.scrollLeft = donoScroller.scrollWidth;
    requestAnimationFrame(() => {
      timer.style.transitionDuration = `${duration}ms`;
      timer.style.width = '0%';
    });
    setTimeout(() => pill.remove(), duration);
  }

  return {
    addMessage(m) {
      messages.push(m);
      render();
      if (m.type === 'donation') {
        spawnDonation(m);
      }
    },
    showDonation(m) {
      spawnDonation(m);
    }
  };
}
