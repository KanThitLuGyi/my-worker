import { SELECTOR } from "../config/selector.js";
import { paginateUrl } from "../utils/paginateUrl.js";
import { scrapeList } from "./generic.scraper.js";

// =======================
// CHANNEL LIST (parent)
// =======================
export function scrapeChannels({ page = 1, env }) {
  return scrapeList({
    url: paginateUrl(SELECTOR.channel.url, page),
    config: SELECTOR.channel,
    env,
    page
  });
}

// =======================
// CHANNEL VIDEOS (child)
// =======================
export function scrapeChannelSection({ channelUrl, page = 1, env }) {
  if (!channelUrl) {
    throw new Error("channelUrl is required");
  }

  return scrapeList({
    url: paginateUrl(channelUrl, page),
    config: SELECTOR.channel.section,
    env,
    page
  });
}
