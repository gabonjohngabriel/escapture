"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useTransition,
  type ComponentProps,
} from "react";
import { Skeleton } from "@/components/ui/feedback";
import { cn } from "@/lib/cn";

type NavigateOptions = {
  replace?: boolean;
};

type SearchFocusContextValue = {
  isPending: boolean;
  navigate: (href: string, options?: NavigateOptions) => void;
};

const SearchFocusContext = createContext<SearchFocusContextValue | null>(null);

/**
 * Coordinates search, sort, and filter navigations so only the results focus
 * area shows a loading transition while the page header, tabs, and inputs stay
 * mounted and focused.
 */
export function SearchFocusProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const navigate = useCallback(
    (href: string, options?: NavigateOptions) => {
      startTransition(() => {
        if (options?.replace) {
          router.replace(href, { scroll: false });
        } else {
          router.push(href, { scroll: false });
        }
      });
    },
    [router],
  );

  return (
    <SearchFocusContext.Provider value={{ isPending, navigate }}>
      {children}
    </SearchFocusContext.Provider>
  );
}

export function useSearchFocus(): SearchFocusContextValue {
  const ctx = useContext(SearchFocusContext);
  const router = useRouter();
  const [localPending, startTransition] = useTransition();

  const fallbackNavigate = useCallback(
    (href: string, options?: NavigateOptions) => {
      startTransition(() => {
        if (options?.replace) {
          router.replace(href, { scroll: false });
        } else {
          router.push(href, { scroll: false });
        }
      });
    },
    [router],
  );

  return ctx ?? { isPending: localPending, navigate: fallbackNavigate };
}

/**
 * Wraps the results area that should refresh during a search, sort, or filter
 * transition while keeping surrounding controls intact.
 */
export function SearchFocusArea({
  children,
  fallback,
  className,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}) {
  const { isPending } = useSearchFocus();

  if (isPending && fallback) {
    return <div className={className}>{fallback}</div>;
  }

  return (
    <div
      aria-busy={isPending || undefined}
      className={cn(
        "transition-opacity duration-150",
        isPending && "pointer-events-none opacity-55",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * A `<Link>` that participates in the nearest `SearchFocusProvider` transition
 * so clicking tabs, filter chips, pagination, or "Clear filters" only refreshes
 * the results focus area.
 */
export function FocusLink({
  onClick,
  href,
  scroll = false,
  ...props
}: ComponentProps<typeof Link>) {
  const ctx = useContext(SearchFocusContext);

  return (
    <Link
      href={href}
      scroll={scroll}
      onClick={(e) => {
        onClick?.(e);
        if (
          e.defaultPrevented ||
          !ctx ||
          e.button !== 0 ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey
        ) {
          return;
        }
        e.preventDefault();
        ctx.navigate(typeof href === "string" ? href : href.toString());
      }}
      {...props}
    />
  );
}

export function CardsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading results"
      className="grid grid-cols-1 gap-5 md:grid-cols-2"
    >
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="h-40 w-full rounded-2xl" />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading table results"
      className="overflow-hidden rounded-xl border border-border bg-card shadow-soft"
    >
      <div className="border-b border-border bg-subtle px-4 py-3">
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex h-11 items-center gap-4 px-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/5" />
            <Skeleton className="ml-auto h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading items"
      className="flex flex-col gap-3.5"
    >
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-2xl" />
      ))}
    </div>
  );
}
