import * as cheerio from "cheerio";
import { fetchHtml } from "../utils/fetchHtml.js";
import { rateLimit } from "../utils/rateLimit.js";
import { getCache, setCache } from "../cache/kv.js";

export async function scrapeList({
  url,
  config,
  env,
  page = 1
}) {
  if (!config?.list) {
    throw new Error("scrapeList: missing list selector");
  }

  const ttl = page <= 3 ? 21600 : 3600;
  const cacheKey = `scrape:${url}:p${page}`;

  const cached = await getCache(cacheKey, env);
  if (cached) return cached;

  await rateLimit();

  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const list = [];

  $(config.list).each((_, el) => {
    const node = $(el);

    const title = config.title
      ? config.title.text
        ? node.find(config.title.selector).text().trim()
        : node.find(config.title.selector).attr(config.title.attr)
      : "";

    const img = config.img
      ? node.find(config.img.selector).attr(config.img.attr)
      : node.find(config.img.selector).attr("data-src");

    let href = config.link
      ? config.link.selector
        ? node.find(config.link.selector).attr(config.link.attr)
        : node.attr(config.link.attr)
      : null;

    if (!href) return;

    if (!href.startsWith("http")) {
      href = `https://xhamster.com${href}`;
    }

    list.push({ title, img, url: href });
  });

  if (list.length) {
    await setCache(cacheKey, list, env, ttl);
  }

  return list;
}
