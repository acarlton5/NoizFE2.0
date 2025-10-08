export default {
  async init({ root, props = {}, hub }) {
    const channel = props.id || 'noiz-demo';

    root.innerHTML = `
      <aside class="noiz-live-chat">
        <header class="lc-hdr">
          <div class="title">Live Chat</div>
          <div class="actions">
            <button class="lc-btn" data-act="popout" title="Pop out">🗗</button>
            <button class="lc-btn" data-act="close" title="Close Chat">✕</button>
          </div>
        </header>

        <div class="lc-host">
          <module data-module="chat-pane"></module>
          <module data-module="chat-composer" data-props='{"channel":"${channel}"}'></module>
        </div>
      </aside>
    `;

    // mount the two chat modules we just added
    const tags = root.querySelectorAll('module[data-module]');
    for (const el of tags) await hub.loadModule(el.dataset.module, el);

    root.addEventListener('click', (e) => {
      const btn = e.target.closest('.lc-btn'); if (!btn) return;
      if (btn.dataset.act === 'close') hub.emit('ui:closeLive');
      if (btn.dataset.act === 'popout') hub.emit('live-chat:popout');
    });
  }
};
