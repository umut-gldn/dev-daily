import { SERVER_CONFIG } from "../config.js";
import { fetchWithRetry } from "../http.js";
import { applyScores } from "../score.js";

const { baseUrl, searchPath } = SERVER_CONFIG.api.github;

const truncate = (str, max) => {
  if (!str || typeof str !== "string") return "";
  return str.length > max ? str.slice(0, max) + "\u2026" : str;
};

const formatNumber = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num) || num < 0) return "0";
  return num >= 1000 ? (num / 1000).toFixed(1) + "k" : String(num);
};

const daysAgoISO = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
};

const getLanguageColor = (lang) => SERVER_CONFIG.languageColors[lang] ?? "#8888a0";

const buildHeaders = () => {
  const headers = { Accept: "application/vnd.github.v3+json" };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
};

const fetchWindow = async (days, perPage, headers) => {
  const since = daysAgoISO(days);
  const url = `${baseUrl}${searchPath}?q=created:>${since}&sort=stars&order=desc&per_page=${perPage}`;
  const data = await fetchWithRetry(url, { headers });
  return (data?.items || []).map((repo) => ({
    ...repo,
    _windowDays: days,
    _velocity: repo.stargazers_count / days,
  }));
};

export const fetchGitHubTrending = async () => {
  const headers = buildHeaders();
  const limit = SERVER_CONFIG.limits.github;

  // 3 parallel queries: 1-day, 3-day, 7-day windows
  const [w1, w3, w7] = await Promise.allSettled([
    fetchWindow(1, limit, headers),
    fetchWindow(3, limit, headers),
    fetchWindow(7, limit, headers),
  ]);

  const allRepos = [
    ...(w1.status === "fulfilled" ? w1.value : []),
    ...(w3.status === "fulfilled" ? w3.value : []),
    ...(w7.status === "fulfilled" ? w7.value : []),
  ];

  if (allRepos.length === 0) throw new Error("GitHub: empty results");

  // Dedup by repo id, keeping best velocity
  const best = new Map();
  for (const repo of allRepos) {
    const existing = best.get(repo.id);
    if (!existing || repo._velocity > existing._velocity) {
      best.set(repo.id, repo);
    }
  }

  const sorted = Array.from(best.values())
    .sort((a, b) => b._velocity - a._velocity)
    .slice(0, limit);

  let items = sorted.map((repo, index) => ({
    id: repo.id ?? index,
    rank: index + 1,
    source: "github",
    title: repo.full_name ?? "Unknown",
    description: truncate(repo.description, SERVER_CONFIG.limits.descriptionMaxLength),
    url: repo.html_url ?? "#",
    meta: {
      stars: formatNumber(repo.stargazers_count),
      starsRaw: repo.stargazers_count ?? 0,
      forks: formatNumber(repo.forks_count),
      language: repo.language ?? null,
      languageColor: getLanguageColor(repo.language),
      starVelocity: Math.round(repo._velocity),
    },
    tag: index < 3 ? { label: "hot", variant: "hot" } : null,
  }));

  items = applyScores(items, (item) => {
    const stars = item.meta?.starsRaw || 0;
    const velocity = item.meta?.starVelocity || 0;
    return velocity * 3 + stars / 1000;
  });

  return { items, raw: sorted };
};
