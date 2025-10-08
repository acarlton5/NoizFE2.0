import { getUserByToken } from '../users.js';

const GUILDS = [
  {
    id: 'gg-circle',
    name: 'GG Circle',
    initials: 'GG',
    color: '#5865F2',
    module: 'noiz-hub',
    description: 'Design hub',
    userToken: 'john-viking'
  },
  {
    id: 'playmakers',
    name: 'Playmakers',
    initials: 'P',
    color: '#FEE75C',
    description: 'Scrims',
    userToken: 'marina-valentine'
  },
  {
    id: 'team-alpha',
    name: 'Team Alpha',
    initials: 'TA',
    color: '#F23F42',
    description: 'Competitive',
    userToken: 'nick-grissom'
  },
  {
    id: 'noiz-lab',
    name: 'Noiz Lab',
    initials: 'NL',
    color: '#43B581',
    description: 'Experiments',
    userToken: 'neko-bebop'
  },
  {
    id: 'orbit',
    name: 'Orbit',
    initials: 'O',
    color: '#EB459E',
    description: 'Creator collabs',
    userToken: 'sarah-diamond'
  }
];

const getPresenceState = (user) => {
  if (!user || !user.status) return '';
  if (user.status.streaming) return 'streaming';
  if (user.status.dnd) return 'dnd';
  if (user.status.away) return 'idle';
  if (user.status.online) return 'online';
  return 'offline';
};

const createGuildButton = ({ id, name, initials, color, module, description, user }) => {
  const label = description || name;
  const accent = (user && user.accent) || color || '#5865F2';
  const status = user ? getPresenceState(user) : '';
  const accentStyle = accent ? ` style="--accent:${accent}"` : '';
  const statusAttr = status ? ` data-status="${status}"` : '';
  const frameVar = user && user.frame ? `--frame:url('${user.frame}')` : '--frame:none';
  const avatarMarkup = user && user.avatar
    ? `<span class="avatar-wrap guild-rail__avatar" style="--avi-width:40px; --avi-height:40px; --frame-bleed:18%; --frame-opacity:1; ${frameVar};"><img class="avatar-image" src="${user.avatar}" alt="${user.name || name}"></span>`
    : `<span class="guild-rail__badge" style="background:${accent};">${initials || (name ? name.slice(0, 2) : '?')}</span>`;

  return `
    <button
      class="guild-rail__button guild-rail__button--profile"
      type="button"
      data-guild-id="${id}"
      ${module ? `data-module="${module}"` : ''}
      data-title="${name}"${accentStyle}${statusAttr}
    >
      <span class="guild-rail__indicator" aria-hidden="true"></span>
      <span class="guild-rail__ring">${avatarMarkup}</span>
      ${status ? '<span class="guild-rail__presence" aria-hidden="true"></span>' : ''}
      <span class="visually-hidden">${label}</span>
    </button>
  `;
};

export default async function init({ hub, root, utils }) {
  let currentModule = 'noiz-hub';
  const loggedToken = await fetch('/data/logged-in.json').then((r) => r.json()).catch(() => null);
  const currentUser = loggedToken ? await getUserByToken(loggedToken) : null;
  const currentStatus = currentUser ? getPresenceState(currentUser) : '';
  const guildProfiles = await Promise.all(
    GUILDS.map(async (guild) => {
      if (!guild.userToken) return guild;
      try {
        const user = await getUserByToken(guild.userToken);
        return { ...guild, user };
      } catch (error) {
        return guild;
      }
    })
  );

  // Render the guild rail (guild-style server switcher)
  root.innerHTML = `
    <nav class="guild-rail" aria-label="Servers">
      <div class="guild-rail__scroll">
        <button class="guild-rail__button guild-rail__button--home" type="button" data-module="noiz-hub" data-title="Home">
          <svg aria-hidden="true" viewBox="0 0 28 20" class="guild-rail__home-icon">
            <path d="M24.5 0.5a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-3.4l-.29-2.08a1 1 0 0 0-1.65-.61l-1.56 1.39a1 1 0 0 1-.66.25H10.06a1 1 0 0 1-.67-.26l-1.55-1.39a1 1 0 0 0-1.65.6L5.9 18.5H2.5a3 3 0 0 1-3-3v-12a3 3 0 0 1 3-3Z" />
          </svg>
          <span class="visually-hidden">Home</span>
        </button>
        <div class="guild-rail__divider" role="presentation"></div>
        ${guildProfiles.map(createGuildButton).join('')}
      </div>
      <div class="guild-rail__footer">
        <button class="guild-rail__button guild-rail__button--add" type="button" aria-label="Add a server">+</button>
        <button class="guild-rail__button guild-rail__button--explore" type="button" aria-label="Explore servers">
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M12 2 2 7l10 5 10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </button>
        ${currentUser ? `
        <button class="guild-rail__button guild-rail__button--profile guild-rail__button--dm" type="button" data-profile-name="${currentUser.name}" data-profile-token="${currentUser.token}" data-profile-avatar="${currentUser.avatar}" data-profile-banner="${currentUser.banner}" data-profile-accent="${currentUser.accent}" data-profile-frame="${currentUser.frame}" data-profile-bio="${currentUser.bio || ''}" data-profile-since="${currentUser.memberSince || ''}" data-profile-connections="${(currentUser.connections || []).join(',')}" data-profile-badges="${(currentUser.badges || []).join(',')}" data-profile-streaming="${currentUser.streaming ? 'true' : 'false'}" style="--accent:${currentUser.accent || '#5865F2'}"${currentStatus ? ` data-status="${currentStatus}"` : ''}>
          <span class="guild-rail__indicator" aria-hidden="true"></span>
          <span class="guild-rail__ring">
            ${currentUser.avatar
              ? `<span class="avatar-wrap guild-rail__avatar" style="--avi-width:40px; --avi-height:40px; --frame-bleed:18%; --frame-opacity:1; ${currentUser.frame ? `--frame:url('${currentUser.frame}')` : '--frame:none'};"><img class="avatar-image" src="${currentUser.avatar}" alt="${currentUser.name}"></span>`
              : `<span class="guild-rail__badge" style="background:${currentUser.accent || '#5865F2'};">${(currentUser.name || '?').slice(0, 2)}</span>`}
          </span>
          ${currentStatus ? '<span class="guild-rail__presence" aria-hidden="true"></span>' : ''}
          <span class="visually-hidden">Direct messages</span>
        </button>` : ''}
      </div>
    </nav>
  `;

  const buttons = root.querySelectorAll('.guild-rail__button[data-module]');
  const getAccentFromButton = (button) => {
    if (!button) return '';
    const inlineAccent = button.style.getPropertyValue('--accent');
    if (inlineAccent && inlineAccent.trim()) {
      return inlineAccent.trim();
    }
    const computed = window.getComputedStyle(button).getPropertyValue('--accent');
    return computed.trim();
  };

  const applyActiveAccent = (accent) => {
    const nextAccent = accent && accent.trim() ? accent.trim() : '#5865f2';
    document.documentElement.style.setProperty('--active-guild-accent', nextAccent);
  };

  const updateActive = (moduleName) => {
    if (!moduleName) return;
    currentModule = moduleName;
    let activeAccent = '';
    buttons.forEach((btn) => {
      if (btn.getAttribute('data-module') === moduleName) {
        btn.classList.add('is-active');
        if (!activeAccent) {
          activeAccent = getAccentFromButton(btn);
        }
      } else {
        btn.classList.remove('is-active');
      }
    });
    applyActiveAccent(activeAccent);
  };

  utils.delegate(root, 'click', '.guild-rail__button[data-module]', (event, button) => {
    event.preventDefault();
    const moduleName = button.getAttribute('data-module');
    if (!moduleName) return;
    window.LoadMainModule(moduleName);
    updateActive(moduleName);
  });

  if (currentUser) {
    utils.delegate(root, 'click', '.guild-rail__button--dm', (event, button) => {
      event.preventDefault();
      const rect = button.getBoundingClientRect();
      hub.api['mini-profile']
        ?.show(
          currentUser,
          rect.left + rect.width / 2 + window.scrollX,
          rect.bottom + window.scrollY
        )
        .catch(() => {});
    });
  }

  const off = hub.on('module:ready', (name) => {
    if (name === currentModule) return;
    if (buttons.length && Array.from(buttons).some((btn) => btn.getAttribute('data-module') === name)) {
      updateActive(name);
    }
  });
  utils.onCleanup(() => off());

  // Initial highlight
  updateActive(currentModule);

  return {
    setActive(moduleName) {
      updateActive(moduleName);
    }
  };
}
