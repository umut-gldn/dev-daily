import { useI18n } from "../i18n";
import { SectionCard } from "./SectionCard";
import { SkeletonLoader, ErrorDisplay, ItemCard, MetaItem, LanguageDot } from "./ui";

export const GitHubSection = ({ data, status, error, onRetry }) => {
  const { t } = useI18n();
  const items = Array.isArray(data) ? data.slice(0, 4) : [];
  return (
    <SectionCard
      icon={"\u2b21"} iconClass="github"
      title={t.github.title} badge={t.hints.github}
      animDelay={0.1}
    >
      {status === "loading" && <><SkeletonLoader /><SkeletonLoader /><SkeletonLoader /></>}
      {status === "error" && <ErrorDisplay message={error} onRetry={onRetry} />}
      {status === "success" && items.map((item) => (
        <ItemCard key={item.id} item={item}>
          <MetaItem>{"\u2b50"} {item.meta.stars}</MetaItem>
          <MetaItem>{"\ud83c\udf74"} {item.meta.forks}</MetaItem>
          {item.meta.language && (
            <MetaItem><LanguageDot color={item.meta.languageColor} /> {item.meta.language}</MetaItem>
          )}
        </ItemCard>
      ))}
    </SectionCard>
  );
};
