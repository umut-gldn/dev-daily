import { getJson, setJson, updateJson } from "./storage.js";

const INDEX_KEY = "archive:index";
const MAX_DAYS = 120;

const toDateKey = (isoString) => {
  const d = isoString ? new Date(isoString) : new Date();
  return d.toISOString().slice(0, 10);
};

export const storeDailyDigest = async (digest) => {
  if (!digest) return null;
  const dateKey = toDateKey(digest.generatedAt);
  const key = `archive:${dateKey}`;
  await setJson(key, digest);

  await updateJson(INDEX_KEY, (current) => {
    const list = Array.isArray(current) ? current : [];
    if (!list.includes(dateKey)) list.unshift(dateKey);
    const deduped = Array.from(new Set(list));
    return deduped.slice(0, MAX_DAYS);
  });

  return dateKey;
};

export const getDigestByDate = async (dateKey) => {
  if (!dateKey) return null;
  return getJson(`archive:${dateKey}`);
};

export const listDigestDates = async (limit = 30) => {
  const list = await getJson(INDEX_KEY);
  if (!Array.isArray(list)) return [];
  return list.slice(0, limit);
};

export const listDigests = async (limit = 30) => {
  const dates = await listDigestDates(limit);
  const items = await Promise.all(dates.map((d) => getDigestByDate(d)));
  return items.filter(Boolean);
};
