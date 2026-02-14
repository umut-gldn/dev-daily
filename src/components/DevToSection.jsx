import { useI18n } from "../i18n";
import { SectionCard } from "./SectionCard";
import { SkeletonLoader, ErrorDisplay, ItemCard, MetaItem } from "./ui";

export const DevToSection = ({ data, status, error, onRetry }) => {
  const { t } = useI18n();
  const items = Array.isArray(data) ? data.slice(0, 4) : [];
  return (
    <SectionCard
      icon={"\u25c6"} iconClass="devto"
      title={t.devto.title} badge={t.hints.devto}
      animDelay={0.3}
    >
      {status === "loading" && <><SkeletonLoader /><SkeletonLoader /></>}
      {status === "error" && <ErrorDisplay message={error} onRetry={onRetry} />}
      {status === "success" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          {items.map((item) => (
            <ItemCard key={item.id} item={item}>
              <MetaItem>{"\u2764"} {item.meta.reactions}</MetaItem>
              <MetaItem>{"\ud83d\udcac"} {item.meta.comments}</MetaItem>
              <MetaItem>{item.meta.author}</MetaItem>
              <MetaItem>{item.meta.publishDate}</MetaItem>
            </ItemCard>
          ))}
        </div>
      )}
    </SectionCard>
  );
};
