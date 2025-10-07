import { getUserByToken } from '../users.js';

const MEMBER_GROUPS = [
  {
    label: 'TEAM LEADS — 4',
    members: [
      { token: 'marina-valentine', status: 'Reviewing showcase deck', presence: 'online' },
      { token: 'nick-grissom', status: 'In strategy sync', presence: 'dnd' },
      { token: 'neko-bebop', status: 'Mixing motion cues', presence: 'online' },
      { token: 'sarah-diamond', status: 'Scheduling stream routes', presence: 'online' }
    ]
  },
  {
    label: 'COMMUNITY MODS — 6',
    members: [
      { token: 'john-viking', status: 'Scouting submissions', presence: 'online' },
      { token: 'marina-valentine', status: 'Pinned resources update', presence: 'idle' },
      { token: 'nick-grissom', status: 'Ticket triage', presence: 'online' }
    ]
  }
];

const profileData = (u = {}) =>
  `data-profile-name="${u.name || ''}" data-profile-token="${u.token || ''}" data-profile-avatar="${u.avatar || ''}" data-profile-banner="${u.banner || ''}" data-profile-accent="${u.accent || ''}" data-profile-frame="${u.frame || ''}" data-profile-bio="${u.bio || ''}" data-profile-since="${u.memberSince || ''}" data-profile-connections="${(u.connections || []).join(',')}" data-profile-badges="${(u.badges || []).join(',')}" data-profile-streaming="${u.streaming ? 'true' : 'false'}"`;

const renderMember = (user, meta = {}) => {
  if (!user) return '';
  return `
    <li class="member-sidebar__person" ${profileData(user)}>
      <div class="avatar-wrap member-sidebar__avatar" style="--avi-width:32px; --avi-height:32px; --frame:url('${user.frame}')">
        <img class="avatar-image" src="${user.avatar}" alt="${user.name}">
      </div>
      <div class="member-sidebar__person-meta">
        <span class="member-sidebar__person-name">${user.name}</span>
        <span class="member-sidebar__person-status">${meta.status || ''}</span>
      </div>
      <button class="member-sidebar__message" type="button" aria-label="Message ${user.name}">
        <svg width="14" height="14" aria-hidden="true"><use href="#svg-messages"></use></svg>
      </button>
      <span class="member-sidebar__presence member-sidebar__presence--${meta.presence || 'online'}"></span>
    </li>
  `;
};

export default async function init({ root }) {
  const groupMembers = await Promise.all(
    MEMBER_GROUPS.flatMap((group) =>
      group.members.map(async (member) => ({
        user: await getUserByToken(member.token),
        meta: member,
        group: group.label
      }))
    )
  );

  const grouped = MEMBER_GROUPS.map((group) => ({
    label: group.label,
    members: groupMembers.filter((entry) => entry.group === group.label)
  }));

  root.innerHTML = `
    <aside class="member-sidebar">
      <header class="member-sidebar__header">
        <h2 class="member-sidebar__title">Members</h2>
        <div class="member-sidebar__header-actions">
          <button type="button" aria-label="Toggle members list">
            <svg width="16" height="16" aria-hidden="true"><use href="#svg-members"></use></svg>
          </button>
          <button type="button" aria-label="Member settings">
            <svg width="16" height="16" aria-hidden="true"><use href="#svg-settings"></use></svg>
          </button>
        </div>
      </header>
      <div class="member-sidebar__scroll">
        ${grouped
          .map(
            (group) => `
              <section class="member-sidebar__group">
                <header class="member-sidebar__group-header">${group.label}</header>
                <ul class="member-sidebar__people">
                  ${group.members.map(({ user, meta }) => renderMember(user, meta)).join('')}
                </ul>
              </section>
            `
          )
          .join('')}
      </div>
    </aside>
  `;

  return {};
}
