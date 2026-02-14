const store = new Map();

export const cache = {
  get(key) {
    const entry = store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      store.delete(key);
      return null;
    }
    return entry.value;
  },

  set(key, value, ttlMs) {
    store.set(key, { value, expiresAt: Date.now() + ttlMs });
  },

  has(key) {
    return this.get(key) !== null;
  },

  delete(key) {
    store.delete(key);
  },

  cleanup() {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.expiresAt) store.delete(key);
    }
  },
};

// Periodic cleanup every 5 minutes
setInterval(() => cache.cleanup(), 5 * 60 * 1000);
