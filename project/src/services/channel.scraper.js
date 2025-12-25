import { SELECTOR } from "../config/selector.js";
import { paginateUrl } from "../utils/paginateUrl.js";
import { scrapeList } from "./generic.scraper.js";

export function scrapeChannels({ page, env }) {
  return scrapeList({
    url: paginateUrl(SELECTOR.channel.url, page),
    selector: SELECTOR.channel.item,
    env,
    page
  });
}

export function scrapeChannelSection({ channelUrl, page, env }) {
  return scrapeList({
    url: paginateUrl(channelUrl, page),
    selector: SELECTOR.channel.sectionItem,
    env,
    page
  });
}
