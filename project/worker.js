import { scrapeHome } from "./src/services/home.scraper.js";
import { scrapeModels, scrapeModelSection } from "./src/services/model.scraper.js";
import { scrapeChannels, scrapeChannelSection } from "./src/services/channel.scraper.js";
import { scrapeTags, scrapeTagSection } from "./src/services/tag.scraper.js";
import { json } from "./src/utils/response.js";

export default {
 
  async fetch(req, env) {
  const apiKey = req.headers.get("x-api-key");
    if (apiKey !== env.API_KEY) {
      return new Response("Unauthorized", { status: 401 });
    }
    const url = new URL(req.url);
    const page = Number(url.searchParams.get("page") || 1);
    const target = url.searchParams.get("url");

    if (url.pathname === "/home")
      return json(await scrapeHome({ page, env }));

    if (url.pathname === "/models")
      return json(await scrapeModels({ page, env }));
    if(url.pathname ==="/model/section"){
      const modelUrl = url.searchParams.get("url");
      const page = Number(url.searchParams.get("page") || 1);
      if(!modelUrl){
        return new Response("Bad Request", { status: 400 });
      }
      return json(await scrapeModelSection({modelUrl,page,env}));
    }

    if (url.pathname === "/channels")
      return json(await scrapeChannels({ page, env }));
    if(url.pathname ==="/channel/section"){
      const channelUrl = url.searchParams.get("url");
    if(!channelUrl){
        return new Response("Bad Request", { status: 400 });
      }
      return json(await scrapeChannelSection({channelUrl,page,env}));
    }

    if (url.pathname === "/tags")
      return json(await scrapeTags());
    if(url.pathname ==="/tag/section"){
      const tagUrl = url.searchParams.get("url");
      const page = Number(url.searchParams.get("page") || 1);
      if(!tagUrl){
        return new Response("Bad Request", { status: 400 });
      }
      return json(await scrapeTagSection({tagUrl,page,env}));
    }

    return new Response("Not Found", { status: 404 });
  },

  // ⏰ CRON
  async scheduled(event, env, ctx) {
    ctx.waitUntil(preloadCache(env));
  }
};

// 🔥 preload function
async function preloadCache(env) {
  console.log("Cron started: preload cache");

  // page 1 ~ 3 preload
  for (let page = 1; page <= 3; page++) {
    await scrapeHome({ page, env });
    await scrapeModels({ page, env });
    await scrapeChannels({ page, env });
  }

  await scrapeTags();

  console.log("Cron finished");
}
