export class Normalizer {
  static title(title) {
    return title ? title.replace(/\s+/g, " ").trim() : null;
  }

  static url(href, base) {
    if (!href) return null;
    return href.startsWith("http") ? href : new URL(href, base).href;
  }

  static image(url) {
    if (!url) return null;

    return url

      .replace(/\/16x9\./, "/1280x720.")

      .replace(/\/\d+x\d+\./, "/1280x720.")

      .replace(/s\(w:\d+,h:\d+\),?/g, "s(w:1280,h:720),");
  }
}
