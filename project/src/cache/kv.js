export async function getCache(key, env) {
  const data = await env.CACHE.get(key);
  return data ? JSON.parse(data) : null;
}

export async function setCache(key, data, env, ttl = 3600) {
  await env.CACHE.put(key, JSON.stringify(data), {
    expirationTtl: ttl
  });
}