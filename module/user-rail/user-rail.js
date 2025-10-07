import { getUserByToken } from '../users.js';

const PRIMARY_PROFILE = 'marina-valentine';

const ABOUT_BLOCKS = [
  {
    title: 'Currently crafting',
    value: 'Luminous Pulse overlay suite'
  },
  {
    title: 'Timezone',
    value: 'UTC-5 (EST)'
  },
  {
    title: 'Platforms',
    value: 'Twitch • YouTube • Kick'
  }
];

const MEMBER_GROUPS = [
  {
    label: 'Team Leads — 4',
    members: [
      { token: 'marina-valentine', status: 'Reviewing showcase deck', presence: 'online' },
      { token: 'nick-grissom', status: 'In Discord call', presence: 'busy' },
      { token: 'neko-bebop', status: 'Rendering particles', presence: 'online' },
      { token: 'sarah-diamond', status: 'Scheduling stream routes', presence: 'online' }
    ]
  },
  {
    label: 'Mods — 6',
    members: [
      { token: 'john-viking', status: 'Scouting submissions', presence: 'online' },
      { token: 'marina-valentine', status: 'Pinned resources update', presence: 'online' }
    ]
  }
];

const profileData = (u = {}) =>
  `data-profile-name="${u.name || ''}" data-profile-token="${u.token || ''}" data-profile-avatar="${u.avatar || ''}" data-profile-banner="${u.banner || ''}" data-profile-accent="${u.accent || ''}" data-profile-frame="${u.frame || ''}" data-profile-bio="${u.bio || ''}" data-profile-since="${u.memberSince || ''}" data-profile-connections="${(u.connections || []).join(',')}" data-profile-badges="${(u.badges || []).join(',')}" data-profile-streaming="${u.streaming ? 'true' : 'false'}"`;

const renderMember = (user, meta = {}) => {
  if (!user) return '';
  return `
    <li class="member-sidebar__person" ${profileData(user)}>
      <span class="member-sidebar__presence member-sidebar__presence--${meta.presence || 'online'}"></span>
      <div class="avatar-wrap member-sidebar__avatar" style="--avi-width:36px; --avi-height:36px; --frame:url('${user.frame}')">
        <img class="avatar-image" src="${user.avatar}" alt="${user.name}">
      </div>
      <div class="member-sidebar__person-meta">
        <span class="member-sidebar__person-name">${user.name}</span>
        <span class="member-sidebar__person-status">${meta.status || ''}</span>
      </div>
      <button class="member-sidebar__ping" type="button" aria-label="Ping ${user.name}">Ping</button>
    </li>
  `;
};

export default async function init({ root }) {
  const profileUser = await getUserByToken(PRIMARY_PROFILE);
  const groupMembers = await Promise.all(
    MEMBER_GROUPS.flatMap((group) => group.members.map(async (member) => ({
      user: await getUserByToken(member.token),
      meta: member,
      group: group.label
    })))
  );

  const grouped = MEMBER_GROUPS.map((group) => ({
    label: group.label,
    members: groupMembers.filter((entry) => entry.group === group.label)
  }));

  root.innerHTML = `
    <aside class="member-sidebar">
      ${profileUser ? `
        <section class="member-sidebar__card" ${profileData(profileUser)}>
          <div class="member-sidebar__hero" style="background: linear-gradient(140deg, ${profileUser.accent || '#7c5dff'} 0%, rgba(255, 114, 209, 0.8) 100%), url('${profileUser.banner}') center/cover;"></div>
          <div class="member-sidebar__identity">
            <div class="avatar-wrap member-sidebar__identity-avatar" style="--avi-width:74px; --avi-height:74px; --frame:url('${profileUser.frame}')">
              <img class="avatar-image" src="${profileUser.avatar}" alt="${profileUser.name}">
            </div>
            <div class="member-sidebar__identity-meta">
              <h3 class="member-sidebar__identity-name">${profileUser.name}</h3>
              <span class="member-sidebar__identity-tag">Creative Director • Online</span>
            </div>
          </div>
          <ul class="member-sidebar__about">
            ${ABOUT_BLOCKS.map((row) => `
              <li>
                <span class="member-sidebar__about-label">${row.title}</span>
                <span class="member-sidebar__about-value">${row.value}</span>
              </li>
            `).join('')}
          </ul>
          <div class="member-sidebar__actions">
            <button type="button">Start Call</button>
            <button type="button">Share Files</button>
          </div>
        </section>
      ` : ''}
      <section class="member-sidebar__list">
        ${grouped
          .map(
            (group) => `
              <div class="member-sidebar__group">
                <header class="member-sidebar__group-header">${group.label}</header>
                <ul class="member-sidebar__people">
                  ${group.members.map(({ user, meta }) => renderMember(user, meta)).join('')}
                </ul>
              </div>
            `
          )
          .join('')}
      </section>
    </aside>
  `;

  return {};
}
