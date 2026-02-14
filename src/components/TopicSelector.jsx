import { useState } from "react";
import { useTheme } from "../theme";
import { useI18n } from "../i18n";

const ALL_TOPICS = [
  "ai", "web", "backend", "devops", "mobile", "rust",
  "python", "javascript", "go", "security", "data", "oss",
];

export const TopicSelector = ({ selected, onChange }) => {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [hovered, setHovered] = useState(null);

  const toggle = (topic) => {
    if (selected.includes(topic)) {
      onChange(selected.filter((t) => t !== topic));
    } else {
      onChange([...selected, topic]);
    }
  };

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {ALL_TOPICS.map((topic) => {
        const isActive = selected.includes(topic);
        const isHovered = hovered === topic;
        return (
          <button
            key={topic}
            onClick={() => toggle(topic)}
            onMouseEnter={() => setHovered(topic)}
            onMouseLeave={() => setHovered(null)}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              padding: "5px 12px",
              borderRadius: 20,
              cursor: "pointer",
              border: `1px solid ${isActive ? theme.accent.mintBorder : isHovered ? theme.border.glow : theme.border.base}`,
              background: isActive ? theme.accent.mintDim : isHovered ? theme.bg.cardHover : theme.bg.card,
              color: isActive ? theme.accent.mint : isHovered ? theme.text.secondary : theme.text.muted,
              transition: "all 0.2s",
              fontWeight: isActive ? 600 : 400,
            }}
          >
            {t.topics?.[topic] || topic}
          </button>
        );
      })}
    </div>
  );
};
