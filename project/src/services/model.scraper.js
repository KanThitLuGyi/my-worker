import { SELECTOR } from "../config/selector.js";
import { paginateUrl } from "../utils/paginateUrl.js";
import { scrapeList } from "./generic.scraper.js";

export function scrapeModels({ page = 1, env }) {
  return scrapeList({
    url: paginateUrl(SELECTOR.model.url, page),
    config: SELECTOR.model,
    env,
    page
  });
}

export function scrapeModelSection({ modelUrl, page = 1, env }) {
  if (!modelUrl) {
    throw new Error("modelUrl is required");
  }

  return scrapeList({
    url: paginateUrl(modelUrl, page),
    config: SELECTOR.model.section,
    env,
    page
  });
}
