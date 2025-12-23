import * as cheerio from "cheerio";
import { fetchHtml } from "../utils/fetchHtml.js";
import { rateLimit } from "../utils/rateLimit.js";
import { SELECTOR } from "../config/selector.js";
import {scrapeList} from "./generic.scraper.js";
import { paginateUrl } from "../utils/paginateUrl.js";

export async function scrapeTags() {
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
        url:href
      });
    }
  });

  return tags;
}

export function scrapeTagSection({ tagUrl, page, env }) {
  if(!tagUrl) {
    throw new Error("tagUrl is required");
  }
  return scrapeList({
    url: paginateUrl(tagUrl, page),
    selector: SELECTOR.tag.sectionItem,
    env
  });
}