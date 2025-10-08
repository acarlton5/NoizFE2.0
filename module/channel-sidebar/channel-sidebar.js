export default {
  async init({ root, props = {}, hub }) {
    const data = props.data ?? demoData();

    root.innerHTML = `
      <aside class="noiz-channel-sidebar">
        <!-- Server mini header -->
        <div class="srv-header d-flex align-items-center gap-2 px-2 py-2">
          <div class="srv-logo"></div>
          <div class="srv-name flex-grow-1 text-truncate">Noice</div>
          <button class="btn btn-sm btn-icon" title="Server Menu" aria-label="Server Menu">▾</button>
        </div>

        <!-- Boost goal pill -->
        <div class="px-2">
          <div class="boost d-flex align-items-center gap-2">
            <span class="pill"></span><span class="label">Boost Goal</span>
            <span class="ms-auto count">${data.boostsDone}/${data.boostsGoal} Boosts</span>
          </div>
        </div>

        <!-- Channels & Roles -->
        <button class="section-cta w-100 text-start" data-action="roles">
          <span class="ico">🔍</span>
          <span>Channels & Roles</span>
        </button>

        <div class="hr"></div>

        <!-- Sections -->
        <div class="sections">
          ${data.sections.map(sec => renderSection(sec)).join('')}
        </div>
      </aside>
    `;

    // collapse/expand
    root.addEventListener('click', (e) => {
      const t = e.target.closest('[data-toggle="section"]');
      if (!t) return;
      const id = t.dataset.id;
      const section = root.querySelector(`.section[data-id="${id}"]`);
      section?.classList.toggle('is-collapsed');
    });

    // channel click
    root.addEventListener('click', (e) => {
      const ch = e.target.closest('.chan');
      if (!ch) return;
      // set active
      root.querySelectorAll('.chan.is-active').forEach(n => n.classList.remove('is-active'));
      ch.classList.add('is-active');
      // clear unread dot
      ch.querySelector('.unread')?.remove();
      // emit + (optionally) route
      hub.emit('channel-sidebar:open', { id: ch.dataset.id });
      // hub.navigate(`/channel?id=${encodeURIComponent(ch.dataset.id)}`);
    });

    // roles click
    root.querySelector('[data-action="roles"]')?.addEventListener('click', () => {
      hub.emit('channel-sidebar:roles');
    });
  }
};

/* ------------ helpers ------------ */

function renderSection(sec) {
  return `
    <div class="section ${sec.collapsed ? 'is-collapsed' : ''}" data-id="${sec.id}">
      <button class="section-hdr" data-toggle="section" data-id="${sec.id}">
        <span class="chev">▾</span>
        <span class="title text-uppercase">${sec.title}</span>
      </button>
      <div class="section-body">
        ${sec.channels.map(c => renderChan(c)).join('')}
      </div>
    </div>`;
}

function renderChan(c) {
  const icon = c.icon ?? '#';
  const badge = c.badge ? `<span class="badge">${c.badge}</span>` : '';
  const unread = c.unread ? `<span class="unread"></span>` : '';
  const lock = c.locked ? `<span class="lock">🔒</span>` : '';
  return `
    <button class="chan ${c.active ? 'is-active' : ''}" data-id="${c.id}" title="${c.name}">
      <span class="hash">#</span>
      <span class="label text-truncate">${icon} ${c.name}</span>
      ${badge}${lock}${unread}
    </button>`;
}

function demoData() {
  return {
    boostsDone: 9, boostsGoal: 28,
    sections: [
      {
        id:'welcome', title:'Welcome', collapsed:false,
        channels:[
          {id:'welcome', name:'welcome'},
          {id:'rules', name:'rules', icon:'☑️'},
          {id:'introductions', name:'introductions', icon:'👋'},
          {id:'new-joiners', name:'new-joiners', icon:'🆕'}
        ]
      },
      {
        id:'important', title:'Important', collapsed:false,
        channels:[
          {id:'announcements', name:'announcements', icon:'📢'},
          {id:'prediction-card-game', name:'prediction-card-game', icon:'🧠'}
        ]
      },
      {
        id:'community', title:'Community', collapsed:false,
        channels:[
          {id:'general', name:'general', icon:'💬', active:true},
          {id:'general-creators', name:'general-creators', icon:'💬'},
          {id:'creator-events', name:'creator-events', icon:'📅'},
          {id:'the-good-stuff', name:'the-good-stuff', icon:'❤️'},
          {id:'clips', name:'clips', icon:'🎬', badge:2, unread:true}
        ]
      },
      {
        id:'support', title:'Support', collapsed:false,
        channels:[
          {id:'feedback', name:'feedback', icon:'🧪'},
          {id:'bug-reports', name:'bug-reports', icon:'🪲'}
        ]
      }
    ]
  };
}
