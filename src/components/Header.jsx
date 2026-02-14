import { useState } from "react";
import { useTheme } from "../theme";
import { useI18n } from "../i18n";
import { getDisplayDate } from "../lib/utils";
import { TopicSelector } from "./TopicSelector";

const SOURCE_DOT_COLORS = { github: "mint", hn: "amber", devto: "sky" };

const ToggleButton = ({ onClick, title, children, isActive }) => {
  const { theme } = useTheme();
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? theme.bg.cardHover : theme.bg.card,
        border: `1px solid ${hovered ? theme.border.glow : theme.border.base}`,
        color: isActive ? theme.accent.amber : theme.text.secondary,
        height: 38, borderRadius: 10, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 600, transition: "all 0.25s",
        fontFamily: "'JetBrains Mono', monospace",
        padding: "0 12px", gap: 4, whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
};

const LinkButton = ({ href, title, children }) => {
  const { theme } = useTheme();
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? theme.bg.cardHover : theme.bg.card,
        border: `1px solid ${hovered ? theme.border.glow : theme.border.base}`,
        color: theme.text.secondary,
        height: 38, borderRadius: 10, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 600, transition: "all 0.25s",
        fontFamily: "'JetBrains Mono', monospace",
        padding: "0 12px", gap: 6, whiteSpace: "nowrap",
        textDecoration: "none",
      }}
    >
      {children}
    </a>
  );
};

export const Header = ({ onRefresh, isLoading, topics, onTopicsChange }) => {
  const { theme, themeId, toggleTheme } = useTheme();
  const { t, lang, toggleLang } = useI18n();

  return (
    <header style={{
      padding: "40px 0 30px",
      borderBottom: `1px solid ${theme.border.base}`,
      marginBottom: 32,
      animation: "fadeInDown 0.6s ease-out",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 44, height: 44,
            background: `linear-gradient(135deg, ${theme.accent.mint}, ${theme.accent.sky})`,
            borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
            color: theme.bg.primary, boxShadow: `0 0 24px ${theme.accent.mintDim}`,
          }}>D.</div>
        <div>
          <h1 style={{
            fontSize: 26, fontWeight: 800, letterSpacing: -0.5,
            color: theme.text.primary, transition: "color 0.35s ease",
          }}>Dev Daily</h1>
          <p style={{
            fontSize: 13, color: theme.text.muted,
            fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1,
          }}>{t.subtitle}</p>
          <p style={{
            fontSize: 13, color: theme.text.secondary, marginTop: 6, maxWidth: 520,
            lineHeight: 1.5,
          }}>
            {t.blurb}
          </p>
        </div>
      </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
            color: theme.accent.mint, background: theme.accent.mintDim,
            padding: "8px 14px", borderRadius: 8,
            border: `1px solid ${theme.accent.mintBorder}`,
          }}>{getDisplayDate(lang)}</div>
          <ToggleButton onClick={toggleLang} title="Switch language">
            {lang === "en" ? "\ud83c\uddf9\ud83c\uddf7 TR" : "\ud83c\uddec\ud83c\udde7 EN"}
          </ToggleButton>
          <ToggleButton
            onClick={toggleTheme}
            title={`Switch to ${themeId === "dark" ? "light" : "dark"} mode`}
            isActive
          >
            {themeId === "dark" ? "\u2600" : "\u263d"}
          </ToggleButton>
          <LinkButton href="/api/rss" title={t.rssHint}>
            {"\u27f3"} {t.rss}
          </LinkButton>
          <button onClick={onRefresh} disabled={isLoading} style={{
            background: theme.bg.card,
            border: `1px solid ${theme.border.base}`,
            color: theme.text.secondary,
            padding: "8px 16px", borderRadius: 10,
            cursor: isLoading ? "not-allowed" : "pointer",
            fontFamily: "'Outfit', sans-serif",
            fontSize: 13, fontWeight: 500,
            display: "flex", alignItems: "center", gap: 6,
            transition: "all 0.25s",
            opacity: isLoading ? 0.6 : 1,
          }}>
            <span style={{
              display: "inline-block",
              animation: isLoading ? "spin 1s linear infinite" : "none",
            }}>{"\u21bb"}</span>
            {isLoading ? t.loading : t.refresh}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap", alignItems: "center" }}>
        {["github", "hn", "devto"].map((key) => {
          const colorKey = SOURCE_DOT_COLORS[key];
          return (
            <div key={key} style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
              padding: "5px 12px", borderRadius: 20,
              background: theme.bg.card,
              border: `1px solid ${theme.border.base}`,
              color: theme.text.muted,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%", display: "inline-block",
                background: theme.accent[colorKey],
                boxShadow: `0 0 6px ${theme.accent[colorKey]}`,
              }} />
              {t.sources[key]}
            </div>
          );
        })}
      </div>

      {onTopicsChange && (
        <div style={{ marginTop: 16 }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
            color: theme.text.muted, marginBottom: 8, textTransform: "uppercase",
            letterSpacing: 1,
          }}>
            {t.topicsLabel || "INTERESTS"}
          </div>
          <TopicSelector selected={topics || []} onChange={onTopicsChange} />
        </div>
      )}
    </header>
  );
};
