import * as cheerio from "cheerio";
import { fetchHtml } from "../utils/fetchHtml.js";
import { rateLimit } from "../utils/rateLimit.js";
import { SELECTOR } from "../config/selector.js";
import { scrapeList } from "./generic.scraper.js";
import { paginateUrl } from "../utils/paginateUrl.js";
import { getCache, setCache } from "../cache/kv.js";

const TAG_TTL = 21600; // 6 hours

export async function scrapeTags({ env }) {
  const cacheKey = "scrape:tags:list";
  const cached = await getCache(cacheKey, env);
  if (cached) return cached;

  await rateLimit();

  const html = await fetchHtml("https://www.pornhat.com/tags/");
  const $ = cheerio.load(html);
  console.log("Scraping tags list...");

  const tags = [];

  $(".tags-holder a.item").each((_, el) => {
    const href = $(el).attr("href");
    const title = $(el).text().trim();

    if (!href) return;

    tags.push({
      title,
      url: href.startsWith("http")
        ? href
        : `https://www.pornhat.com${href}`
    });
  });

  console.log("TAGS FOUND:", tags.length);

  if (tags.length) {
    await setCache(cacheKey, tags, env, TAG_TTL);
  }

  return tags;
}


// =======================
// TAG VIDEOS (CHILD)
// =======================
export function scrapeTagSection({ tagUrl, page, env }) {
  if (!tagUrl) {
    throw new Error("tagUrl is required");
  }

  return scrapeList({
    url: paginateUrl(tagUrl, page),
    config: SELECTOR.tag.section,
    env,
    page
  });
}
