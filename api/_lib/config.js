export const SERVER_CONFIG = Object.freeze({
  api: {
    github: {
      baseUrl: "https://api.github.com",
      searchPath: "/search/repositories",
    },
    hn: {
      baseUrl: "https://hacker-news.firebaseio.com/v0",
    },
    devto: {
      baseUrl: "https://dev.to/api",
      articlesPath: "/articles",
    },
    groq: {
      url: "https://api.groq.com/openai/v1/chat/completions",
      model: "llama-3.3-70b-versatile",
      fallbackModels: ["openai/gpt-oss-20b", "llama-3.1-8b-instant"],
    },
  },
  limits: {
    github: 8,
    hn: 8,
    devto: 6,
    descriptionMaxLength: 120,
    fetchTimeoutMs: 10000,
    retryAttempts: 2,
    retryDelayMs: 1000,
  },
  cache: {
    digestTtlMs: 10 * 60 * 1000,
    snapshotTtlMs: 24 * 60 * 60 * 1000,
  },
  rateLimit: {
    windowMs: 60 * 1000,
    maxRequests: 30,
  },
  languageColors: {
    JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5",
    Rust: "#dea584", Go: "#00ADD8", Java: "#b07219",
    "C++": "#f34b7d", C: "#555555", Ruby: "#701516",
    Swift: "#F05138", Kotlin: "#A97BFF", Dart: "#00B4AB",
    PHP: "#4F5D95", "C#": "#178600", Zig: "#ec915c",
    Elixir: "#6e4a7e", Lua: "#000080", Shell: "#89e051",
    HTML: "#e34c26", CSS: "#563d7c", Vue: "#41b883",
    Svelte: "#ff3e00", "Jupyter Notebook": "#DA5B0B",
  },
  topics: [
    "ai", "web", "backend", "devops", "mobile", "rust",
    "python", "javascript", "go", "security", "data", "oss",
  ],
  topicKeywords: {
    ai: ["ai", "llm", "gpt", "machine learning", "neural", "deep learning", "transformer", "openai", "langchain", "ml", "model", "chatgpt", "diffusion", "agent"],
    web: ["react", "vue", "angular", "next", "nuxt", "svelte", "frontend", "css", "html", "web", "browser", "tailwind", "remix", "astro", "vite"],
    backend: ["api", "server", "database", "microservice", "backend", "rest", "graphql", "grpc", "express", "fastapi", "django", "spring", "postgres", "redis"],
    devops: ["docker", "kubernetes", "k8s", "ci", "cd", "terraform", "aws", "cloud", "deploy", "infrastructure", "devops", "jenkins", "github actions", "ansible"],
    mobile: ["ios", "android", "flutter", "react native", "swift", "kotlin", "mobile", "app store", "xcode"],
    rust: ["rust", "cargo", "rustc", "tokio", "wasm", "webassembly"],
    python: ["python", "pip", "django", "flask", "fastapi", "pandas", "numpy", "pytorch", "jupyter"],
    javascript: ["javascript", "typescript", "node", "deno", "bun", "npm", "js", "ts", "ecmascript"],
    go: ["go", "golang", "goroutine", "gin", "fiber"],
    security: ["security", "vulnerability", "cve", "exploit", "encryption", "auth", "hack", "cyber", "malware", "zero-day", "pentest"],
    data: ["database", "sql", "nosql", "postgres", "mongo", "redis", "analytics", "data", "etl", "spark", "warehouse", "pipeline"],
    oss: ["open source", "oss", "license", "community", "contributor", "fork", "maintainer", "apache", "mit license"],
  },
});
