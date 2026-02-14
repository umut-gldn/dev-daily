import { getJson } from "./_lib/storage.js";
import { checkRateLimit } from "./_lib/rateLimit.js";
import { getClientIp } from "./_lib/request.js";

const KEY = "analytics:clicks";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  const ip = getClientIp(req);
  const limit = checkRateLimit(ip, "analytics");
  if (!limit.allowed) {
    res.setHeader("Retry-After", String(limit.retryAfter));
    return res.status(429).json({ ok: false, error: "Rate limit exceeded", retryAfter: limit.retryAfter });
  }

  const data = await getJson(KEY);
  if (!data) return res.status(200).json({ ok: true, total: 0, top: [] });

  const items = Object.values(data.byId || {});
  items.sort((a, b) => b.count - a.count);
  const top = items.slice(0, 10);

  return res.status(200).json({
    ok: true,
    total: data.total || 0,
    bySource: data.bySource || {},
    top,
  });
}
