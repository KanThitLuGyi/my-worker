import * as cheerio from "cheerio";
import { fetchHtml } from "../utils/fetchHtml.js";
import { rateLimit } from "../utils/rateLimit.js";
import { getCache, setCache } from "../cache/kv.js";

export async function scrapeList({
  url,
  selector,
  env,
  page = 1
}) {
  // TTL logic
  const ttl = page <= 4 ? 21600 : 3600; // 6h : 1h

  const cacheKey = `scrape:${selector}:${url}`;
  const cached = await getCache(cacheKey, env);
  if (cached) return cached;

  await rateLimit();

  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const list = [];

  $(selector).each((_, el) => {
    const title = $(el).find("img").attr("alt") || "";
    const img = $(el).find("img").attr("src") || "";
    const href = $(el).find("a").attr("href");

    if (href) {
      list.push({
        title,
        img,
        url: href.startsWith("http")
          ? href
          : `https://xhamster.com${href}`
      });
    }
  });

  if (list.length > 0) {
    await setCache(cacheKey, list, env, ttl);
  }

  return list;
}
