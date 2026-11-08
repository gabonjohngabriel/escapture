import { FolderOpen } from "lucide-react";
import { CreateReportButton } from "@/components/cases/case-actions";
import { ReportCardsGrid } from "@/components/cases/report-cards-grid";
import { ReportSort } from "@/components/cases/report-sort";
import { PageToolbar, PageToolbarSearch } from "@/components/ui/page-toolbar";
import { PillTabs } from "@/components/ui/pill-tabs";
import {
    CardsGridSkeleton,
    SearchFocusArea,
    SearchFocusProvider,
} from "@/components/ui/search-focus";
import { SearchEmptyState } from "@/components/ui/search-empty-state";
import { SearchResultsSummary } from "@/components/ui/search-results-summary";
import { findFlaggedWords } from "@/lib/flags";
import { pageUser } from "@/server/page-auth";
import { listCases } from "@/server/services/cases";
import { listWordsPlain } from "@/server/services/flags";

// Per-user page: allowed to wait for the server on navigation.
export const instant = false;

const TABS = [
    { key: "all", label: "All reports", match: () => true },
    { key: "drafts", label: "Drafts", match: (s: string) => s === "draft" },
    {
        key: "escalated",
        label: "Escalated",
        match: (s: string) => s === "escalated" || s === "under_review",
    },
    {
        key: "closed",
        label: "Closed",
        match: (s: string) => s === "closed",
    },
] as const;

export default async function CasesPage({ searchParams }: PageProps<"/cases">) {
    const user = await pageUser(["student"]);
    const [all, bank] = await Promise.all([listCases(user), listWordsPlain()]);
    const params = await searchParams;
    const key = Array.isArray(params.tab) ? params.tab[0] : params.tab;
    const rawQ = (
        Array.isArray(params.q) ? params.q[0] : (params.q ?? "")
    ).trim();
    const q = rawQ.toLowerCase();
    const sort = Array.isArray(params.sort)
        ? params.sort[0]
        : (params.sort ?? "updated");

    const tab = TABS.find((t) => t.key === key) ?? TABS[0];
    const tabItems = all.filter((c) => tab.match(c.status));
    let items = all
        .filter((c) => tab.match(c.status))
        .filter(
            (c) =>
                !q ||
                c.title.toLowerCase().includes(q) ||
                c.ownerName.toLowerCase().includes(q),
        );

    if (sort === "evidence") {
        items = [...items].sort((a, b) => b.evidenceCount - a.evidenceCount);
    } else if (sort === "title") {
        items = [...items].sort((a, b) => a.title.localeCompare(b.title));
    } else {
        items = [...items].sort(
            (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime(),
        );
    }

    const sensitiveMap: Record<string, boolean> = {};
    for (const c of items) {
        sensitiveMap[c.id] = findFlaggedWords(c.title, bank).length > 0;
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-brand-700 sm:text-4xl">
                        Reports
                    </h1>
                    <p className="text-base text-muted">
                        Organize captured evidence. Share only when you choose.
                    </p>
                </div>

                <CreateReportButton />
            </div>

            {all.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-brand-500 bg-card p-12 text-center shadow-xs">
                    <div className="flex size-16 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                        <FolderOpen size={32} strokeWidth={2} aria-hidden />
                    </div>
                    <h2 className="mt-5 text-2xl font-bold text-brand-800">
                        You have no reports yet
                    </h2>
                    <p className="mt-2.5 max-w-xl text-base leading-relaxed text-muted">
                        Start a report when you are ready. It stays a private
                        draft, and you can add evidence and people you trust at
                        your own pace.
                    </p>
                    <div className="mt-6">
                        <CreateReportButton />
                    </div>
                </div>
            ) : (
                <SearchFocusProvider>
                    <div className="flex flex-col gap-5">
                        {/* Toolbar */}
                        <PageToolbar>
                            <PillTabs
                                variant="white"
                                label="Report sections"
                                tabs={TABS.map((t) => ({
                                    key: t.key,
                                    label: t.label,
                                    count: all.filter((c) => t.match(c.status))
                                        .length,
                                    active: t.key === tab.key,
                                    href:
                                        t.key === "all"
                                            ? "/cases"
                                            : `/cases?tab=${t.key}`,
                                }))}
                            />

                            <PageToolbarSearch
                                action="/cases"
                                defaultValue={q}
                                placeholder="Search reports..."
                                hiddenFields={
                                    tab.key !== "all"
                                        ? { tab: tab.key }
                                        : undefined
                                }>
                                <ReportSort defaultValue={sort} />
                            </PageToolbarSearch>
                        </PageToolbar>

                        {/* Cards Grid or Empty Filter */}
                        <SearchFocusArea
                            fallback={<CardsGridSkeleton />}
                            className="flex flex-col gap-5">
                            {(q || tab.key !== "all") && tabItems.length > 0 && (
                                <SearchResultsSummary
                                    shown={items.length}
                                    total={tabItems.length}
                                    query={rawQ}
                                    clearHref="/cases"
                                />
                            )}
                            {items.length === 0 ? (
                                <>
                                    <SearchEmptyState
                                        title="No reports matched your filters"
                                        clearHref="/cases"
                                        clearLabel="Clear filters">
                                        Try adjusting your search terms or view
                                        a different tab.
                                    </SearchEmptyState>
                                </>
                            ) : (
                                <ReportCardsGrid
                                    items={items}
                                    sensitiveMap={sensitiveMap}
                                />
                            )}
                        </SearchFocusArea>
                    </div>
                </SearchFocusProvider>
            )}
        </div>
    );
}
