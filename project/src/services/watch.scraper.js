export async function scrapeM3u8(pageUrl) {
 try {
    const res = await fetch(pageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120",
        "Accept": "text/html"
      }
    });

    if (!res.ok) return null;

    const html = await res.text();

    const urls = html.match(/https?:\/\/[^'"]+/g) || [];

    // Prefer mp4
    const mp4 = urls.find(u => u.includes(".mp4"));
    if (mp4) return mp4;

    return null;
  } catch {
    return null;
  }
  
}