import { getUserByToken } from '../users.js';

const GUILDS = [
  {
    id: 'gg-circle',
    name: 'GG Circle',
    initials: 'GG',
    color: '#5865F2',
    module: 'discord-home',
    description: 'Design hub'
  },
  {
    id: 'playmakers',
    name: 'Playmakers',
    initials: 'P',
    color: '#FEE75C',
    description: 'Scrims'
  },
  {
    id: 'team-alpha',
    name: 'Team Alpha',
    initials: 'TA',
    color: '#F23F42',
    description: 'Competitive'
  },
  {
    id: 'noiz-lab',
    name: 'Noiz Lab',
    initials: 'NL',
    color: '#43B581',
    description: 'Experiments'
  },
  {
    id: 'orbit',
    name: 'Orbit',
    initials: 'O',
    color: '#EB459E',
    description: 'Creator collabs'
  }
];

const createGuildButton = ({ id, name, initials, color, module, description }) => `
  <button
    class="guild-rail__button"
    type="button"
    data-guild-id="${id}"
    ${module ? `data-module="${module}"` : ''}
    data-title="${name}"
  >
    <span class="guild-rail__badge" style="background:${color}">${initials}</span>
    <span class="visually-hidden">${description || name}</span>
  </button>
`;

export default async function init({ hub, root, utils }) {
  let currentModule = 'discord-home';
  const loggedToken = await fetch('/data/logged-in.json').then((r) => r.json()).catch(() => null);
  const currentUser = loggedToken ? await getUserByToken(loggedToken) : null;

  // Render the guild rail (Discord-style server switcher)
  root.innerHTML = `
    <nav class="guild-rail" aria-label="Servers">
      <div class="guild-rail__scroll">
        <button class="guild-rail__button guild-rail__button--home" type="button" data-module="discord-home" data-title="Home">
          <svg aria-hidden="true" viewBox="0 0 28 20" class="guild-rail__home-icon">
            <path d="M24.5 0.5a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-3.4l-.29-2.08a1 1 0 0 0-1.65-.61l-1.56 1.39a1 1 0 0 1-.66.25H10.06a1 1 0 0 1-.67-.26l-1.55-1.39a1 1 0 0 0-1.65.6L5.9 18.5H2.5a3 3 0 0 1-3-3v-12a3 3 0 0 1 3-3Z" />
          </svg>
          <span class="visually-hidden">Home</span>
        </button>
        <div class="guild-rail__divider" role="presentation"></div>
        ${GUILDS.map(createGuildButton).join('')}
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
        <button class="guild-rail__button guild-rail__button--dm" type="button" data-profile-name="${currentUser.name}" data-profile-token="${currentUser.token}" data-profile-avatar="${currentUser.avatar}" data-profile-banner="${currentUser.banner}" data-profile-accent="${currentUser.accent}" data-profile-frame="${currentUser.frame}" data-profile-bio="${currentUser.bio || ''}" data-profile-since="${currentUser.memberSince || ''}" data-profile-connections="${(currentUser.connections || []).join(',')}" data-profile-badges="${(currentUser.badges || []).join(',')}" data-profile-streaming="${currentUser.streaming ? 'true' : 'false'}">
          ${currentUser.avatar ? `<img class="guild-rail__avatar" src="${currentUser.avatar}" alt="${currentUser.name}">` : `<span class="guild-rail__badge" style="background:${currentUser.accent || '#5865F2'}">${(currentUser.name || '?').slice(0,2)}</span>`}
          <span class="visually-hidden">Direct messages</span>
        </button>` : ''}
      </div>
    </nav>
  `;

  const buttons = root.querySelectorAll('.guild-rail__button[data-module]');
  const updateActive = (moduleName) => {
    if (!moduleName) return;
    currentModule = moduleName;
    buttons.forEach((btn) => {
      if (btn.getAttribute('data-module') === moduleName) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });
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
