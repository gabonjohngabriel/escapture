"use client";

import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
    const router = useRouter();
    const [filterOpen, setFilterOpen] = useState(false);

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

    function apply(form: HTMLFormElement) {
        const data = new FormData(form);
        router.push(
            vaultHref({
                tab: view.tab,
                q: String(data.get("q") ?? "").trim(),
                kind: String(data.get("kind") ?? "") as VaultView["kind"],
                sort: String(data.get("sort") ?? "") as VaultView["sort"],
            }),
        );
        setFilterOpen(false);
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Pill Tabs */}
                <nav
                    aria-label="Vault tabs"
                    className="inline-flex items-center rounded-full bg-white p-1.5 shadow-soft">
                    {tabs.map((t) => {
                        const active = view.tab === t.key;
                        return (
                            <Link
                                key={t.key}
                                href={vaultHref({ tab: t.key, q: view.q })}
                                aria-current={active ? "page" : undefined}
                                className={cn(
                                    "flex items-center gap-2.5 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 select-none",
                                    active
                                        ? "bg-brand-600 text-white shadow-xs"
                                        : "text-muted hover:text-brand-700",
                                )}>
                                <span>{t.label}</span>
                                <span
                                    className={cn(
                                        "flex size-5 items-center justify-center rounded-full text-xs font-bold transition-colors",
                                        active
                                            ? "bg-white text-brand-700"
                                            : "bg-brand-100 text-brand-800",
                                    )}>
                                    {t.count}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Search & Filter Controls */}
                {showControls && (
                    <form
                        key={vaultHref(view)}
                        role="search"
                        action="/vault"
                        method="get"
                        onSubmit={(e) => {
                            e.preventDefault();
                            apply(e.currentTarget);
                        }}
                        className="relative flex flex-wrap items-center gap-3">
                        {view.tab === "shared" && (
                            <input type="hidden" name="tab" value="shared" />
                        )}

                        {/* Rounded Pill Search Bar */}
                        <div className="relative min-w-[240px] md:w-[320px]">
                            <Search
                                size={18}
                                strokeWidth={2}
                                aria-hidden
                                className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted"
                            />
                            <input
                                type="search"
                                name="q"
                                defaultValue={view.q}
                                maxLength={120}
                                placeholder="Search captures, titles, or hashes..."
                                className="h-11 w-full rounded-full border border-border bg-brand-50 pr-4 pl-11 text-sm text-ink placeholder:text-muted transition-colors focus:border-brand-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                            />
                        </div>

                        {/* Filter Toggle Button */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setFilterOpen((o) => !o)}
                                aria-expanded={filterOpen}
                                className={cn(
                                    "flex h-11 items-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-medium transition-colors hover:bg-brand-50",
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
                                        "transition-transform duration-200 text-muted",
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
                                                defaultValue={view.kind}
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
                                                defaultValue={view.sort}
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
                                                    router.push(
                                                        vaultHref({
                                                            tab: view.tab,
                                                            q: view.q,
                                                        }),
                                                    );
                                                    setFilterOpen(false);
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
