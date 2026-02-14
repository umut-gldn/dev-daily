import { useTheme } from "../theme";

export const TagCloud = ({ themes }) => {
  const { theme } = useTheme();
  if (!themes || themes.length === 0) return null;

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
      {themes.map((t) => (
        <span key={t} style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          padding: "3px 10px",
          borderRadius: 20,
          background: theme.accent.skyDim,
          color: theme.accent.sky,
          border: `1px solid ${theme.accent.skyBorder}`,
          letterSpacing: 0.3,
        }}>
          {t}
        </span>
      ))}
    </div>
  );
};
