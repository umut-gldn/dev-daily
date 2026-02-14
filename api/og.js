import { listDigestDates, getDigestByDate } from "./_lib/archive.js";
import { checkRateLimit } from "./_lib/rateLimit.js";
import { getClientIp } from "./_lib/request.js";

const wrapText = (text, maxLen = 48) => {
  const words = (text || "").split(/\s+/);
  const lines = [];
  let line = [];
  for (const w of words) {
    const next = [...line, w].join(" ");
    if (next.length > maxLen) {
      if (line.length) lines.push(line.join(" "));
      line = [w];
    } else {
      line.push(w);
    }
  }
  if (line.length) lines.push(line.join(" "));
  return lines.slice(0, 6);
};

export default async function handler(req, res) {
  const ip = getClientIp(req);
  const limit = checkRateLimit(ip, "og");
  if (!limit.allowed) {
    res.setHeader("Retry-After", String(limit.retryAfter));
    return res.status(429).json({ ok: false, error: "Rate limit exceeded", retryAfter: limit.retryAfter });
  }

  const dates = await listDigestDates(1);
  const latest = dates[0] ? await getDigestByDate(dates[0]) : null;

  const title = "Dev Daily";
  const summary = latest?.ai?.summary || "Your daily developer digest with trends, insights, and learning picks.";
  const date = latest?.generatedAt ? new Date(latest.generatedAt).toISOString().slice(0, 10) : "Today";
  const lines = wrapText(summary);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" />
  <rect x="60" y="60" width="1080" height="510" rx="24" fill="#0b1220" stroke="#1f2937"/>
  <text x="100" y="140" font-size="48" fill="#e2e8f0" font-family="Arial, Helvetica, sans-serif" font-weight="700">${title}</text>
  <text x="100" y="185" font-size="20" fill="#94a3b8" font-family="Arial, Helvetica, sans-serif">${date}</text>
  ${lines.map((line, i) => (
    `<text x="100" y="${250 + i * 42}" font-size="28" fill="#cbd5f5" font-family="Arial, Helvetica, sans-serif">${line.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text>`
  )).join("\n")}
  <text x="100" y="560" font-size="18" fill="#38bdf8" font-family="Arial, Helvetica, sans-serif">devdaily</text>
</svg>`;

  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=300");
  return res.status(200).send(svg);
}
