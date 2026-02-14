const ANALYTICS_URL = "/api/analytics";

export const fetchAnalytics = async () => {
  const res = await fetch(ANALYTICS_URL);
  if (!res.ok) throw new Error(`Analytics API error: ${res.status}`);
  return res.json();
};

