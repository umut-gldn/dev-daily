import { useState } from "react";
import { useTheme } from "../theme";
import { useI18n } from "../i18n";
import { MovementIndicator } from "./MovementIndicator";

// ── Tag ──

const TAG_VARIANTS = {
  hot: (theme) => ({ bg: theme.accent.roseDim, color: theme.accent.rose, border: `1px solid ${theme.accent.rose}44` }),
  new: (theme) => ({ bg: theme.accent.mintDim, color: theme.accent.mint, border: `1px solid ${theme.accent.mintBorder}` }),
  rising: (theme) => ({ bg: theme.accent.amberDim, color: theme.accent.amber, border: `1px solid ${theme.accent.amberBorder}` }),
};

export const Tag = ({ label, variant }) => {
  const { theme } = useTheme();
  const s = (TAG_VARIANTS[variant] || TAG_VARIANTS.new)(theme);
  return (
    <span style={{
      fontFamily: "'JetBrains Mono', monospace", fontSize: 10, padding: "2px 8px",
      borderRadius: 4, textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap",
      background: s.bg, color: s.color, border: s.border,
    }}>{label}</span>
  );
};

// ── SkeletonLoader ──

export const SkeletonLoader = ({ lines = 3 }) => {
  const { theme } = useTheme();
  return (
    <div style={{ padding: 16 }}>
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} style={{
          height: 14, marginBottom: 10, borderRadius: 4,
          width: i === lines - 1 ? "60%" : "100%",
          background: `linear-gradient(90deg, ${theme.bg.card} 25%, ${theme.bg.cardHover} 50%, ${theme.bg.card} 75%)`,
          backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite",
        }} />
      ))}
    </div>
  );
};

// ── ErrorDisplay ──

export const ErrorDisplay = ({ message, onRetry }) => {
  const { theme } = useTheme();
  const { t } = useI18n();
  return (
    <div style={{ padding: 32, textAlign: "center", color: theme.text.muted, fontSize: 13 }}>
      <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.6 }}>{"\u26a0"}</div>
      <p style={{ marginBottom: onRetry ? 14 : 0, lineHeight: 1.6, maxWidth: 320, margin: "0 auto 14px" }}>
        {message}
      </p>
      {onRetry && (
        <button onClick={onRetry} style={{
          background: theme.bg.secondary, border: `1px solid ${theme.border.base}`,
          color: theme.text.secondary, padding: "7px 18px", borderRadius: 8, cursor: "pointer",
          fontSize: 12, fontFamily: "'Outfit', sans-serif", fontWeight: 500,
        }}>{t.tryAgain}</button>
      )}
    </div>
  );
};

// ── SectionIcon ──

const ICON_COLOR_MAP = { github: "violet", hn: "amber", devto: "sky", ai: "mint" };

export const SectionIcon = ({ icon, variant }) => {
  const { theme } = useTheme();
  const key = ICON_COLOR_MAP[variant] || "mint";
  return (
    <div style={{
      width: 32, height: 32, borderRadius: 8,
      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
      background: theme.accent[`${key}Dim`],
      color: theme.accent[key],
      border: `1px solid ${theme.accent[`${key}Border`]}`,
    }}>{icon}</div>
  );
};

// ── ItemCard ──

export const ItemCard = ({ item, children }) => {
  const { theme } = useTheme();
  const [hovered, setHovered] = useState(false);
  const handleClick = () => {
    try {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: item.source,
          id: item.id,
          title: item.title,
          url: item.url,
        }),
      });
    } catch {}
  };
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: 16, borderRadius: 10, display: "block",
        color: "inherit", textDecoration: "none", transition: "all 0.2s",
        background: hovered ? theme.bg.cardHover : "transparent",
        border: `1px solid ${hovered ? theme.border.base : "transparent"}`,
      }}
    >
      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: theme.text.muted,
        marginBottom: 6, display: "flex", alignItems: "center", gap: 8,
      }}>
        #{item.rank}
        {item.tag && <Tag label={item.tag.label} variant={item.tag.variant} />}
        {item.movement && <MovementIndicator movement={item.movement} />}
      </div>
      <div style={{
        fontSize: 15, fontWeight: 600, lineHeight: 1.4,
        marginBottom: 4, letterSpacing: -0.2, color: theme.text.primary,
      }}>
        {item.title}
      </div>
      {item.description && (
        <div style={{ fontSize: 13, color: theme.text.secondary, lineHeight: 1.5, marginTop: 4 }}>
          {item.description}
        </div>
      )}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
        fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
        color: theme.text.muted, marginTop: 8,
      }}>
        {children}
      </div>
    </a>
  );
};

// ── Meta helpers ──

export const MetaItem = ({ children }) => (
  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>{children}</span>
);

export const LanguageDot = ({ color }) => (
  <span style={{
    width: 8, height: 8, borderRadius: "50%",
    display: "inline-block", background: color,
  }} />
);
