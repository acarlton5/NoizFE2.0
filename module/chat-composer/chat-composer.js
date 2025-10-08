export default {
  async init({ root, props = {}, hub }) {
    root.innerHTML = `
      <footer class="noiz-chat-composer">
        <div class="composer-wrap">
          <div class="toolbar-left">
            <button class="cbtn" title="Emoji">😊</button>
            <button class="cbtn" title="GIF">GIF</button>
            <button class="cbtn" title="Sticker">🩵</button>
          </div>

          <input class="cinput" placeholder="Message #general-creators" />

          <div class="toolbar-right">
            <button class="cbtn" title="Attach">📎</button>
            <button class="send-btn" title="Send">Send</button>
          </div>
        </div>

        <div class="hints">
          <span>Press <kbd>Enter</kbd> to send • <kbd>Shift</kbd>+<kbd>Enter</kbd> for new line</span>
        </div>
      </footer>
    `;

    const input = root.querySelector('.cinput');
    const send  = root.querySelector('.send-btn');

    function sendMsg() {
      const txt = input.value.trim();
      if (!txt) return;
      window.noiz?.hub.emit('chat:send', { text: txt });
      input.value = '';
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMsg();
      }
    });
    send.addEventListener('click', sendMsg);
  }
};
