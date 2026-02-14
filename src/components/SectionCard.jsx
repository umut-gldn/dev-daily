import { useTheme } from "../theme";
import { SectionIcon } from "./ui";

export const SectionCard = ({ icon, iconClass, title, badge, children, animDelay = 0, fullWidth = false }) => {
  const { theme } = useTheme();
  return (
    <div style={{
      background: theme.bg.card,
      border: `1px solid ${theme.border.base}`,
      borderRadius: 16,
      overflow: "hidden",
      animation: `fadeInUp 0.6s ease-out ${animDelay}s both`,
      gridColumn: fullWidth ? "1 / -1" : undefined,
      transition: "background 0.35s, border-color 0.35s",
    }}>
      <div style={{
        padding: "16px 18px",
        borderBottom: `1px solid ${theme.border.base}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <SectionIcon icon={icon} variant={iconClass} />
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, letterSpacing: -0.2, color: theme.text.primary }}>
              {title}
            </h2>
            {badge && (
              <p style={{
                marginTop: 3,
                fontSize: 12,
                color: theme.text.muted,
                lineHeight: 1.3,
              }}>
                {badge}
              </p>
            )}
          </div>
        </div>
      </div>
      <div style={{ padding: 6 }}>{children}</div>
    </div>
  );
};
