import { useTheme } from "../theme";
import { useI18n } from "../i18n";
import { SectionCard } from "./SectionCard";

const GlanceItem = ({ label, item }) => {
  const { theme } = useTheme();
  if (!item) return null;
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        textDecoration: "none",
        padding: "10px 12px",
        borderRadius: 10,
        border: `1px solid ${theme.border.base}`,
        background: theme.bg.card,
      }}
    >
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11, color: theme.text.muted, marginBottom: 6,
      }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: theme.text.primary, lineHeight: 1.4 }}>
        {item.title}
      </div>
    </a>
  );
};

export const QuickGlance = ({ github, hn, devto }) => {
  const { t } = useI18n();
  return (
    <SectionCard icon={"⚡"} iconClass="ai" title={t.quick.title} animDelay={0} fullWidth>
      <div style={{ display: "grid", gap: 10, padding: "12px 16px" }}>
        <GlanceItem label={t.quick.github} item={github} />
        <GlanceItem label={t.quick.hn} item={hn} />
        <GlanceItem label={t.quick.devto} item={devto} />
      </div>
    </SectionCard>
  );
};
