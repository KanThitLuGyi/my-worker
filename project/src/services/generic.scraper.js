import * as cheerio from "cheerio";
import { fetchHtml } from "../utils/fetchHtml.js";
import { rateLimit } from "../utils/rateLimit.js";
import { getCache, setCache } from "../cache/kv.js";

/* ================= IMAGE HELPERS ================= */

function normalizeImgUrl(src) {
  if (!src) return null;

  // absolute
  if (src.startsWith("http")) return src;

  // relative video thumbnails
  if (
    src.startsWith("webp/") ||
    src.startsWith("jpg/") ||
    src.startsWith("png/")
  ) {
    return `https://ic-vt-nss.xhcdn.com/${src}`;
  }

  return src;
}

function canResizeImage(url) {
  return (
    url?.includes("ic-vt-nss.xhcdn.com") ||
    url?.includes("thumb-v7.xhcdn.com")
  );
}

function upgradeIfTooSmall(url, minW = 640, minH = 360) {
  if (!url) return url;

  // remove forced tiny resize (s(w:16,h:9))
  url = url.replace(/s\(w:\d+,h:\d+\),?/g, "");

  const match = url.match(/(\d{2,4})x(\d{2,4})/);
  if (!match) return url;

  const w = parseInt(match[1], 10);
  const h = parseInt(match[2], 10);

  // already large enough
  if (w >= minW && h >= minH) {
    return url;
  }

  // upgrade safely
  return url.replace(/\d{2,4}x\d{2,4}/, "1280x720");
}

function getSmartImg($img) {
  if (!$img || !$img.length) return null;

  let src =
    $img.attr("src") ||
    $img.attr("data-src");

  // fallback to srcset (best quality)
  if (!src) {
    const srcset = $img.attr("srcset");
    if (srcset) {
      src = srcset.split(",").pop().trim().split(" ")[0];
    }
  }

  if (!src) return null;

  src = normalizeImgUrl(src);

  // resize ONLY resizable CDNs (video thumbs)
  if (canResizeImage(src)) {
    return upgradeIfTooSmall(src);
  }

  // avatar or protected image → return as-is
  return src;
}

/* ================= MAIN SCRAPER ================= */

export async function scrapeList({
  url,
  config,
  env,
  page = 1
}) {
  if (!config?.list) {
    throw new Error("scrapeList: missing list selector");
  }

  const ttl = page <= 3 ? 21600 : 3600;
  const cacheKey = `scrape:v2:${url}:p${page}`;

  const cached = await getCache(cacheKey, env);
  if (cached) return cached;

  await rateLimit();

  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const list = [];

  $(config.list).each((_, el) => {
    const node = $(el);

    const title = config.title
      ? config.title.text
        ? node.find(config.title.selector).text().trim()
        : node.find(config.title.selector).attr(config.title.attr)
      : "";

    const img = config.img
      ? getSmartImg(node.find(config.img.selector))
      : null;

    let href = config.link
      ? config.link.selector
        ? node.find(config.link.selector).attr(config.link.attr)
        : node.attr(config.link.attr)
      : null;

    if (!href) return;

    if (!href.startsWith("http")) {
      href = `https://xhamster.com${href}`;
    }

    list.push({
      title,
      img,
      url: href
    });
  });

  if (list.length) {
    await setCache(cacheKey, list, env, ttl);
  }

  return list;
}
