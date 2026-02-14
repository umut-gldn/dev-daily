import { useEffect, useState } from "react";
import { fetchWeekly } from "../services/weekly";

export const useWeekly = (lang) => {
  const [state, setState] = useState({ status: "idle", data: null, error: null });

  useEffect(() => {
    let active = true;
    setState({ status: "loading", data: null, error: null });
    fetchWeekly(lang)
      .then((data) => {
        if (!active) return;
        setState({ status: "success", data, error: null });
      })
      .catch((err) => {
        if (!active) return;
        setState({ status: "error", data: null, error: err.message || "Weekly failed" });
      });
    return () => { active = false; };
  }, [lang]);

  return state;
};

