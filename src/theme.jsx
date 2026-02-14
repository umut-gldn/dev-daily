import { createContext, useContext, useState, useCallback } from "react";

const themes = Object.freeze({
  dark: {
    id: "dark",
    bg: { primary: "#131218", secondary: "#1a1921", card: "#201f29", cardHover: "#2a2935" },
    border: { base: "#2e2d3a", glow: "#3d3c4d" },
    text: { primary: "#eae9f0", secondary: "#9e9bab", muted: "#6b687a" },
    accent: {
      mint: "#6ee7b7", mintDim: "#6ee7b720", mintBorder: "#6ee7b735",
      sky: "#7dd3fc", skyDim: "#7dd3fc20", skyBorder: "#7dd3fc35",
      amber: "#fcd34d", amberDim: "#fcd34d20", amberBorder: "#fcd34d35",
      violet: "#c4b5fd", violetDim: "#c4b5fd20", violetBorder: "#c4b5fd35",
      rose: "#fda4af", roseDim: "#fda4af20",
    },
  },
  light: {
    id: "light",
    bg: { primary: "#f8f7fc", secondary: "#efedf5", card: "#ffffff", cardHover: "#f3f1f9" },
    border: { base: "#dddae6", glow: "#c8c4d6" },
    text: { primary: "#1c1a27", secondary: "#5c596e", muted: "#908da2" },
    accent: {
      mint: "#059669", mintDim: "#05966914", mintBorder: "#0596692a",
      sky: "#0284c7", skyDim: "#0284c714", skyBorder: "#0284c72a",
      amber: "#b45309", amberDim: "#b4530914", amberBorder: "#b453092a",
      violet: "#7c3aed", violetDim: "#7c3aed14", violetBorder: "#7c3aed2a",
      rose: "#e11d48", roseDim: "#e11d4814",
    },
  },
});

const ThemeContext = createContext(null);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};

const getInitialTheme = () => {
  try {
    return window.matchMedia?.("(prefers-color-scheme: light)")?.matches ? "light" : "dark";
  } catch {
    return "dark";
  }
};

export const ThemeProvider = ({ children }) => {
  const [themeId, setThemeId] = useState(getInitialTheme);
  const theme = themes[themeId];
  const toggle = useCallback(() => setThemeId((p) => (p === "dark" ? "light" : "dark")), []);
  return (
    <ThemeContext.Provider value={{ theme, themeId, toggleTheme: toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};
