import { SearchX } from "lucide-react";
import Link from "next/link";
import { Pagination } from "@/components/dashboard/data-table";
import { VaultCardsGrid } from "@/components/vault/vault-cards-grid";
import {
    EmptySharedState,
    EmptyVaultState,
} from "@/components/vault/vault-empty-state";
import { VaultToolbar } from "@/components/vault/vault-toolbar";
import { buttonClass } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { evidenceKind, evidenceSort } from "@/lib/validators";
import { vaultHref, type VaultView } from "@/lib/vault-view";
import { pageUser } from "@/server/page-auth";
import { countEvidence, listEvidence } from "@/server/services/evidence";

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
    const [items, counts] = await Promise.all([
        listEvidence(user, view.tab, {
            q: view.q || undefined,
            kind: view.kind || undefined,
            sort: view.sort || undefined,
        }),
        countEvidence(user),
    ]);
    const total = counts[view.tab];
    const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    const page = Math.min(
        pages,
        Math.max(1, Number.parseInt(first(params.page), 10) || 1),
    );
    const shown = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const narrowed = Boolean(view.q || view.kind);

    const firstName = user.name ? user.name.split(" ")[0] : "User";

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col">
                <h1
                    className="text-[42px] font-bold tracking-tight text-[#52946B] leading-tight"
                    style={{ fontFamily: "var(--font-heading)" }}>
                    Welcome back, {firstName}!
                </h1>
                <p className="text-[16px] font-normal text-[#5F856E]">
                    Only you can control what is shared within the university.
                </p>
            </div>

            <div className="flex flex-col gap-5">
                <VaultToolbar
                    view={view}
                    counts={counts}
                    showControls={total > 0 || narrowed}
                />

                {narrowed && total > 0 && (
                    <p
                        aria-live="polite"
                        className="text-sm font-medium text-[#55665C]">
                        Showing{" "}
                        <span className="tnum font-bold text-[#203E2C]">
                            {items.length}
                        </span>{" "}
                        of{" "}
                        <span className="tnum font-bold text-[#203E2C]">
                            {total}
                        </span>
                        {view.q && <> for “{view.q}”</>}.{" "}
                        <Link
                            href={vaultHref({ tab: view.tab })}
                            className="link ml-1">
                            Clear filters
                        </Link>
                    </p>
                )}

                {/* Empty States */}
                {total === 0 && view.tab === "mine" && <EmptyVaultState />}

                {total === 0 && view.tab === "shared" && <EmptySharedState />}

                {total > 0 && items.length === 0 && (
                    <EmptyState
                        icon={<SearchX size={24} strokeWidth={1.75} />}
                        title="Nothing matches your filter"
                        action={
                            <Link
                                href={vaultHref({ tab: view.tab })}
                                className={buttonClass("secondary")}>
                                Clear search and filters
                            </Link>
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
                    />
                )}

                {pages > 1 && (
                    <Pagination
                        page={page}
                        pages={pages}
                        total={items.length}
                        unit={items.length === 1 ? "capture" : "captures"}
                        hrefFor={(to) => vaultHref({ ...view, page: to })}
                    />
                )}
            </div>
        </div>
    );
}
