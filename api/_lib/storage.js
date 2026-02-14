const memory = new Map();
let kvClientPromise;

const getKv = async () => {
  if (kvClientPromise) return kvClientPromise;
  kvClientPromise = (async () => {
    try {
      const mod = await import("@vercel/kv");
      return mod.kv;
    } catch {
      return null;
    }
  })();
  return kvClientPromise;
};

export const getJson = async (key) => {
  const kv = await getKv();
  if (kv) return kv.get(key);
  return memory.has(key) ? memory.get(key) : null;
};

export const setJson = async (key, value, ttlSeconds) => {
  const kv = await getKv();
  if (kv) {
    if (ttlSeconds) return kv.set(key, value, { ex: ttlSeconds });
    return kv.set(key, value);
  }
  memory.set(key, value);
  return true;
};

export const updateJson = async (key, updater, ttlSeconds) => {
  const current = (await getJson(key)) ?? null;
  const next = updater(current);
  await setJson(key, next, ttlSeconds);
  return next;
};
