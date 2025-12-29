import { scrapeHome } from "./src/services/home.scraper.js";
import { scrapeModels, scrapeModelSection } from "./src/services/model.scraper.js";
import { scrapeChannels, scrapeChannelSection } from "./src/services/channel.scraper.js";
import { scrapeTags, scrapeTagSection } from "./src/services/tag.scraper.js";
import { json } from "./src/utils/response.js";
import { getWatchM3U8 } from "./src/services/watch.m3u8.service.js";



function edgeCacheJson(req, data, ttl = 300) {
  const res = json(data);
  res.headers.set(
    "Cache-Control",
    `public, max-age=${ttl}, s-maxage=${ttl}`
  );
  return res;
}

export default {
  async fetch(req, env,ctx) {
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

    const apiKey = req.headers.get("x-api-key");
    if (!apiKey || apiKey !== env.API_KEY) {
      return new Response("Unauthorized", {
        status: 401,
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    const url = new URL(req.url);
    const page = Number(url.searchParams.get("page") || 1);
    const target = url.searchParams.get("url");


    if (url.pathname === "/home") {
      const data = await scrapeHome({ page, env });
      return edgeCacheJson(req, data, 300); // 5 min edge
    }

    if (url.pathname === "/models") {
      const data = await scrapeModels({ page, env });
      return edgeCacheJson(req, data, 300);
    }

    if (url.pathname === "/model/section") {
      const modelUrl = url.searchParams.get("url");
      if (!modelUrl) {
        return new Response("Bad Request", { status: 400 });
      }

      const data = await scrapeModelSection({ modelUrl, page, env });
      return edgeCacheJson(req, data, 300);
    }

    if (url.pathname === "/channels") {
      const data = await scrapeChannels({ page, env });
      return edgeCacheJson(req, data, 300);
    }

    if (url.pathname === "/channel/section") {
      const channelUrl = url.searchParams.get("url");
      if (!channelUrl) {
        return new Response("Bad Request", { status: 400 });
      }

      const data = await scrapeChannelSection({ channelUrl, page, env });
      return edgeCacheJson(req, data, 300);
    }

    if (url.pathname === "/tags") {
      const data = await scrapeTags({ env });
      return edgeCacheJson(req, data, 1800);
    }

    if (url.pathname === "/tag/section") {
      const tagUrl = url.searchParams.get("url");
      if (!tagUrl) {
        return new Response("Bad Request", { status: 400 });
      }

      const data = await scrapeTagSection({ tagUrl, page, env });
      return edgeCacheJson(req, data, 300);
    }
     if(url.pathname ==="/watch"){
      if(!target){
        return new Response("Bad Request", { status: 400 });
      
      }
      return await getWatchM3U8({ target, ctx});
     }
    

    return new Response("Not Found", { status: 404 });
  },
  


  async scheduled(event, env, ctx) {
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
