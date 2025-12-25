export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",

      // 🔥 REQUIRED FOR MOBILE APPS
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",

      // Optional but recommended
      "Cache-Control": "public, max-age=300"
    }
  });
}
