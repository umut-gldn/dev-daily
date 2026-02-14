import { SERVER_CONFIG } from "../config.js";
import { fetchWithRetry } from "../http.js";
import { applyScores } from "../score.js";

const { baseUrl } = SERVER_CONFIG.api.hn;

const timeAgo = (unixTs) => {
  if (!unixTs || typeof unixTs !== "number") return "";
  const seconds = Math.max(0, Math.floor(Date.now() / 1000 - unixTs));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return Math.floor(seconds / 60) + "m ago";
  if (seconds < 86400) return Math.floor(seconds / 3600) + "h ago";
  return Math.floor(seconds / 86400) + "d ago";
};

const getHotTag = (score) => {
  if (score >= 200) return { label: "hot", variant: "hot" };
  if (score >= 100) return { label: "rising", variant: "rising" };
  return null;
};

export const fetchHackerNews = async () => {
  const ids = await fetchWithRetry(`${baseUrl}/topstories.json`);
  if (!Array.isArray(ids) || ids.length === 0) throw new Error("HN: no story IDs");

  const limit = SERVER_CONFIG.limits.hn;
  const results = await Promise.allSettled(
    ids.slice(0, limit).map((id) => fetchWithRetry(`${baseUrl}/item/${id}.json`))
  );

  const stories = results
    .filter((r) => r.status === "fulfilled" && r.value != null)
    .map((r) => r.value);

  if (stories.length === 0) throw new Error("HN: no stories fetched");

  let items = stories.map((story, index) => ({
    id: story.id ?? index,
    rank: index + 1,
    source: "hn",
    title: story.title ?? "Untitled",
    description: null,
    url: story.url ?? `https://news.ycombinator.com/item?id=${story.id}`,
    meta: {
      points: story.score ?? 0,
      comments: story.descendants ?? 0,
      author: story.by ?? "anonymous",
      timeAgo: timeAgo(story.time),
    },
    tag: getHotTag(story.score ?? 0),
  }));

  items = applyScores(items, (item) => {
    const points = item.meta?.points || 0;
    const comments = item.meta?.comments || 0;
    return points + comments * 1.8;
  });

  return { items, raw: stories };
};
