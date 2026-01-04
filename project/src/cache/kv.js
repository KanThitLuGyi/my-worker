export async function getCache(key, env) {
  if (!env?.CACHE || env.CACHE_ENABLED !== "true") return null;

  const data = await env.CACHE.get(key);
  return data ? JSON.parse(data) : null;
}

export async function setCache(key, data, env, ttl = 3600) {
  if (!env?.CACHE || env.CACHE_ENABLED !== "true") return;

  await env.CACHE.put(key, JSON.stringify(data), {
    expirationTtl: ttl
  });
}
