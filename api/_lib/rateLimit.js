import { SERVER_CONFIG } from "./config.js";

const hits = new Map();

const { windowMs, maxRequests } = SERVER_CONFIG.rateLimit;

const getBucketKey = (ip, scope) => `${scope || "global"}:${ip}`;

export const checkRateLimit = (ip, scope = "global", overrides = {}) => {
  const now = Date.now();
  const activeWindowMs = Number(overrides.windowMs) || windowMs;
  const activeMaxRequests = Number(overrides.maxRequests) || maxRequests;
  const windowStart = now - activeWindowMs;
  const bucket = getBucketKey(ip, scope);

  let timestamps = hits.get(bucket);
  if (!timestamps) {
    timestamps = [];
    hits.set(bucket, timestamps);
  }

  // Remove timestamps outside the window
  while (timestamps.length > 0 && timestamps[0] <= windowStart) {
    timestamps.shift();
  }

  if (timestamps.length >= activeMaxRequests) {
    const retryAfter = Math.ceil((timestamps[0] + activeWindowMs - now) / 1000);
    return { allowed: false, retryAfter };
  }

  timestamps.push(now);
  return { allowed: true, remaining: activeMaxRequests - timestamps.length };
};

// Cleanup stale IPs every 2 minutes
setInterval(() => {
  const cutoff = Date.now() - windowMs;
  for (const [bucket, timestamps] of hits) {
    if (timestamps.length === 0 || timestamps[timestamps.length - 1] <= cutoff) {
      hits.delete(bucket);
    }
  }
}, 2 * 60 * 1000);
