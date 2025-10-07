import { buildProfileCard } from '../profile/profile-view.js';
import { getUserByToken } from '../users.js';

async function fetchLoggedInUser() {
  try {
    const token = await fetch('/data/logged-in.json').then((res) => res.json());
    if (!token) return null;
    return await getUserByToken(token);
  } catch (err) {
    return null;
  }
}

export default async function init({ hub, root, utils }) {
  const view = buildProfileCard(root, { variant: 'sidebar' });
  const user = (await fetchLoggedInUser()) || { name: 'Unknown User' };

  view.updateUser(user);

  const applyUnread = (count = 0) => view.updateUnread(count);
  try {
    const unread = await hub.api.messages.getUnread();
    applyUnread(unread);
  } catch (err) {
    applyUnread(0);
  }

  const off = hub.on('messages:unreadChanged', applyUnread);
  utils.onCleanup(off);

  const messageBtn = view.elements.messageBtn;
  if (messageBtn) {
    utils.listen(messageBtn, 'click', (event) => {
      event.preventDefault();
      if (typeof window.LoadMainModule === 'function') {
        window.LoadMainModule('messages');
      }
    });
  }

  return {
    setUser(next) {
      view.updateUser(next || {});
    }
  };
}
