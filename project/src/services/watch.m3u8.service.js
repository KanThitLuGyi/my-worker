import { scrapeM3u8 } from "./watch.scraper.js";

export async function getWatchM3U8({ target, ctx, env }) {
  // Environment အလိုက် cache setting သတ်မှတ်ခြင်း
  const isDev = env?.ENVIRONMENT === 'dev';
  const cacheEnabled = env?.CACHE_ENABLED === 'true';
  
  // Dev mode မှာ cache မသုံးဘူးဆိုရင်
  if (isDev || !cacheEnabled) {
    console.log(`[${env?.ENVIRONMENT || 'dev'}] M3U8 cache disabled for: ${target}`);
    return await getM3U8WithoutCache(target);
  }

  // Production mode မှာပဲ cache သုံးမယ်
  const cache = caches.default;
  const cacheKey = new Request(
    `https://watch-cache/${env?.ENVIRONMENT || 'production'}/?url=` + encodeURIComponent(target)
  );

  // 1️⃣ cache lookup (production mode only)
  const cached = await cache.match(cacheKey);
  if (cached) {
    console.log(`[${env?.ENVIRONMENT || 'production'}] M3U8 cache hit for: ${target}`);
    const data = await cached.clone();
    
    // Cache ထဲက m3u8 link အသက်ရှိမရှိ စစ်ဆေးခြင်း
    try {
      const m3u8Data = await data.json();
      const alive = await isM3U8Alive(m3u8Data.m3u8);
      if (alive) {
        return cached;
      } else {
        console.log(`[${env?.ENVIRONMENT || 'production'}] M3U8 expired, re-scraping: ${target}`);
      }
    } catch (e) {
      console.log(`[${env?.ENVIRONMENT || 'production'}] Cache parse error, re-scraping: ${target}`);
    }
  }

  // 2️⃣ re-scrape (cache miss or expired)
  console.log(`[${env?.ENVIRONMENT || 'production'}] M3U8 cache miss for: ${target}`);
  const m3u8 = await scrapeM3u8(target);
  if (!m3u8) {
    return new Response(
      JSON.stringify({ error: "m3u8 not found" }),
      {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          ...(isDev && { "Cache-Control": "no-cache" })
        }
      }
    );
  }

  // 3️⃣ response ပြင်ဆင်ခြင်း
  const responseBody = JSON.stringify({ m3u8 });
  
  // Environment အလိုက် cache TTL သတ်မှတ်ခြင်း
  const cacheTtl = env?.CACHE_TTL_M3U8 ? parseInt(env.CACHE_TTL_M3U8) : 480; // default 8 minutes
  
  const res = new Response(
    responseBody,
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": isDev 
          ? "no-cache, no-store, must-revalidate" 
          : `public, max-age=${cacheTtl}, s-maxage=${cacheTtl}`
      }
    }
  );

  // 4️⃣ cache ထဲသိမ်းခြင်း (production mode only)
  if (!isDev && cacheEnabled) {
    if (ctx) {
      ctx.waitUntil(cache.put(cacheKey, res.clone()));
    } else {
      await cache.put(cacheKey, res.clone());
    }
    console.log(`[${env?.ENVIRONMENT || 'production'}] M3U8 cached for ${cacheTtl}s: ${target}`);
  }

  return res;
}

// Dev mode အတွက် cache မသုံးတဲ့ function
async function getM3U8WithoutCache(target) {
  console.log(`Fetching M3U8 without cache: ${target}`);
  
  const m3u8 = await scrapeM3u8(target);
  if (!m3u8) {
    return new Response(
      JSON.stringify({ error: "m3u8 not found" }),
      {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-cache"
        }
      }
    );
  }

  return new Response(
    JSON.stringify({ m3u8 }),
    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache, no-store, must-revalidate"
      }
    }
  );
}

async function isM3U8Alive(url) {
  try {
    const r = await fetch(url, { 
      method: "HEAD",
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    return r.ok;
  } catch {
    return false;
  }
}