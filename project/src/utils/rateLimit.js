export async function rateLimit(ms = 800) {
  await new Promise(r => setTimeout(r, ms));
}
