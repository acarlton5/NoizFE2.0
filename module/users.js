const cache = new Map();

export async function getUserByToken(token) {
  if (!cache.has(token)) {
    cache.set(token, fetch(`/data/users/${token}.json`).then(r => r.json()));
  }
  return cache.get(token);
}
