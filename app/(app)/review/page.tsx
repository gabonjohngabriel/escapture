import { CircleCheck, Clock } from "lucide-react";
import {
    ActivityLogsCard,
    SummaryCard,
    type SummaryMetrics,
} from "@/components/dashboard/charts";
import { ReportGrid } from "@/components/dashboard/report-grid";
import { type ReportDetailData } from "@/components/dashboard/report-details-dialog";
import { StatTile } from "@/components/dashboard/stat-tile";
import { pageUser } from "@/server/page-auth";
import {
    boardInsights,
    boardPage,
    boardSummary,
    listArchives,
    RANGE_DAYS,
    type BoardRange,
} from "@/server/services/review";

// Per-user page: allowed to wait for the server on navigation.
export const instant = false;

function SearchExclamationIcon(props: {
    size?: number;
    className?: string;
    strokeWidth?: number;
}) {
    return (
        <svg
            width={props.size ?? 22}
            height={props.size ?? 22}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={props.strokeWidth ?? 2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={props.className}
            aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="11" />
            <line x1="11" y1="14" x2="11.01" y2="14" />
        </svg>
    );
}

const first = (v: string | string[] | undefined) =>
    (Array.isArray(v) ? v[0] : v) ?? "";

/**
 * Reviewer Desk Dashboard
 */
export default async function ReviewDashboardPage({
    searchParams,
}: PageProps<"/review">) {
    const user = await pageUser(["reviewer", "admin"]);
    const params = await searchParams;

    const tab = first(params.tab) === "archived" ? "archived" : "recent";
    const q = first(params.q);
    const page = Math.max(1, Number(first(params.page)) || 1);
    const mine = Boolean(first(params.mine)) && user.role === "reviewer";
    const unassigned = Boolean(first(params.unassigned));
    const flagged = Boolean(first(params.flagged));
    const rawRange = first(params.range);
    const range: BoardRange =
        rawRange === "30d" || rawRange === "90d" ? rawRange : "all";

    // Concurrently fetch KPIs, insights, and report data
    const [summary, insights] = await Promise.all([
        boardSummary(user),
        boardInsights(user, range === "all" ? "90d" : range),
    ]);

    let reportItems: ReportDetailData[] = [];
    let totalCount = 0;
    let recentCount = summary.escalated + summary.underReview;
    let archivedCount = summary.closedThisMonth;

    if (tab === "recent") {
        const board = await boardPage(user, {
            q: q || undefined,
            page,
            mine,
            unassigned,
            flagged,
            days: RANGE_DAYS[range] ?? undefined,
            pageSize: 4,
        });

        reportItems = board.items.map((c) => ({
            id: c.id,
            title: c.title,
            description: c.description ?? "",
            status: c.status,
            escalatedAt: c.escalatedAt,
            reporterName: c.reporterName,
            assignees: c.assignees,
            evidenceCount: c.evidenceCount,
            collaboratorCount: c.collaboratorCount,
            flaggedWords: c.flaggedWords,
            kindLabel: "Posts",
        }));

        totalCount = board.total;
        recentCount = board.total;
    } else {
        const archives = await listArchives(user, {
            q: q || undefined,
            mine,
            days: RANGE_DAYS[range] ?? undefined,
        });

        totalCount = archives.length;
        archivedCount = archives.length;

        const paged = archives.slice((page - 1) * 4, page * 4);
        reportItems = paged.map((c) => ({
            id: c.id,
            title: c.title,
            description: c.closingNote ?? "",
            status: "closed",
            escalatedAt: c.escalatedAt,
            closedAt: c.closedAt,
            reporterName: c.reporterName,
            evidenceCount: c.evidenceCount,
            assignees: c.closedBy
                ? [{ id: "closed-by", name: c.closedBy }]
                : [],
            kindLabel: "Archive",
        }));
    }

    const totalAllCases =
        insights.statuses.escalated +
        insights.statuses.under_review +
        insights.statuses.closed;
    const resolutionRate =
        totalAllCases > 0
            ? Math.round((insights.statuses.closed / totalAllCases) * 100)
            : 0;

    const summaryMetrics: SummaryMetrics = {
        statuses: insights.statuses,
        totalCases: totalAllCases,
        resolutionRate,
        oldestUnderReviewDays: summary.oldestUnderReviewDays,
        newThisWeek: summary.newThisWeek,
        closedThisMonth: summary.closedThisMonth,
        reviewerName: user.name,
    };

    return (
        <div className="flex flex-col gap-8 pb-12">
            {/* Page Header Greeting */}
            <header className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-brand-700 sm:text-4xl">
                    Review dashboard
                </h1>
                <p className="text-sm font-medium text-muted sm:text-base">
                    Cases escalated to the university, at a glance.
                </p>
            </header>

            {/* Top 3 Summary Tiles */}
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatTile
                    label="Awaiting acknowledgement"
                    note={
                        summary.newThisWeek > 0
                            ? `${summary.newThisWeek} new cases`
                            : "No new cases"
                    }
                    value={summary.escalated}
                    Icon={Clock}
                    variant="amber"
                />

                <StatTile
                    label="Under review"
                    note={
                        summary.assignedToMe > 0
                            ? `${summary.assignedToMe} cases assigned to you`
                            : "No cases assigned to you"
                    }
                    value={summary.underReview}
                    Icon={SearchExclamationIcon}
                    variant="coral"
                />

                <StatTile
                    label="Closed this month"
                    note="Total closed cases"
                    value={summary.closedThisMonth}
                    Icon={CircleCheck}
                    variant="green"
                />
            </dl>

            {/* Main Two-Column Layout */}
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
                {/* Left Column: Reports Section */}
                <div className="min-w-0">
                    <ReportGrid
                        items={reportItems}
                        activeTab={tab}
                        recentCount={recentCount}
                        archivedCount={archivedCount}
                        total={totalCount}
                        page={page}
                        pageSize={4}
                        q={q}
                        mine={mine}
                        unassigned={unassigned}
                        flagged={flagged}
                        range={range}
                    />
                </div>

                {/* Right Rail: Activity Logs & Summary */}
                <aside className="flex flex-col gap-8 min-w-0">
                    <ActivityLogsCard items={insights.activity} />
                    <SummaryCard metrics={summaryMetrics} />
                </aside>
            </div>
        </div>
    );
}
