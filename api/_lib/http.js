import { SERVER_CONFIG } from "./config.js";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchWithTimeout = async (url, options = {}) => {
  const { timeoutMs = SERVER_CONFIG.limits.fetchTimeoutMs, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...fetchOptions, signal: controller.signal });
    if (!response.ok) {
      const err = new Error(`HTTP ${response.status}`);
      err.status = response.status;
      throw err;
    }
    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") {
      const err = new Error("Timeout");
      err.status = 408;
      throw err;
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const fetchWithRetry = async (url, options = {}) => {
  const maxAttempts = SERVER_CONFIG.limits.retryAttempts + 1;
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fetchWithTimeout(url, options);
    } catch (error) {
      lastError = error;
      const isRetryable = !error.status || error.status >= 500 || error.status === 408;
      if (!isRetryable || attempt >= maxAttempts) break;
      await wait(SERVER_CONFIG.limits.retryDelayMs * attempt);
    }
  }
  throw lastError;
};
