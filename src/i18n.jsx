import { createContext, useContext, useState, useCallback } from "react";

const translations = Object.freeze({
  en: {
    subtitle: "YOUR DAILY DEVELOPER DIGEST",
    blurb: "A 3-minute scan of what devs are building, debating, and learning today.",
    quick: {
      title: "Quick Glance",
      badge: "top picks",
      github: "Top Repo",
      hn: "Top Discussion",
      devto: "Top Article",
    },
    refresh: "Refresh",
    loading: "Loading\u2026",
    tryAgain: "Try Again",
    github: { title: "GitHub Trending", badge: "today" },
    hn: { title: "Hacker News", badge: "top stories" },
    devto: { title: "Dev.to Trending", badge: "this week" },
    hints: {
      github: "What’s rising in open source",
      hn: "What the community is debating",
      devto: "Practical reads from devs",
    },
    ai: {
      title: "AI Daily Digest",
      badge: "powered by llama",
      analyzing: "Analyzing today\u2019s developer trends\u2026",
      learnTitle: "\ud83d\udcda Today\u2019s Learning Pick",
      insightLabel: "Insight",
      share: "Share",
      shared: "Shared",
      copied: "Copied",
      shareFailed: "Failed",
    },
    sources: { github: "GitHub Trending", hn: "Hacker News", devto: "Dev.to Articles" },
    footer: "Built with \u2665 by Umut \u00b7 Data from GitHub, HN & Dev.to",
    topicsLabel: "INTERESTS",
    rss: "RSS",
    rssHint: "Open RSS feed",
    archive: {
      title: "Daily Archive",
      badge: "past days",
      empty: "No archived days yet",
      loading: "Loading archive…",
      error: "Archive unavailable",
      refresh: "Refresh",
    },
    trends: {
      title: "Trends and Analytics",
      badge: "movement",
      shiftTitle: "Theme shift (vs yesterday/week)",
      emptyShift: "Not enough data yet for trend shifts.",
      analyticsTitle: "Most clicked repos/topics",
      emptyAnalytics: "No click analytics yet.",
      shiftHint: "Shows which themes are gaining momentum compared with yesterday and the recent week.",
      analyticsHint: "Shows what users actually open, so you can tune what to highlight next.",
      clicks: "clicks",
    },
    topics: {
      ai: "AI", web: "Web", backend: "Backend", devops: "DevOps",
      mobile: "Mobile", rust: "Rust", python: "Python",
      javascript: "JavaScript", go: "Go", security: "Security",
      data: "Data", oss: "OSS",
    },
    movement: {
      new: "NEW",
      rising: "Rising",
      steady: "Steady",
    },
    errors: {
      timeout: (src) => `${src} is taking too long to respond. Please try again.`,
      rateLimit: (src) => `${src} rate limit reached. Please wait a moment and retry.`,
      notFound: (src) => `${src} data is temporarily unavailable.`,
      server: (src) => `${src} is experiencing issues. Please try again later.`,
      network: (src) => `Could not reach ${src}. Check your connection and retry.`,
      generic: (src) => `Something went wrong loading ${src}. Please try again.`,
    },
    meta: { pts: "pts", by: "by" },
  },
  tr: {
    subtitle: "G\u00dcNL\u00dcK GEL\u0130\u015eT\u0130R\u0130C\u0130 \u00d6ZET\u0130N",
    blurb: "Geli\u015ftiricilerin bug\u00fcn ne yapt\u0131\u011f\u0131, ne konu\u015ftu\u011fu ve ne \u00f6\u011frendi\u011fi \u2014 3 dakikada.",
    quick: {
      title: "H\u0131zl\u0131 Bak\u0131\u015f",
      badge: "\u00f6ne \u00e7\u0131kanlar",
      github: "En Pop\u00fcler Repo",
      hn: "En \u00c7ok Tart\u0131\u015f\u0131lan",
      devto: "\u00d6ne \u00c7\u0131kan Makale",
    },
    refresh: "Yenile",
    loading: "Y\u00fckleniyor\u2026",
    tryAgain: "Tekrar Dene",
    github: { title: "GitHub Trend", badge: "bug\u00fcn" },
    hn: { title: "Hacker News", badge: "en pop\u00fcler" },
    devto: { title: "Dev.to Trend", badge: "bu hafta" },
    hints: {
      github: "A\u00e7\u0131k kaynaktaki y\u00fckselenler",
      hn: "Toplulu\u011fun tart\u0131\u015ft\u0131klar\u0131",
      devto: "Geli\u015ftiricilerden pratik okumalar",
    },
    ai: {
      title: "AI G\u00fcnl\u00fck \u00d6zet",
      badge: "llama ile",
      analyzing: "G\u00fcn\u00fcn geli\u015ftirici trendleri analiz ediliyor\u2026",
      learnTitle: "\ud83d\udcda Bug\u00fcn \u00d6\u011frenilecek Konu",
      insightLabel: "\u0130\u00e7g\u00f6r\u00fc",
      share: "Payla\u015f",
      shared: "Payla\u015f\u0131ld\u0131",
      copied: "Kopyaland\u0131",
      shareFailed: "Hata",
    },
    sources: { github: "GitHub Trend", hn: "Hacker News", devto: "Dev.to Makaleler" },
    footer: "Umut taraf\u0131ndan \u2665 ile yap\u0131ld\u0131 \u00b7 Veriler: GitHub, HN & Dev.to",
    topicsLabel: "\u0130LG\u0130 ALANLARI",
    rss: "RSS",
    rssHint: "RSS ak\u0131\u015f\u0131n\u0131 a\u00e7",
    archive: {
      title: "G\u00fcnl\u00fck Ar\u015fiv",
      badge: "ge\u00e7mi\u015f g\u00fcnler",
      empty: "Hen\u00fcz ar\u015fiv yok",
      loading: "Ar\u015fiv y\u00fckleniyor\u2026",
      error: "Ar\u015fiv kullan\u0131lam\u0131yor",
      refresh: "Yenile",
    },
    trends: {
      title: "Trend ve Analitik",
      badge: "hareket",
      shiftTitle: "Tema de\u011fi\u015fimi (d\u00fcn/hafta)",
      emptyShift: "Trend de\u011fi\u015fimi i\u00e7in hen\u00fcz yeterli veri yok.",
      analyticsTitle: "En \u00e7ok t\u0131klanan repo/konular",
      emptyAnalytics: "Hen\u00fcz t\u0131klama analiti\u011fi yok.",
      shiftHint: "Temalar\u0131n d\u00fcne ve son haftaya g\u00f6re ivmesini g\u00f6sterir.",
      analyticsHint: "Kullan\u0131c\u0131lar\u0131n ger\u00e7ekte neye t\u0131klad\u0131\u011f\u0131n\u0131 g\u00f6sterir; sonraki g\u00fcn neyi \u00f6ne \u00e7\u0131karaca\u011f\u0131n\u0131z\u0131 belirler.",
      clicks: "t\u0131klama",
    },
    topics: {
      ai: "Yapay Zeka", web: "Web", backend: "Backend", devops: "DevOps",
      mobile: "Mobil", rust: "Rust", python: "Python",
      javascript: "JavaScript", go: "Go", security: "G\u00fcvenlik",
      data: "Veri", oss: "A\u00e7\u0131k Kaynak",
    },
    movement: {
      new: "YEN\u0130",
      rising: "Y\u00fckseliyor",
      steady: "Sabit",
    },
    errors: {
      timeout: (src) => `${src} yan\u0131t vermekte gecikiyor. L\u00fctfen tekrar deneyin.`,
      rateLimit: (src) => `${src} istek limiti a\u015f\u0131ld\u0131. Biraz bekleyip tekrar deneyin.`,
      notFound: (src) => `${src} verileri ge\u00e7ici olarak kullan\u0131lam\u0131yor.`,
      server: (src) => `${src} \u015fu an sorun ya\u015f\u0131yor. Daha sonra tekrar deneyin.`,
      network: (src) => `${src} sunucusuna ula\u015f\u0131lam\u0131yor. Ba\u011flant\u0131n\u0131z\u0131 kontrol edin.`,
      generic: (src) => `${src} y\u00fcklenirken bir sorun olu\u015ftu. L\u00fctfen tekrar deneyin.`,
    },
    meta: { pts: "puan", by: "" },
  },
});

const I18nContext = createContext(null);

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};

const getInitialLang = () => {
  try {
    return navigator.language?.slice(0, 2) === "tr" ? "tr" : "en";
  } catch {
    return "en";
  }
};

export const I18nProvider = ({ children }) => {
  const [lang, setLang] = useState(getInitialLang);
  const t = translations[lang];
  const toggle = useCallback(() => setLang((p) => (p === "en" ? "tr" : "en")), []);
  return (
    <I18nContext.Provider value={{ t, lang, toggleLang: toggle }}>
      {children}
    </I18nContext.Provider>
  );
};
