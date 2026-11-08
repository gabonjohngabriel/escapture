import { SearchX } from "lucide-react";
import { Pagination } from "@/components/dashboard/data-table";
import { VaultCardsGrid } from "@/components/vault/vault-cards-grid";
import {
    EmptySharedState,
    EmptyVaultState,
} from "@/components/vault/vault-empty-state";
import { VaultToolbar } from "@/components/vault/vault-toolbar";
import { buttonClass } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import {
    CardsGridSkeleton,
    FocusLink,
    SearchFocusArea,
    SearchFocusProvider,
} from "@/components/ui/search-focus";
import { evidenceKind, evidenceSort } from "@/lib/validators";
import { vaultHref, type VaultView } from "@/lib/vault-view";
import { pageUser } from "@/server/page-auth";
import { countEvidence, listEvidence } from "@/server/services/evidence";
import { listWordsPlain } from "@/server/services/flags";
import { isSensitive } from "@/server/services/sensitivity";

// Per-user page: allowed to wait for the server on navigation.
export const instant = false;

const PAGE_SIZE = 24;

const first = (v: string | string[] | undefined) =>
    (Array.isArray(v) ? v[0] : v) ?? "";

export default async function VaultPage({ searchParams }: PageProps<"/vault">) {
    const user = await pageUser(["student"]);
    const params = await searchParams;
    const view: VaultView = {
        tab: first(params.tab) === "shared" ? "shared" : "mine",
        q: first(params.q).trim().slice(0, 120),
        kind: evidenceKind.safeParse(first(params.kind)).data ?? "",
        sort: evidenceSort.safeParse(first(params.sort)).data ?? "",
    };
    const [items, counts, bank] = await Promise.all([
        listEvidence(user, view.tab, {
            q: view.q || undefined,
            kind: view.kind || undefined,
            sort: view.sort || undefined,
        }),
        countEvidence(user),
        listWordsPlain(),
    ]);
    const total = counts[view.tab];
    const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    const page = Math.min(
        pages,
        Math.max(1, Number.parseInt(first(params.page), 10) || 1),
    );
    const shown = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const narrowed = Boolean(view.q || view.kind);

    const sensitivityEntries = await Promise.all(
        shown.map(async (item) => {
            const sensitive = await isSensitive(user, item, bank);
            return [item.id, sensitive] as const;
        }),
    );
    const sensitiveMap = Object.fromEntries(sensitivityEntries);

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-brand-700 sm:text-4xl">
                    Your vault
                </h1>
                <p className="text-base text-muted">
                    Private to you. Nothing reaches university reviewers unless
                    you escalate a report.
                </p>
            </div>

            <SearchFocusProvider>
                <div className="flex flex-col gap-5">
                    <VaultToolbar
                        view={view}
                        counts={counts}
                        showControls={total > 0 || narrowed}
                    />

                    <SearchFocusArea
                        fallback={<CardsGridSkeleton />}
                        className="flex flex-col gap-5">
                        {narrowed && total > 0 && (
                            <p
                                aria-live="polite"
                                className="text-sm font-medium text-muted">
                                Showing{" "}
                                <span className="tnum font-bold text-ink">
                                    {items.length}
                                </span>{" "}
                                of{" "}
                                <span className="tnum font-bold text-ink">
                                    {total}
                                </span>
                                {view.q && <> for “{view.q}”</>}
                            </p>
                        )}

                        {/* Empty States */}
                        {total === 0 && view.tab === "mine" && (
                            <EmptyVaultState />
                        )}

                        {total === 0 && view.tab === "shared" && (
                            <EmptySharedState />
                        )}

                        {total > 0 && items.length === 0 && (
                            <EmptyState
                                icon={<SearchX size={24} strokeWidth={1.75} />}
                                title="Nothing matches your filter"
                                action={
                                    <FocusLink
                                        href={vaultHref({ tab: view.tab })}
                                        className={buttonClass("secondary")}>
                                        Clear search and filters
                                    </FocusLink>
                                }>
                                {view.q
                                    ? `No ${view.kind ? "items of that kind" : "items"} match “${view.q}”.`
                                    : "No items match the selected filter."}{" "}
                                Clear search or filters to see all evidence.
                            </EmptyState>
                        )}

                        {/* 2-Column Cards Grid */}
                        {items.length > 0 && (
                            <VaultCardsGrid
                                items={shown}
                                shared={view.tab === "shared"}
                                sensitiveMap={sensitiveMap}
                            />
                        )}

                        {pages > 1 && (
                            <Pagination
                                page={page}
                                pages={pages}
                                total={items.length}
                                unit={
                                    items.length === 1 ? "capture" : "captures"
                                }
                                hrefFor={(to) =>
                                    vaultHref({ ...view, page: to })
                                }
                            />
                        )}
                    </SearchFocusArea>
                </div>
            </SearchFocusProvider>
        </div>
    );
}
