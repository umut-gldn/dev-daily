import { useEffect, useState } from "react";
import { fetchAnalytics } from "../services/analytics";

export const useAnalytics = () => {
  const [state, setState] = useState({ status: "idle", data: null, error: null });

  useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, status: "loading", error: null }));
    fetchAnalytics()
      .then((data) => {
        if (!active) return;
        setState({ status: "success", data, error: null });
      })
      .catch((err) => {
        if (!active) return;
        setState({ status: "error", data: null, error: err.message || "Analytics failed" });
      });
    return () => { active = false; };
  }, []);

  return state;
};

