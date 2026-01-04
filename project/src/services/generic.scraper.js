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

  // Environment အလိုက် cache TTL သတ်မှတ်ခြင်း
  const isDev = env.ENVIRONMENT === 'dev';
  const cacheEnabled = env.CACHE_ENABLED === 'true';
  
  // Dev mode မှာ cache မလုပ်စေချင်ဘူး
  if (isDev || !cacheEnabled) {
    console.log(`[${env.ENVIRONMENT}] Cache disabled for: ${url} page ${page}`);
    return await fetchAndScrapeWithoutCache({ url, config, page });
  }

  // Production mode မှာပဲ cache သုံးမယ်
  // Cache TTL ကို environment variable ကနေ ဖတ်မယ်
  const defaultTtl = env.CACHE_TTL ? parseInt(env.CACHE_TTL) : 3600;
  const ttl = page <= 3 ? defaultTtl * 6 : defaultTtl; // First 3 pages cache longer
  
  // Cache key ထဲမှာ environment ပါအောင် ထည့်ပေးခြင်း
  const cacheKey = `scrape:${env.ENVIRONMENT}:${url}:p${page}`;

  // Cache ထဲမှာ ရှိမရှိ စစ်ဆေးခြင်း
  const cached = await getCache(cacheKey, env);
  if (cached) {
    console.log(`[${env.ENVIRONMENT}] Cache hit for: ${url} page ${page}`);
    return cached;
  }

  console.log(`[${env.ENVIRONMENT}] Cache miss for: ${url} page ${page}`);
  
  await rateLimit();

  const html = await fetchHtml(url);
  if (!html) {
  console.warn(`No HTML returned for ${url}`);
  return [];
}
  const $ = cheerio.load(html);
  const list = [];

  $(config.list).each((_, el) => {
    const node = $(el);

    /* ---------- TITLE ---------- */
    const title = config.title
      ? config.title.text
        ? node
            .find(config.title.selector)
            .clone()
            .children()
            .remove()
            .end()
            .text()
            .trim()
        : node.find(config.title.selector).attr(config.title.attr)
      : "";

    /* ---------- IMAGE ---------- */
    let img = null;
    if (config.img) {
      const imgEl = config.img.selector
        ? node.find(config.img.selector)
        : node;

      img =
        imgEl.attr(config.img.attr) ||
        imgEl.find("img").attr("src")||
        imgEl.attr("data-lazy") ||
        imgEl.attr("srcset")?.split(" ")[0] ||
        null;
    }

    /* ---------- LINK ---------- */
    let href = config.link
      ? config.link.selector
        ? node.find(config.link.selector).attr(config.link.attr)
        : node.attr(config.link.attr)
      : null;

    if (!href) return;

    if (!href.startsWith("http")) {
      href = `https://www.freepornvideo.sex${href}`;
    }

    list.push({
      title,
      img,
      url: href
    });
  });

  if (list.length) {
    await setCache(cacheKey, list, env, ttl);
    console.log(`[${env.ENVIRONMENT}] Cached: ${url} page ${page} (TTL: ${ttl}s)`);
  }

  return list;
}

// Dev mode အတွက် cache မသုံးတဲ့ function
async function fetchAndScrapeWithoutCache({ url, config, page }) {
  console.log(`Fetching without cache: ${url} page ${page}`);
  
  await rateLimit();
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const list = [];

  $(config.list).each((_, el) => {
    const node = $(el);

    const title = config.title
      ? config.title.text
        ? node
            .find(config.title.selector)
            .clone()
            .children()
            .remove()
            .end()
            .text()
            .trim()
        : node.find(config.title.selector).attr(config.title.attr)
      : "";

    let img = null;
    if (config.img) {
      const imgEl = config.img.selector
        ? node.find(config.img.selector)
        : node;

      img =
        imgEl.attr(config.img.attr) ||
        imgEl.find("img").attr("src")||
        imgEl.attr("data-lazy") ||
        imgEl.attr("srcset")?.split(" ")[0] ||
        null;
    }

    let href = config.link
      ? config.link.selector
        ? node.find(config.link.selector).attr(config.link.attr)
        : node.attr(config.link.attr)
      : null;

    if (!href) return;

    if (!href.startsWith("http")) {
      href = `https://www.freepornvideo.sex${href}`;
    }

    list.push({
      title,
      img,
      url: href
    });
  });

  return list;
  
}
