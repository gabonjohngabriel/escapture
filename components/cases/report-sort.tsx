"use client";

import { ChevronDown, Loader2, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSearchFocus } from "@/components/ui/search-focus";

export interface ReportSortProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (next: string) => void;
}

/**
 * Interactive Client Component dropdown for sorting reports without a full page reload.
 */
export function ReportSort({
  defaultValue = "updated",
  value,
  onValueChange,
}: ReportSortProps) {
  return (
    <div className="relative">
      <select
        name="sort"
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        aria-label="Sort reports"
        onChange={(e) => {
          if (onValueChange) {
            onValueChange(e.target.value);
          } else {
            e.target.form?.requestSubmit();
          }
        }}
        className="h-11 cursor-pointer appearance-none rounded-full border border-border bg-card pr-9 pl-4 text-sm font-medium text-brand-800 hover:bg-brand-50 focus:border-brand-600 focus:outline-none"
      >
        <option value="updated">Recently updated</option>
        <option value="evidence">Most evidence</option>
        <option value="title">Title, A to Z</option>
      </select>
      <ChevronDown
        size={15}
        strokeWidth={2}
        className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-muted"
        aria-hidden
      />
    </div>
  );
}

export function CasesSearchForm({
  tabKey,
  defaultQuery = "",
  defaultSort = "updated",
}: {
  tabKey: string;
  defaultQuery?: string;
  defaultSort?: string;
}) {
  const { isPending, navigate } = useSearchFocus();
  const [query, setQuery] = useState(defaultQuery);
  const [sort, setSort] = useState(defaultSort);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(defaultQuery);
  }, [defaultQuery]);

  useEffect(() => {
    setSort(defaultSort);
  }, [defaultSort]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function buildHref(nextQuery: string, nextSort: string) {
    const params = new URLSearchParams();
    if (tabKey && tabKey !== "all") params.set("tab", tabKey);
    const trimmed = nextQuery.trim();
    if (trimmed) params.set("q", trimmed);
    if (nextSort) params.set("sort", nextSort);
    const qs = params.toString();
    return qs ? `/cases?${qs}` : "/cases";
  }

  return (
    <form
      role="search"
      action="/cases"
      method="get"
      onSubmit={(e) => {
        e.preventDefault();
        if (debounceRef.current) clearTimeout(debounceRef.current);
        navigate(buildHref(query, sort));
      }}
      className="flex flex-wrap items-center gap-3"
    >
      {tabKey !== "all" && <input type="hidden" name="tab" value={tabKey} />}
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
          value={query}
          onChange={(e) => {
            const nextVal = e.target.value;
            setQuery(nextVal);
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
              navigate(buildHref(nextVal, sort), { replace: true });
            }, 250);
          }}
          placeholder="Search reports..."
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

      <ReportSort
        value={sort}
        onValueChange={(nextSort) => {
          if (debounceRef.current) clearTimeout(debounceRef.current);
          setSort(nextSort);
          navigate(buildHref(query, nextSort));
        }}
      />
    </form>
  );
}
