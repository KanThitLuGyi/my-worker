import * as cheerio from "cheerio";
import { fetchHtml } from "../utils/fetchHtml.js";
import { rateLimit } from "../utils/rateLimit.js";
import { getCache, setCache } from "../cache/kv.js";
import { Extractor } from "./extractor.js";

export async function scrapeList({
  url,
  config,
  env,
  page = 1
}) {
  if (!config?.list) {
    throw new Error("generic.scraper: missing list selector");
  }

  const ttl = page <= 3 ? 21600 : 3600;
  const cacheKey = `scrape:${url}:p${page}`;

  const cached = await getCache(cacheKey, env);
  if (cached) return cached;

  await rateLimit();

  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  const result = [];

  $(config.list).each((_, el) => {
    const node = $(el);

    const item = {
      title: Extractor.title(node, config),
      img: Extractor.image(node, config),
      url: Extractor.link(node, config, url)
    };

    if (!item.url) return;

    result.push(item);
  });

  if (result.length) {
    await setCache(cacheKey, result, env, ttl);
  }

  return result;
}
