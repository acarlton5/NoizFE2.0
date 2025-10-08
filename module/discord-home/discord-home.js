import { getUserByToken } from '../users.js';
import { BOOST_GOAL, CHANNEL_GROUPS, ICONS, MEMBER_GROUPS, MESSAGES } from './discord-home.data.js';

const DEFAULT_ACCENT = '#5865f2';

export default async function init({ root }) {
  const loggedToken = await fetch('/data/logged-in.json').then((r) => r.json()).catch(() => null);
  const currentUser = loggedToken ? await getUserByToken(loggedToken).catch(() => null) : null;
  const accent = currentUser?.accent || DEFAULT_ACCENT;

  root.classList.add('discord-home');
  root.innerHTML = `
    <div class="discord-home__layout">
      <module data-module="discord-channel-sidebar" data-css="true"></module>
      <module data-module="discord-chat" data-css="true"></module>
      <module data-module="discord-members" data-css="true"></module>
    </div>
  `;

  const sidebarNode = root.querySelector('module[data-module="discord-channel-sidebar"]');
  const chatNode = root.querySelector('module[data-module="discord-chat"]');
  const membersNode = root.querySelector('module[data-module="discord-members"]');

  if (sidebarNode) {
    sidebarNode.setAttribute(
      'data-props',
      JSON.stringify({
        accent,
        boostGoal: BOOST_GOAL,
        channelGroups: CHANNEL_GROUPS,
        icons: ICONS,
        user: currentUser
      })
    );
  }

  if (chatNode) {
    chatNode.setAttribute('data-props', JSON.stringify({ messages: MESSAGES }));
  }

  if (membersNode) {
    membersNode.setAttribute('data-props', JSON.stringify({ groups: MEMBER_GROUPS }));
  }

  return {
    getSections() {
      return [
        { name: 'discord-channel-sidebar', role: 'Channels, hero, and boost goal' },
        { name: 'discord-chat', role: 'Channel header, transcript, and composer' },
        { name: 'discord-members', role: 'Member presence list' }
      ];
    },
    getAccent() {
      return accent;
    }
  };
}
