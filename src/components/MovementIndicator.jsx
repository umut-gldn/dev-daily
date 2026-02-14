import { useTheme } from "../theme";

export const MovementIndicator = ({ movement }) => {
  const { theme } = useTheme();
  if (!movement) return null;

  const styles = {
    new: { color: theme.accent.mint, label: "NEW", icon: "\u2726" },
    rising: { color: theme.accent.amber, label: `\u2191${movement.rankChange}`, icon: "\u25b2" },
    steady: { color: theme.text.muted, label: "\u2014", icon: "" },
  };

  const s = styles[movement.type];
  if (!s || movement.type === "steady") return null;

  return (
    <span style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 10,
      padding: "1px 6px",
      borderRadius: 4,
      color: s.color,
      background: `${s.color}18`,
      letterSpacing: 0.5,
      whiteSpace: "nowrap",
    }}>
      {s.icon} {s.label}
    </span>
  );
};
