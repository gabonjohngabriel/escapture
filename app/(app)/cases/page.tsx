import { FolderOpen } from "lucide-react";
import { CreateReportButton } from "@/components/cases/case-actions";
import { ReportCardsGrid } from "@/components/cases/report-cards-grid";
import { CasesSearchForm } from "@/components/cases/report-sort";
import {
  CardsGridSkeleton,
  FocusLink,
  SearchFocusArea,
  SearchFocusProvider,
} from "@/components/ui/search-focus";
import { cn } from "@/lib/cn";
import { pageUser } from "@/server/page-auth";
import { listCases } from "@/server/services/cases";

// Per-user page: allowed to wait for the server on navigation.
export const instant = false;

const TABS = [
  { key: "all", label: "All reports", match: () => true },
  { key: "drafts", label: "Drafts", match: (s: string) => s === "draft" },
  {
    key: "escalated",
    label: "Escalated",
    match: (s: string) => s === "escalated" || s === "under_review",
  },
  {
    key: "closed",
    label: "Closed",
    match: (s: string) => s === "closed",
  },
] as const;

export default async function CasesPage({ searchParams }: PageProps<"/cases">) {
  const user = await pageUser(["student"]);
  const all = await listCases(user);
  const params = await searchParams;
  const key = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const rawQ = (Array.isArray(params.q) ? params.q[0] : params.q ?? "").trim();
  const q = rawQ.toLowerCase();
  const sort = Array.isArray(params.sort) ? params.sort[0] : params.sort ?? "updated";

  const tab = TABS.find((t) => t.key === key) ?? TABS[0];
  let items = all
    .filter((c) => tab.match(c.status))
    .filter(
      (c) =>
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.ownerName.toLowerCase().includes(q),
    );

  if (sort === "evidence") {
    items = [...items].sort((a, b) => b.evidenceCount - a.evidenceCount);
  } else if (sort === "title") {
    items = [...items].sort((a, b) => a.title.localeCompare(b.title));
  } else {
    items = [...items].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-brand-700 sm:text-4xl">
            Reports
          </h1>
          <p className="text-base text-muted">
            Organize captured evidence. Share only when you choose.
          </p>
        </div>

        <CreateReportButton />
      </div>

      {all.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-brand-500 bg-card p-12 text-center shadow-xs">
          <div className="flex size-16 items-center justify-center rounded-full bg-brand-50 text-brand-700">
            <FolderOpen size={32} strokeWidth={2} aria-hidden />
          </div>
          <h2 className="mt-5 text-2xl font-bold text-brand-800">
            You have no reports yet
          </h2>
          <p className="mt-2.5 max-w-xl text-base leading-relaxed text-muted">
            Start a report when you are ready. It stays a private draft, and you
            can add evidence and people you trust at your own pace.
          </p>
          <div className="mt-6">
            <CreateReportButton />
          </div>
        </div>
      ) : (
        <SearchFocusProvider>
          <div className="flex flex-col gap-5">
            {/* Toolbar: Pill Tabs + Search & Sort */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <nav
                aria-label="Report sections"
                className="inline-flex items-center rounded-full bg-brand-50 p-1.5 shadow-xs"
              >
                {TABS.map((t) => {
                  const active = t.key === tab.key;
                  const count = all.filter((c) => t.match(c.status)).length;
                  const tabParams = new URLSearchParams();
                  if (t.key !== "all") tabParams.set("tab", t.key);
                  if (rawQ) tabParams.set("q", rawQ);
                  if (sort && sort !== "updated") tabParams.set("sort", sort);
                  const qs = tabParams.toString();
                  const href = qs ? `/cases?${qs}` : "/cases";
                  return (
                    <FocusLink
                      key={t.key}
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 select-none",
                        active
                          ? "bg-brand-600 text-white shadow-xs"
                          : "text-muted hover:text-brand-700",
                      )}
                    >
                      <span>{t.label}</span>
                      <span
                        className={cn(
                          "flex size-5 items-center justify-center rounded-full text-xs font-bold transition-colors",
                          active
                            ? "bg-white text-brand-700"
                            : "bg-brand-100 text-brand-800",
                        )}
                      >
                        {count}
                      </span>
                    </FocusLink>
                  );
                })}
              </nav>

              {/* Search Input & Filter */}
              <CasesSearchForm
                tabKey={tab.key}
                defaultQuery={rawQ}
                defaultSort={sort}
              />
            </div>

            {/* Cards Grid or Empty Filter (Focus Area) */}
            <SearchFocusArea fallback={<CardsGridSkeleton />}>
              {items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-brand-500/40 bg-card p-12 text-center">
                  <p className="text-base font-bold text-brand-800">
                    No reports matched your filters
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Try adjusting your search terms or view a different tab.
                  </p>
                  <div className="mt-4">
                    <FocusLink
                      href="/cases"
                      className="inline-flex items-center rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                    >
                      Clear filters
                    </FocusLink>
                  </div>
                </div>
              ) : (
                <ReportCardsGrid items={items} />
              )}
            </SearchFocusArea>
          </div>
        </SearchFocusProvider>
      )}
    </div>
  );
}
