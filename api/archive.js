import { cache } from "./_lib/cache.js";
import { getDigestByDate, listDigestDates } from "./_lib/archive.js";
import { checkRateLimit } from "./_lib/rateLimit.js";
import { getClientIp } from "./_lib/request.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  const ip = getClientIp(req);
  const limitState = checkRateLimit(ip, "archive");
  if (!limitState.allowed) {
    res.setHeader("Retry-After", String(limitState.retryAfter));
    return res.status(429).json({ ok: false, error: "Rate limit exceeded", retryAfter: limitState.retryAfter });
  }

  const date = typeof req.query.date === "string" ? req.query.date : null;
  const limitRaw = Number(req.query.limit || 30);
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(90, limitRaw)) : 30;

  if (date) {
    const cached = cache.get(`archive:${date}`);
    if (cached) return res.status(200).json(cached);

    const digest = await getDigestByDate(date);
    if (!digest) return res.status(404).json({ ok: false, error: "Not found" });
    cache.set(`archive:${date}`, digest, 5 * 60 * 1000);
    return res.status(200).json(digest);
  }

  const cacheKey = `archive:index:${limit}`;
  const cachedIndex = cache.get(cacheKey);
  if (cachedIndex) return res.status(200).json(cachedIndex);

  const dates = await listDigestDates(limit);
  const payload = { ok: true, dates };
  cache.set(cacheKey, payload, 5 * 60 * 1000);
  return res.status(200).json(payload);
}
