const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

export const applyScores = (items, getRawScore) => {
  if (!Array.isArray(items) || items.length === 0) return items;
  const raws = items.map((i) => getRawScore(i));
  const min = Math.min(...raws);
  const max = Math.max(...raws);
  const range = max - min || 1;
  return items.map((item, idx) => {
    const raw = raws[idx];
    const score = clamp(Math.round(((raw - min) / range) * 100), 0, 100);
    return {
      ...item,
      meta: {
        ...item.meta,
        score,
        scoreRaw: Math.round(raw * 100) / 100,
      },
    };
  });
};
