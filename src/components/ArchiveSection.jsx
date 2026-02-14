import { useTheme } from "../theme";
import { useI18n } from "../i18n";
import { SectionCard } from "./SectionCard";

export const ArchiveSection = ({ dates, activeDate, activeDigest, status, onSelectDate, onReload }) => {
  const { theme } = useTheme();
  const { t } = useI18n();

  return (
    <SectionCard icon={"⌛"} iconClass="ai" title={t.archive.title} animDelay={0} fullWidth>
      <div style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {dates.length === 0 && (
            <span style={{ fontSize: 12, color: theme.text.muted }}>{t.archive.empty}</span>
          )}
          {dates.map((d) => (
            <button key={d} onClick={() => onSelectDate(d)} style={{
              background: d === activeDate ? theme.accent.mintDim : theme.bg.card,
              border: `1px solid ${d === activeDate ? theme.accent.mintBorder : theme.border.base}`,
              color: d === activeDate ? theme.accent.mint : theme.text.secondary,
              padding: "6px 10px", borderRadius: 8, cursor: "pointer",
              fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600,
            }}>
              {d}
            </button>
          ))}
          <button onClick={onReload} style={{
            background: theme.bg.card,
            border: `1px solid ${theme.border.base}`,
            color: theme.text.secondary,
            padding: "6px 10px", borderRadius: 8, cursor: "pointer",
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600,
          }}>
            {t.archive.refresh}
          </button>
        </div>

        {status === "loading" && (
          <div style={{ fontSize: 12, color: theme.text.muted }}>{t.archive.loading}</div>
        )}
        {status === "error" && (
          <div style={{ fontSize: 12, color: theme.accent.rose }}>{t.archive.error}</div>
        )}
        {activeDigest?.ai?.summary && (
          <div style={{ fontSize: 14, lineHeight: 1.7, color: theme.text.secondary }}>
            {activeDigest.ai.summary}
          </div>
        )}
      </div>
    </SectionCard>
  );
};
