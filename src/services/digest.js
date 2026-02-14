const DIGEST_URL = "/api/digest";

export const fetchDigest = async (lang = "en", topics = []) => {
  const params = new URLSearchParams({ lang });
  if (topics.length > 0) params.set("topics", topics.join(","));

  const response = await fetch(`${DIGEST_URL}?${params}`);

  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After") || "60";
    const err = new Error("Rate limited");
    err.retryAfter = Number(retryAfter);
    throw err;
  }

  if (!response.ok) {
    throw new Error(`Digest API error: ${response.status}`);
  }

  return response.json();
};
