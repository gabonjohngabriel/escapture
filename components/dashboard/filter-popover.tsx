"use client";

import { Check, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { FocusLink } from "@/components/ui/search-focus";
import { cn } from "@/lib/cn";

export type FilterGroupOption = {
  label: string;
  href: string;
  active: boolean;
};

export type FilterGroup = {
  id: string;
  label: string;
  type: "radio" | "checkbox" | "segment";
  options: FilterGroupOption[];
};

export interface FilterPopoverProps {
  groups: FilterGroup[];
  activeCount: number;
  clearHref?: string;
  title?: string;
  className?: string;
}

/**
 * Standardized Filter Popover matching Escapture's Figma green capsule aesthetic.
 * Encapsulates complex filtering into a clean capsule trigger button with active-count badge,
 * and renders categorized controls (segmented controls, radios, checkboxes) in a popover.
 */
export function FilterPopover({
  groups,
  activeCount,
  clearHref,
  title = "Filter",
  className,
}: FilterPopoverProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      {/* Capsule Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          "flex h-11 items-center gap-2 rounded-full border border-brand-500 bg-card px-5 text-sm font-medium transition-colors hover:bg-brand-50 cursor-pointer",
          activeCount > 0 || open
            ? "border-brand-600 bg-brand-50 text-brand-700"
            : "text-brand-800",
        )}
      >
        <SlidersHorizontal size={17} strokeWidth={2} aria-hidden />
        <span>Filter</span>
        {activeCount > 0 && (
          <span className="grid size-5 place-items-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
            {activeCount}
          </span>
        )}
        <ChevronDown
          size={15}
          strokeWidth={2}
          className={cn(
            "text-muted transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {/* Popover Card */}
      {open && (
        <div
          role="dialog"
          aria-label={title}
          className="animate-in fade-in zoom-in-95 absolute right-0 z-30 mt-2 w-80 rounded-2xl border border-border bg-card p-4 shadow-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-sm font-bold text-ink">{title}</span>
            <div className="flex items-center gap-2">
              {activeCount > 0 && clearHref && (
                <FocusLink
                  href={clearHref}
                  onClick={() => setOpen(false)}
                  className="rounded-full px-2.5 py-1 text-xs font-semibold text-brand-600 hover:text-brand-800 hover:bg-brand-50"
                >
                  Reset all
                </FocusLink>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="rounded-full p-1 text-muted hover:bg-subtle hover:text-ink cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Groups */}
          <div className="flex flex-col gap-4 py-3">
            {groups.map((group) => (
              <div key={group.id} className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-muted uppercase tracking-wider">
                  {group.label}
                </span>

                {group.type === "segment" ? (
                  <div className="inline-flex w-full rounded-xl bg-subtle p-1 gap-1">
                    {group.options.map((opt) => (
                      <FocusLink
                        key={opt.label}
                        href={opt.href}
                        className={cn(
                          "flex-1 rounded-lg py-1.5 text-center text-xs font-semibold transition-all select-none",
                          opt.active
                            ? "bg-brand-600 text-white shadow-xs"
                            : "text-muted hover:text-ink hover:bg-card/70",
                        )}
                      >
                        {opt.label}
                      </FocusLink>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {group.options.map((opt) => {
                      const isRadio = group.type === "radio";
                      return (
                        <FocusLink
                          key={opt.label}
                          href={opt.href}
                          className={cn(
                            "flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors hover:bg-brand-50/70",
                            opt.active ? "text-brand-800 font-semibold" : "text-ink",
                          )}
                        >
                          <span>{opt.label}</span>
                          <div
                            className={cn(
                              "flex size-4 shrink-0 items-center justify-center border transition-colors",
                              isRadio ? "rounded-full" : "rounded",
                              opt.active
                                ? "border-brand-600 bg-brand-600 text-white"
                                : "border-border bg-card",
                            )}
                          >
                            {opt.active && (
                              isRadio ? (
                                <div className="size-1.5 rounded-full bg-white" />
                              ) : (
                                <Check size={11} strokeWidth={3} />
                              )
                            )}
                          </div>
                        </FocusLink>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end border-t border-border pt-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full bg-brand-600 px-5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
