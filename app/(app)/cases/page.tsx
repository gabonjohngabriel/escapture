import { ChevronDown, FolderOpen, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { CreateReportButton } from "@/components/cases/case-actions";
import { ReportCardsGrid } from "@/components/cases/report-cards-grid";
import { cn } from "@/lib/cn";
import { pageUser } from "@/server/page-auth";
import { listCases } from "@/server/services/cases";

// Per-user page: allowed to wait for the server on navigation.
export const instant = false;

const TABS = [
  { key: "all", label: "All Reports", match: () => true },
  { key: "drafts", label: "Drafts", match: (s: string) => s === "draft" },
  {
    key: "archived",
    label: "Archived",
    match: (s: string) => s === "closed" || s === "escalated" || s === "under_review",
  },
] as const;

export default async function CasesPage({ searchParams }: PageProps<"/cases">) {
  const user = await pageUser(["student"]);
  const all = await listCases(user);
  const params = await searchParams;
  const key = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const q = (Array.isArray(params.q) ? params.q[0] : params.q ?? "").trim().toLowerCase();

  const tab = TABS.find((t) => t.key === key) ?? TABS[0];
  const items = all
    .filter((c) => tab.match(c.status))
    .filter((c) => !q || c.title.toLowerCase().includes(q) || c.ownerName.toLowerCase().includes(q));

  return (
    <div className="flex flex-col gap-6">
      {/* Header matching Figma node 44:1090 */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex flex-col gap-1">
          <h1
            className="text-[38px] font-bold tracking-tight text-[#52946B] leading-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Reports
          </h1>
          <p className="text-[16px] font-normal text-[#5F856E]">
            Organize captured evidence. Share only when you choose.
          </p>
        </div>

        <CreateReportButton />
      </div>

      {all.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[24px] border-[2px] border-[#52946B] bg-white p-12 text-center shadow-xs">
          <div className="flex size-16 items-center justify-center rounded-full bg-[#F2F7F4] text-[#52946B]">
            <FolderOpen size={32} strokeWidth={2} aria-hidden />
          </div>
          <h2 className="mt-5 text-[24px] font-bold text-[#4A8B63]">You have no reports yet</h2>
          <p className="mt-2.5 max-w-xl text-[15px] leading-relaxed text-[#5F856E]">
            Start a report when you are ready. It stays a private draft, and you can add evidence
            and people you trust at your own pace.
          </p>
          <div className="mt-6">
            <CreateReportButton />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Toolbar matching Figma node 44:1090: Pill Tabs + Search & Filter */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <nav
              aria-label="Report sections"
              className="inline-flex items-center rounded-full bg-[#EBF3EE] p-1.5 shadow-inner"
            >
              {TABS.map((t) => {
                const active = t.key === tab.key;
                const count = all.filter((c) => t.match(c.status)).length;
                const href = t.key === "all" ? "/cases" : `/cases?tab=${t.key}`;
                return (
                  <Link
                    key={t.key}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 select-none",
                      active
                        ? "bg-[#52946B] text-white shadow-sm"
                        : "text-[#5F856E] hover:text-[#52946B]"
                    )}
                  >
                    <span>{t.label}</span>
                    <span
                      className={cn(
                        "flex size-5 items-center justify-center rounded-full text-xs font-bold transition-colors",
                        active
                          ? "bg-white text-[#52946B]"
                          : "bg-[#DCE7DF] text-[#5F856E]"
                      )}
                    >
                      {count}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* Search Input & Filter matching Figma node 44:1090 */}
            <form
              role="search"
              action="/cases"
              method="get"
              className="flex flex-wrap items-center gap-3"
            >
              {tab.key !== "all" && <input type="hidden" name="tab" value={tab.key} />}
              <div className="relative min-w-[240px] md:w-[320px]">
                <Search
                  size={18}
                  strokeWidth={2}
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#5F856E]"
                />
                <input
                  type="search"
                  name="q"
                  defaultValue={q}
                  placeholder="Search captures, hashes, cases..."
                  className="h-11 w-full rounded-full border border-[#DCE5DF] bg-[#F2F7F4] pr-4 pl-11 text-sm text-[#1E2A22] placeholder:text-[#5F856E] transition-colors focus:border-[#52946B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#52946B]/20"
                />
              </div>

              <div className="flex h-11 items-center gap-2 rounded-full border border-[#DCE5DF] bg-white px-5 text-sm font-medium text-[#3F7855] hover:bg-[#F2F7F4] cursor-pointer">
                <SlidersHorizontal size={17} strokeWidth={2} aria-hidden />
                <span>Filter</span>
                <ChevronDown size={15} strokeWidth={2} className="ml-0.5 text-[#5F856E]" />
              </div>
            </form>
          </div>

          {/* Cards Grid or Empty Filter */}
          {items.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[#52946B]/40 bg-white p-12 text-center">
              <p className="text-[16px] font-bold text-[#4A8B63]">No reports matched your filters</p>
              <p className="mt-1 text-sm text-[#5F856E]">Try adjusting your search terms or view a different tab.</p>
              <div className="mt-4">
                <Link
                  href="/cases"
                  className="inline-flex items-center rounded-full bg-[#52946B] px-5 py-2 text-sm font-semibold text-white hover:bg-[#437C58]"
                >
                  Clear filters
                </Link>
              </div>
            </div>
          ) : (
            <ReportCardsGrid items={items} />
          )}
        </div>
      )}
    </div>
  );
}
