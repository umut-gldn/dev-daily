import { SERVER_CONFIG } from "./_lib/config.js";
import { cache } from "./_lib/cache.js";
import { checkRateLimit } from "./_lib/rateLimit.js";
import { fetchGitHubTrending } from "./_lib/fetchers/github.js";
import { fetchHackerNews } from "./_lib/fetchers/hn.js";
import { fetchDevToTrending } from "./_lib/fetchers/devto.js";
import { fetchAISummary, buildFallbackSummary } from "./_lib/ai.js";
import { applyMovement } from "./_lib/comparison.js";
import { filterByTopics } from "./_lib/topicFilter.js";
import { listDigests, storeDailyDigest } from "./_lib/archive.js";
import { getClientIp } from "./_lib/request.js";
import { computeThemeTrendShift } from "./_lib/themeTrends.js";

const cacheKey = (lang, topics) => `digest:${lang}:${(topics || []).sort().join(",")}`;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  // Rate limiting
  const ip = getClientIp(req);
  const limit = checkRateLimit(ip, "digest");
  if (!limit.allowed) {
    res.setHeader("Retry-After", String(limit.retryAfter));
    return res.status(429).json({ ok: false, error: "Rate limit exceeded", retryAfter: limit.retryAfter });
  }

  const lang = (req.query.lang || "en").slice(0, 2);
  const topics = req.query.topics
    ? req.query.topics.split(",").filter((t) => SERVER_CONFIG.topics.includes(t))
    : [];

  // Check cache
  const key = cacheKey(lang, topics);
  const cached = cache.get(key);
  if (cached) {
    return res.status(200).json(cached);
  }

  const warnings = [];

  // Fetch all sources in parallel
  const [ghResult, hnResult, dtResult] = await Promise.allSettled([
    fetchGitHubTrending(),
    fetchHackerNews(),
    fetchDevToTrending(),
  ]);

  const github = ghResult.status === "fulfilled" ? ghResult.value : null;
  const hn = hnResult.status === "fulfilled" ? hnResult.value : null;
  const devto = dtResult.status === "fulfilled" ? dtResult.value : null;

  if (!github) warnings.push("GitHub: " + (ghResult.reason?.message || "unavailable"));
  if (!hn) warnings.push("HN: " + (hnResult.reason?.message || "unavailable"));
  if (!devto) warnings.push("Dev.to: " + (dtResult.reason?.message || "unavailable"));

  // Apply movement indicators
  let githubItems = github ? applyMovement("github", github.items) : [];
  let hnItems = hn ? applyMovement("hn", hn.items) : [];
  let devtoItems = devto ? applyMovement("devto", devto.items) : [];

  // Filter by topics — reorder/filter items based on user interests
  if (topics.length > 0) {
    githubItems = filterByTopics(githubItems, topics);
    hnItems = filterByTopics(hnItems, topics);
    devtoItems = filterByTopics(devtoItems, topics);
  }

  // AI summary — pass the filtered items so AI analyzes what the user sees
  let ai;
  try {
    const aiResult = await fetchAISummary(
      githubItems, hnItems, devtoItems, lang, topics
    );
    if (aiResult) {
      ai = aiResult;
    } else {
      ai = buildFallbackSummary(githubItems, hnItems, lang, devtoItems);
      warnings.push("AI: API key not configured");
    }
  } catch (err) {
    ai = buildFallbackSummary(githubItems, hnItems, lang, devtoItems);
    warnings.push("AI: " + (err.message || "unavailable"));
  }

  const response = {
    ok: true,
    generatedAt: new Date().toISOString(),
    lang,
    topics,
    warnings: warnings.length > 0 ? warnings : undefined,
    ai: {
      summary: ai.summary,
      themes: ai.themes || [],
      learnTopic: ai.learnTopic || null,
      insight: ai.insight || null,
      trendShift: [],
    },
    github: { items: githubItems },
    hn: { items: hnItems },
    devto: { items: devtoItems },
  };

  // Cache the response
  try {
    const pastDigests = await listDigests(7);
    response.ai.trendShift = computeThemeTrendShift([
      { generatedAt: response.generatedAt, ai: { themes: response.ai.themes } },
      ...(pastDigests || []),
    ]);
  } catch {
    response.ai.trendShift = [];
  }

  cache.set(key, response, SERVER_CONFIG.cache.digestTtlMs);
  // Persist daily snapshot for archive/weekly
  storeDailyDigest(response).catch(() => {});

  return res.status(200).json(response);
}
