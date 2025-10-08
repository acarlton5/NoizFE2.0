import { getUserByToken } from '../users.js';
import { BOOST_GOAL, CHANNEL_GROUPS, ICONS, MEMBER_GROUPS, MESSAGES } from './discord-home.data.js';

const DEFAULT_ACCENT = '#5865f2';

export default async function init({ root }) {
  const loggedToken = await fetch('/data/logged-in.json').then((r) => r.json()).catch(() => null);
  const currentUser = loggedToken ? await getUserByToken(loggedToken).catch(() => null) : null;
  const accent = currentUser?.accent || DEFAULT_ACCENT;

  root.classList.add('discord-home');
  root.innerHTML = '';

  const layout = document.createElement('div');
  layout.className = 'discord-home__layout';

  const createModule = (name, props) => {
    const node = document.createElement('module');
    node.setAttribute('data-module', name);
    node.setAttribute('data-css', 'true');
    if (props && Object.keys(props).length) {
      node.setAttribute('data-props', JSON.stringify(props));
    }
    return node;
  };

  root.appendChild(layout);

  layout.append(
    createModule('discord-channel-sidebar', {
      accent,
      boostGoal: BOOST_GOAL,
      channelGroups: CHANNEL_GROUPS,
      icons: ICONS,
      user: currentUser
    }),
    createModule('discord-chat', { messages: MESSAGES }),
    createModule('discord-members', { groups: MEMBER_GROUPS })
  );

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
