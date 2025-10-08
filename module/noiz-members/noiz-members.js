const renderMemberGroup = (group) => `
  <section class="member-group">
    <h3 class="member-group__title">${group.title}</h3>
    <ul class="member-group__list">
      ${(group.members || [])
        .map(
          (member) => `
            <li class="member" data-status="${member.status}">
              <div class="member__avatar">
                <img src="${member.avatar}" alt="${member.name}">
                <span class="member__presence"></span>
              </div>
              <div class="member__body">
                <p class="member__name">${member.name}</p>
                <p class="member__activity">${member.activity}</p>
              </div>
            </li>
          `
        )
        .join('')}
    </ul>
  </section>
`;

export default async function init({ root, props = {} }) {
  const groups = props.groups || [];

  root.classList.add('noiz-members');
  root.innerHTML = `
    <div class="member-column">
      <div class="member-scroll">
        ${groups.map(renderMemberGroup).join('')}
      </div>
    </div>
  `;

  return {
    highlightStatus(status) {
      root.querySelectorAll('.member').forEach((item) => {
        item.classList.toggle('is-highlighted', item.dataset.status === status);
      });
    }
  };
}
