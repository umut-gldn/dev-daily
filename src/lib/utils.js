import { LANGUAGE_COLORS } from "../config";

export const truncate = (str, maxLen) => {
  if (!str || typeof str !== "string") return "";
  return str.length > maxLen ? `${str.slice(0, maxLen)}\u2026` : str;
};

export const formatNumber = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num) || num < 0) return "0";
  return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : String(num);
};

export const timeAgo = (unixTs) => {
  if (!unixTs || typeof unixTs !== "number") return "";
  const seconds = Math.max(0, Math.floor(Date.now() / 1000 - unixTs));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

export const daysAgoISO = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
};

export const getDisplayDate = (lang) =>
  new Date().toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", {
    weekday: "long", year: "numeric", month: "short", day: "numeric",
  });

export const getLanguageColor = (lang) => LANGUAGE_COLORS[lang] ?? "#8888a0";

export const getHotTag = (score, hotThreshold, risingThreshold) => {
  if (score >= hotThreshold) return { label: "hot", variant: "hot" };
  if (score >= risingThreshold) return { label: "rising", variant: "rising" };
  return null;
};
