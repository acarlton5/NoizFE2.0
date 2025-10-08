export default {
  async init({ root, props = {} }) {
    const data = props.data ?? demoData();

    root.innerHTML = `
      <aside class="noiz-members-rail">
        ${data.groups.map(g => `
          <div class="group">
            <div class="group-hdr">
              <span>${g.title}</span>
              <span class="count">— ${g.count}</span>
            </div>
            <div class="group-list">
              ${g.members.map(m => renderMember(m)).join('')}
            </div>
          </div>
        `).join('')}
      </aside>
    `;

    // click → select
    root.addEventListener('click', (e) => {
      const item = e.target.closest('.member');
      if (!item) return;
      root.querySelectorAll('.member.is-active').forEach(n => n.classList.remove('is-active'));
      item.classList.add('is-active');
      // broadcast
      window.noiz?.hub.emit('members-rail:select', { id: item.dataset.id });
    });
  }
};

function renderMember(m) {
  const sub = m.activity ? `<div class="sub">${m.activity}</div>` : '';
  const presence = m.presence || 'online';
  const tags = (m.tags || []).map(t => `<span class="tag tag-${t.toLowerCase()}">${t}</span>`).join('');
  const flair = m.flair ? `<span class="flair">${m.flair}</span>` : '';
  return `
    <button class="member ${m.active ? 'is-active' : ''}" data-id="${m.id}" title="${m.name}">
      <span class="avatar">
        <img src="${m.avatar}" alt="${m.name}">
        <span class="presence ${presence}"></span>
      </span>
      <span class="main">
        <span class="line">
          <span class="name text-truncate">${m.name}</span>
          ${flair}
          ${tags}
        </span>
        ${sub}
      </span>
    </button>
  `;
}

function demoData() {
  const a = 'https://placehold.co/48x48/png';
  return {
    groups: [
      {
        title: 'Noice Staff',
        count: 7,
        members: [
          { id:'conran',   name:'Conran (Rannerz)', avatar:a, presence:'online',   flair:'N', tags:[],  activity:'' },
          { id:'dale',     name:'Dale',             avatar:a, presence:'online',   tags:[],  activity:'' },
          { id:'drew',     name:'Drew - VP Growth', avatar:a, presence:'online',   tags:['HERO'], activity:'' },
          { id:'lawok',    name:'Lawok',            avatar:a, presence:'idle',     tags:[],  activity:'' },
          { id:'marra',    name:'Marra',            avatar:a, presence:'dnd',      tags:[],  activity:' ' , active:true},
          { id:'saku',     name:'Saku',             avatar:a, presence:'online',   tags:[],  activity:'' },
          { id:'valsu',    name:'Valentin | valsu', avatar:a, presence:'offline',  tags:[],  activity:'' }
        ]
      },
      {
        title: 'Noiz Partner',
        count: 103,
        members: [
          { id:'detroit', name:'! / I_Am_Detroit', avatar:a, presence:'online', tags:['HERO'],  activity:"💬 100 W's in the CHAT" },
          { id:'fzvra',   name:'!Zvrra',           avatar:a, presence:'online', tags:['BGG'],   activity:'Playing Hazy Dayz RP' },
          { id:'jamore',  name:'!Amore',           avatar:a, presence:'idle',   tags:['MDNT'],  activity:'' },
          { id:'duck',    name:'24/7 Duck Squad',  avatar:a, presence:'online', tags:['QUAC'],  activity:'Playing VALORANT' },
          { id:'althrow', name:'AL Throwback',     avatar:a, presence:'online', tags:['FLSH'],  activity:'' },
          { id:'andsim',  name:'Andsim Gaming',    avatar:a, presence:'online', tags:['BEAM'],  activity:'' },
          { id:'angelic', name:'Angelic Angel',    avatar:a, presence:'online', tags:['BEAM'],  activity:'' },
          { id:'barbell', name:'Barbell_Bull',     avatar:a, presence:'online', tags:['KICK'],  activity:'' },
          { id:'batplay', name:'Batplayerzz',      avatar:a, presence:'online', tags:['TNT'],   activity:'Streaming Come join and ha… +1' }
        ]
      }
    ]
  };
}
