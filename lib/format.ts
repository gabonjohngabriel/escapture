const TZ = "Asia/Manila";

const dateTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
const dateOnly = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** Stored as UTC, displayed in Asia/Manila. */
export function formatDateTime(d: Date | string): string {
  return dateTime.format(new Date(d)).replace(",", "");
}
export function formatDate(d: Date | string): string {
  return dateOnly.format(new Date(d));
}
export function shortHash(hash: string): string {
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}
export function age(d: Date | string, now: Date = new Date()): string {
  const mins = Math.max(0, Math.floor((now.getTime() - new Date(d).getTime()) / 60000));
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"}`;
}
/** "Maya Santos" -> "MS". */
export const initials = (name: string) => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return ((words[0]?.[0] ?? "") + (words.length > 1 ? words[words.length - 1][0] : "")).toUpperCase() || "?";
};
export const kindLabel = (kind: "facebook_post" | "facebook_message") =>
  kind === "facebook_post" ? "Facebook post" : "Facebook messages";

const dayOnly = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
/** The calendar day in Manila, as YYYY-MM-DD: for grouping things by day. */
export const dayKey = (d: Date | string) => dayOnly.format(new Date(d));

/** "Just now", "5 min ago", "3 hr ago", "Yesterday", "4 days ago", then the date. */
export function timeAgo(d: Date | string, now: Date = new Date()): string {
  const then = new Date(d);
  const mins = Math.max(0, Math.floor((now.getTime() - then.getTime()) / 60000));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return formatDate(then);
}

export type DayBucket = "Today" | "Yesterday" | "Earlier";

const longDate = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  month: "long",
  day: "numeric",
  year: "numeric",
});

/**
 * Groups items with a `createdAt` timestamp into Today, Yesterday, and Earlier
 * based on the Manila calendar day (not a rolling 24h window).
 * Empty buckets are omitted.
 */
export function groupByDay<T extends { createdAt: Date | string }>(
  items: readonly T[],
  now: Date = new Date(),
): { key: DayBucket; label: string; items: T[] }[] {
  const todayStr = dayKey(now);
  const [y, m, d] = todayStr.split("-").map(Number);
  const yesterdayUTC = new Date(Date.UTC(y, m - 1, d - 1, 12, 0, 0));
  const yesterdayStr = dayKey(yesterdayUTC);

  const today: T[] = [];
  const yesterday: T[] = [];
  const earlier: T[] = [];

  for (const item of items) {
    const k = dayKey(item.createdAt);
    if (k === todayStr) {
      today.push(item);
    } else if (k === yesterdayStr) {
      yesterday.push(item);
    } else {
      earlier.push(item);
    }
  }

  const groups: { key: DayBucket; label: string; items: T[] }[] = [];
  if (today.length > 0) {
    groups.push({
      key: "Today",
      label: `Today · ${longDate.format(now)}`,
      items: today,
    });
  }
  if (yesterday.length > 0) {
    groups.push({
      key: "Yesterday",
      label: `Yesterday · ${longDate.format(yesterdayUTC)}`,
      items: yesterday,
    });
  }
  if (earlier.length > 0) {
    groups.push({
      key: "Earlier",
      label: "Earlier",
      items: earlier,
    });
  }
  return groups;
}

/** How to say a case's latest event in the table's "Last update" column. */
const LAST_UPDATE: Record<string, string> = {
  escalated: "Escalated",
  status_changed: "Review started",
  closed: "Closed",
  assigned: "Reviewer assigned",
  unassigned: "Reviewer taken off",
};
export const lastUpdateText = (type: string | null | undefined) => (type ? (LAST_UPDATE[type] ?? "Updated") : "");
