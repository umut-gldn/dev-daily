export const CONFIG = Object.freeze({
  api: {
    github: { baseUrl: "https://api.github.com", searchPath: "/search/repositories" },
    hn: { baseUrl: "https://hacker-news.firebaseio.com/v0" },
    devto: { baseUrl: "https://dev.to/api", articlesPath: "/articles" },
  },
  limits: {
    github: 8,
    hn: 8,
    devto: 6,
    descriptionMaxLength: 120,
    retryAttempts: 2,
    retryDelayMs: 1000,
    fetchTimeoutMs: 10000,
  },
  cache: { ttlMs: 5 * 60 * 1000 },
});

export const LANGUAGE_COLORS = Object.freeze({
  JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5",
  Rust: "#dea584", Go: "#00ADD8", Java: "#b07219",
  "C++": "#f34b7d", C: "#555555", Ruby: "#701516",
  Swift: "#F05138", Kotlin: "#A97BFF", Dart: "#00B4AB",
  PHP: "#4F5D95", "C#": "#178600", Zig: "#ec915c",
  Elixir: "#6e4a7e", Lua: "#000080", Shell: "#89e051",
  HTML: "#e34c26", CSS: "#563d7c", Vue: "#41b883",
  Svelte: "#ff3e00", "Jupyter Notebook": "#DA5B0B",
});
