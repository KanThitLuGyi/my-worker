import * as cheerio from "cheerio";
import { fetchHtml } from "../utils/fetchHtml.js";
import { rateLimit } from "../utils/rateLimit.js";
import { SELECTOR } from "../config/selector.js";
import { scrapeList } from "./generic.scraper.js";
import { paginateUrl } from "../utils/paginateUrl.js";
import { getCache, setCache } from "../cache/kv.js";

const TAG_TTL = 21600; // 6 hours

// ✅ TAG LIST (CACHED)
export async function scrapeTags({ env }) {
  const cacheKey = "scrape:tags:list";

  const cached = await getCache(cacheKey, env);
  if (cached) return cached;

  await rateLimit();

  const html = await fetchHtml(SELECTOR.tag.url);
  const $ = cheerio.load(html);

  const tags = [];
  $(SELECTOR.tag.item).each((_, el) => {
    const href = $(el).attr("href");
    const title = $(el).text().trim();

    if (href) {
      tags.push({
        title,
        url: href
      });
    }
  });

  if (tags.length > 0) {
    await setCache(cacheKey, tags, env, TAG_TTL);
  }

  return tags;
}

// ✅ TAG SECTION (ALREADY CACHED via generic.scraper.js)
export function scrapeTagSection({ tagUrl, page, env }) {
  if (!tagUrl) {
    throw new Error("tagUrl is required");
  }

  return scrapeList({
    url: paginateUrl(tagUrl, page),
    selector: SELECTOR.tag.sectionItem,
    env,
    page
  });
}
