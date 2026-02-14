import { useState, useEffect, useCallback } from "react";

const ARCHIVE_URL = "/api/archive";
const DATE_PARAM = "date";

const getDateFromUrl = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const value = params.get(DATE_PARAM);
    return value || null;
  } catch {
    return null;
  }
};

const syncDateToUrl = (date) => {
  try {
    const url = new URL(window.location.href);
    if (date) {
      url.searchParams.set(DATE_PARAM, date);
    } else {
      url.searchParams.delete(DATE_PARAM);
    }
    window.history.replaceState({}, "", url.toString());
  } catch {}
};

export const useArchive = () => {
  const [dates, setDates] = useState([]);
  const [activeDate, setActiveDate] = useState(null);
  const [activeDigest, setActiveDigest] = useState(null);
  const [status, setStatus] = useState("idle");

  const loadDates = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch(ARCHIVE_URL);
      if (!res.ok) throw new Error("Archive index error");
      const data = await res.json();
      setDates(data.dates || []);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, []);

  const loadDate = useCallback(async (date) => {
    if (!date) return;
    setActiveDate(date);
    setActiveDigest(null);
    syncDateToUrl(date);
    setStatus("loading");
    try {
      const res = await fetch(`${ARCHIVE_URL}?date=${date}`);
      if (!res.ok) throw new Error("Archive fetch error");
      const data = await res.json();
      setActiveDigest(data);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const initialDate = getDateFromUrl();
    loadDates().then(() => {
      if (initialDate) loadDate(initialDate);
    });
  }, [loadDates, loadDate]);

  return {
    dates,
    activeDate,
    activeDigest,
    status,
    loadDate,
    reload: loadDates,
  };
};
