import * as cheerio from "cheerio";
import { fetchHtml } from "../utils/fetchHtml.js";
import { rateLimit } from "../utils/rateLimit.js";
import { getCache, setCache } from "../cache/kv.js";


function normalizeImgUrl(src) {
  if (!src) return null;

  if (src.startsWith("http")) return src;

  if (
    src.startsWith("webp/") ||
    src.startsWith("jpg/") ||
    src.startsWith("png/")
  ) {
    return `https://ic-vt-nss.xhcdn.com/${src}`;
  }

  return src;
}

function extractSize(url) {
  const match = url?.match(/(\d{2,4})x(\d{2,4})/);
  if (!match) return null;

  return {
    w: parseInt(match[1], 10),
    h: parseInt(match[2], 10)
  };
}

function upgradeIfTooSmall(url, minW = 640, minH = 360) {
  const size = extractSize(url);

  if (!size) return url;


  if (size.w >= minW && size.h >= minH) {
    return url;
  }


  return url.replace(/\d{2,4}x\d{2,4}/, "1280x720");
}

function getSmartImg($img) {
  if (!$img || !$img.length) return null;

  let src =
    $img.attr("src") ||
    $img.attr("data-src");

  if (!src) {
    const srcset = $img.attr("srcset");
    if (srcset) {
      src = srcset.split(",").pop().trim().split(" ")[0];
    }
  }

  if (!src) return null;

  src = normalizeImgUrl(src);
  return upgradeIfTooSmall(src);
}


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
  const cacheKey = `scrape:${url}:p${page}`;

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
 