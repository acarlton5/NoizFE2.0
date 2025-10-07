import { buildProfileCard } from './profile-view.js';

export default async function init({ hub, root, utils, props }) {
  const view = buildProfileCard(root, { variant: 'page' });
  const user = props?.user || { name: 'Unknown User' };

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
    update(userData) {
      view.updateUser(userData || {});
    }
  };
}
