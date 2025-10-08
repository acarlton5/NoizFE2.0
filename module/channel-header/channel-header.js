export default {
  async init({ root }) {
    root.innerHTML = `
      <div class="noiz-channel-header d-flex align-items-center gap-2 px-3 py-2"
           style="border-bottom:1px solid rgba(255,255,255,.06); background:#12151a;">
        <span class="text-secondary">#</span>
        <strong>general-creators</strong>
        <span class="ms-2 small text-secondary">• Connect, collab, and vibe</span>
        <div class="ms-auto d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-outline-light">🔎</button>
          <button class="btn btn-sm btn-outline-light">📌</button>
        </div>
      </div>
    `;
  }
};
