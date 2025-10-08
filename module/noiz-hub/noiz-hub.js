import { getUserByToken } from '../users.js';
import { BOOST_GOAL, CHANNEL_GROUPS, ICONS, MEMBER_GROUPS, MESSAGES } from './noiz-hub.data.js';

const DEFAULT_ACCENT = '#5865f2';

export default async function init({ root }) {
  const loggedToken = await fetch('/data/logged-in.json').then((r) => r.json()).catch(() => null);
  const currentUser = loggedToken ? await getUserByToken(loggedToken).catch(() => null) : null;
  const accent = currentUser?.accent || DEFAULT_ACCENT;

  root.classList.add('noiz-hub');
  root.innerHTML = '';

  const layout = document.createElement('div');
  layout.className = 'noiz-hub__layout';

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
    createModule('noiz-channel-sidebar', {
      accent,
      boostGoal: BOOST_GOAL,
      channelGroups: CHANNEL_GROUPS,
      icons: ICONS,
      user: currentUser
    }),
    createModule('noiz-chat', { messages: MESSAGES }),
    createModule('noiz-members', { groups: MEMBER_GROUPS })
  );

  return {
    getSections() {
      return [
        { name: 'noiz-channel-sidebar', role: 'Channels, hero, and boost goal' },
        { name: 'noiz-chat', role: 'Channel header, transcript, and composer' },
        { name: 'noiz-members', role: 'Member presence list' }
      ];
    },
    getAccent() {
      return accent;
    }
  };
}
