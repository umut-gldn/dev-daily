import { useState } from "react";
import { useTheme } from "../theme";
import { useI18n } from "../i18n";
import { SectionCard } from "./SectionCard";
import { TagCloud } from "./TagCloud";

export const AISummarySection = ({ summary, learnTopic, themes, insight, isLoading }) => {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [shareStatus, setShareStatus] = useState("idle");

  const buildShareText = () => {
    const parts = [];
    if (summary) parts.push(summary);
    if (learnTopic) {
      const title = typeof learnTopic === "string" ? learnTopic : learnTopic.title;
      parts.push(`${t.ai.learnTitle}: ${title}`);
    }
    if (insight) parts.push(`${t.ai.insightLabel}: ${insight}`);
    return parts.join("\n");
  };

  const handleShare = async () => {
    if (!summary || isLoading) return;
    const text = buildShareText();
    const shareData = { title: "Dev Daily", text, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareStatus("shared");
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
        setShareStatus("copied");
        return;
      }
      setShareStatus("failed");
    } catch {
      setShareStatus("failed");
    } finally {
      setTimeout(() => setShareStatus("idle"), 2000);
    }
  };
  return (
    <SectionCard icon={"\u2726"} iconClass="ai" title={t.ai.title} animDelay={0} fullWidth>
      <div style={{ padding: "12px 16px" }}>
        {isLoading ? (
          <div style={{
            fontSize: 14, lineHeight: 1.7, color: theme.text.secondary,
            paddingLeft: 20, position: "relative",
          }}>
            <span style={{
              position: "absolute", left: 0, color: theme.accent.mint,
              fontFamily: "'JetBrains Mono', monospace",
              animation: "blink 0.7s step-end infinite",
            }}>{"\u258c"}</span>
            {t.ai.analyzing}
          </div>
        ) : (
          <>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 10, gap: 8, flexWrap: "wrap",
            }}>
              <TagCloud themes={themes} />
              <button onClick={handleShare} disabled={!summary} style={{
                background: theme.bg.card,
                border: `1px solid ${theme.border.base}`,
                color: theme.text.secondary,
                padding: "6px 10px", borderRadius: 8,
                cursor: summary ? "pointer" : "not-allowed",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 6,
                transition: "all 0.25s",
                opacity: summary ? 1 : 0.6,
              }}>
                {"\u2197"} {shareStatus === "copied"
                  ? t.ai.copied
                  : shareStatus === "shared"
                    ? t.ai.shared
                    : shareStatus === "failed"
                      ? t.ai.shareFailed
                      : t.ai.share}
              </button>
            </div>
            <div style={{
              fontSize: 14, lineHeight: 1.7, color: theme.text.secondary,
              paddingLeft: 20, position: "relative",
            }}>
              <span style={{
                position: "absolute", left: 0, color: theme.accent.mint,
                fontFamily: "'JetBrains Mono', monospace",
              }}>&gt;</span>
              {summary}
            </div>
            {insight && (
              <div style={{
                marginTop: 12, padding: "10px 16px",
                borderLeft: `2px solid ${theme.accent.sky}`,
                fontSize: 13, lineHeight: 1.6, color: theme.text.secondary,
                fontStyle: "italic",
              }}>
                {insight}
              </div>
            )}
            {learnTopic && (
              <div style={{
                marginTop: 16, padding: 16,
                background: theme.accent.mintDim,
                border: `1px solid ${theme.accent.mintBorder}`,
                borderRadius: 10,
              }}>
                <h4 style={{
                  fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
                  color: theme.accent.mint, marginBottom: 8,
                  textTransform: "uppercase", letterSpacing: 1,
                }}>{t.ai.learnTitle}</h4>
                <p style={{ fontSize: 14, fontWeight: 600, color: theme.text.primary, marginBottom: 4 }}>
                  {typeof learnTopic === "string" ? learnTopic : learnTopic.title}
                </p>
                {typeof learnTopic === "object" && learnTopic.reason && (
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: theme.text.secondary }}>
                    {learnTopic.reason}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </SectionCard>
  );
};
