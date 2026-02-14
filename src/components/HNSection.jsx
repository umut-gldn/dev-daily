import { useI18n } from "../i18n";
import { SectionCard } from "./SectionCard";
import { SkeletonLoader, ErrorDisplay, ItemCard, MetaItem } from "./ui";

export const HNSection = ({ data, status, error, onRetry }) => {
  const { t } = useI18n();
  const items = Array.isArray(data) ? data.slice(0, 4) : [];
  return (
    <SectionCard
      icon={"\u25b2"} iconClass="hn"
      title={t.hn.title} badge={t.hints.hn}
      animDelay={0.2}
    >
      {status === "loading" && <><SkeletonLoader /><SkeletonLoader /><SkeletonLoader /></>}
      {status === "error" && <ErrorDisplay message={error} onRetry={onRetry} />}
      {status === "success" && items.map((item) => (
        <ItemCard key={item.id} item={item}>
          <MetaItem>{"\u25b2"} {item.meta.points} {t.meta.pts}</MetaItem>
          <MetaItem>{"\ud83d\udcac"} {item.meta.comments}</MetaItem>
          {t.meta.by
            ? <MetaItem>{t.meta.by} {item.meta.author}</MetaItem>
            : <MetaItem>{item.meta.author}</MetaItem>}
          <MetaItem>{item.meta.timeAgo}</MetaItem>
        </ItemCard>
      ))}
    </SectionCard>
  );
};
