import { Bell } from "lucide-react";
import {
  MarkAllRead,
  NotificationsSearchForm,
} from "@/components/layout/notification-actions";
import { NotificationCard } from "@/components/layout/notification-row";
import { EmptyState } from "@/components/ui/feedback";
import {
  FocusLink,
  ListSkeleton,
  SearchFocusArea,
  SearchFocusProvider,
} from "@/components/ui/search-focus";
import { cn } from "@/lib/cn";
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
  const rawQ = (Array.isArray(params.q) ? params.q[0] : params.q ?? "").trim();
  const q = rawQ.toLowerCase();

  const { items, unreadCount } = await listNotifications(user);

  // Categorize
  const sharingCount = items.filter(
    (n) => n.type.includes("shared") || n.type.includes("collaborator"),
  ).length;
  const reportsCount = items.filter((n) => n.type.startsWith("case_")).length;

  const isStudent = user.role === "student";
  const tabs = [
    { key: "all", label: "All", count: items.length },
    { key: "unread", label: "Unread", count: unreadCount },
    { key: "sharing", label: "Sharing", count: sharingCount },
    { key: "reports", label: isStudent ? "Reports" : "Cases", count: reportsCount },
  ];

  let filtered = items;
  if (tabKey === "unread") {
    filtered = filtered.filter((n) => !n.readAt);
  } else if (tabKey === "sharing") {
    filtered = filtered.filter(
      (n) => n.type.includes("shared") || n.type.includes("collaborator"),
    );
  } else if (tabKey === "reports") {
    filtered = filtered.filter((n) => n.type.startsWith("case_"));
  }

  if (q) {
    filtered = filtered.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        (n.body && n.body.toLowerCase().includes(q)),
    );
  }

  const now = new Date();
  const formattedToday = `Today · ${now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })}`;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-brand-700 sm:text-4xl">
            Notifications
          </h1>
          <p className="text-base text-muted">
            Keep track of your evidence, reports, and sharing updates.
          </p>
        </div>

        {unreadCount > 0 && <MarkAllRead />}
      </div>

      <SearchFocusProvider>
        {/* Toolbar: Pill Tabs & Search Filter */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav
            aria-label="Notification tabs"
            className="inline-flex items-center rounded-full bg-brand-50 p-1.5 shadow-xs"
          >
            {tabs.map((t) => {
              const active = tabKey === t.key;
              const tabParams = new URLSearchParams();
              if (t.key !== "all") tabParams.set("tab", t.key);
              if (rawQ) tabParams.set("q", rawQ);
              const qs = tabParams.toString();
              const href = qs ? `/notifications?${qs}` : "/notifications";
              return (
                <FocusLink
                  key={t.key}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 select-none",
                    active
                      ? "bg-brand-600 text-white shadow-xs"
                      : "text-muted hover:text-brand-700",
                  )}
                >
                  <span>{t.label}</span>
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full text-xs font-bold transition-colors",
                      active
                        ? "bg-white text-brand-700"
                        : "bg-brand-100 text-brand-800",
                    )}
                  >
                    {t.count}
                  </span>
                </FocusLink>
              );
            })}
          </nav>

          {/* Search input */}
          <NotificationsSearchForm tabKey={tabKey} defaultQuery={rawQ} />
        </div>

        {/* Date Header */}
        <div className="pt-2">
          <h2 className="text-sm font-semibold text-muted">{formattedToday}</h2>
        </div>

        {/* Notifications List (Focus Area) */}
        <SearchFocusArea fallback={<ListSkeleton />}>
          {items.length === 0 ? (
            <EmptyState
              icon={<Bell size={24} strokeWidth={1.75} />}
              title="No notifications yet"
            >
              You will receive updates here when evidence or reports are shared
              with you.
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
        </SearchFocusArea>
      </SearchFocusProvider>
    </div>
  );
}
