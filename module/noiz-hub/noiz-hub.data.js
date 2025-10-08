export const BOOST_GOAL = {
  current: 9,
  total: 28
};

export const CHANNEL_GROUPS = [
  {
    name: 'Welcome',
    items: [
      { id: 'welcome', icon: '📫', iconType: 'emoji', separator: '│', label: 'welcome' },
      { id: 'rules', icon: '📜', iconType: 'emoji', separator: '│', label: 'rules' },
      { id: 'introductions', icon: '👋', iconType: 'emoji', separator: '│', label: 'introductions' },
      { id: 'new-joiners', icon: '✨', iconType: 'emoji', separator: '│', label: 'new-joiners' }
    ]
  },
  {
    name: 'Important',
    items: [
      { id: 'announcements', icon: '📌', iconType: 'emoji', separator: '│', label: 'announcements' },
      { id: 'creator-events', icon: '🎉', iconType: 'emoji', separator: '│', label: 'creator-events' },
      { id: 'prediction-card-game', icon: '🃏', iconType: 'emoji', separator: '│', label: 'prediction-card-game' }
    ]
  },
  {
    name: 'Community',
    items: [
      {
        id: 'general',
        iconSvg: 'chatBubble',
        iconType: 'hash',
        prefix: '#',
        label: 'general',
        active: true,
        accent: '#6d6afc',
        metaIcon: 'threads'
      },
      { id: 'general-creators', icon: '🎨', iconType: 'emoji', separator: '│', label: 'general-creators' },
      { id: 'creator-studio', icon: '🎬', iconType: 'emoji', separator: '│', label: 'creator-events' },
      { id: 'the-good-stuff', icon: '🤝', iconType: 'emoji', separator: '│', label: 'the-good-stuff' },
      { id: 'clips', icon: '📼', iconType: 'emoji', separator: '│', label: 'clips' },
      { id: 'going-live', icon: '📡', iconType: 'emoji', separator: '│', label: 'going-live' },
      { id: 'memes', icon: '😂', iconType: 'emoji', separator: '│', label: 'memes' },
      { id: 'twitch-extension-beta', icon: '🧪', iconType: 'emoji', separator: '│', label: 'twitch-extension-beta' },
      { id: 'noiz-community-talk', icon: '💬', iconType: 'emoji', separator: '│', label: 'noiz-community-talk' }
    ]
  },
  {
    name: 'Support',
    items: [
      { id: 'feedback', icon: '📝', iconType: 'emoji', separator: '│', label: 'feedback' },
      { id: 'bug-reports', icon: '🪲', iconType: 'emoji', separator: '│', label: 'bug-reports' }
    ]
  }
];

export const ICONS = {
  chevronDown:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6.29 9.29 5.3 5.3a.999.999 0 0 0 1.41 0l5.3-5.3A1 1 0 0 0 17.59 8H6.41a1 1 0 0 0-.12 1.29Z" /></svg>',
  boost:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a1 1 0 0 1 .9.55l2 4A1 1 0 0 1 14 8h-4L6.73 3.7A1 1 0 0 1 7.5 2H12Zm-6.29 6.7a1 1 0 0 1 1.09.17L10 13h4l3.2 3.53a1 1 0 0 1-.74 1.67H6a1 1 0 0 1-.9-1.45l2.61-5.22-1.64-1.64a1 1 0 0 1 .36-1.66Z" /></svg>',
  hashCircle:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.75 7.5 9.5 9h5l.25-1.5h1.5L15.75 9h2v1.5h-2.25l-.5 3H18v1.5h-2.5l-.25 1.5h-1.5l.25-1.5h-5l-.25 1.5h-1.5l.25-1.5h-2V13.5h2.25l.5-3H6v-1.5h2.5l.25-1.5Zm4 4.5h-5l-.5 3h5Z" /><path d="M12 2a10 10 0 1 1-7.07 2.93A10 10 0 0 1 12 2Zm0 1.5a8.5 8.5 0 1 0 8.5 8.5A8.51 8.51 0 0 0 12 3.5Z" /></svg>',
  arrowRight:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 11h9.59l-4.3-4.29L12 5l7 7-7 7-1.71-1.71L14.59 13H5z" /></svg>',
  threads:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12a3 3 0 0 1 3 3v5.76a8.24 8.24 0 0 1-8.24 8.24H7.66l-3.32 3.32A.75.75 0 0 1 3 22.25v-3.25A8 8 0 0 1 2 12V6a3 3 0 0 1 3-3Zm0 1.5A1.5 1.5 0 0 0 4.5 6v6a6.5 6.5 0 0 0 1.75 4.44.75.75 0 0 1 .2.5v1.64l2.28-2.28a.75.75 0 0 1 .53-.22h4.5A6.74 6.74 0 0 0 19.5 11V6A1.5 1.5 0 0 0 18 4.5Z" /></svg>',
  chatBubble:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.5c4.69 0 8.5 3.13 8.5 7s-3.81 7-8.5 7a10 10 0 0 1-2.93-.43l-3.72 2.21a.75.75 0 0 1-1.13-.65v-3.34a6.5 6.5 0 0 1-3.22-5.51c0-3.87 3.81-7 8.5-7Zm0 1.5c-3.87 0-7 2.47-7 5.5a5 5 0 0 0 2.72 4.25.75.75 0 0 1 .39.66v2l2.66-1.57a.75.75 0 0 1 .6-.07A8.6 8.6 0 0 0 12 17c3.87 0 7-2.47 7-5.5S15.87 6 12 6Z" /></svg>'
};

export const MESSAGES = [
  {
    id: 'm1',
    author: {
      name: 'Admin Gaming',
      role: 'Admin',
      color: '#EB459E',
      avatar: 'images/avatars/avatar-1.jpg'
    },
    timestamp: 'Today at 4:37 PM',
    body: [
      'Yo! Quick check-in—what stack are we leaning into for this take? React + modular JS like before?'
    ]
  },
  {
    id: 'm2',
    author: {
      name: 'NOIZ',
      role: 'Owner',
      color: '#5865F2',
      avatar: 'images/logo.png'
    },
    timestamp: 'Today at 4:39 PM',
    body: [
      'Let’s rebuild the hub using the NOIZ-style layout from the mock.',
      'Key beats to cover:',
      [
        'Server rail with badges + tooltips',
        'Channel column with clear section labels',
        'Message history styled like the screenshot',
        'Members list on the right with presence states'
      ],
      'If we keep things componentized we can still hot-swap modules later.'
    ]
  },
  {
    id: 'm3',
    author: {
      name: 'Admin Gaming',
      role: 'Admin',
      color: '#EB459E',
      avatar: 'images/avatars/avatar-1.jpg'
    },
    timestamp: 'Today at 4:41 PM',
    body: [
      'Perfect. I’ll mirror the thread preview and composer from the shot and keep the palette matched to dark mode.'
    ],
    thread: {
      title: 'Sprint 12 Handoff',
      replies: 6,
      participants: [
        { name: 'Nova', avatar: 'images/avatars/avatar-3.jpg' },
        { name: 'Dex', avatar: 'images/avatars/avatar-4.jpg' }
      ]
    }
  }
];

export const MEMBER_GROUPS = [
  {
    title: 'Admin — 2',
    members: [
      { name: 'Admin Gaming', status: 'online', activity: 'Reviewing layout', avatar: 'images/avatars/avatar-1.jpg' },
      { name: 'NOIZ', status: 'online', activity: 'Sketching UI', avatar: 'images/logo.png' }
    ]
  },
  {
    title: 'Moderators — 2',
    members: [
      { name: 'Nova', status: 'online', activity: 'In Figma', avatar: 'images/avatars/avatar-3.jpg' },
      { name: 'Dex', status: 'idle', activity: 'Editing copy', avatar: 'images/avatars/avatar-4.jpg' }
    ]
  },
  {
    title: 'Members — 4',
    members: [
      { name: 'Luma', status: 'online', activity: 'Listening to synthwave', avatar: 'images/avatars/avatar-8.jpg' },
      { name: 'Kai', status: 'dnd', activity: 'Pairing on API', avatar: 'images/avatars/avatar-7.jpg' },
      { name: 'Miko', status: 'offline', activity: 'Offline', avatar: 'images/avatars/avatar-6.jpg' },
      { name: 'Iris', status: 'offline', activity: 'Offline', avatar: 'images/avatars/avatar-5.jpg' }
    ]
  }
];
