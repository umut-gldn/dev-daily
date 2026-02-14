import { cache } from "./_lib/cache.js";
import { listDigests } from "./_lib/archive.js";
import { fetchWeeklySummary } from "./_lib/ai.js";
import { SERVER_CONFIG } from "./_lib/config.js";
import { checkRateLimit } from "./_lib/rateLimit.js";
import { getClientIp } from "./_lib/request.js";
import { computeThemeTrendShift } from "./_lib/themeTrends.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  const ip = getClientIp(req);
  const limit = checkRateLimit(ip, "weekly");
  if (!limit.allowed) {
    res.setHeader("Retry-After", String(limit.retryAfter));
    return res.status(429).json({ ok: false, error: "Rate limit exceeded", retryAfter: limit.retryAfter });
  }

  const lang = (req.query.lang || "en").slice(0, 2);
  const cacheKey = `weekly:${lang}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.status(200).json(cached);

  const digests = await listDigests(7);
  if (!digests || digests.length === 0) {
    return res.status(404).json({ ok: false, error: "No archive data" });
  }

  let ai;
  try {
    ai = await fetchWeeklySummary(digests, lang);
  } catch (err) {
    return res.status(502).json({ ok: false, error: err.message || "AI error" });
  }

  const payload = {
    ok: true,
    generatedAt: new Date().toISOString(),
    lang,
    days: digests.length,
    ai,
    trendShift: computeThemeTrendShift(digests, 6),
  };

  cache.set(cacheKey, payload, SERVER_CONFIG.cache.digestTtlMs);
  return res.status(200).json(payload);
}
