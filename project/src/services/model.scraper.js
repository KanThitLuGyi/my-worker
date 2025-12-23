import { SELECTOR } from "../config/selector.js";
import { paginateUrl } from "../utils/paginateUrl.js";
import { scrapeList } from "./generic.scraper.js";

export function scrapeModels({ page, env }) {
  return scrapeList({
    url: paginateUrl(SELECTOR.model.url, page),
    selector: SELECTOR.model.item,
    env
  });
}

export function scrapeModelSection({ modelUrl, page, env }) {
  return scrapeList({
    url: paginateUrl(modelUrl, page),
    selector: SELECTOR.model.sectionItem,
    env
  });
}