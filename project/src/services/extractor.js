import { Normalizer } from "./normalizer.js";

export class Extractor {
  static title($node, config) {
    if (!config?.title) return null;

    if (config.title.text) {
      return Normalizer.title(
        $node.find(config.title.selector).text()
      );
    }

    return Normalizer.title(
      $node.find(config.title.selector).attr(config.title.attr)
    );
  }

  static image($node, config) {
    if (!config?.img?.selector) return null;

    const img = $node.find(config.img.selector).first();

    const raw =
      img.attr("data-src") ||
      img.attr("data-lazy") ||
      img.attr("data-original") ||
      img.attr("src") ||
      img.attr("srcset")?.split(" ")[0] ||
      null;

    return Normalizer.image(raw);
  }

  static link($node, config, baseUrl) {
    if (!config?.link) return null;

    const el = config.link.selector
      ? $node.find(config.link.selector).first()
      : $node;

    return Normalizer.url(
      el.attr(config.link.attr),
      baseUrl
    );
  }
}
