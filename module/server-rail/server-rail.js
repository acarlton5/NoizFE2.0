export default {
  async init({ root, props = {}, hub }) {
    // shape the data you can pass via data-props
    const servers = props.servers ?? [
      { id: 'home',  name: 'Home',  img: '/images/noiz-32.png',  active: true,  status: 'online' },
      { id: 's1',    name: 'Drew',  img: '/images/drew.png',     unread: 3,     status: 'online' },
      { id: 's2',    name: 'Lawk',  img: '/images/lawk.png',     status: 'idle' },
      { id: 's3',    name: 'Marra', img: '/images/marra.png',    status: 'dnd'  },
      { id: 's4',    name: 'Noiz',  img: '/images/noiz-snow.png' }
    ];

    // optional bottom "me" bubble
    const me = props.me ?? { name: 'You', img: '/images/me.png', status: 'online' };

    root.innerHTML = `
      <aside class="noiz-server-rail d-flex flex-column align-items-center">
        <!-- top spacer -->
        <div class="rail-spacer"></div>

        <!-- top "NOIZ" bubble -->
        <button class="rail-btn rail-home" data-action="home" title="NOIZ">
          <span class="ring"></span>
          <img class="pfp" src="${servers[0]?.img || 'https://placehold.co/64'}" alt="">
        </button>

        <div class="rail-sep"></div>

        <!-- list -->
        <div class="rail-scroll flex-grow-1 d-flex flex-column align-items-center">
          ${servers.slice(1).map(s => `
            <button class="rail-btn ${s.active ? 'is-active' : ''}" data-action="open" data-id="${s.id}" title="${s.name}">
              <span class="ring"></span>
              <img class="pfp" src="${s.img}" alt="${s.name}">
              ${s.unread ? `<span class="badge">${s.unread}</span>` : ''}
              ${s.status ? `<span class="status ${s.status}"></span>` : ''}
              ${s.active ? `<span class="active-bar"></span>` : ''}
            </button>
          `).join('')}
        </div>

        <!-- quick add slots -->
        <div class="rail-sep"></div>
        <button class="rail-btn rail-empty" data-action="add" title="Create / Discover">
          <span class="ring"></span>
          <span class="dot"></span>
        </button>
        <button class="rail-btn rail-empty" data-action="add" title="Create / Discover">
          <span class="ring"></span>
          <span class="dot"></span>
        </button>

        <!-- bottom user bubble -->
        <div class="rail-bottom">
          <button class="rail-btn rail-me" data-action="me" title="${me.name}">
            <span class="ring"></span>
            <img class="pfp" src="${me.img}" alt="${me.name}">
            <span class="status ${me.status || 'online'}"></span>
          </button>
        </div>
      </aside>
    `;
    // Enable BS5 tooltips on rail buttons (floated to <body>)
    const btns = root.querySelectorAll('.rail-btn');
    for (const b of btns) {
      b.setAttribute('data-bs-toggle', 'tooltip');
      b.setAttribute('data-bs-placement', 'right');
      // use title attr if present, fallback to data-id/name
      if (!b.title) b.title = b.getAttribute('title') || b.dataset.id || '';
      // eslint-disable-next-line no-undef
      new bootstrap.Tooltip(b, {
        container: 'body',
        boundary: document.body,
        customClass: 'noiz-tooltip',
        trigger: 'hover focus'
      });
    }

    // interactions
    root.addEventListener('click', (e) => {
      const btn = e.target.closest('.rail-btn');
      if (!btn) return;
      const action = btn.dataset.action;

      if (action === 'open') {
        // visual active state
        root.querySelectorAll('.rail-btn.is-active .active-bar').forEach(n => n.remove());
        root.querySelectorAll('.rail-btn.is-active').forEach(n => n.classList.remove('is-active'));
        btn.classList.add('is-active');
        btn.insertAdjacentHTML('beforeend', '<span class="active-bar"></span>');
        hub.emit('server-rail:open', { id: btn.dataset.id });
      } else if (action === 'add') {
        hub.emit('server-rail:add');
      } else if (action === 'home') {
        hub.emit('server-rail:home');
      } else if (action === 'me') {
        hub.emit('server-rail:me');
      }
    });
  },

  api(hub) {
    return {
      setActive(id) {
        const btn = document.querySelector(`.noiz-server-rail .rail-btn[data-id="${CSS.escape(id)}"]`);
        if (!btn) return;
        document.querySelectorAll('.noiz-server-rail .rail-btn.is-active .active-bar').forEach(n => n.remove());
        document.querySelectorAll('.noiz-server-rail .rail-btn.is-active').forEach(n => n.classList.remove('is-active'));
        btn.classList.add('is-active');
        btn.insertAdjacentHTML('beforeend', '<span class="active-bar"></span>');
      }
    };
  }
};
