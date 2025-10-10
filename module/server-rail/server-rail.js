// Minimal smoke test: renders 5 circles and requests the rail-width left column.
// If you see these circles, the loader & CSS binding are working.

export const shell = { left: 'rail' };

export default async function init({ root /*, props, hub */ }) {
  // Clear any placeholder
  const ph = root.parentElement?.querySelector('.rail-placeholder');
  if (ph) ph.remove();

  root.innerHTML = `
    <div class="srv-rail">
      <button class="srv-pill" title="Home">N</button>
      <button class="srv-pill" title="Noiz">N</button>
      <button class="srv-pill" data-unread="2" title="Andsim">A</button>
      <button class="srv-pill" data-live="true" title="Bebop">B</button>
      <button class="srv-pill" data-status="dnd" title="G">G</button>
      <div class="srv-spacer"></div>
      <button class="srv-pill me" title="Me">ME</button>
    </div>
  `;

  // Example: demonstrate swapping to wide right panel from devtools
  // window.noiz?.setLayout?.({ right: 'narrow' });

  return {
    dispose() {
      // nothing yet
    }
  };
}
