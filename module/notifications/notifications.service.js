// module/notifications/notifications.service.js
// Preloads notification styles and exposes a simple notification API.

export default function ({ hub }) {
  // Ensure CSS is loaded when service starts
  if (!document.querySelector('link[data-module="notifications"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/module/notifications/notifications.css';
    link.dataset.module = 'notifications';
    document.head.appendChild(link);
  }

  function notify(message, { timeout, icon, actions = [] } = {}) {
    let container = document.querySelector('.notification-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'notification-container';
      document.body.appendChild(container);
    }

    const popup = document.createElement('div');
    popup.className = 'notification-popup';

    const main = document.createElement('div');
    main.className = 'notification-main';
    popup.appendChild(main);

    if (icon) {
      let iconEl;
      if (icon.startsWith('#')) {
        const SVG_NS = 'http://www.w3.org/2000/svg';
        const XLINK_NS = 'http://www.w3.org/1999/xlink';
        const svg = document.createElementNS(SVG_NS, 'svg');
        // `className` on SVG elements is a read-only object in some browsers,
        // so use `setAttribute` to apply the class instead of direct assignment.
        svg.setAttribute('class', 'notification-icon');
        const use = document.createElementNS(SVG_NS, 'use');
        const ref = icon.startsWith('#svg-') ? icon : `#svg-${icon.slice(1)}`;
        use.setAttribute('href', ref);
        use.setAttributeNS(XLINK_NS, 'xlink:href', ref);
        svg.appendChild(use);
        iconEl = svg;
      } else {
        const img = document.createElement('img');
        img.src = icon;
        img.alt = '';
        img.className = 'notification-icon';
        iconEl = img;
      }
      main.appendChild(iconEl);
    }

    const content = document.createElement('div');
    content.className = 'notification-content';
    content.textContent = message;
    main.appendChild(content);


    if (actions.length) {
      const actionsWrap = document.createElement('div');
      actionsWrap.className = 'notification-actions';
      actions.forEach(({ label, onClick }) => {
        const btn = document.createElement('button');
        btn.className = 'notification-action';
        btn.textContent = label;
        btn.addEventListener('click', () => {
          if (typeof onClick === 'function') onClick();
          popup.remove();
        });
        actionsWrap.appendChild(btn);
      });
      popup.appendChild(actionsWrap);
    }

    container.appendChild(popup);
    requestAnimationFrame(() => popup.classList.add('show'));

    if (typeof timeout === 'number' && timeout > 0) {
      window.setTimeout(() => {
        popup.classList.remove('show');
        popup.classList.add('fade-out');
        popup.addEventListener('transitionend', () => popup.remove(), { once: true });
      }, timeout);
    }

    return popup;
  }

  const api = { notify };
  hub.register('notifications', api);
  return api;
}
