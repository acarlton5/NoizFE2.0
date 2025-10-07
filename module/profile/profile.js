const tpl = (user, unread) => `
  <section class="profile">
    <div class="profile-banner" style="--banner:url('${user.banner}')"></div>
    <div class="profile-content">
      <div class="profile-avatar">
        <div class="avatar-wrap" style="--avi-width:128px; --avi-height:128px; --frame:url('${user.frame}')">
          <img class="avatar-image" src="${user.avatar}" alt="${user.name}">
        </div>
      </div>
      <div class="profile-actions">
        <button class="btn btn-primary btn-sm">Add Friend +</button>
        <button class="btn btn-secondary btn-sm position-relative">
          Send Message
          <span class="badge ${unread > 0 ? 'bg-success' : 'bg-secondary'} position-absolute top-0 start-100 translate-middle" data-role="unread">${unread}</span>
        </button>
      </div>
      <ul class="profile-stats">
        <li class="profile-stat"><span class="stat-number">930</span><span class="stat-label">Posts</span></li>
        <li class="profile-stat"><span class="stat-number">82</span><span class="stat-label">Friends</span></li>
        <li class="profile-stat"><span class="stat-number">5.7K</span><span class="stat-label">Visits</span></li>
        <li class="profile-stat"><span class="stat-number">USA</span><span class="stat-label">Country</span></li>
      </ul>
      <h2 class="profile-name">${user.name}</h2>
      <p class="profile-website">www.safenvandress.com</p>
      <div class="profile-social">
        <a href="#" class="social-item" style="--color:#3763d9"><svg class="icon"><use href="#svg-facebook"></use></svg></a>
        <a href="#" class="social-item" style="--color:#1da1f2"><svg class="icon"><use href="#svg-twitter"></use></svg></a>
        <a href="#" class="social-item" style="--color:#ff0000"><svg class="icon"><use href="#svg-youtube"></use></svg></a>
        <a href="#" class="social-item" style="--color:#c13584"><svg class="icon"><use href="#svg-instagram"></use></svg></a>
      </div>
    </div>
  </section>
`;

export default async function init({ hub, root, utils, props }) {
  const user = props?.user || { name: 'Unknown', avatar: '', frame: '', banner: '' };
  root.innerHTML = tpl(user, 0);

  const badge = root.querySelector('[data-role="unread"]');
  const update = (n) => {
    badge.textContent = n;
    badge.classList.toggle('bg-success', n > 0);
    badge.classList.toggle('bg-secondary', n <= 0);
  };

  hub.api.messages.getUnread().then(update).catch(() => {});
  const off = hub.on('messages:unreadChanged', update);
  utils.onCleanup(off);

  return {};
}
