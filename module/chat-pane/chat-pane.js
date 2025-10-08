export default {
  async init({ root, props = {} }) {
    const data = props.data ?? demoData();

    root.innerHTML = `
      <section class="noiz-chat-pane">
        <!-- New messages banner -->
        <div class="nm-banner">
          <span>18 new messages since 10:34 AM</span>
          <div class="spacer"></div>
          <button class="btn btn-sm btn-mark">Mark As Read</button>
        </div>

        <!-- Messages scroll -->
        <div class="msg-scroll">
          ${data.map(group => renderGroup(group)).join('')}
          <div class="end-of-sample">— end of sample —</div>
        </div>
      </section>
    `;

    // hover actions (demo)
    root.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-act]');
      if (!btn) return;
      const act = btn.dataset.act;
      const mid = btn.closest('.msg')?.dataset.id;
      console.log('[chat] action', act, 'on', mid);
    });

    // mark as read (demo)
    root.querySelector('.btn-mark')?.addEventListener('click', () => {
      root.querySelector('.nm-banner')?.classList.add('is-hidden');
    });
  }
};

function renderGroup(g) {
  return `
    <div class="msg-group">
      <img class="avatar" src="${g.avatar}" alt="${g.author}" />
      <div class="bubble">
        <div class="meta">
          <span class="author">${g.author}</span>
          ${g.role ? `<span class="role">${g.role}</span>` : ''}
          <time class="time">${g.time}</time>
        </div>
        ${g.messages.map(m => renderMsg(m)).join('')}
      </div>
    </div>
  `;
}

function renderMsg(m) {
  return `
    <article class="msg" data-id="${m.id}">
      <div class="msg-line">
        <p class="text">${m.text}</p>
        <div class="line-actions">
          <button class="icon-btn" data-act="reply" title="Reply">↩</button>
          <button class="icon-btn" data-act="thread" title="Open thread">🧵</button>
          <button class="icon-btn" data-act="more" title="More">⋯</button>
        </div>
      </div>
      ${m.attach ? `<div class="attachment">${m.attach}</div>` : ''}
    </article>
  `;
}

function demoData() {
  return [
    {
      author: 'Andsim Gaming',
      role: 'BEAM',
      time: '9/25/25, 12:25 PM',
      avatar: 'https://placehold.co/40x40/png',
      messages: [
        { id: 'm1', text: 'it have to be link to a file' }
      ]
    },
    {
      author: 'Dale',
      role: '',
      time: '9/25/25, 12:29 PM',
      avatar: 'https://placehold.co/40x40/png?text=D',
      messages: [
        { id: 'm2', text: 'Can you share a screenshot of what you are referring to?' }
      ]
    },
    {
      author: 'Andsim Gaming',
      role: 'BEAM',
      time: '9/25/25, 12:29 PM',
      avatar: 'https://placehold.co/40x40/png',
      messages: [
        { id: 'm3', text: 'nope error still pop up' }
      ]
    }
  ];
}
