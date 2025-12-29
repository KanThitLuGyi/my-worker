import { SELECTOR } from "../config/selector.js";
import { paginateUrl } from "../utils/paginateUrl.js";
import { scrapeList } from "./generic.scraper.js";

export function scrapeHome({ page = 1, env }) {
  return scrapeList({
    url: paginateUrl(SELECTOR.home.url, page),
    config: SELECTOR.home,
    env,
    page
  });
}
