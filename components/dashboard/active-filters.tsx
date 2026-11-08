import { X } from "lucide-react";
import React from "react";
import { FocusLink } from "@/components/ui/search-focus";
import { cn } from "@/lib/cn";

export type ActiveFilterChip = {
  label: string;
  removeHref: string;
};

export interface ActiveFiltersProps {
  countText?: string;
  chips: ActiveFilterChip[];
  clearHref?: string;
  className?: string;
}

/**
 * Renders active filters as removable green pill tags with an overall item count,
 * matching Escapture's Figma-aligned UI system.
 */
export function ActiveFilters({
  countText,
  chips,
  clearHref,
  className,
}: ActiveFiltersProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3 pt-1", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {countText && (
          <span aria-live="polite" className="tnum text-sm font-semibold text-muted">
            {countText}
          </span>
        )}

        {chips.length > 0 && countText && (
          <span className="text-muted/60" aria-hidden="true">
            •
          </span>
        )}

        {chips.map((chip) => (
          <FocusLink
            key={chip.label}
            href={chip.removeHref}
            title={`Remove filter: ${chip.label}`}
            className="group inline-flex items-center gap-1.5 rounded-full bg-brand-100/90 px-3 py-1 text-xs font-semibold text-brand-800 transition-colors hover:bg-brand-200"
          >
            <span>{chip.label}</span>
            <X
              size={12}
              strokeWidth={2.5}
              className="text-brand-700 group-hover:text-brand-900"
              aria-hidden="true"
            />
          </FocusLink>
        ))}

        {chips.length > 0 && clearHref && (
          <FocusLink
            href={clearHref}
            className="rounded-full px-2 py-1 text-xs font-semibold text-muted transition-colors hover:text-danger-fg"
          >
            Clear all
          </FocusLink>
        )}
      </div>
    </div>
  );
}
