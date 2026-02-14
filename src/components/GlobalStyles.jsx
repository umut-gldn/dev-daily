import { useTheme } from "../theme";

export const GlobalStyles = () => {
  const { theme } = useTheme();
  return (
    <style>{`
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        background: ${theme.bg.primary};
        color: ${theme.text.primary};
        font-family: 'Outfit', sans-serif;
        min-height: 100vh;
        transition: background 0.35s ease, color 0.35s ease;
      }
      body::before {
        content: ''; position: fixed; top: -50%; left: -50%; width: 200%; height: 200%;
        background: radial-gradient(ellipse at 20% 20%, ${theme.accent.mintDim} 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, ${theme.accent.skyDim} 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, ${theme.accent.violetDim} 0%, transparent 50%);
        animation: ambientMove 30s ease-in-out infinite alternate;
        z-index: -1;
      }
      @keyframes ambientMove { 0%{transform:translate(0,0) rotate(0deg)} 100%{transform:translate(-5%,-5%) rotate(3deg)} }
      @keyframes fadeInDown { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
      @keyframes fadeInUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
      @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      @keyframes spin { to{transform:rotate(360deg)} }
      @keyframes blink { 50%{opacity:0} }
      ::-webkit-scrollbar { width: 6px; }
      ::-webkit-scrollbar-track { background: ${theme.bg.primary}; }
      ::-webkit-scrollbar-thumb { background: ${theme.border.base}; border-radius: 3px; }
      .dd-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 330px;
        gap: 16px;
        align-items: start;
      }
      .dd-main {
        min-width: 0;
      }
      .dd-sidebar {
        min-width: 0;
      }
      .dd-sidebar-sticky {
        display: grid;
        gap: 12px;
        position: sticky;
        top: 14px;
      }
      @media (min-width: 1280px) {
        .dd-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        }
      }
      @media (max-width: 1024px) {
        .dd-layout { grid-template-columns: 1fr; }
        .dd-sidebar-sticky { position: static; }
      }
      @media (max-width: 768px) {
        .dd-grid { grid-template-columns: 1fr !important; }
      }
    `}</style>
  );
};
