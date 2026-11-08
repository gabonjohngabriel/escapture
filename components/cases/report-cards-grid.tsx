import { ReportCard, type ReportItem } from "./report-card";

/**
 * 2-column Reports Grid matching Figma node 44:1090
 */
export function ReportCardsGrid({
  items,
  sensitiveMap = {},
}: {
  items: ReportItem[];
  sensitiveMap?: Record<string, boolean>;
}) {
  return (
    <div
      role="feed"
      aria-busy={false}
      className="grid grid-cols-1 gap-6 xl:grid-cols-2"
    >
      {items.map((item) => (
        <ReportCard
          key={item.id}
          item={item}
          sensitive={Boolean(sensitiveMap[item.id])}
        />
      ))}
    </div>
  );
}
