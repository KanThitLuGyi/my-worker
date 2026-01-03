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
    // CORS preflight request အတွက်
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "x-api-key, content-type"
        }
      });
    }

    /* const apiKey = req.headers.get("x-api-key");
    if (!apiKey || apiKey !== env.API_KEY) {
      return new Response("Unauthorized", {
        status: 401,
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      });
    }*/

    const url = new URL(req.url);
    const page = Number(url.searchParams.get("page") || 1);
    const target = url.searchParams.get("url");

    // Dev mode ဖြစ်လားဆိုတာ log ထုတ်ကြည့်ခြင်း
    if (env.ENVIRONMENT === 'dev') {
      console.log(`[DEV MODE] ${req.method} ${url.pathname} - Caching disabled`);
    }

    if (url.pathname === "/home") {
      const data = await scrapeHome({ page, env });
      return edgeCacheJson(req, data, env, 300); // env parameter ထည့်ပေးပါ
    }

    if (url.pathname === "/models") {
      const data = await scrapeModels({ page, env });
      return edgeCacheJson(req, data, env, 300);
    }

    if (url.pathname === "/model/section") {
      const modelUrl = url.searchParams.get("url");
      if (!modelUrl) {
        return new Response("Bad Request", { status: 400 });
      }
      const data = await scrapeModelSection({ modelUrl, page, env });
      return edgeCacheJson(req, data, env, 300);
    }

    if (url.pathname === "/channels") {
      const data = await scrapeChannels({ page, env });
      return edgeCacheJson(req, data, env, 300);
    }

    if (url.pathname === "/channel/section") {
      const channelUrl = url.searchParams.get("url");
      if (!channelUrl) {
        return new Response("Bad Request", { status: 400 });
      }
      const data = await scrapeChannelSection({ channelUrl, page, env });
      return edgeCacheJson(req, data, env, 300);
    }

    if (url.pathname === "/tags") {
      const data = await scrapeTags({ env });
      // tags အတွက် cache time ကို environment အလိုက် သတ်မှတ်ခြင်း
      const tagsTtl = env.ENVIRONMENT === 'dev' ? 60 : 1800; // dev: 1min, production: 30min
      return edgeCacheJson(req, data, env, tagsTtl);
    }

    if (url.pathname === "/tag/section") {
      const tagUrl = url.searchParams.get("url");
      if (!tagUrl) {
        return new Response("Bad Request", { status: 400 });
      }
      const data = await scrapeTagSection({ tagUrl, page, env });
      return edgeCacheJson(req, data, env, 300);
    }
    
    if (url.pathname === "/watch") {
      if (!target) {
        return new Response("Bad Request", { status: 400 });
      }
      // Watch endpoint အတွက် environment-based cache
      return await getWatchM3U8({ target, ctx, env });
    }

    return new Response("Not Found", { status: 404 });
  },

  async scheduled(event, env, ctx) {
    // Dev mode မှာ cron job မလုပ်စေချင်ဘူးဆိုရင်
    if (env.ENVIRONMENT === 'dev') {
      console.log("[DEV MODE] Cron job skipped");
      return;
    }
    
    console.log("Cron started: preload cache");
    ctx.waitUntil(preloadCache(env));
  }
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