// module/messages/messages.js
// JS-only render + scoped listeners + cross-module calls

const tpl = (items, unread) => `
  <section class="container my-3" data-role="messages">
    <div class="card bg-dark text-white">
      <div class="card-header d-flex justify-content-between align-items-center">
        <span>Messages</span>
        <span class="badge ${unread > 0 ? 'bg-success' : 'bg-secondary'}" data-role="unread">${unread}</span>
      </div>
      <div class="list-group list-group-flush" data-role="list">
        ${items.length === 0 ? `
          <div class="list-group-item bg-dark text-muted">No messages</div>
        ` : items.map((m, i) => `
          <button class="list-group-item list-group-item-action ${m.read ? '' : 'fw-bold'}"
                  data-role="row" data-index="${i}">
            <div class="d-flex justify-content-between">
              <span>${m.from}</span>
              ${m.read ? '' : '<span class="badge bg-success">new</span>'}
            </div>
            <div class="small text-muted mt-1">${m.text}</div>
          </button>
        `).join('')}
      </div>
      <div class="card-footer d-flex justify-content-between">
        <button class="btn btn-sm btn-outline-light" data-action="mark-all">Mark all read</button>
        <button class="btn btn-sm btn-outline-light" data-action="rename-header">Set Header Title</button>
      </div>
    </div>
  </section>
`;

export default async function init({ hub, root, utils }) {
  // Demo state
  let messages = [
    { id: 1, from: 'Nova', text: 'Yo! Ready to queue?', read: false },
    { id: 2, from: 'Dex', text: 'Nice clip from last match!', read: false },
    { id: 3, from: 'Kai', text: 'See you Friday', read: true }
  ];
  const unread = () => messages.reduce((n, m) => n + (m.read ? 0 : 1), 0);

  function render() {
    root.innerHTML = tpl(messages, unread());
  }

  // Initial paint hidden until opened
  root.style.display = 'none';
  render();

  // Delegated events (auto-cleaned)
  utils.delegate(root, 'click', '[data-role="row"]', (e, btn) => {
    const i = parseInt(btn.getAttribute('data-index'), 10);
    messages[i].read = true;
    hub.emit('messages:unreadChanged', unread());
    render();
  });

  utils.delegate(root, 'click', '[data-action="mark-all"]', () => {
    messages = messages.map(m => ({ ...m, read: true }));
    hub.emit('messages:unreadChanged', 0);
    render();
  });

  utils.delegate(root, 'click', '[data-action="rename-header"]', async () => {
    await hub.api.header.setTitle('NOIZ • Inbox');
  });

  // Public API for other modules
  return {
    open() {
      root.style.display = '';
      root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    getUnread() { return unread(); },

    // Optional destroy hook if you allocate external resources
    // destroy() {}
  };
}
