import { getUserByToken } from '../users.js';

const sectionTpl = (section, i) => `
  <section id="section-${i}" class="doc-section">
    <h3>${section.heading}</h3>
    <p class="post-open-paragraph">${section.content}</p>
    ${(section.blurbs || []).map(b => `
      <div class="doc-blurb">
        <strong>${b.label}</strong>
        <p class="post-open-paragraph">${b.text}</p>
      </div>
    `).join('')}
  </section>
`;

const navTpl = (doc) => `
  <nav class="doc-nav">
    <div class="doc-nav-header">
      <span>${doc.sections.length} Chapters</span>
      <span>${doc.sections.length} Total</span>
    </div>
    <ol class="doc-nav-list">
      ${doc.sections.map((s, i) => `<li><a href="#" data-target="section-${i}">${s.heading}</a></li>`).join('')}
    </ol>
  </nav>
`;

const tagsTpl = (tags, { asLinks = true } = {}) => `
  <div class="tag-list">
    ${tags.map(t => asLinks
      ? `<a class="tag-item secondary" href="#">${t}</a>`
      : `<span class="tag-item secondary">${t}</span>`).join('')}
  </div>
`;

const defaultAvatar = 'https://odindesignthemes.com/vikinger/img/avatar/01.jpg';

const buildAuthor = (doc, user) => {
  const name = doc.author || user?.name;
  if (!name) {
    return null;
  }
  return {
    name,
    avatar: doc.author_avatar || user?.avatar || defaultAvatar,
    banner: doc.author_banner || user?.banner || '',
    frame: doc.author_frame || user?.frame || ''
  };
};

const authorTpl = (author) => `
  <div class="doc-author-card">
    <figure class="doc-author-banner" style="${author.banner ? `background-image:url('${author.banner}')` : ''}"></figure>
    <div class="doc-author-body">
      <div class="avatar-wrap doc-author-avatar" style="--avi-width:64px; --avi-height:64px; --frame:${author.frame ? `url('${author.frame}')` : 'none'};">
        <img class="avatar-image" src="${author.avatar || defaultAvatar}" alt="${author.name}">
      </div>
      <p class="doc-author-name">${author.name}</p>
    </div>
  </div>
`;

const docCardTpl = (doc) => `
  <div class="col-12 col-md-6 col-xl-4">
    <a class="doc-card" href="#/doc/${doc.slug}">
      <figure class="doc-card-cover${doc.cover ? ' has-cover' : ''}" style="${doc.cover ? `background-image:url('${doc.cover}')` : ''}">
        ${doc.cover ? `<img src="${doc.cover}" alt="${doc.title || ''} cover" loading="lazy">` : ''}
      </figure>
      <div class="doc-card-body">
        <h3 class="doc-card-title">${doc.title}</h3>
        ${doc.summary ? `<p class="doc-card-summary">${doc.summary}</p>` : ''}
        ${Array.isArray(doc.tags) && doc.tags.length ? tagsTpl(doc.tags, { asLinks: false }) : ''}
      </div>
      <div class="doc-card-meta">
        ${doc.author ? `<span class="doc-card-author">${doc.author}</span>` : ''}
        ${doc.created_at ? `<span class="doc-card-date">${new Date(doc.created_at).toLocaleDateString()}</span>` : (doc.date ? `<span class="doc-card-date">${doc.date}</span>` : '')}
      </div>
    </a>
  </div>
`;

const docListTpl = (docs) => `
  <div class="container doc-container doc-list">
    <div class="row">
      <div class="col-12">
        <header class="doc-list-header">
          <h2 class="doc-list-title">Documentation</h2>
          <p class="doc-list-subtitle">Select a guide to dive deeper into the NOIZ platform.</p>
        </header>
      </div>
    </div>
    <div class="row g-4">
      ${docs.map(docCardTpl).join('')}
    </div>
  </div>
`;

const tpl = (doc, author) => `
  <div class="container doc-container">
    <div class="row g-4">
      <div class="col-12 col-lg-8">
        <article class="post-open doc-module">
          <figure class="post-open-cover${doc.cover ? ' has-cover' : ''}" style="${doc.cover ? `background-image: url('${doc.cover}')` : ''}">
            ${doc.cover ? `<img src="${doc.cover}" alt="${doc.title || ''} cover" style="display:none;">` : ''}
            <div class="post-open-heading">
              <p class="post-open-timestamp">${doc.created_at ? new Date(doc.created_at).toLocaleDateString() : doc.date || ''}</p>
              <h2 class="post-open-title">${doc.title}</h2>
              ${Array.isArray(doc.tags) ? tagsTpl(doc.tags) : ''}
            </div>
          </figure>
          <div class="post-open-body">
            <div class="post-open-content-body">
              ${Array.isArray(doc.sections)
                ? doc.sections.map(sectionTpl).join('')
                : (doc.content ? `<p class="post-open-paragraph">${doc.content}</p>` : '')}
            </div>
          </div>
        </article>
      </div>
      <div class="col-12 col-lg-4">
        ${author ? authorTpl(author) : ''}
        ${Array.isArray(doc.sections) ? navTpl(doc) : ''}
      </div>
    </div>
  </div>
`;

export default async function init({ root, props }) {
  const slug = props?.slug;
  if (!slug) {
    try {
      const response = await fetch('/data/doc/index.json');
      const payload = await response.json();
      const docs = Array.isArray(payload) ? payload : Array.isArray(payload?.documents) ? payload.documents : [];
      if (!docs.length) {
        root.innerHTML = '<p class="text-center p-4">No documents available yet. Check back soon!</p>';
        return;
      }
      root.innerHTML = docListTpl(docs);
    } catch (err) {
      root.innerHTML = '<p class="text-center p-4">Unable to load documentation list.</p>';
    }
    return;
  }
  try {
    const doc = await fetch(`/data/doc/${slug}.json`).then(r => r.json());
    let user = null;
    if (doc.author_token) {
      try {
        user = await getUserByToken(doc.author_token);
      } catch (err) {
        user = null;
      }
    }
    const author = buildAuthor(doc, user);
    root.innerHTML = tpl(doc, author);
    const navLinks = root.querySelectorAll('.doc-nav-list a');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-target');
        const section = root.querySelector(`#${targetId}`);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });
  } catch (err) {
    root.innerHTML = '<p class="text-center p-4">Document not found.</p>';
  }
}
