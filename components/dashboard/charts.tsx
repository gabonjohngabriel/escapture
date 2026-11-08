"use client";

import {
  ArrowRight,
  ArrowUpRight,
  CircleCheck,
  Eye,
  FileDown,
  Printer,
  UserMinus,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatDate, formatDateTime, timeAgo } from "@/lib/format";

// The Review Board's panels and right-rail summary widgets.
// Adheres strictly to the Figma design tokens.

export function Panel({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="flex min-w-0 flex-col gap-4 rounded-xl border border-border bg-card p-[var(--card-pad)] shadow-soft">
      <div>
        <h2 className="text-[17px] leading-6 font-bold text-brand-800">{title}</h2>
        {note && <p className="text-[13px] leading-[18px] text-muted">{note}</p>}
      </div>
      {children}
    </section>
  );
}

const shortDay = (d: Date) => formatDate(d).replace(/ \d{4}$/, "");

/** One series of bars. Hover a bar for its number; screen readers hear them all. */
export function BarChart({ data, unit }: { data: { start: Date; count: number }[]; unit: [string, string] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const W = 560;
  const H = 160;
  const slot = W / data.length;
  const bar = Math.min(48, slot * 0.6);
  const label = (d: { start: Date; count: number }) =>
    `Week of ${formatDate(d.start)}: ${d.count} ${d.count === 1 ? unit[0] : unit[1]}`;
  return (
    <div className="flex flex-col gap-3">
      <svg
        viewBox={`0 0 ${W} ${H + 28}`}
        role="img"
        aria-label={`Bar chart. ${data.map(label).join(". ")}.`}
        className="h-auto w-full"
      >
        {[0.5, 1].map((f) => (
          <line key={f} x1="0" x2={W} y1={H - H * f} y2={H - H * f} stroke="var(--chart-grid)" strokeWidth="1" />
        ))}
        {data.map((d, i) => {
          const h = d.count === 0 ? 0 : Math.max(4, (d.count / max) * (H - 24));
          const x = i * slot + (slot - bar) / 2;
          return (
            <g key={d.start.toISOString()}>
              <rect x={i * slot} y="0" width={slot} height={H} fill="var(--chart-fill)" className="opacity-0 hover:opacity-100" />
              <rect x={x} y={H - h} width={bar} height={h} rx="4" fill="var(--chart-primary)" className="pointer-events-none" />
              <text
                x={i * slot + slot / 2}
                y={H - h - 6}
                textAnchor="middle"
                className="pointer-events-none fill-[var(--ink)] text-[13px] font-semibold"
              >
                {d.count}
              </text>
              <text
                x={i * slot + slot / 2}
                y={H + 18}
                textAnchor="middle"
                className="pointer-events-none fill-[var(--muted)] text-[13px]"
              >
                {shortDay(d.start)}
              </text>
              <title>{label(d)}</title>
            </g>
          );
        })}
        <line x1="0" x2={W} y1={H} y2={H} stroke="var(--chart-axis)" strokeWidth="1" />
      </svg>
    </div>
  );
}

const SEGMENTS = [
  { key: "escalated", label: "Escalated", color: "var(--chart-escalated)" },
  { key: "under_review", label: "Under Review", color: "var(--chart-review)" },
  { key: "closed", label: "Closed", color: "var(--chart-closed)" },
] as const;

/** One stacked bar and a legend that states every count, so colour is never the only signal. */
export function StatusBreakdown({ counts }: { counts: { escalated: number; under_review: number; closed: number } }) {
  const total = counts.escalated + counts.under_review + counts.closed;
  return (
    <div className="flex flex-col gap-4">
      <div
        role="img"
        aria-label={`${total} ${total === 1 ? "case" : "cases"}: ${SEGMENTS.map((s) => `${counts[s.key]} ${s.label.toLowerCase()}`).join(", ")}.`}
        className="flex h-4 w-full gap-0.5 overflow-hidden rounded-full bg-subtle"
      >
        {total > 0 &&
          SEGMENTS.filter((s) => counts[s.key] > 0).map((s) => (
            <span key={s.key} style={{ width: `${(counts[s.key] / total) * 100}%`, background: s.color }} />
          ))}
      </div>
      <ul className="flex flex-col gap-2 text-sm leading-5">
        {SEGMENTS.map((s) => (
          <li key={s.key} className="flex items-center gap-2">
            <span aria-hidden className="size-3 shrink-0 rounded-sm" style={{ background: s.color }} />
            <span className="flex-1">{s.label}</span>
            <span className="tnum font-semibold">{counts[s.key]}</span>
          </li>
        ))}
        <li className="flex items-center gap-2 border-t border-border pt-2 text-muted">
          <span className="flex-1">All cases in this period</span>
          <span className="tnum font-semibold text-ink">{total}</span>
        </li>
      </ul>
    </div>
  );
}

export type Activity = {
  id: string;
  type: string;
  createdAt: Date | string;
  caseId: string;
  caseTitle: string;
  actorName: string;
};

const EVENTS: Record<string, { Icon: LucideIcon; text: (who: string) => string; isEscalation?: boolean }> = {
  escalated: { Icon: ArrowUpRight, text: (who) => `${who} escalated`, isEscalation: true },
  status_changed: { Icon: Eye, text: (who) => `${who} started reviewing` },
  closed: { Icon: CircleCheck, text: (who) => `${who} closed` },
  assigned: { Icon: UserPlus, text: (who) => `${who} assigned a reviewer` },
  unassigned: { Icon: UserMinus, text: (who) => `${who} took a reviewer off` },
};

/**
 * Figma Activity Logs right rail card (Screens 1, 2, 3, 4, 5).
 * Features colored status indicator dots, item description with relative time,
 * error state, and link to Case Archives.
 */
export function ActivityLogsCard({
  items = [],
  isUnavailable = false,
  className,
}: {
  items?: Activity[];
  isUnavailable?: boolean;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <h2 className="text-2xl font-bold tracking-tight text-brand-700">Activity Logs</h2>

      <div className="rounded-2xl border border-brand-500/30 bg-card p-5 shadow-soft flex flex-col justify-between min-h-[190px]">
        {isUnavailable ? (
          <div className="flex flex-col py-3">
            <h3 className="text-sm font-bold text-ink">Activity unavailable</h3>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Activity could not be loaded. Retry the dashboard to check for updates.
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col py-3">
            <h3 className="text-sm font-bold text-ink">No activity yet</h3>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Updates will appear when an escalated report reaches the review desk.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-border/60">
            {items.slice(0, 3).map((item) => {
              const isEscalation = item.type === "escalated";
              const dotClass = isEscalation ? "bg-amber-400" : "bg-brand-500";
              const titleText =
                item.type === "escalated"
                  ? "Report escalated to review desk"
                  : item.type === "assigned"
                    ? `${item.actorName} assigned reviewer`
                    : item.type === "status_changed"
                      ? `${item.actorName} started reviewing`
                      : item.type === "closed"
                        ? `${item.actorName} closed report`
                        : "Reviewer action attached";

              return (
                <li key={item.id} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-1">
                  <span
                    aria-hidden="true"
                    className={cn("mt-1.5 size-3 shrink-0 rounded-full", dotClass)}
                  />
                  <div className="min-w-0 flex-1 flex flex-col">
                    <p className="text-xs font-bold text-ink leading-tight truncate">{titleText}</p>
                    <p className="text-xs text-muted mt-0.5 truncate">
                      <Link href={`/review/${item.caseId}`} className="hover:text-brand-700 hover:underline">
                        {item.caseTitle}
                      </Link>{" "}
                      · {timeAgo(item.createdAt)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="border-t border-border pt-3 mt-2">
          <Link
            href="/review/archives"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-brand-700 transition-colors"
          >
            <span>Open full case archives</span>
            <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export type SummaryMetrics = {
  statuses: {
    escalated: number;
    under_review: number;
    closed: number;
  };
  totalCases: number;
  resolutionRate: number;
  oldestUnderReviewDays: number | null;
  newThisWeek: number;
  closedThisMonth: number;
  flaggedCount?: number;
  reviewerName?: string;
};

/**
 * Summary section component on the right rail.
 * Combines visual case status breakdown, review velocity metrics,
 * and a client-side clean print/PDF export for official university audit.
 */
export function SummaryCard({
  metrics,
  isUnavailable = false,
  className,
}: {
  metrics: SummaryMetrics;
  isUnavailable?: boolean;
  className?: string;
}) {
  const { statuses, totalCases, resolutionRate, oldestUnderReviewDays, closedThisMonth, reviewerName } = metrics;
  const total = totalCases || statuses.escalated + statuses.under_review + statuses.closed;

  const handlePrint = () => {
    window.print();
  };

  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-brand-700">Summary</h2>
        {!isUnavailable && (
          <button
            type="button"
            onClick={handlePrint}
            aria-label="Export Summary PDF"
            title="Generate and print / save summary as PDF"
            className="inline-flex items-center gap-1.5 rounded-full border border-brand-600/30 bg-card px-3 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50 shadow-2xs transition-colors cursor-pointer"
          >
            <FileDown size={13} className="text-brand-600" />
            <span>Generate PDF</span>
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-brand-500/30 bg-card p-5 shadow-soft flex flex-col gap-4">
        {isUnavailable ? (
          <div className="py-2 text-xs text-muted">Summary metrics currently unavailable.</div>
        ) : (
          <>
            {/* Visual Status Breakdown */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-ink">Case Status Distribution</span>
                <span className="text-muted font-medium">{total} total</span>
              </div>

              {/* Multi-segment stacked bar */}
              <div
                role="img"
                aria-label={`Status breakdown of ${total} cases`}
                className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-subtle"
              >
                {total > 0 ? (
                  <>
                    {statuses.escalated > 0 && (
                      <span
                        title={`Escalated: ${statuses.escalated}`}
                        style={{ width: `${(statuses.escalated / total) * 100}%` }}
                        className="bg-[#B07A1E]"
                      />
                    )}
                    {statuses.under_review > 0 && (
                      <span
                        title={`Under Review: ${statuses.under_review}`}
                        style={{ width: `${(statuses.under_review / total) * 100}%` }}
                        className="bg-brand-600"
                      />
                    )}
                    {statuses.closed > 0 && (
                      <span
                        title={`Closed: ${statuses.closed}`}
                        style={{ width: `${(statuses.closed / total) * 100}%` }}
                        className="bg-[#76857F]"
                      />
                    )}
                  </>
                ) : (
                  <span className="w-full bg-subtle" />
                )}
              </div>

              {/* Status Legend */}
              <div className="grid grid-cols-3 gap-1 pt-1 text-[11px]">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="size-2 rounded-full bg-[#B07A1E] shrink-0" />
                  <span className="truncate text-muted">Escalated:</span>
                  <span className="font-bold text-ink">{statuses.escalated}</span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="size-2 rounded-full bg-brand-600 shrink-0" />
                  <span className="truncate text-muted">Review:</span>
                  <span className="font-bold text-ink">{statuses.under_review}</span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="size-2 rounded-full bg-[#76857F] shrink-0" />
                  <span className="truncate text-muted">Closed:</span>
                  <span className="font-bold text-ink">{statuses.closed}</span>
                </div>
              </div>
            </div>

            {/* Review Velocity Highlights */}
            <div className="border-t border-border/80 pt-3 flex flex-col gap-2">
              <span className="text-xs font-bold text-ink">Review Velocity & Turnaround</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-border/70 bg-subtle/50 p-2.5 flex flex-col">
                  <span className="text-[11px] text-muted">Resolution Rate</span>
                  <span className="font-heading text-lg font-bold text-brand-700 mt-0.5">
                    {resolutionRate}%
                  </span>
                </div>

                <div className="rounded-xl border border-border/70 bg-subtle/50 p-2.5 flex flex-col">
                  <span className="text-[11px] text-muted">Oldest Open Case</span>
                  <span className="font-heading text-lg font-bold text-amber-700 mt-0.5">
                    {oldestUnderReviewDays !== null ? `${oldestUnderReviewDays}d` : "None"}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="border-t border-border pt-2 flex items-center justify-between">
              <span className="text-[11px] text-muted">
                {closedThisMonth} closed this month
              </span>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800 cursor-pointer"
              >
                <span>Print Report</span>
                <Printer size={12} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Print-Only Template (Visible strictly during @media print) */}
      <div id="summary-print-template" className="hidden print:block fixed inset-0 bg-white p-8 z-50 text-black">
        <div className="border-b-2 border-black pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold tracking-tight uppercase">Bulacan State University</h1>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                Escapture Incident Desk — Executive Review Summary
              </p>
            </div>
            <div className="text-right text-xs text-gray-600">
              <p>Generated: {new Date().toLocaleDateString("en-GB", { dateStyle: "long" })}</p>
              <p>Reviewer: {reviewerName ?? "Authorized Reviewer"}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6 p-4 border border-gray-300 rounded-lg">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase">Total Escalated</p>
            <p className="text-2xl font-bold">{statuses.escalated}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase">Under Active Review</p>
            <p className="text-2xl font-bold">{statuses.under_review}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase">Closed Cases</p>
            <p className="text-2xl font-bold">{statuses.closed}</p>
          </div>
        </div>

        <table className="w-full text-left text-xs mb-8 border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">Metric</th>
              <th className="border border-gray-300 p-2">Value</th>
              <th className="border border-gray-300 p-2">Operational Standard</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Resolution Rate</td>
              <td className="border border-gray-300 p-2 font-bold">{resolutionRate}%</td>
              <td className="border border-gray-300 p-2 text-gray-600">Target ≥ 70% within 30 days</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Oldest Active Escalation</td>
              <td className="border border-gray-300 p-2 font-bold">
                {oldestUnderReviewDays !== null ? `${oldestUnderReviewDays} days` : "0 days"}
              </td>
              <td className="border border-gray-300 p-2 text-gray-600">Max permissible SLA: 14 days</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-medium">Closed This Calendar Month</td>
              <td className="border border-gray-300 p-2 font-bold">{closedThisMonth} cases</td>
              <td className="border border-gray-300 p-2 text-gray-600">Archived with full evidentiary record</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-16 pt-4 border-t border-gray-300 flex justify-between text-xs text-gray-600">
          <div>
            <p className="font-bold">Official Seal / Verification</p>
            <p className="mt-6">___________________________</p>
          </div>
          <div className="text-right">
            <p className="font-bold">Desk Officer Signature</p>
            <p className="mt-6">___________________________</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Legacy / backward compatible ActivityFeed component. */
export function ActivityFeed({ items }: { items: Activity[] }) {
  if (items.length === 0) return <p className="text-sm leading-[22px] text-muted">Nothing has happened on an open case yet.</p>;
  return (
    <ul className="flex flex-col">
      {items.map((e) => {
        const { Icon, text } = EVENTS[e.type] ?? { Icon: Eye, text: (who: string) => `${who} updated` };
        return (
          <li key={e.id} className="flex items-start gap-3 border-b border-border py-2.5 last:border-b-0">
            <span aria-hidden className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-800">
              <Icon size={14} strokeWidth={1.75} />
            </span>
            <p className="min-w-0 flex-1 text-sm leading-[22px]">
              {text(e.actorName)}{" "}
              <Link href={`/review/${e.caseId}`} className="link">
                {e.caseTitle}
              </Link>
            </p>
            <time dateTime={new Date(e.createdAt).toISOString()} className="mono tnum shrink-0 text-muted">
              {formatDateTime(e.createdAt)}
            </time>
          </li>
        );
      })}
    </ul>
  );
}

export { lastUpdateText } from "@/lib/format";
