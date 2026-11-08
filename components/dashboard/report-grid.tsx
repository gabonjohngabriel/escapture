"use client";

import {
  Archive,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Globe,
  Inbox,
  Loader2,
  RotateCw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { PillTabs } from "@/components/ui/pill-tabs";
import { CardsGridSkeleton } from "@/components/ui/search-focus";
import { cn } from "@/lib/cn";
import { ReportCard } from "./report-card";
import {
  ReportDetailsDialog,
  type ReportDetailData,
} from "./report-details-dialog";

export type ReportGridProps = {
  items: ReportDetailData[];
  activeTab: "recent" | "archived";
  recentCount: number;
  archivedCount: number;
  total: number;
  page: number;
  pageSize?: number;
  q?: string;
  mine?: boolean;
  unassigned?: boolean;
  flagged?: boolean;
  range?: string;
  isUnavailable?: boolean;
  baseHref?: string;
};

export function ReportGrid({
  items,
  activeTab,
  recentCount,
  archivedCount,
  total,
  page,
  pageSize = 4,
  q = "",
  mine = false,
  unassigned = false,
  flagged = false,
  range = "all",
  isUnavailable = false,
  baseHref = "/review",
}: ReportGridProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedReport, setSelectedReport] =
    useState<ReportDetailData | null>(null);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState(q);
  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    setPrevQ(q);
    setSearchTerm(q);
  }
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Close filter popover on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(e.target as Node)
      ) {
        setFilterMenuOpen(false);
      }
    }
    if (filterMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [filterMenuOpen]);

  const navigate = (href: string, replace = false) => {
    startTransition(() => {
      if (replace) {
        router.replace(href, { scroll: false });
      } else {
        router.push(href, { scroll: false });
      }
    });
  };

  const buildUrl = (
    overrides: Record<string, string | number | boolean | undefined>,
  ) => {
    const params = new URLSearchParams();
    const merged = {
      tab: activeTab,
      q: searchTerm || undefined,
      mine: mine ? "1" : undefined,
      unassigned: unassigned ? "1" : undefined,
      flagged: flagged ? "1" : undefined,
      range: range !== "all" ? range : undefined,
      page: page > 1 ? String(page) : undefined,
      ...overrides,
    };

    for (const [key, val] of Object.entries(merged)) {
      if (val !== undefined && val !== "" && (val as unknown) !== false) {
        params.set(key, String(val));
      }
    }
    const qs = params.toString();
    return qs ? `${baseHref}?${qs}` : baseHref;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    navigate(buildUrl({ q: searchTerm.trim() || undefined, page: undefined }));
  };

  const handleTabChange = (tab: "recent" | "archived") => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    navigate(buildUrl({ tab, page: undefined }));
  };

  const handleReload = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const activeFilterCount =
    (mine ? 1 : 0) +
    (unassigned ? 1 : 0) +
    (flagged ? 1 : 0) +
    (range !== "all" ? 1 : 0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const startIdx = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIdx = Math.min(page * pageSize, total);

  return (
    <section className="flex flex-col gap-5">
      {/* Header and Controls */}
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-brand-700">
          Reports
        </h2>

        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Tabs: Recent Cases vs Archived Cases */}
          <PillTabs
            variant="white"
            label="Report tabs"
            tabs={[
              {
                key: "recent",
                label: "Recent Cases",
                count: recentCount,
                active: activeTab === "recent",
                onClick: () => handleTabChange("recent"),
              },
              {
                key: "archived",
                label: "Archived Cases",
                count: archivedCount,
                active: activeTab === "archived",
                onClick: () => handleTabChange("archived"),
              },
            ]}
          />

          {/* Search Bar & Filter Menu */}
          <div className="flex min-w-[280px] flex-1 items-center justify-end gap-3">
            <form
              onSubmit={handleSearchSubmit}
              className="relative min-w-[240px] md:w-[320px]"
            >
              <Search
                size={18}
                strokeWidth={2}
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted"
              />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => {
                  const nextVal = e.target.value;
                  setSearchTerm(nextVal);
                  if (debounceRef.current) clearTimeout(debounceRef.current);
                  debounceRef.current = setTimeout(() => {
                    navigate(
                      buildUrl({
                        q: nextVal.trim() || undefined,
                        page: undefined,
                      }),
                      true,
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
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 animate-spin text-brand-600"
                />
              )}
            </form>

            {/* Filter Menu Dropdown */}
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                className={cn(
                  "flex h-11 items-center gap-2 rounded-full border border-brand-500 bg-card px-5 text-sm font-medium transition-colors hover:bg-brand-50 cursor-pointer",
                  activeFilterCount > 0 || filterMenuOpen
                    ? "border-brand-600 bg-brand-50 text-brand-700"
                    : "text-brand-800",
                )}
                aria-expanded={filterMenuOpen}
              >
                <SlidersHorizontal size={17} strokeWidth={2} aria-hidden />
                <span>Filter</span>
                {activeFilterCount > 0 && (
                  <span className="grid size-5 place-items-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown
                  size={15}
                  strokeWidth={2}
                  className={cn(
                    "text-muted transition-transform duration-200",
                    filterMenuOpen && "rotate-180",
                  )}
                  aria-hidden
                />
              </button>

              {filterMenuOpen && (
                <div className="animate-in fade-in zoom-in-95 absolute top-full right-0 z-30 mt-2 w-72 rounded-2xl border border-border bg-card p-4 shadow-raised">
                  <div className="flex items-center justify-between border-b border-border pb-2.5">
                    <span className="text-xs font-bold tracking-wider text-brand-700 uppercase">
                      Filter Reports
                    </span>
                    {activeFilterCount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setFilterMenuOpen(false);
                          navigate(
                            buildUrl({
                              mine: false,
                              unassigned: false,
                              flagged: false,
                              range: "all",
                              page: undefined,
                            }),
                          );
                        }}
                        className="cursor-pointer text-xs font-semibold text-brand-600 hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 py-3">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                      <input
                        type="checkbox"
                        checked={mine}
                        onChange={(e) => {
                          navigate(
                            buildUrl({
                              mine: e.target.checked ? "1" : undefined,
                              page: undefined,
                            }),
                          );
                        }}
                        className="size-4 rounded border-border-strong text-brand-600 focus:ring-brand-500"
                      />
                      <span>Assigned to me</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                      <input
                        type="checkbox"
                        checked={unassigned}
                        onChange={(e) => {
                          navigate(
                            buildUrl({
                              unassigned: e.target.checked ? "1" : undefined,
                              page: undefined,
                            }),
                          );
                        }}
                        className="size-4 rounded border-border-strong text-brand-600 focus:ring-brand-500"
                      />
                      <span>Unassigned only</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                      <input
                        type="checkbox"
                        checked={flagged}
                        onChange={(e) => {
                          navigate(
                            buildUrl({
                              flagged: e.target.checked ? "1" : undefined,
                              page: undefined,
                            }),
                          );
                        }}
                        className="size-4 rounded border-border-strong text-brand-600 focus:ring-brand-500"
                      />
                      <span>Flagged keywords detected</span>
                    </label>

                    <div className="border-t border-border pt-2">
                      <label className="mb-1 block text-xs font-semibold text-muted">
                        Time Period
                      </label>
                      <select
                        value={range}
                        onChange={(e) => {
                          navigate(
                            buildUrl({
                              range:
                                e.target.value !== "all"
                                  ? e.target.value
                                  : undefined,
                              page: undefined,
                            }),
                          );
                        }}
                        className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-ink focus:border-brand-600 focus:outline-none"
                      >
                        <option value="all">All time</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area (Focus Area): Grid, Empty State, or Unavailable State */}
      {isPending ? (
        <CardsGridSkeleton count={4} />
      ) : isUnavailable ? (
        /* Screen 3: Unavailable / Error State */
        <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-brand-500/40 bg-card p-12 text-center shadow-soft">
          <button
            type="button"
            onClick={handleReload}
            aria-label="Retry loading review desk"
            title="Retry"
            className="absolute top-5 right-5 grid size-9 cursor-pointer place-items-center rounded-full bg-brand-600 text-white shadow-xs transition-colors hover:bg-brand-700"
          >
            <RotateCw size={16} />
          </button>

          <div className="mb-4 grid size-12 place-items-center rounded-full bg-red-50 text-red-600 ring-1 ring-red-200">
            <Globe size={24} />
          </div>

          <h3 className="text-xl font-bold text-brand-800">
            We couldn&apos;t load your review desk
          </h3>
          <p className="mt-2 max-w-md text-sm text-muted">
            Reports, counts and activity are unavailable right now. This does
            not mean there are no reports. Check your connection, then try
            again.
          </p>
          <p className="mt-1 max-w-sm text-xs text-muted/80">
            Nothing has been changed. If the problem continues, wait a few
            minutes before retrying.
          </p>
        </div>
      ) : items.length === 0 ? (
        /* Screen 2 & Screen 4: Empty State */
        <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-brand-500/50 bg-card p-12 text-center shadow-soft">
          <button
            type="button"
            onClick={handleReload}
            aria-label="Refresh reports"
            title="Refresh"
            className="absolute top-5 right-5 grid size-9 cursor-pointer place-items-center rounded-full bg-brand-600 text-white shadow-xs transition-colors hover:bg-brand-700"
          >
            <RotateCw size={16} />
          </button>

          <div className="mb-4 grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-200">
            {activeTab === "recent" ? (
              <Inbox size={26} strokeWidth={1.75} />
            ) : (
              <Archive size={26} strokeWidth={1.75} />
            )}
          </div>

          <h3 className="text-xl font-bold text-brand-800">
            {activeTab === "recent"
              ? "No submitted reports yet"
              : "No archived cases yet"}
          </h3>

          <p className="mt-2 max-w-lg text-sm text-muted">
            {activeTab === "recent"
              ? "Only reports explicitly escalated to the university appear here. There are no escalated reports in your review desk yet."
              : "Closed reports appear here after an Actions Taken note has been recorded. Your recent cases are still available in Recent Cases."}
          </p>

          <p className="mt-2 max-w-md text-xs text-muted/80">
            {activeTab === "recent"
              ? "Private captures stay in the student's vault unless they confirm sharing. An empty review desk does not mean no incidents have occurred."
              : "Closing a report preserves its record and the actions taken for future reference."}
          </p>
        </div>
      ) : (
        /* Screen 1 & Screen 5: 2x2 Grid of Report Cards */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onViewDetails={setSelectedReport}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!isPending && !isUnavailable && total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <p className="text-sm font-medium text-muted">
            Showing {startIdx}–{endIdx} of {total.toLocaleString()}{" "}
            {activeTab === "recent" ? "recent cases" : "archived cases"}
          </p>

          <nav
            aria-label="Pagination controls"
            className="flex items-center gap-1.5"
          >
            {page > 1 ? (
              <Link
                href={buildUrl({ page: page - 1 })}
                scroll={false}
                onClick={(e) => {
                  if (
                    e.button === 0 &&
                    !e.metaKey &&
                    !e.ctrlKey &&
                    !e.shiftKey &&
                    !e.altKey
                  ) {
                    e.preventDefault();
                    navigate(buildUrl({ page: page - 1 }));
                  }
                }}
                className="inline-flex h-9 items-center gap-1 rounded-full border border-border-strong/40 bg-card px-3 text-xs font-semibold text-ink shadow-xs hover:bg-brand-50"
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </Link>
            ) : (
              <span className="inline-flex h-9 cursor-not-allowed items-center gap-1 rounded-full border border-transparent bg-subtle px-3 text-xs font-semibold text-disabled-fg">
                <ChevronLeft size={14} />
                <span>Previous</span>
              </span>
            )}

            {/* Page number buttons */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = i + 1;
              const isActive = p === page;
              return (
                <Link
                  key={p}
                  href={buildUrl({ page: p })}
                  scroll={false}
                  onClick={(e) => {
                    if (
                      e.button === 0 &&
                      !e.metaKey &&
                      !e.ctrlKey &&
                      !e.shiftKey &&
                      !e.altKey
                    ) {
                      e.preventDefault();
                      navigate(buildUrl({ page: p }));
                    }
                  }}
                  className={cn(
                    "grid size-9 cursor-pointer place-items-center rounded-full text-xs font-semibold transition-colors",
                    isActive
                      ? "bg-brand-600 text-white shadow-xs"
                      : "text-ink hover:bg-brand-50",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {p}
                </Link>
              );
            })}

            {page < totalPages ? (
              <Link
                href={buildUrl({ page: page + 1 })}
                scroll={false}
                onClick={(e) => {
                  if (
                    e.button === 0 &&
                    !e.metaKey &&
                    !e.ctrlKey &&
                    !e.shiftKey &&
                    !e.altKey
                  ) {
                    e.preventDefault();
                    navigate(buildUrl({ page: page + 1 }));
                  }
                }}
                className="inline-flex h-9 items-center gap-1 rounded-full border border-border-strong/40 bg-card px-3 text-xs font-semibold text-ink shadow-xs hover:bg-brand-50"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </Link>
            ) : (
              <span className="inline-flex h-9 cursor-not-allowed items-center gap-1 rounded-full border border-transparent bg-subtle px-3 text-xs font-semibold text-disabled-fg">
                <span>Next</span>
                <ChevronRight size={14} />
              </span>
            )}
          </nav>
        </div>
      )}

      {/* Details Dialog */}
      <ReportDetailsDialog
        report={selectedReport}
        open={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
      />
    </section>
  );
}
