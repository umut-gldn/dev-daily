import { useEffect } from "react";
import { ThemeProvider, useTheme } from "./theme";
import { I18nProvider, useI18n } from "./i18n";
import { useDigest } from "./hooks/useDigest";
import { useTopics } from "./hooks/useTopics";
import { useArchive } from "./hooks/useArchive";
import { useWeekly } from "./hooks/useWeekly";
import { useAnalytics } from "./hooks/useAnalytics";
import { GlobalStyles } from "./components/GlobalStyles";
import { Header } from "./components/Header";
import { AISummarySection } from "./components/AISummarySection";
import { GitHubSection } from "./components/GitHubSection";
import { HNSection } from "./components/HNSection";
import { DevToSection } from "./components/DevToSection";
import { ArchiveSection } from "./components/ArchiveSection";
import { QuickGlance } from "./components/QuickGlance";
import { TrendsAnalyticsSection } from "./components/TrendsAnalyticsSection";

const SHOW_TRENDS_PANEL = String(import.meta.env.VITE_SHOW_TRENDS_PANEL || "false") === "true";

const AppContent = () => {
  const { theme } = useTheme();
  const { t, lang } = useI18n();
  const [topics, setTopics] = useTopics();

  const { digest, isLoading, status, error, execute } = useDigest(lang, topics);
  const archive = useArchive();
  const weekly = useWeekly(lang);
  const analytics = useAnalytics();

  useEffect(() => {
    const topicText = topics.length > 0 ? ` (${topics.join(", ")})` : "";
    const summary = digest?.ai?.summary;
    const title = `Dev Daily${topicText}`;
    const description = summary
      ? summary.slice(0, 160)
      : "Daily AI-powered dev trends, insights, and learning picks.";
    const url = window.location.href;
    document.title = title;

    const setMeta = (selector, value) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute("content", value);
    };
    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:url"]', url);
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description);
  }, [digest?.ai?.summary, topics]);

  return (
    <>
      <GlobalStyles />
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 20px" }}>
        <Header
          onRefresh={execute}
          isLoading={isLoading}
          topics={topics}
          onTopicsChange={setTopics}
        />
        <div className="dd-layout" style={{ marginBottom: 32 }}>
          <main className="dd-main">
            <AISummarySection
              summary={digest?.ai?.summary}
              learnTopic={digest?.ai?.learnTopic}
              themes={digest?.ai?.themes}
              insight={digest?.ai?.insight}
              isLoading={isLoading}
            />
            {digest?.warnings?.length > 0 && (
              <div style={{
                padding: "8px 16px", marginBottom: 16, borderRadius: 8,
                background: theme.accent.amberDim,
                border: `1px solid ${theme.accent.amberBorder}`,
                fontSize: 12, color: theme.accent.amber,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {digest.warnings.join(" · ")}
              </div>
            )}
            <div className="dd-grid" style={{
              display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 14, marginBottom: 14,
            }}>
              <GitHubSection
                data={digest?.github?.items}
                status={status}
                error={error}
                onRetry={execute}
              />
              <HNSection
                data={digest?.hn?.items}
                status={status}
                error={error}
                onRetry={execute}
              />
              <DevToSection
                data={digest?.devto?.items}
                status={status}
                error={error}
                onRetry={execute}
              />
            </div>
          </main>

          <aside className="dd-sidebar">
            <div className="dd-sidebar-sticky">
              <QuickGlance
                github={digest?.github?.items?.[0]}
                hn={digest?.hn?.items?.[0]}
                devto={digest?.devto?.items?.[0]}
              />
              <ArchiveSection
                dates={archive.dates}
                activeDate={archive.activeDate}
                activeDigest={archive.activeDigest}
                status={archive.status}
                onSelectDate={archive.loadDate}
                onReload={archive.reload}
              />
              {SHOW_TRENDS_PANEL && (
                <TrendsAnalyticsSection
                  trendShift={digest?.ai?.trendShift}
                  analytics={analytics.data}
                  weekly={weekly.data}
                  loading={weekly.status === "loading" || analytics.status === "loading"}
                />
              )}
            </div>
          </aside>
        </div>
        <footer style={{
          textAlign: "center", padding: "32px 0",
          borderTop: `1px solid ${theme.border.base}`,
        }}>
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12, color: theme.text.muted,
          }}>
            Dev Daily {"\u2014"} {t.footer}
          </p>
        </footer>
      </div>
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AppContent />
      </I18nProvider>
    </ThemeProvider>
  );
}
