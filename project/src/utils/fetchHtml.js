export async function fetchHtml(url) {
  const referer = new URL(url).origin + "/";

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html",
        "Referer": referer,
      },
      cf: {
        cacheTtl: 0,
        cacheEverything: false,
      },
    });

    // 🚫 DO NOT THROW
    if (!res.ok) {
      console.warn(`Blocked ${res.status}: ${url}`);
      return null;
    }

    return await res.text();
  } catch (err) {
    console.error("fetchHtml error:", err.message);
    return null; // ✅ NEVER crash worker
  }
}


/*export async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      redirect: "follow",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept": "text/html",
     // "Referer": "https://www.freepornvideo.sex/",
    },
    cf: {
      cacheTtl: 0,
      cacheEverything: false
    }
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return await res.text();
}
*/