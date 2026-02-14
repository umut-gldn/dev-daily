import { useState, useCallback, useRef, useEffect } from "react";
import { fetchDigest } from "../services/digest";

export const useDigest = (lang, topics) => {
  const [state, setState] = useState({
    status: "idle",
    data: null,
    error: null,
  });

  const activeRef = useRef(true);
  const hasInitialized = useRef(false);

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, status: "loading", error: null }));
    activeRef.current = true;
    try {
      const result = await fetchDigest(lang, topics);
      if (!activeRef.current) return;
      setState({ status: "success", data: result, error: null });
    } catch (error) {
      if (!activeRef.current) return;
      setState({ status: "error", data: null, error: error.message });
    }
  }, [lang, topics]);

  // Fetch on mount and when lang/topics change
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      execute();
      return;
    }
    // Re-fetch when lang or topics change
    execute();
  }, [execute]);

  useEffect(() => () => { activeRef.current = false; }, []);

  return {
    ...state,
    execute,
    isLoading: state.status === "loading",
    digest: state.data,
  };
};
