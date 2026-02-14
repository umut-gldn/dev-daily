import { SERVER_CONFIG } from "./config.js";

const { topicKeywords } = SERVER_CONFIG;

const buildSearchText = (item) => {
  const parts = [
    item.title,
    item.description,
    item.meta?.language,
  ].filter(Boolean);
  return parts.join(" ").toLowerCase();
};

const itemMatchesTopics = (item, topics) => {
  const text = buildSearchText(item);
  let score = 0;
  for (const topic of topics) {
    const keywords = topicKeywords[topic];
    if (!keywords) continue;
    for (const kw of keywords) {
      if (text.includes(kw)) {
        score++;
        break; // one match per topic is enough
      }
    }
  }
  return score;
};

export const filterByTopics = (items, topics) => {
  if (!topics || topics.length === 0) return items;

  const scored = items.map((item) => ({
    item,
    score: itemMatchesTopics(item, topics),
  }));

  const matching = scored.filter((s) => s.score > 0);

  // If we have enough matching items, only show those (re-ranked)
  if (matching.length >= 3) {
    return matching
      .sort((a, b) => b.score - a.score || a.item.rank - b.item.rank)
      .map((s, i) => ({ ...s.item, rank: i + 1 }));
  }

  // Not enough matches: show matching first, then rest
  const matchIds = new Set(matching.map((s) => s.item.id));
  const rest = scored.filter((s) => !matchIds.has(s.item.id));
  const combined = [
    ...matching.sort((a, b) => b.score - a.score),
    ...rest,
  ];
  return combined.map((s, i) => ({ ...s.item, rank: i + 1 }));
};
