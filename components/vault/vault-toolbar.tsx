"use client";

import {
    ChevronDown,
    Loader2,
    Search,
    SlidersHorizontal,
    X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PillTabs } from "@/components/ui/pill-tabs";
import { useSearchFocus } from "@/components/ui/search-focus";
import { cn } from "@/lib/cn";
import { vaultHref, type VaultView } from "@/lib/vault-view";

/**
 * Vault Toolbar
 */
export function VaultToolbar({
    view,
    counts,
    showControls,
}: {
    view: VaultView;
    counts: { mine: number; shared: number };
    showControls: boolean;
}) {
    const { isPending, navigate } = useSearchFocus();
    const [filterOpen, setFilterOpen] = useState(false);
    const [query, setQuery] = useState(view.q ?? "");
    const [kind, setKind] = useState<VaultView["kind"]>(view.kind ?? "");
    const [sort, setSort] = useState<VaultView["sort"]>(view.sort ?? "");
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setQuery(view.q ?? "");
    }, [view.q]);

    useEffect(() => {
        setKind(view.kind ?? "");
    }, [view.kind]);

    useEffect(() => {
        setSort(view.sort ?? "");
    }, [view.sort]);

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    const tabs = [
        { key: "mine" as const, label: "My evidence", count: counts.mine },
        {
            key: "shared" as const,
            label: "Shared with me",
            count: counts.shared,
        },
    ];

    useEffect(() => {
        if (!filterOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setFilterOpen(false);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [filterOpen]);

    function apply(
        nextQ = query,
        nextKind = kind,
        nextSort = sort,
        replace = false,
    ) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        navigate(
            vaultHref({
                tab: view.tab,
                q: nextQ.trim(),
                kind: nextKind,
                sort: nextSort,
            }),
            { replace },
        );
        setFilterOpen(false);
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <PillTabs
                    variant="white"
                    label="Vault tabs"
                    tabs={tabs.map((t) => ({
                        key: t.key,
                        label: t.label,
                        count: t.count,
                        active: view.tab === t.key,
                        href: vaultHref({ tab: t.key, q: view.q }),
                    }))}
                />

                {/* Search & Filter Controls */}
                {showControls && (
                    <form
                        role="search"
                        action="/vault"
                        method="get"
                        onSubmit={(e) => {
                            e.preventDefault();
                            apply(query, kind, sort, false);
                        }}
                        className="relative flex flex-wrap items-center gap-3">
                        {view.tab === "shared" && (
                            <input type="hidden" name="tab" value="shared" />
                        )}

                        {/* Rounded Pill Search Bar */}
                        <div className="relative min-w-[240px] md:w-[320px] ">
                            <Search
                                size={18}
                                strokeWidth={2}
                                aria-hidden
                                className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted"
                            />
                            <input
                                type="search"
                                name="q"
                                value={query}
                                onChange={(e) => {
                                    const nextVal = e.target.value;
                                    setQuery(nextVal);
                                    if (debounceRef.current)
                                        clearTimeout(debounceRef.current);
                                    debounceRef.current = setTimeout(() => {
                                        navigate(
                                            vaultHref({
                                                tab: view.tab,
                                                q: nextVal.trim(),
                                                kind,
                                                sort,
                                            }),
                                            { replace: true },
                                        );
                                    }, 250);
                                }}
                                maxLength={120}
                                placeholder="Search captures, titles, or hashes..."
                                className="h-11 w-full rounded-full border border-border bg-brand-50 pr-9 pl-11 text-sm text-ink placeholder:text-muted transition-colors focus:border-brand-600 focus:bg-card focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                            />
                            {isPending && (
                                <Loader2
                                    size={16}
                                    aria-hidden
                                    className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 animate-spin text-brand-600"
                                />
                            )}
                        </div>

                        {/* Filter Toggle Button */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setFilterOpen((o) => !o)}
                                aria-expanded={filterOpen}
                                className={cn(
                                    "flex h-11 items-center gap-2 rounded-full border border-brand-500 bg-card px-5 text-sm font-medium transition-colors hover:bg-brand-50",
                                    Boolean(view.kind || view.sort) ||
                                        filterOpen
                                        ? "border-brand-600 bg-brand-50 text-brand-700"
                                        : "text-brand-800",
                                )}>
                                <SlidersHorizontal
                                    size={17}
                                    strokeWidth={2}
                                    aria-hidden
                                />
                                <span>Filter</span>
                                <ChevronDown
                                    size={15}
                                    strokeWidth={2}
                                    className={cn(
                                        "text-muted transition-transform duration-200",
                                        filterOpen && "rotate-180",
                                    )}
                                    aria-hidden
                                />
                            </button>

                            {/* Filter Dropdown Popover */}
                            {filterOpen && (
                                <div className="absolute right-0 z-30 mt-2 w-72 rounded-2xl border border-border bg-card p-4 shadow-xl">
                                    <div className="mb-3 flex items-center justify-between border-b border-border pb-2">
                                        <span className="text-sm font-bold text-ink">
                                            Filter & sort
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setFilterOpen(false)}
                                            className="rounded-full p-1 text-muted hover:bg-subtle">
                                            <X size={16} />
                                        </button>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <div>
                                            <label
                                                htmlFor="filter-kind"
                                                className="block text-xs font-bold text-muted">
                                                Evidence kind
                                            </label>
                                            <select
                                                id="filter-kind"
                                                name="kind"
                                                value={kind}
                                                onChange={(e) =>
                                                    setKind(
                                                        e.target
                                                            .value as VaultView["kind"],
                                                    )
                                                }
                                                className="mt-1 h-9 w-full rounded-lg border border-border bg-card px-3 text-xs font-medium text-ink focus:border-brand-600 focus:outline-none">
                                                <option value="">
                                                    All kinds
                                                </option>
                                                <option value="facebook_post">
                                                    Posts
                                                </option>
                                                <option value="facebook_message">
                                                    Messages
                                                </option>
                                            </select>
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="filter-sort"
                                                className="block text-xs font-bold text-muted">
                                                Sort order
                                            </label>
                                            <select
                                                id="filter-sort"
                                                name="sort"
                                                value={sort}
                                                onChange={(e) =>
                                                    setSort(
                                                        e.target
                                                            .value as VaultView["sort"],
                                                    )
                                                }
                                                className="mt-1 h-9 w-full rounded-lg border border-border bg-card px-3 text-xs font-medium text-ink focus:border-brand-600 focus:outline-none">
                                                {view.tab === "shared" ? (
                                                    <>
                                                        <option value="">
                                                            Recently shared
                                                        </option>
                                                        <option value="newest">
                                                            Newest capture
                                                        </option>
                                                    </>
                                                ) : (
                                                    <option value="">
                                                        Newest first
                                                    </option>
                                                )}
                                                <option value="oldest">
                                                    Oldest first
                                                </option>
                                                <option value="name">
                                                    Name, A to Z
                                                </option>
                                            </select>
                                        </div>

                                        <div className="mt-2 flex items-center justify-end gap-2 border-t border-border pt-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setKind("");
                                                    setSort("");
                                                    apply(query, "", "", false);
                                                }}
                                                className="rounded-full px-3 py-1.5 text-xs font-semibold text-muted hover:text-ink">
                                                Reset
                                            </button>
                                            <button
                                                type="submit"
                                                className="rounded-full bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-700">
                                                Apply
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
