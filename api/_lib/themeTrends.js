const norm = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const getThemes = (digest) =>
  Array.isArray(digest?.ai?.themes)
    ? digest.ai.themes.map((t) => String(t || "").trim()).filter(Boolean)
    : [];

const hasTheme = (digest, themeKey) => {
  const set = new Set(getThemes(digest).map(norm));
  return set.has(themeKey);
};

const ratio = (count, total) => (total > 0 ? count / total : 0);

export const computeThemeTrendShift = (digests, limit = 4) => {
  if (!Array.isArray(digests) || digests.length < 2) return [];

  const uniqueByDate = [];
  const seen = new Set();
  for (const d of digests) {
    const dateKey = d?.generatedAt ? new Date(d.generatedAt).toISOString().slice(0, 10) : null;
    const key = dateKey || JSON.stringify(getThemes(d));
    if (!seen.has(key)) {
      seen.add(key);
      uniqueByDate.push(d);
    }
  }

  if (uniqueByDate.length < 2) return [];

  const today = uniqueByDate[0];
  const yesterday = uniqueByDate[1];
  const recentSlice = uniqueByDate.slice(0, Math.min(3, uniqueByDate.length));
  const previousSlice = uniqueByDate.slice(3, Math.min(7, uniqueByDate.length));
  const allThemeLabels = new Map();

  for (const d of uniqueByDate) {
    for (const label of getThemes(d)) {
      const key = norm(label);
      if (!allThemeLabels.has(key)) allThemeLabels.set(key, label);
    }
  }

  const shifts = [];
  for (const [themeKey, themeLabel] of allThemeLabels) {
    const dayDelta = (hasTheme(today, themeKey) ? 1 : 0) - (hasTheme(yesterday, themeKey) ? 1 : 0);
    const recentCount = recentSlice.filter((d) => hasTheme(d, themeKey)).length;
    const previousCount = previousSlice.filter((d) => hasTheme(d, themeKey)).length;
    const weekDelta = ratio(recentCount, recentSlice.length) - ratio(previousCount, previousSlice.length);
    const score = dayDelta * 0.6 + weekDelta;

    if (score > 0) {
      shifts.push({
        theme: themeLabel,
        dayDelta,
        weekDelta: Math.round(weekDelta * 100) / 100,
        score: Math.round(score * 100) / 100,
      });
    }
  }

  return shifts
    .sort((a, b) => b.score - a.score || b.dayDelta - a.dayDelta)
    .slice(0, Math.max(1, limit));
};

