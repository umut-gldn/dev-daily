import { cache } from "./cache.js";
import { SERVER_CONFIG } from "./config.js";

const snapshotKey = (source) => `snapshot:${source}`;
const todayKey = () => new Date().toISOString().split("T")[0];

const getSnapshot = (source) => {
  const entry = cache.get(snapshotKey(source));
  if (!entry) return null;
  return entry;
};

const saveSnapshot = (source, items) => {
  const ids = new Set(items.map((item) => item.id));
  const ranks = new Map(items.map((item) => [item.id, item.rank]));
  cache.set(snapshotKey(source), { date: todayKey(), ids, ranks }, SERVER_CONFIG.cache.snapshotTtlMs);
};

export const applyMovement = (source, items) => {
  const previous = getSnapshot(source);

  // If no previous snapshot or same day, no movement data
  if (!previous || previous.date === todayKey()) {
    saveSnapshot(source, items);
    return items.map((item) => ({ ...item, movement: null }));
  }

  const result = items.map((item) => {
    if (!previous.ids.has(item.id)) {
      return { ...item, movement: { type: "new", rankChange: null } };
    }
    const prevRank = previous.ranks.get(item.id);
    const change = prevRank - item.rank; // positive = rising
    if (change > 0) {
      return { ...item, movement: { type: "rising", rankChange: change } };
    }
    return { ...item, movement: { type: "steady", rankChange: 0 } };
  });

  saveSnapshot(source, items);
  return result;
};
