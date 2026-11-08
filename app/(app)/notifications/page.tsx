import { Bell, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { MarkAllRead } from "@/components/layout/notification-actions";
import { NotificationCard } from "@/components/layout/notification-row";
import { EmptyState } from "@/components/ui/feedback";
import { cn } from "@/lib/cn";
import { dayKey, formatDate } from "@/lib/format";
import { pageUser } from "@/server/page-auth";
import { listNotifications } from "@/server/services/notifications";

// Per-user page: allowed to wait for the server on navigation.
export const instant = false;

export default async function NotificationsPage({
  searchParams,
}: PageProps<"/notifications">) {
  const user = await pageUser();
  const params = await searchParams;
  const tabKey = (Array.isArray(params.tab) ? params.tab[0] : params.tab) ?? "all";
  const q = (Array.isArray(params.q) ? params.q[0] : params.q ?? "").trim().toLowerCase();

  const { items, unreadCount } = await listNotifications(user);

  // Categorize
  const sharingCount = items.filter(
    (n) => n.type.includes("shared") || n.type.includes("collaborator")
  ).length;
  const reportsCount = items.filter((n) => n.type.startsWith("case_")).length;

  const tabs = [
    { key: "all", label: "All", count: items.length },
    { key: "unread", label: "Unread", count: unreadCount },
    { key: "sharing", label: "Sharing", count: sharingCount },
    { key: "reports", label: "Reports", count: reportsCount },
  ];

  let filtered = items;
  if (tabKey === "unread") {
    filtered = filtered.filter((n) => !n.readAt);
  } else if (tabKey === "sharing") {
    filtered = filtered.filter(
      (n) => n.type.includes("shared") || n.type.includes("collaborator")
    );
  } else if (tabKey === "reports") {
    filtered = filtered.filter((n) => n.type.startsWith("case_"));
  }

  if (q) {
    filtered = filtered.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        (n.body && n.body.toLowerCase().includes(q))
    );
  }

  const now = new Date();
  const today = dayKey(now);
  const formattedToday = `Today · ${now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })}`;

  return (
    <div className="flex flex-col gap-6">
      {/* Header matching Figma node 44:1820 */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex flex-col gap-1.5">
          <h1
            className="text-3xl font-bold tracking-tight text-[#203E2C] md:text-4xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Notifications
          </h1>
          <p className="text-base font-medium text-[#55665C]">
            Keep track of your evidence, reports, and sharing updates.
          </p>
        </div>

        {unreadCount > 0 && <MarkAllRead />}
      </div>

      {/* Toolbar: Pill Tabs & Search Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav
          aria-label="Notification tabs"
          className="inline-flex items-center rounded-full bg-[#EBF3EE] p-1.5 shadow-inner"
        >
          {tabs.map((t) => {
            const active = tabKey === t.key;
            const href =
              t.key === "all" ? "/notifications" : `/notifications?tab=${t.key}`;
            return (
              <Link
                key={t.key}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 select-none",
                  active
                    ? "bg-[#52946B] text-white shadow-sm"
                    : "text-[#55665C] hover:text-[#203E2C]"
                )}
              >
                <span>{t.label}</span>
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-xs font-bold transition-colors",
                    active
                      ? "bg-white text-[#52946B]"
                      : "bg-[#DCE7DF] text-[#55665C]"
                  )}
                >
                  {t.count}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Search input matching Figma */}
        <form
          role="search"
          action="/notifications"
          method="get"
          className="flex flex-wrap items-center gap-3"
        >
          {tabKey !== "all" && <input type="hidden" name="tab" value={tabKey} />}
          <div className="relative min-w-[240px] md:w-[320px]">
            <Search
              size={18}
              strokeWidth={2}
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#55665C]"
            />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search notifications..."
              className="h-12 w-full rounded-full border border-[#52946B]/40 bg-card pr-4 pl-11 text-sm text-[#203E2C] placeholder:text-[#55665C] transition-colors focus:border-[#52946B] focus:outline-none focus:ring-2 focus:ring-[#52946B]/20"
            />
          </div>

          <div className="flex h-12 items-center gap-2 rounded-full border border-[#52946B]/40 bg-card px-5 text-sm font-semibold text-[#203E2C]">
            <SlidersHorizontal size={17} strokeWidth={2} aria-hidden />
            <span>Filter</span>
          </div>
        </form>
      </div>

      {/* Date Header */}
      <div className="pt-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#55665C]">
          {formattedToday}
        </h2>
      </div>

      {/* Notifications List */}
      {items.length === 0 ? (
        <EmptyState
          icon={<Bell size={24} strokeWidth={1.75} />}
          title="No notifications yet"
        >
          You will receive updates here when evidence or reports are shared with you.
        </EmptyState>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Bell size={24} strokeWidth={1.75} />}
          title="No notifications in this view"
        >
          There are no items matching this filter.
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-3.5">
          {filtered.map((n) => (
            <NotificationCard key={n.id} n={n} role={user.role} />
          ))}
        </div>
      )}
    </div>
  );
}
