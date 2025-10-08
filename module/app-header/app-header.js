export default {
  async init({ root, props = {} }) {
    const title = props.title ?? "Souls of Purgatory";
    const icon  = props.icon  ?? "https://placehold.co/16x16"; // small square game/brand icon

    root.innerHTML = `
      <header class="noiz-app-header-min">
        <div class="container-fluid d-flex align-items-center justify-content-between">
          <!-- left spacer (keeps title perfectly centered) -->
          <div class="hdr-side d-none d-sm-flex"></div>

          <!-- centered title -->
          <div class="hdr-center d-flex align-items-center gap-2 mx-auto">
            <img class="hdr-icon" src="${icon}" alt="" />
            <span class="hdr-title text-truncate">${title}</span>
          </div>

          <!-- right actions -->
          <div class="hdr-side d-flex align-items-center gap-2">
            <button class="hdr-btn" data-action="display" title="Display"><svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M3 5h18v11H3zM8 19h8v2H8z"/></svg></button>
            <button class="hdr-btn" data-action="help" title="Help"><svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2Zm1 16h-2v-2h2v2Zm1.07-7.75-.9.92A2 2 0 0 0 12 13h-1v-1a3 3 0 0 1 .88-2.12l1.24-1.26a1.5 1.5 0 1 0-2.12-2.12 1.49 1.49 0 0 0-.44 1.06H8a3.5 3.5 0 1 1 7 0c0 .93-.37 1.82-.93 2.37Z"/></svg></button>
            <button class="hdr-btn hdr-success" data-action="download" title="Download"><svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M5 20h14v-2H5v2ZM12 2v10.59l3.3-3.3 1.4 1.41-5 5-5-5 1.4-1.41 3.3 3.3V2h1Z"/></svg></button>
          </div>
        </div>
      </header>
    `;

    // simple events (hook these up later)
    root.addEventListener('click', (e) => {
      const btn = e.target.closest('.hdr-btn');
      if (!btn) return;
      const action = btn.dataset.action;
      // example: emit
      window.noiz?.hub.emit(`header:${action}`);
    });
  }
};
