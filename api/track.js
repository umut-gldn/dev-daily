import { updateJson } from "./_lib/storage.js";
import { checkRateLimit } from "./_lib/rateLimit.js";
import { getClientIp } from "./_lib/request.js";

const KEY = "analytics:clicks";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }
  const ip = getClientIp(req);
  const limit = checkRateLimit(ip, "track", { maxRequests: 120 });
  if (!limit.allowed) {
    res.setHeader("Retry-After", String(limit.retryAfter));
    return res.status(429).json({ ok: false, error: "Rate limit exceeded", retryAfter: limit.retryAfter });
  }

  const { source, id, title, url } = req.body || {};
  if (!source || id == null) {
    return res.status(400).json({ ok: false, error: "Missing source/id" });
  }

  const now = Date.now();
  const next = await updateJson(KEY, (current) => {
    const base = current && typeof current === "object"
      ? current
      : { total: 0, bySource: {}, byId: {} };

    base.total += 1;
    base.bySource[source] = (base.bySource[source] || 0) + 1;
    const key = `${source}:${id}`;
    base.byId[key] = base.byId[key] || { count: 0, title, url, source, id, last: null };
    base.byId[key].count += 1;
    base.byId[key].last = now;
    return base;
  });

  return res.status(200).json({ ok: true, total: next.total });
}
