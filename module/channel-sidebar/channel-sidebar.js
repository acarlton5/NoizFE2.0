// NOIZ channel-sidebar with LIVE button
// default export async function init({ root, props }) returns { api, dispose }

export default async function init({ root, props = {} }) {
  const initial = {
    online: props.online ?? true,
    title: props.title ?? "Live UI Build",
    channel: props.channel ?? "general",
    viewers: props.viewers ?? 1234
  };

  root.innerHTML = render(initial);

  const liveBtn = root.querySelector("[data-action='go-live']");
  const titleEl = root.querySelector("[data-bind='title']");
  const pill = root.querySelector("[data-bind='pill']");
  const viewersEl = root.querySelector("[data-bind='viewers']");

  // Click → tell the app to switch to live view
  liveBtn.addEventListener("click", () => {
    const detail = { channel: initial.channel, title: titleEl.textContent.trim() };
    // Your app.js can listen to this:
    window.dispatchEvent(new CustomEvent("channel:go-live", { detail }));
    props.onLiveClick && props.onLiveClick(detail);
  });

  // simple demo channel list (replace with real data)
  root.querySelectorAll(".chan").forEach(el => {
    el.addEventListener("click", () => {
      root.querySelectorAll(".chan.is-active").forEach(a => a.classList.remove("is-active"));
      el.classList.add("is-active");
    });
  });

  const api = {
    /** Update the live bar dynamically */
    updateLive({ title, online, viewers } = {}) {
      if (typeof title === "string")  titleEl.textContent = title;
      if (typeof online === "boolean") {
        pill.style.display = online ? "" : "none";
        liveBtn.classList.toggle("is-offline", !online);
      }
      if (Number.isFinite(viewers)) {
        viewersEl.textContent = Intl.NumberFormat().format(viewers);
      }
    }
  };

  function dispose() {
    // Nothing persistent; if you attach observers, clean them here.
  }

  return { api, dispose };
}

/* --- view --- */
function render(state) {
  const vStr = Intl.NumberFormat().format(state.viewers ?? 0);
  return `
  <aside class="channel-sidebar" aria-label="Channel Navigation">

    <!-- LIVE header -->
    <button class="live-card" type="button" data-action="go-live" aria-label="Open live view">
      <span class="live-dot" aria-hidden="true"></span>

      <span class="live-meta">
        <span class="live-row">
          <span class="pill" data-bind="pill">LIVE</span>
          <span class="hash">#${escape(state.channel)}</span>
        </span>
        <span class="title" data-bind="title">${escape(state.title)}</span>
      </span>

      <span class="viewer-chip" title="Concurrent viewers">
        <span aria-hidden="true">👁</span>
        <span data-bind="viewers">${vStr}</span>
      </span>
    </button>

    <div class="divider"></div>

    <!-- Sections (examples) -->
    <div class="section">
      <h6>Welcome</h6>
      ${row("#", "welcome")}
      ${row("📜", "rules")}
      ${row("✨", "introductions")}
      ${row("🆕", "new-joiners")}
    </div>

    <div class="section">
      <h6>Community</h6>
      ${row("💬", "general", true)}
      ${row("🎨", "creator-events")}
      ${row("⭐", "the-good-stuff")}
      ${row("🎬", "clips")}
    </div>

    <div class="section">
      <h6>Support</h6>
      ${row("🛠️", "feedback")}
      ${row("🐞", "bug-reports")}
    </div>

  </aside>`;
}

function row(icon, name, active=false) {
  return `
    <div class="chan ${active ? "is-active": ""}" role="button" tabindex="0" aria-label="${escape(name)}">
      <span class="hash">${escape(icon)}</span>
      <span>${escape(name)}</span>
      <span></span>
    </div>`;
}

function escape(s="") { return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
