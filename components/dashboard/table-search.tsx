"use client";

import { Loader2, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSearchFocus } from "@/components/ui/search-focus";
import { cn } from "@/lib/cn";

/**
 * A client-side search box that filters a table in the address bar without
 * triggering a full browser reload or unmounting the input.
 */
export function TableSearch({
  action,
  label,
  value,
  keep = {},
  className,
}: {
  action: string;
  label: string;
  value: string;
  keep?: Record<string, string | undefined>;
  className?: string;
}) {
  const { isPending, navigate } = useSearchFocus();
  const [query, setQuery] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function buildHref(nextQuery: string) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(keep)) {
      if (v) params.set(k, v);
    }
    const trimmed = nextQuery.trim();
    if (trimmed) params.set("q", trimmed);
    const qs = params.toString();
    return qs ? `${action}?${qs}` : action;
  }

  return (
    <form
      role="search"
      action={action}
      method="get"
      onSubmit={(e) => {
        e.preventDefault();
        if (debounceRef.current) clearTimeout(debounceRef.current);
        navigate(buildHref(query));
      }}
      className={cn("relative", className)}
    >
      {Object.entries(keep).map(([name, v]) =>
        v ? <input key={name} type="hidden" name={name} value={v} /> : null,
      )}
      <Search
        size={16}
        strokeWidth={1.75}
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
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
            navigate(buildHref(nextVal), { replace: true });
          }, 250);
        }}
        aria-label={label}
        placeholder={label}
        maxLength={120}
        className="h-10 w-full rounded-md border border-border-strong bg-card pr-8 pl-[38px] text-[15px] leading-5 text-ink placeholder:text-muted"
      />
      {isPending && (
        <Loader2
          size={15}
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 animate-spin text-brand-600"
        />
      )}
    </form>
  );
}
