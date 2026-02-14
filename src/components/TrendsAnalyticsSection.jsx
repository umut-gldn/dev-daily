import { SectionCard } from "./SectionCard";
import { SkeletonLoader } from "./ui";
import { useTheme } from "../theme";
import { useI18n } from "../i18n";

const ShiftBadge = ({ item }) => {
  const { theme } = useTheme();
  const day = item.dayDelta > 0 ? `+${item.dayDelta}` : `${item.dayDelta}`;
  const weekPct = `${Math.round((item.weekDelta || 0) * 100)}%`;
  return (
    <span style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 10,
      borderRadius: 6,
      padding: "2px 8px",
      background: theme.accent.mintDim,
      border: `1px solid ${theme.accent.mintBorder}`,
      color: theme.accent.mint,
      whiteSpace: "nowrap",
    }}>
      {`d:${day} w:${weekPct}`}
    </span>
  );
};

export const TrendsAnalyticsSection = ({ trendShift, analytics, weekly, loading }) => {
  const { theme } = useTheme();
  const { t } = useI18n();
  const top = analytics?.top || [];
  const shifts = trendShift?.length ? trendShift : (weekly?.trendShift || []);

  return (
    <SectionCard icon={"↗"} iconClass="ai" title={t.trends.title} animDelay={0.05} fullWidth>
      {loading ? (
        <div style={{ padding: "8px 12px" }}>
          <SkeletonLoader lines={4} />
        </div>
      ) : (
        <div style={{
          padding: "12px 16px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 12,
        }}>
          {weekly?.ai?.summary && (
            <div style={{
              gridColumn: "1 / -1",
              border: `1px solid ${theme.border.base}`,
              borderRadius: 10,
              background: theme.bg.primary,
              padding: 12,
              fontSize: 13,
              color: theme.text.secondary,
              lineHeight: 1.6,
            }}>
              {weekly.ai.summary}
            </div>
          )}
          <div style={{
            border: `1px solid ${theme.border.base}`,
            borderRadius: 10,
            background: theme.bg.primary,
            padding: 12,
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: theme.text.muted,
              marginBottom: 10,
            }}>
              {t.trends.shiftTitle}
            </div>
            <div style={{ fontSize: 12, color: theme.text.muted, marginBottom: 10, lineHeight: 1.5 }}>
              {t.trends.shiftHint}
            </div>
            {shifts.length === 0 && (
              <div style={{ fontSize: 13, color: theme.text.muted }}>{t.trends.emptyShift}</div>
            )}
            <div style={{ display: "grid", gap: 8 }}>
              {shifts.slice(0, 6).map((s) => (
                <div key={s.theme} style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                }}>
                  <span style={{ fontSize: 13, color: theme.text.secondary }}>{s.theme}</span>
                  <ShiftBadge item={s} />
                </div>
              ))}
            </div>
          </div>

          <div style={{
            border: `1px solid ${theme.border.base}`,
            borderRadius: 10,
            background: theme.bg.primary,
            padding: 12,
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: theme.text.muted,
              marginBottom: 10,
            }}>
              {t.trends.analyticsTitle}
            </div>
            <div style={{ fontSize: 12, color: theme.text.muted, marginBottom: 10, lineHeight: 1.5 }}>
              {t.trends.analyticsHint}
            </div>
            {top.length === 0 && (
              <div style={{ fontSize: 13, color: theme.text.muted }}>{t.trends.emptyAnalytics}</div>
            )}
            <div style={{ display: "grid", gap: 8 }}>
              {top.slice(0, 5).map((item) => (
                <a
                  key={`${item.source}:${item.id}`}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: "none",
                    border: `1px solid ${theme.border.base}`,
                    borderRadius: 8,
                    padding: "8px 10px",
                    background: theme.bg.card,
                    color: theme.text.secondary,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: theme.text.primary }}>
                    {item.title}
                  </div>
                  <div style={{
                    marginTop: 4,
                    fontSize: 11,
                    color: theme.text.muted,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {item.source} · {item.count} {t.trends.clicks}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
};
