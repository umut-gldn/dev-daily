import { cache } from "./_lib/cache.js";
import { fetchGitHubTrending } from "./_lib/fetchers/github.js";
import { fetchHackerNews } from "./_lib/fetchers/hn.js";
import { fetchDevToTrending } from "./_lib/fetchers/devto.js";
import { applyMovement } from "./_lib/comparison.js";
import { buildRssFeed } from "./_lib/rss-builder.js";
import { SERVER_CONFIG } from "./_lib/config.js";
import { checkRateLimit } from "./_lib/rateLimit.js";
import { getClientIp } from "./_lib/request.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).end("Method not allowed");
  }
  const ip = getClientIp(req);
  const limit = checkRateLimit(ip, "rss");
  if (!limit.allowed) {
    res.setHeader("Retry-After", String(limit.retryAfter));
    return res.status(429).json({ ok: false, error: "Rate limit exceeded", retryAfter: limit.retryAfter });
  }

  // Check cache first
  const cached = cache.get("rss");
  if (cached) {
    res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
    return res.status(200).end(cached);
  }

  const [ghResult, hnResult, dtResult] = await Promise.allSettled([
    fetchGitHubTrending(),
    fetchHackerNews(),
    fetchDevToTrending(),
  ]);

  const github = ghResult.status === "fulfilled" ? ghResult.value : null;
  const hn = hnResult.status === "fulfilled" ? hnResult.value : null;
  const devto = dtResult.status === "fulfilled" ? dtResult.value : null;

  const digest = {
    generatedAt: new Date().toISOString(),
    ai: { summary: null },
    github: { items: github ? applyMovement("github", github.items) : [] },
    hn: { items: hn ? applyMovement("hn", hn.items) : [] },
    devto: { items: devto ? applyMovement("devto", devto.items) : [] },
  };

  const xml = buildRssFeed(digest);
  cache.set("rss", xml, SERVER_CONFIG.cache.digestTtlMs);

  res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
  return res.status(200).end(xml);
}
