import { ICONS as DEFAULT_ICONS } from '../noiz-hub/noiz-hub.data.js';

const DEFAULT_ACCENT = '#5865f2';

const renderChannelHero = (user, accent, icons) => {
  const bannerStyle = user?.banner ? ` style="--hero-banner:url('${user.banner}')"` : '';
  const frameStyle = user?.frame ? `--frame:url('${user.frame}')` : '--frame:none';
  const avatar = user?.avatar || 'images/avatars/avatar-2.jpg';
  const name = user?.name || 'Noice Member';
  const subtitle = user?.bio || 'Channeling the community energy.';

  return `
    <div class="channel-hero" style="--hero-accent:${accent};">
      <div class="channel-hero__banner"${bannerStyle}></div>
      <div class="channel-hero__overlay"></div>
      <div class="channel-hero__content">
        <button class="channel-hero__server" type="button">
          <span class="channel-hero__server-name">Noice</span>
          ${icons.chevronDown}
        </button>
        <div class="channel-hero__profile">
          <span class="avatar-wrap channel-hero__avatar" style="--avi-width:72px; --avi-height:72px; --frame-bleed:24%; --frame-opacity:1; ${frameStyle};">
            <img class="avatar-image" src="${avatar}" alt="${name}">
          </span>
          <div class="channel-hero__meta">
            <p class="channel-hero__label">${name}</p>
            <p class="channel-hero__subtitle">${subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  `;
};

const renderBoostGoal = (boostGoal, accent, icons) => {
  if (!boostGoal) return '';
  const { current = 0, total = 1 } = boostGoal;
  const percent = Math.min(100, Math.round((current / total) * 100));
  return `
    <div class="channel-boost" style="--boost-accent:${accent}; --boost-progress:${percent}%;">
      <button class="channel-boost__cta" type="button">
        <span class="channel-boost__icon">${icons.boost}</span>
        <span class="channel-boost__text">Boost Goal</span>
      </button>
      <div class="channel-boost__progress">
        <span class="channel-boost__count">${current}/${total} Boosts</span>
        <div class="channel-boost__bar"><span></span></div>
      </div>
    </div>
  `;
};

const renderChannelsDirectory = (icons) => `
  <button class="channel-directory" type="button">
    <span class="channel-directory__icon">${icons.hashCircle}</span>
    <span class="channel-directory__label">Channels & Roles</span>
    <span class="channel-directory__chevron">${icons.arrowRight}</span>
  </button>
`;

const renderChannel = (channel, icons) => {
  if (channel.type === 'dm') {
    const accent = channel.accent || DEFAULT_ACCENT;
    const frame = channel.frame || `conic-gradient(from 90deg, ${accent}, transparent)`;
    const activeAttr = channel.active ? ' aria-current="true"' : '';
    return `
      <li>
        <button
          class="channel channel--dm"
          type="button"
          data-channel-id="${channel.id}"
          data-status="${channel.status || 'offline'}"${activeAttr}
          style="--dm-accent:${accent};"
        >
          <span class="channel-dm__accent" aria-hidden="true"></span>
          <span class="channel-dm__media">
            <span class="avatar-wrap" style="--avi-width:36px; --avi-height:36px; --frame-bleed:18%; --frame:${frame};">
              <img class="avatar-image" src="${channel.avatar}" alt="${channel.label}">
            </span>
            <span class="channel-dm__presence" aria-hidden="true"></span>
          </span>
          <span class="channel__label">${channel.label}</span>
        </button>
      </li>
    `;
  }

  const activeAttr = channel.active ? ' aria-current="true"' : '';
  const glyphClasses = ['channel__glyph'];
  if (channel.iconType) {
    glyphClasses.push(`channel__glyph--${channel.iconType}`);
  }

  const channelStyle = channel.accent ? ` style="--channel-accent:${channel.accent};"` : '';
  const metaIcon = channel.metaIcon ? `<span class="channel__meta" aria-hidden="true">${icons[channel.metaIcon] || ''}</span>` : '';
  const glyphMarkup = channel.iconSvg ? icons[channel.iconSvg] || channel.iconSvg : channel.icon || '#';

  return `
    <li>
      <button class="channel" type="button" data-channel-id="${channel.id}"${activeAttr}${channelStyle}>
        <span class="${glyphClasses.join(' ')}">${glyphMarkup}</span>
        ${channel.separator ? `<span class="channel__separator">${channel.separator}</span>` : ''}
        <span class="channel__label">
          ${channel.prefix ? `<span class="channel__label-prefix">${channel.prefix}</span>` : ''}
          <span class="channel__label-text">${channel.label}</span>
        </span>
        ${metaIcon}
      </button>
    </li>
  `;
};

const renderChannelGroup = (group, icons) => `
  <section class="channel-group">
    <header class="channel-group__header">
      <button type="button" class="channel-group__toggle" aria-label="Collapse ${group.name}">
        ${icons.chevronDown}
      </button>
      <span>${group.name}</span>
    </header>
    <ul class="channel-group__list">
      ${(group.items || []).map((channel) => renderChannel(channel, icons)).join('')}
    </ul>
  </section>
`;

export default async function init({ root, props = {}, utils }) {
  const icons = { ...DEFAULT_ICONS, ...(props.icons || {}) };
  const accent = props.accent || DEFAULT_ACCENT;
  const user = props.user || null;
  const boostGoal = props.boostGoal;
  const channelGroups = props.channelGroups || [];

  root.classList.add('noiz-channel-sidebar');
  root.style.setProperty('--channel-accent', accent);

  root.innerHTML = `
    <div class="channel-sidebar">
      ${renderChannelHero(user, accent, icons)}
      <div class="channel-sidebar__body">
        ${renderBoostGoal(boostGoal, accent, icons)}
        ${renderChannelsDirectory(icons)}
        <div class="channel-scroll">
          ${channelGroups.map((group) => renderChannelGroup(group, icons)).join('')}
        </div>
      </div>
    </div>
  `;

  utils.delegate(root, 'click', '.channel', (_event, button) => {
    root.querySelectorAll('.channel[aria-current="true"]').forEach((active) => active.removeAttribute('aria-current'));
    button.setAttribute('aria-current', 'true');
  });

  return {
    focusFirstChannel() {
      const firstChannel = root.querySelector('.channel');
      firstChannel?.focus?.();
    }
  };
}
