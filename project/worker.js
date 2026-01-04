import { scrapeHome } from "./src/services/home.scraper.js";
import { scrapeModels, scrapeModelSection } from "./src/services/model.scraper.js";
import { scrapeChannels, scrapeChannelSection } from "./src/services/channel.scraper.js";
import { scrapeTags, scrapeTagSection } from "./src/services/tag.scraper.js";
import { json } from "./src/utils/response.js";
import { getWatchM3U8 } from "./src/services/watch.m3u8.service.js";

// Environment-based cache function
function edgeCacheJson(req, data, env, defaultTtl = 300) {
  const res = json(data);
  
  // Dev mode လား၊ Production mode လား စစ်ဆေးခြင်း
  const isDev = env.ENVIRONMENT === 'dev';
  
  // Dev မှာ cache မလုပ်ဘူး၊ Production မှာပဲ cache လုပ်မယ်
  if (isDev) {
    // Dev mode - cache မလုပ်စေချင်ဘူး
    res.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.headers.set("Pragma", "no-cache");
    res.headers.set("Expires", "0");
    res.headers.set("X-Environment", "development");
  } else {
    // Production mode - cache လုပ်မယ်
    const ttl = env.CACHE_TTL ? parseInt(env.CACHE_TTL) : defaultTtl;
    res.headers.set(
      "Cache-Control",
      `public, max-age=${ttl}, s-maxage=${ttl}, stale-while-revalidate=60`
    );
    res.headers.set("X-Environment", "production");
  }
  
  return res;
}

export default {
  async fetch(req, env, ctx) {
    try {
      // CORS preflight
      if (req.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "x-api-key, content-type",
          },
        });
      }

      const url = new URL(req.url);
      const page = Number(url.searchParams.get("page") || 1);
      const target = url.searchParams.get("url");

      if (env.ENVIRONMENT === "dev") {
        console.log(`[DEV] ${req.method} ${url.pathname}`);
      }

      if (url.pathname === "/home") {
        const data = await scrapeHome({ page, env });
        return edgeCacheJson(req, data ?? [], env, 300);
      }

      if (url.pathname === "/models") {
        const data = await scrapeModels({ page, env });
        return edgeCacheJson(req, data ?? [], env, 300);
      }

      if (url.pathname === "/model/section") {
        if (!target) return new Response("Bad Request", { status: 400 });
        const data = await scrapeModelSection({ modelUrl: target, page, env });
        return edgeCacheJson(req, data ?? [], env, 300);
      }

      if (url.pathname === "/channels") {
        const data = await scrapeChannels({ page, env });
        return edgeCacheJson(req, data ?? [], env, 300);
      }

      if (url.pathname === "/channel/section") {
        if (!target) return new Response("Bad Request", { status: 400 });
        const data = await scrapeChannelSection({ channelUrl: target, page, env });
        return edgeCacheJson(req, data ?? [], env, 300);
      }

      if (url.pathname === "/tags") {
        const data = await scrapeTags({ env });
        return edgeCacheJson(req, data ?? [], env, 1800);
      }

      if (url.pathname === "/tag/section") {
        if (!target) return new Response("Bad Request", { status: 400 });
        const data = await scrapeTagSection({ tagUrl: target, page, env });
        return edgeCacheJson(req, data ?? [], env, 300);
      }

      if (url.pathname === "/watch") {
        if (!target) return new Response("Bad Request", { status: 400 });
        return await getWatchM3U8({ target, ctx, env });
      }

      return new Response("Not Found", { status: 404 });

    } catch (err) {
      // 🔥 THIS PREVENTS ERROR 1101 FOREVER
      console.error("WORKER CRASH:", err);

      return new Response(
        JSON.stringify({
          error: "Worker crashed",
          message: err?.message || "unknown error",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  },

  async scheduled(event, env, ctx) {
    if (env.ENVIRONMENT === "dev") return;

    ctx.waitUntil(
      (async () => {
        try {
          await preloadCache(env);
        } catch (e) {
          console.error("Cron crash:", e);
        }
      })()
    );
  },
};


async function preloadCache(env) {
  console.log("Cron started: preload cache");

  for (let page = 1; page <= 3; page++) {
    await scrapeHome({ page, env });
    await scrapeModels({ page, env });
    await scrapeChannels({ page, env });
  }

  await scrapeTags({ env });

  console.log("Cron finished");
}