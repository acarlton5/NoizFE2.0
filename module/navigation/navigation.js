import { getUserByToken } from '../users.js';

export default async function init({ hub, root, utils }) {
  const res = await fetch('modules-enabled.json');
  const mods = await res.json();
  const links = Object.values(mods)
    .filter((m) => m.status === 'enabled' && m.navigation)
    .map((m) => ({
      title: m.name.charAt(0).toUpperCase() + m.name.slice(1),
      module: m.name,
      icon: `#svg-${m.icon}`
    }));

  const loggedToken = await fetch('/data/logged-in.json').then(r => r.json());
  const currentUser = await getUserByToken(loggedToken);

  root.innerHTML = `
    <nav class="navigation-small" data-role="small">
      <a href="#" class="navigation-avatar avatar-wrap" style="--avi-width:48px; --avi-height:48px; --frame:url('${currentUser.frame}');" data-profile-name="${currentUser.name}" data-profile-token="${currentUser.token}" data-profile-avatar="${currentUser.avatar}" data-profile-banner="${currentUser.banner}" data-profile-accent="${currentUser.accent}" data-profile-frame="${currentUser.frame}" data-profile-bio="${currentUser.bio || ''}" data-profile-since="${currentUser.memberSince || ''}" data-profile-connections="${(currentUser.connections || []).join(',')}" data-profile-badges="${(currentUser.badges || []).join(',')}" data-profile-streaming="${currentUser.streaming ? 'true' : 'false'}">
        <img
          class="avatar-image"
          src="${currentUser.avatar}"
          alt="${currentUser.name}"
        />
      </a>
      <ul class="navigation-small-menu">
        ${links
          .map(
            (l) => `
        <li class="navigation-small-item">
          <a href="#" class="navigation-small-link" data-title="${l.title}" data-module="${l.module}">
            <svg class="icon" width="20" height="20"><use xlink:href="${l.icon}"></use></svg>
          </a>
        </li>`
          )
          .join('')}
      </ul>
    </nav>
    <nav class="navigation-large" data-role="large">
      <div class="navigation-large-profile">
        <img
          class="profile-banner"
          src="${currentUser.banner}"
          alt=""
          aria-hidden="true"
        />
        <div class="avatar-wrap" style="--avi-width:90px; --avi-height:90px; --frame:url('${currentUser.frame}');" data-profile-name="${currentUser.name}" data-profile-token="${currentUser.token}" data-profile-avatar="${currentUser.avatar}" data-profile-banner="${currentUser.banner}" data-profile-accent="${currentUser.accent}" data-profile-frame="${currentUser.frame}" data-profile-bio="${currentUser.bio || ''}" data-profile-since="${currentUser.memberSince || ''}" data-profile-connections="${(currentUser.connections || []).join(',')}" data-profile-badges="${(currentUser.badges || []).join(',')}" data-profile-streaming="${currentUser.streaming ? 'true' : 'false'}">
          <img
            class="avatar-image"
            src="${currentUser.avatar}"
            alt="${currentUser.name}"
          />
        </div>
        <h3 class="user-name" data-profile-name="${currentUser.name}" data-profile-token="${currentUser.token}" data-profile-avatar="${currentUser.avatar}" data-profile-banner="${currentUser.banner}" data-profile-accent="${currentUser.accent}" data-profile-frame="${currentUser.frame}" data-profile-bio="${currentUser.bio || ''}" data-profile-since="${currentUser.memberSince || ''}" data-profile-connections="${(currentUser.connections || []).join(',')}" data-profile-badges="${(currentUser.badges || []).join(',')}" data-profile-streaming="${currentUser.streaming ? 'true' : 'false'}">${currentUser.name}</h3>
        <p class="user-url">www.gamehuntress.com</p>
        <ul class="profile-stats">
          <li class="profile-stat"><span class="stat-value">930</span><span class="stat-label">Posts</span></li>
          <li class="profile-stat"><span class="stat-value">82</span><span class="stat-label">Friends</span></li>
          <li class="profile-stat"><span class="stat-value">5.7K</span><span class="stat-label">Visits</span></li>
        </ul>
        <ul class="user-badges">
          <li><svg class="badge-icon" width="24" height="24"><use xlink:href="#svg-facebook"></use></svg></li>
          <li><svg class="badge-icon" width="24" height="24"><use xlink:href="#svg-twitter"></use></svg></li>
          <li><svg class="badge-icon" width="24" height="24"><use xlink:href="#svg-instagram"></use></svg></li>
          <li><svg class="badge-icon" width="24" height="24"><use xlink:href="#svg-discord"></use></svg></li>
          <li><svg class="badge-icon" width="24" height="24"><use xlink:href="#svg-google"></use></svg></li>
        </ul>
      </div>
      <ul class="navigation-large-menu">
        ${links
          .map(
            (l) => `
        <li class="navigation-large-item">
          <a href="#" class="navigation-large-link" data-module="${l.module}">
            <svg class="icon" width="20" height="20"><use xlink:href="${l.icon}"></use></svg>
            <span>${l.title}</span>
          </a>
        </li>`
          )
          .join('')}
      </ul>
    </nav>
  `;

  const small = root.querySelector('[data-role="small"]');
  const large = root.querySelector('[data-role="large"]');
  const main = document.querySelector('main');

  utils.delegate(root, 'click', '.navigation-small-link, .navigation-large-link', (e, link) => {
    e.preventDefault();
    const mod = link.getAttribute('data-module');
    if (mod === 'profile') {
      const rect = link.getBoundingClientRect();
      hub.api['mini-profile'].show(
        currentUser,
        rect.left + rect.width / 2 + window.scrollX,
        rect.bottom + window.scrollY
      );
    } else if (mod) {
      window.LoadMainModule(mod);
    }
  });

  // Tooltip handling for compact navigation
  let tooltip;
  const showTooltip = (e) => {
    const link = e.currentTarget;
    const title = link.getAttribute('data-title');
    if (!title) return;
    tooltip = document.createElement('div');
    tooltip.className = 'navigation-small-tooltip';
    tooltip.textContent = title;
    document.body.appendChild(tooltip);
    const rect = link.getBoundingClientRect();
    tooltip.style.top = `${rect.top + rect.height / 2}px`;
    tooltip.style.left = `${rect.right}px`;
    requestAnimationFrame(() => tooltip.classList.add('visible'));
  };

  const hideTooltip = () => {
    if (tooltip) {
      tooltip.remove();
      tooltip = null;
    }
  };

  small.querySelectorAll('.navigation-small-link').forEach((link) => {
    link.addEventListener('mouseenter', showTooltip);
    link.addEventListener('mouseleave', hideTooltip);
  });
  small.addEventListener('scroll', hideTooltip);

  const api = {
    showSmall() {
      large.classList.remove('mobile-open');
      const apply = () => {
        small.classList.remove('hidden');
        main.style.transform = 'translate(200.5px)';
        main.style.transition = 'transform 0.4s ease-in-out';
      };
      if (large.classList.contains('open')) {
        large.addEventListener(
          'transitionend',
          apply,
          { once: true }
        );
        large.classList.remove('open');
      } else {
        apply();
      }
    },
    showLarge() {
      small.classList.add('hidden');
      large.classList.remove('mobile-open');
      main.style.transform = 'translate(300.5px)';
      main.style.transition = 'transform 0.4s ease-in-out';
      requestAnimationFrame(() => {
        large.classList.add('open');
      });
    },
    toggle() {
      if (window.innerWidth < 992) {
        large.classList.toggle('mobile-open');
        if (large.classList.contains('mobile-open')) {
          main.style.transform = 'translate(300.5px)';
          main.style.transition = 'transform 0.4s ease-in-out';
        } else {
          main.style.transform = '';
          main.style.transition = '';
        }
      } else if (large.classList.contains('open')) {
        api.showSmall();
      } else {
        api.showLarge();
      }
    }
  };

  return api;
}
