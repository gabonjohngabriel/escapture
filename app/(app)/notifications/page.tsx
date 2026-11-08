import { Bell } from "lucide-react";
import { PageToolbar, PageToolbarSearch } from "@/components/ui/page-toolbar";
import { PillTabs } from "@/components/ui/pill-tabs";
import { MarkAllRead } from "@/components/layout/notification-actions";
import { NotificationCard } from "@/components/layout/notification-row";
import { EmptyState } from "@/components/ui/feedback";
import {
    ListSkeleton,
    SearchFocusArea,
    SearchFocusProvider,
} from "@/components/ui/search-focus";
import { SearchEmptyState } from "@/components/ui/search-empty-state";
import { SearchResultsSummary } from "@/components/ui/search-results-summary";
import { pageUser } from "@/server/page-auth";
import { listNotifications } from "@/server/services/notifications";

// Per-user page: allowed to wait for the server on navigation.
export const instant = false;

export default async function NotificationsPage({
    searchParams,
}: PageProps<"/notifications">) {
    const user = await pageUser();
    const params = await searchParams;
    const tabKey =
        (Array.isArray(params.tab) ? params.tab[0] : params.tab) ?? "all";
    const rawQ = (
        Array.isArray(params.q) ? params.q[0] : (params.q ?? "")
    ).trim();
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
        {
            key: "reports",
            label: isStudent ? "Reports" : "Cases",
            count: reportsCount,
        },
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

    const tabTotal = filtered.length;
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
                        Keep track of your evidence, reports, and sharing
                        updates.
                    </p>
                </div>

                {unreadCount > 0 && <MarkAllRead />}
            </div>

            <SearchFocusProvider>
                {/* Toolbar */}
                <PageToolbar>
                    <PillTabs
                        variant="white"
                        label="Notification tabs"
                        tabs={tabs.map((t) => ({
                            key: t.key,
                            label: t.label,
                            count: t.count,
                            active: tabKey === t.key,
                            href:
                                t.key === "all"
                                    ? "/notifications"
                                    : `/notifications?tab=${t.key}`,
                        }))}
                    />

                    <PageToolbarSearch
                        action="/notifications"
                        defaultValue={q}
                        placeholder="Search notifications..."
                        hiddenFields={
                            tabKey !== "all" ? { tab: tabKey } : undefined
                        }
                    />
                </PageToolbar>

                <SearchFocusArea
                    fallback={<ListSkeleton />}
                    className="flex flex-col gap-5">
                    {(q || tabKey !== "all") && tabTotal > 0 && (
                        <SearchResultsSummary
                            shown={filtered.length}
                            total={tabTotal}
                            query={rawQ}
                            clearHref="/notifications"
                        />
                    )}
                    {/* Date Header */}
                    <div className="pt-2">
                        <h2 className="text-sm font-semibold text-muted">
                            {formattedToday}
                        </h2>
                    </div>

                    {/* Notifications List */}
                    {items.length === 0 ? (
                        <EmptyState
                            icon={<Bell size={24} strokeWidth={1.75} />}
                            title="No notifications yet">
                            You will receive updates here when evidence or
                            reports are shared with you.
                        </EmptyState>
                    ) : filtered.length === 0 ? (
                        <SearchEmptyState
                            title="No notifications matched your filters"
                            clearHref="/notifications"
                            clearLabel="Clear filters">
                            Try adjusting your search terms or view a different
                            tab.
                        </SearchEmptyState>
                    ) : (
                        <div className="flex flex-col gap-3.5">
                            {filtered.map((n) => (
                                <NotificationCard
                                    key={n.id}
                                    n={n}
                                    role={user.role}
                                />
                            ))}
                        </div>
                    )}
                </SearchFocusArea>
            </SearchFocusProvider>
        </div>
    );
}
