import { SERVER_CONFIG } from "./config.js";

const { url: groqUrl, model } = SERVER_CONFIG.api.groq;

const MAX_SUMMARY_WORDS = 42;
const MIN_SUMMARY_WORDS = 24;
const ALLOWED_THEMES = new Set([
  "AI", "Backend", "DevOps", "Mobile", "Security", "Data",
  "Web", "Rust", "Python", "JavaScript", "Go", "Open Source",
]);
const TOPIC_THEME_LABEL = {
  ai: "AI",
  backend: "Backend",
  devops: "DevOps",
  mobile: "Mobile",
  security: "Security",
  data: "Data",
  web: "Web",
  rust: "Rust",
  python: "Python",
  javascript: "JavaScript",
  go: "Go",
  oss: "Open Source",
};

const mapTopicsToThemeLabels = (topics = []) =>
  (topics || [])
    .map((t) => TOPIC_THEME_LABEL[t])
    .filter(Boolean);

const buildPrompt = (githubItems, hnItems, devtoItems, lang, topics, strict = false) => {
  const gh = (githubItems || [])
    .slice(0, 6)
    .map((r) => `${r.title} (${r.meta?.language || "N/A"}, ${r.meta?.stars || "?"}★): ${r.description || "No desc"}`)
    .join("\n");

  const hn = (hnItems || [])
    .slice(0, 6)
    .map((s) => `${s.title} (${s.meta?.points ?? 0} pts)`)
    .join("\n");

  const dt = (devtoItems || [])
    .slice(0, 5)
    .map((a) => `${a.title} (${a.meta?.reactions ?? 0}\u2764): ${a.description || ""}`)
    .join("\n");

  const langInstruction = lang === "tr"
    ? "T\u00dcRK\u00c7E yaz. Samimi ama profesyonel bir ton kullan. Teknik terimleri \u00e7evirme."
    : "Write in ENGLISH. Use a casual but smart tone.";

  const topicContext = topics?.length
    ? `\nThe user is specifically interested in: ${topics.join(", ")}. Tailor your summary, themes, learning pick, and insight to emphasize these interests. Connect the trending items to these topics where relevant. If few items match, note what's trending in those areas generally.`
    : "";

  const strictRules = strict
    ? "\nSTRICT MODE:\n- Output MUST be valid JSON only.\n- Do NOT wrap in markdown or backticks.\n- Use double quotes for all keys and strings.\n- No trailing commas.\n- Do not invent facts; only use the provided items.\n- If you cannot reference item titles, say data is insufficient.\n"
    : "";

  return `You are a senior product editor for developers. Write a daily digest that helps busy engineers decide what to pay attention to now. Based on today's trending data, return ONLY valid JSON (no markdown, no code fences, no explanation) with this exact structure:
{
  "summary": "2-3 sentence summary connecting key themes across sources",
  "themes": ["Theme1", "Theme2", "Theme3", "Theme4"],
  "learnTopic": { "title": "specific topic name", "reason": "1-2 sentence practical explanation of why a developer should learn this today" },
  "insight": "One non-obvious insight or connection between trends that a developer would find valuable"
}

${langInstruction}${topicContext}${strictRules}

GitHub Trending:
${gh || "No data"}

Hacker News Top:
${hn || "No data"}

Dev.to Trending:
${dt || "No data"}

Requirements:
- summary: EXACTLY 2 sentences, 24-42 words total, no line breaks
- summary MUST mention 2 concrete item titles from the lists (verbatim)
- summary sentence 1: what is rising now
- summary sentence 2: why it matters this week for working developers
- themes: exactly 3-4 short tags chosen only from this list: AI, Backend, DevOps, Mobile, Security, Data, Web, Rust, Python, JavaScript, Go, Open Source
- learnTopic: MUST be derived from one of the listed items or their tech (not generic); doable in ~1 hour; reason is 1 sentence with practical outcome
- insight: exactly 1 sentence, non-obvious connection; do not repeat summary; tie two items together
- If data is sparse, be explicit about it rather than guessing
- Do not mention "GitHub", "Hacker News", or "Dev.to" by name
Return ONLY the JSON object.`;
};

const parseResponse = (text) => {
  // Try direct JSON parse
  try {
    const parsed = JSON.parse(text);
    if (parsed.summary) return parsed;
  } catch {}

  // Try extracting JSON from text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.summary) return parsed;
    } catch {}
  }

  // Text fallback
  return {
    summary: text.trim().slice(0, 500),
    themes: [],
    learnTopic: null,
    insight: null,
  };
};

const toWordArray = (text) => String(text || "").trim().split(/\s+/).filter(Boolean);

const clampSummary = (summary, minWords = MIN_SUMMARY_WORDS, maxWords = MAX_SUMMARY_WORDS) => {
  const words = toWordArray(summary);
  if (words.length === 0) return "";
  const picked = words.slice(0, maxWords).join(" ");
  if (picked.length <= 1) return picked;
  if (words.length < minWords) return picked;
  return /[.!?]$/.test(picked) ? picked : `${picked}.`;
};

const normalizeThemes = (themes) => {
  if (!Array.isArray(themes)) return [];
  const uniq = Array.from(
    new Set(
      themes
        .map((t) => String(t || "").trim())
        .filter(Boolean)
    )
  );
  return uniq.filter((t) => ALLOWED_THEMES.has(t)).slice(0, 4);
};

const compactAiResult = (data) => ({
  summary: clampSummary(data?.summary),
  themes: normalizeThemes(data?.themes),
  learnTopic: data?.learnTopic || null,
  insight: data?.insight || null,
});

const alignThemesToSelectedTopics = (ai, topics = []) => {
  if (!topics?.length) return ai;
  const selected = mapTopicsToThemeLabels(topics);
  if (selected.length === 0) return ai;
  const selectedSet = new Set(selected);
  const filtered = (ai?.themes || []).filter((t) => selectedSet.has(t));
  const merged = Array.from(new Set([...filtered, ...selected])).slice(0, 4);
  return { ...ai, themes: merged };
};

const inferThemesFromItems = (githubItems, hnItems, devtoItems) => {
  const corpus = [
    ...(githubItems || []),
    ...(hnItems || []),
    ...(devtoItems || []),
  ]
    .map((i) => `${i.title || ""} ${i.description || ""} ${i.meta?.language || ""}`.toLowerCase())
    .join(" ");

  const scored = Object.entries(SERVER_CONFIG.topicKeywords || {}).map(([topic, keywords]) => {
    let score = 0;
    for (const kw of keywords || []) {
      if (corpus.includes(String(kw).toLowerCase())) score += 1;
    }
    return { topic, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => TOPIC_THEME_LABEL[s.topic])
    .filter(Boolean)
    .slice(0, 4);
};

const buildSafeFallback = (githubItems, hnItems, devtoItems, lang) => {
  const base = buildFallbackSummary(githubItems, hnItems, lang, devtoItems);
  const themes = inferThemesFromItems(githubItems, hnItems, devtoItems);
  return {
    ...base,
    themes: themes.length >= 3 ? themes : base.themes,
  };
};

const isValidAiResult = (data) => {
  if (!data || typeof data.summary !== "string" || data.summary.trim().length < 10) return false;
  if (!Array.isArray(data.themes)) return false;
  if (data.themes.length < 3 || data.themes.length > 4) return false;
  if (!data.learnTopic || typeof data.learnTopic.title !== "string") return false;
  return true;
};

const normalize = (s) => String(s || "").toLowerCase().replace(/\s+/g, " ").trim();

const buildTitleSet = (githubItems, hnItems, devtoItems) => {
  const titles = [
    ...(githubItems || []).map((i) => i.title),
    ...(hnItems || []).map((i) => i.title),
    ...(devtoItems || []).map((i) => i.title),
  ].filter(Boolean);
  return new Set(titles.map(normalize));
};

const summaryHasTwoTitles = (summary, titleSet) => {
  if (!summary || !titleSet || titleSet.size === 0) return false;
  const s = normalize(summary);
  let hits = 0;
  for (const t of titleSet) {
    if (t && s.includes(t)) hits += 1;
    if (hits >= 2) return true;
  }
  return false;
};

const callGroq = async (prompt, temperature, modelName) => {
  const response = await fetch(groqUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: modelName || model,
      max_tokens: 1000,
      temperature,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    let detail = "";
    try {
      const errBody = await response.json();
      detail = errBody?.error?.message || JSON.stringify(errBody);
    } catch {}
    throw new Error(`Groq API error ${response.status}: ${detail}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "";
};

const callGroqWithModels = async (prompt, temperature) => {
  const models = [model, ...(SERVER_CONFIG.api.groq.fallbackModels || [])];
  let lastError = null;
  for (const m of models) {
    try {
      return await callGroq(prompt, temperature, m);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error("Groq call failed");
};

const buildWeeklyPrompt = (dailyDigests, lang) => {
  const daySummaries = (dailyDigests || []).map((d) => {
    const date = d.generatedAt ? new Date(d.generatedAt).toISOString().slice(0, 10) : "unknown";
    const themes = (d.ai?.themes || []).join(", ");
    const learn = d.ai?.learnTopic?.title || "";
    return `${date}: ${themes || "No themes"} | Learn: ${learn || "N/A"}`;
  }).join("\n");

  const langInstruction = lang === "tr"
    ? "TÜRKÇE yaz. Samimi ama profesyonel bir ton kullan. Teknik terimleri çevirme."
    : "Write in ENGLISH. Use a casual but smart tone.";

  return `You are a concise analyst writing a weekly developer trend report. Return ONLY valid JSON with this exact structure:
{
  "summary": "2-3 sentence weekly overview",
  "themes": ["Theme1", "Theme2", "Theme3", "Theme4"],
  "shifts": ["1 sentence about what rose", "1 sentence about what faded"],
  "recommendedFocus": { "title": "specific focus area", "reason": "1-2 sentence practical reason" }
}

${langInstruction}

Daily signals (last 7 days):
${daySummaries || "No data"}

Requirements:
- summary: 2-3 sentences, 30-60 words
- themes: exactly 3-4 short tags, Title Case
- shifts: exactly 2 short sentences
- recommendedFocus: specific and actionable
Return ONLY the JSON object.`;
};

export const fetchWeeklySummary = async (dailyDigests, lang = "en") => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  const prompt = buildWeeklyPrompt(dailyDigests, lang);
  const text = await callGroqWithModels(prompt, 0.4);
  if (!text.trim()) throw new Error("Empty AI response");
  return parseResponse(text);
};

export const buildFallbackSummary = (githubItems, hnItems, lang, devtoItems = []) => {
  const topRepo = githubItems?.[0];
  const topStory = hnItems?.[0];

  if (lang === "tr") {
    const parts = [];
    if (topRepo) parts.push(`Bug\u00fcn \u00f6ne \u00e7\u0131kan repo ${topRepo.title}; ${topRepo.meta?.stars} y\u0131ld\u0131zla geli\u015ftirici ilgisini topluyor.`);
    if (topStory) parts.push(`"${topStory.title}" tart\u0131\u015fmas\u0131n\u0131 10-15 dakikada taramak, bu hafta ekip kararlar\u0131nda hangi konular\u0131n \u00f6ne \u00e7\u0131kt\u0131\u011f\u0131n\u0131 g\u00f6sterir.`);
    return compactAiResult({
      summary: parts.join(" ") || "A\u015fa\u011f\u0131daki trend repolar ve tart\u0131\u015fmalara g\u00f6z at\u0131n.",
      themes: inferThemesFromItems(githubItems, hnItems, devtoItems),
      learnTopic: topRepo
        ? { title: topRepo.title, reason: "Trend projeleri takip etmek sizi g\u00fcncel tutar." }
        : null,
      insight: null,
    });
  }

  const parts = [];
  if (topRepo) parts.push(`Today, ${topRepo.title} is drawing developer attention with ${topRepo.meta?.stars} stars and strong momentum.`);
  if (topStory) parts.push(`Skim "${topStory.title}" for 10-15 minutes to spot what is likely to influence implementation choices this week.`);
  return compactAiResult({
    summary: parts.join(" ") || "Check out today's trending repos and top discussions below.",
    themes: inferThemesFromItems(githubItems, hnItems, devtoItems),
    learnTopic: topRepo
      ? { title: topRepo.title, reason: "Trending OSS projects keep you current." }
      : null,
    insight: null,
  });
};

export const fetchAISummary = async (githubItems, hnItems, devtoItems, lang, topics) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const prompt = buildPrompt(githubItems, hnItems, devtoItems, lang, topics, false);
  const text = await callGroqWithModels(prompt, 0.45);
  if (!text.trim()) throw new Error("Empty AI response");

  const parsed = parseResponse(text);
  const titleSet = buildTitleSet(githubItems, hnItems, devtoItems);
  if (isValidAiResult(parsed) && summaryHasTwoTitles(parsed.summary, titleSet)) {
    return alignThemesToSelectedTopics(compactAiResult(parsed), topics);
  }

  const strictPrompt = buildPrompt(githubItems, hnItems, devtoItems, lang, topics, true);
  const retryText = await callGroqWithModels(strictPrompt, 0.2);
  if (!retryText.trim()) throw new Error("Empty AI response");
  const retried = parseResponse(retryText);
  if (isValidAiResult(retried) && summaryHasTwoTitles(retried.summary, titleSet)) {
    return alignThemesToSelectedTopics(compactAiResult(retried), topics);
  }
  return alignThemesToSelectedTopics(
    buildSafeFallback(githubItems, hnItems, devtoItems, lang),
    topics
  );
};
