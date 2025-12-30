export function normalizeTitle(title) {
  return title?.replace(/\s+/g, " ").trim() ?? "";
}

export function normalizeImage(url) {
  if (!url) return null;

  return url
    .replace(/b\(\d+\),?/g, "")
    .replace(/s\(w:\d+,h:\d+\)/g, "s(w:1280,h:720)")
    .replace(/\/(\d+x\d+)\./, "/1280x720.");
}

export function normalizeUrl(url) {
  if (!url) return null;
  return url.startsWith("//") ? "https:" + url : url;
}

export function extractId(url) {
  const m = url?.match(/-([a-zA-Z0-9]+)$/);
  return m ? m[1] : url;
}
