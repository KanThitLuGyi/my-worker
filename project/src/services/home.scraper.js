import { SELECTOR } from "../config/selector.js";
import { paginateUrl } from "../utils/paginateUrl.js";
import { scrapeList } from "./generic.scraper.js";

export function scrapeHome({ page, env }) {
  return scrapeList({
    url: paginateUrl(SELECTOR.home.url, page),
    selector: SELECTOR.home.item,
    env,
    page
  });
}
