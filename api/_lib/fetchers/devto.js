import { SERVER_CONFIG } from "../config.js";
import { fetchWithRetry } from "../http.js";
import { applyScores } from "../score.js";

const { baseUrl, articlesPath } = SERVER_CONFIG.api.devto;

const truncate = (str, max) => {
  if (!str || typeof str !== "string") return "";
  return str.length > max ? str.slice(0, max) + "\u2026" : str;
};

export const fetchDevToTrending = async () => {
  const limit = SERVER_CONFIG.limits.devto;
  const url = `${baseUrl}${articlesPath}?top=7&per_page=${limit}`;
  const articles = await fetchWithRetry(url);

  if (!Array.isArray(articles) || articles.length === 0) {
    throw new Error("Dev.to: empty results");
  }

  let items = articles.map((article, index) => ({
    id: article.id ?? index,
    rank: index + 1,
    source: "devto",
    title: article.title ?? "Untitled",
    description: truncate(article.description, SERVER_CONFIG.limits.descriptionMaxLength),
    url: article.url ?? "#",
    meta: {
      reactions: article.positive_reactions_count ?? 0,
      comments: article.comments_count ?? 0,
      author: article.user?.name ?? article.user?.username ?? "Unknown",
      publishDate: article.readable_publish_date ?? "",
    },
    tag: index < 2 ? { label: "trending", variant: "new" } : null,
  }));

  items = applyScores(items, (item) => {
    const reactions = item.meta?.reactions || 0;
    const comments = item.meta?.comments || 0;
    return reactions + comments * 2.2;
  });

  return { items, raw: articles };
};
