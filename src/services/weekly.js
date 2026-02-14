const WEEKLY_URL = "/api/weekly";

export const fetchWeekly = async (lang = "en") => {
  const res = await fetch(`${WEEKLY_URL}?lang=${encodeURIComponent(lang)}`);
  if (!res.ok) throw new Error(`Weekly API error: ${res.status}`);
  return res.json();
};

