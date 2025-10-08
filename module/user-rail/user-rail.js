import { getUserByToken } from '../users.js';

export default async function init({ hub, root, utils }) {
  const loggedToken = await fetch('/data/logged-in.json').then(r => r.json());
  const loggedUser = await getUserByToken(loggedToken);
  const { subscribedTo = [], following = [] } = loggedUser || {};
  const tokens = [
    ...subscribedTo,
    ...following.filter(token => !subscribedTo.includes(token))
  ];
  const users = (await Promise.all(tokens.map(getUserByToken))).filter(Boolean);

  root.innerHTML = `
    <nav class="user-rail">
      <ul class="user-rail-list">
        ${users
          .map((u, i) => {
            const accent = u.accent || '#ff72b6';
            const frameStyle = u.frame
              ? `--frame:url('${u.frame}'); --frame-bleed:18%; --frame-opacity:1;`
              : '--frame:none; --frame-opacity:0;';
            return `
        <li class="user-rail-item${u.hasNotification ? ' has-notification' : ''}" data-index="${i}" style="--accent:${accent};" data-profile-name="${u.name}" data-profile-token="${u.token}" data-profile-avatar="${u.avatar}" data-profile-banner="${u.banner}" data-profile-accent="${u.accent}" data-profile-frame="${u.frame || ''}" data-profile-bio="${u.bio || ''}" data-profile-since="${u.memberSince || ''}" data-profile-connections="${(u.connections || []).join(',')}" data-profile-badges="${(u.badges || []).join(',')}" data-profile-streaming="${u.streaming ? 'true' : 'false'}">
          <div class="avatar-wrap" style="${frameStyle}">
            <img class="avatar-image" src="${u.avatar}" alt="${u.name}">
          </div>
        </li>`;
          })
          .join('')}
      </ul>
    </nav>
  `;

  utils.delegate(root, 'click', '.user-rail-item', (e, el) => {
    root.querySelectorAll('.user-rail-item.active').forEach(item => item.classList.remove('active'));
    el.classList.add('active');
    el.classList.remove('has-notification');
  });

  return {};
}
