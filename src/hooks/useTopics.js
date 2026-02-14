import { useState, useCallback } from "react";

const STORAGE_KEY = "devdaily:topics";
const PARAM_KEY = "topics";

const parseTopicParam = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get(PARAM_KEY);
    if (!raw) return null;
    const parsed = raw.split(",").map((v) => v.trim()).filter(Boolean);
    return parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
};

const loadTopics = () => {
  const fromUrl = parseTopicParam();
  if (fromUrl) return fromUrl;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
};

const saveTopics = (topics) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
  } catch {}
  try {
    const url = new URL(window.location.href);
    if (topics?.length) {
      url.searchParams.set(PARAM_KEY, topics.join(","));
    } else {
      url.searchParams.delete(PARAM_KEY);
    }
    window.history.replaceState({}, "", url.toString());
  } catch {}
};

export const useTopics = () => {
  const [topics, setTopicsRaw] = useState(loadTopics);

  const setTopics = useCallback((next) => {
    const value = typeof next === "function" ? next(topics) : next;
    setTopicsRaw(value);
    saveTopics(value);
  }, [topics]);

  return [topics, setTopics];
};
