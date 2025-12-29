import { scrapeM3u8 } from "./watch.scraper.js"

export async function getWatchM3U8({ target, ctx }) {
  const cache = caches.default;
  const cacheKey = new Request(
    "https://watch-cache/?url=" + encodeURIComponent(target)
  );

  // 1️⃣ cache lookup
  const cached = await cache.match(cacheKey);
  if (cached) {
    const data = await cached.clone();
    const alive = await isM3U8Alive((await data.json()).m3u8);
    if (alive) return cached;
  }

  // 2️⃣ re-scrape
  const m3u8 = await scrapeM3u8(target);
  if (!m3u8) {
    return new Response(
      JSON.stringify({ error: "m3u8 not found" }),
      { status: 404 }
    );
  }

  // 3️⃣ cache for 8 minutes
  const res = new Response(
    JSON.stringify({ m3u8 }),
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=480",
      },
    }
  );

 if(ctx){
  ctx.waitUntil(cache.put(cacheKey, res.clone()));
 }else{
  await cache.put(cacheKey, res.clone());
 }
 return res;
}

async function isM3U8Alive(url) {
  try {
    const r = await fetch(url, { method: "HEAD" });
    return r.ok;
  } catch {
    return false;
  }
}