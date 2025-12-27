import { retry } from "./retryFetch.js";

export async function fetchHtml(url) {
  return retry(async () => {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return res.text();
  });
}
