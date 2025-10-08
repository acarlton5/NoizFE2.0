export default {
  async init({ root, props = {} }) {
    const p = {
      id: props.id ?? 'noiz-demo',
      title: props.title ?? 'Coding NOIZ — Live UI Build',
      creator: props.creator ?? 'acarlton5',
      category: props.category ?? 'Software & Tech',
      viewers: props.viewers ?? 1234,
      live: props.live ?? true,
      src: props.src ?? 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      poster: props.poster ?? ''
    };

    root.innerHTML = `
      <section class="noiz-live">
        <div class="player-wrap ${p.poster ? 'has-poster':''}">
          <video class="player" ${p.poster ? `poster="${p.poster}"` : ''} playsinline></video>

          <div class="hud top">
            <span class="pill ${p.live ? 'is-live' : 'is-off'}">${p.live ? 'LIVE' : 'OFFLINE'}</span>
            <span class="viewers">👁 ${Intl.NumberFormat().format(p.viewers)}</span>
          </div>

          <div class="hud bottom">
            <div class="left">
              <button class="pbtn" data-act="togglePlay" title="Play/Pause">⏯</button>
              <button class="pbtn" data-act="toggleMute" title="Mute">🔇</button>
              <input class="vol" type="range" min="0" max="1" step="0.01" value="1" title="Volume"/>
            </div>
            <div class="right">
              <button class="pbtn" data-act="theater" title="Theater">🖼</button>
              <button class="pbtn" data-act="fullscreen" title="Fullscreen">⛶</button>
            </div>
          </div>
        </div>

        <header class="meta">
          <div class="meta-left">
            <div class="avatar"></div>
            <div class="text">
              <div class="title text-truncate">${escapeHtml(p.title)}</div>
              <div class="byline">
                <strong class="creator">@${escapeHtml(p.creator)}</strong>
                <span class="sep">•</span>
                <span class="cat">${escapeHtml(p.category)}</span>
              </div>
            </div>
          </div>
          <div class="meta-actions">
            <button class="btn-ghost">Follow</button>
            <button class="btn-primary">Subscribe</button>
          </div>
        </header>
      </section>
    `;

    const video = root.querySelector('video');
    const src = document.createElement('source');
    src.src = p.src;
    src.type = p.src.endsWith('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp4';
    video.appendChild(src);
    video.autoplay = true; video.controls = false;

    root.addEventListener('input', (e) => {
      if (e.target.matches('.vol')) { video.muted = false; video.volume = parseFloat(e.target.value); }
    });
    root.addEventListener('click', (e) => {
      const btn = e.target.closest('.pbtn'); if (!btn) return;
      const act = btn.dataset.act;
      if (act === 'togglePlay') { video.paused ? video.play() : video.pause(); }
      if (act === 'toggleMute') { video.muted = !video.muted; }
      if (act === 'fullscreen') {
        const wrap = root.querySelector('.player-wrap');
        if (!document.fullscreenElement) wrap.requestFullscreen?.(); else document.exitFullscreen?.();
      }
      if (act === 'theater') { root.classList.toggle('is-theater'); }
    });
  },

  routes(hub) {
    return [{
      path: '/live',
      handler: async ({ params }) => {
        hub.emit('ui:openLive', { id: params.id || 'noiz-demo' });
      }
    }];
  }
};

function escapeHtml(s=''){ return s.replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }
