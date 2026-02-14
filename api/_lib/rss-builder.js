const escapeXml = (str) =>
  String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const buildItem = (item, source) => {
  const title = escapeXml(`[${source}] #${item.rank} ${item.title}`);
  const link = escapeXml(item.url);
  const desc = escapeXml(item.description || item.title);
  return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <description>${desc}</description>
      <guid>${link}</guid>
    </item>`;
};

export const buildRssFeed = (digest) => {
  const items = [
    ...(digest.github?.items || []).map((i) => buildItem(i, "GitHub")),
    ...(digest.hn?.items || []).map((i) => buildItem(i, "HN")),
    ...(digest.devto?.items || []).map((i) => buildItem(i, "Dev.to")),
  ];

  const summaryItem = digest.ai?.summary
    ? `    <item>
      <title>${escapeXml("AI Daily Digest")}</title>
      <description>${escapeXml(digest.ai.summary)}</description>
      <guid>digest-${escapeXml(digest.generatedAt)}</guid>
    </item>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Dev Daily</title>
    <description>Your daily developer digest — GitHub, HN, Dev.to trends</description>
    <lastBuildDate>${new Date(digest.generatedAt).toUTCString()}</lastBuildDate>
${summaryItem}
${items.join("\n")}
  </channel>
</rss>`;
};
