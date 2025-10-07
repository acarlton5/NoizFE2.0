import { getUserByToken } from '../users.js';

const TOKENS = [
  'john-viking',
  'marina-valentine',
  'neko-bebop',
  'nick-grissom',
  'sarah-diamond'
];

export default async function init({ hub }) {
  const modRes = await fetch('modules-enabled.json');
  const modData = await modRes.json();
  const navModules = Object.values(modData).filter(
    (m) => m.status === 'enabled' && m.navigation
  );

  async function search(term) {
    const q = term?.trim().toLowerCase();
    if (!q) return { members: [], modules: [] };
    try {
      const users = (await Promise.all(TOKENS.map(getUserByToken))).filter(Boolean);
      const members = users
        .filter((u) => u.name.toLowerCase().includes(q) || u.token.includes(q))
        .map((u) => ({ ...u, friendCount: 0 }));
      const modules = navModules.filter((m) => m.name.toLowerCase().includes(q));
      return { members, modules };
    } catch {
      return { members: [], modules: [] };
    }
  }
  return { search };
}
