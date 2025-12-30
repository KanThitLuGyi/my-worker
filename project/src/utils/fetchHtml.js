export async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",

      "Accept":
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",


      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "same-origin",
      "Sec-Fetch-User": "?1",

      "Referer": "https://xhamster.com/",
    },


    cf: {
      cacheTtl: 0,
      cacheEverything: false,
    },

    redirect: "follow",
  });

  if (!res.ok || res.url.includes("security") || res.status === 403) {
    throw new Error(
      `Blocked or redirected: ${res.status} → ${res.url}`
    );
  }

  return await res.text();
}
