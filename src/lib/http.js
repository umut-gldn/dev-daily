import { CONFIG } from "../config";

export class HttpError extends Error {
  constructor(message, status, url) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this._internalUrl = url;
  }
}

export const toUserFriendlyError = (error, sourceName, errorStrings) => {
  if (error instanceof HttpError) {
    if (error.status === 408) return errorStrings.timeout(sourceName);
    if (error.status === 403) return errorStrings.rateLimit(sourceName);
    if (error.status === 404) return errorStrings.notFound(sourceName);
    if (error.status >= 500) return errorStrings.server(sourceName);
  }
  if (error?.name === "AbortError" || error?.message?.includes("timeout")) {
    return errorStrings.network(sourceName);
  }
  return errorStrings.generic(sourceName);
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchWithTimeout = async (url, options = {}) => {
  const { timeoutMs = CONFIG.limits.fetchTimeoutMs, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...fetchOptions, signal: controller.signal });
    if (!response.ok) throw new HttpError(`HTTP ${response.status}`, response.status, url);
    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") throw new HttpError("Timeout", 408, url);
    if (error instanceof HttpError) throw error;
    throw new HttpError(error.message || "Network error", 0, url);
  } finally {
    clearTimeout(timeoutId);
  }
};

export const fetchWithRetry = async (url, options = {}) => {
  const maxAttempts = CONFIG.limits.retryAttempts + 1;
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fetchWithTimeout(url, options);
    } catch (error) {
      lastError = error;
      const isRetryable = !error.status || error.status >= 500 || error.status === 408;
      if (!isRetryable || attempt >= maxAttempts) break;
      await wait(CONFIG.limits.retryDelayMs * attempt);
    }
  }
  throw lastError;
};
