"use client";

import { CheckCheck, Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSearchFocus } from "@/components/ui/search-focus";
import { useToast } from "@/components/ui/toast";
import { api, errorMessage } from "@/lib/client-api";

export function MarkAllRead() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await api("/api/notifications/read", { body: {} });
        } catch (err) {
          toast(errorMessage(err));
        }
        setLoading(false);
        router.refresh();
      }}
      className="inline-flex h-11 items-center gap-2 rounded-full bg-[#52946B] px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#427A56] hover:shadow disabled:opacity-50"
    >
      <CheckCheck size={18} strokeWidth={2.5} aria-hidden />
      <span>{loading ? "Marking..." : "Mark all as read"}</span>
    </button>
  );
}

export function NotificationsSearchForm({
  tabKey,
  defaultQuery = "",
}: {
  tabKey: string;
  defaultQuery?: string;
}) {
  const { isPending, navigate } = useSearchFocus();
  const [query, setQuery] = useState(defaultQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(defaultQuery);
  }, [defaultQuery]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function buildHref(nextQuery: string) {
    const params = new URLSearchParams();
    if (tabKey && tabKey !== "all") params.set("tab", tabKey);
    const trimmed = nextQuery.trim();
    if (trimmed) params.set("q", trimmed);
    const qs = params.toString();
    return qs ? `/notifications?${qs}` : "/notifications";
  }

  return (
    <form
      role="search"
      action="/notifications"
      method="get"
      onSubmit={(e) => {
        e.preventDefault();
        if (debounceRef.current) clearTimeout(debounceRef.current);
        navigate(buildHref(query));
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
              navigate(buildHref(nextVal), { replace: true });
            }, 250);
          }}
          placeholder="Search notifications..."
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
    </form>
  );
}
