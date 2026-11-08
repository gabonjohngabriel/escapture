"use client";

import { Check } from "lucide-react";
import { FocusLink, useSearchFocus } from "@/components/ui/search-focus";
import { cn } from "@/lib/cn";

/** A filter that is on or off. It is a link, so the choice lives in the address. */
export function FilterChip({
  label,
  href,
  on,
}: {
  label: string;
  href: string;
  on: boolean;
}) {
  return (
    <FocusLink
      href={href}
      aria-current={on ? "true" : undefined}
      className={cn(
        "inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-sm leading-5 font-semibold whitespace-nowrap transition-colors duration-150",
        on
          ? "border-transparent bg-brand-100 text-brand-800"
          : "border-border bg-card text-muted hover:border-brand-500/40 hover:bg-brand-50 hover:text-ink",
      )}
    >
      {on && <Check size={14} strokeWidth={1.75} aria-hidden />}
      {label}
      <span className="sr-only">
        {on ? ", on. Activate to turn off." : ", off. Activate to turn on."}
      </span>
    </FocusLink>
  );
}

/**
 * A select that changes one search parameter and reloads the list. `hrefs` maps
 * each option's value to where choosing it leads, worked out on the server.
 */
export function ParamSelect({
  label,
  value,
  options,
  hrefs,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  hrefs: Record<string, string>;
}) {
  const { navigate } = useSearchFocus();
  return (
    <label className="flex items-center gap-2 text-sm leading-5 font-semibold text-ink">
      {label}
      <select
        value={value}
        onChange={(e) => navigate(hrefs[e.target.value])}
        className="h-10 rounded-full border border-border bg-card px-4 text-sm font-medium text-ink transition-colors focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
