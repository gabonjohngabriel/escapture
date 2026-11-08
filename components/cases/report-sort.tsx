"use client";

import { ChevronDown } from "lucide-react";

export interface ReportSortProps {
  defaultValue?: string;
}

/**
 * Interactive Client Component dropdown that auto-submits its parent form on change.
 */
export function ReportSort({ defaultValue = "updated" }: ReportSortProps) {
  return (
    <div className="relative">
      <select
        name="sort"
        defaultValue={defaultValue}
        aria-label="Sort reports"
        onChange={(e) => e.target.form?.submit()}
        className="h-11 appearance-none rounded-full border border-border bg-card pr-9 pl-4 text-sm font-medium text-brand-800 hover:bg-brand-50 focus:border-brand-600 focus:outline-none cursor-pointer"
      >
        <option value="updated">Recently updated</option>
        <option value="evidence">Most evidence</option>
        <option value="title">Title, A to Z</option>
      </select>
      <ChevronDown
        size={15}
        strokeWidth={2}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
        aria-hidden
      />
    </div>
  );
}
