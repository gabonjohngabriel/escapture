"use client";

import {
  AlertTriangle,
  CircleCheck,
  CircleDot,
  Clock,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { statusLabel, type CaseStatus } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/cn";
import { timeAgo } from "@/lib/format";
import type { ReportDetailData } from "./report-details-dialog";

const VALID_STATUSES: ReadonlySet<string> = new Set([
  "draft",
  "escalated",
  "under_review",
  "closed",
]);

function eyebrowLabel(status: string): string {
  return VALID_STATUSES.has(status) ? statusLabel(status as CaseStatus) : status;
}

type StatusConfig = {
  label: string;
  Icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
    "aria-hidden"?: boolean;
  }>;
};

const STATUS_CONFIG: Record<string, StatusConfig> = {
  under_review: {
    label: "Under Review",
    Icon: Clock,
  },
  escalated: {
    label: "Escalated",
    Icon: AlertTriangle,
  },
  closed: {
    label: "Closed",
    Icon: CircleCheck,
  },
  draft: {
    label: "Draft",
    Icon: Pencil,
  },
};

function getStatusConfig(status: string): StatusConfig {
  if (status in STATUS_CONFIG) {
    return STATUS_CONFIG[status];
  }
  return {
    label: eyebrowLabel(status),
    Icon: CircleDot,
  };
}

function getReportEyebrow(report: ReportDetailData): string {
  if (report.status === "closed" && report.closedAt) {
    return `Closed · ${timeAgo(report.closedAt)}`;
  }
  if (report.escalatedAt) {
    return `Escalated · ${timeAgo(report.escalatedAt)}`;
  }
  return `Report · ${report.reporterName}`;
}

/**
 * Report Card component adhering strictly to the Figma 2x2 grid design.
 * Features a solid brand header, structured 3-column metadata body,
 * and dual action buttons for fast preview and full review.
 */
export function ReportCard({
  report,
  onViewDetails,
  className,
}: {
  report: ReportDetailData;
  onViewDetails: (report: ReportDetailData) => void;
  className?: string;
}) {
  const reviewerName =
    report.assignees && report.assignees.length > 0
      ? report.assignees.map((a) => a.name).join(", ")
      : "Unassigned";

  const evidenceCount = report.evidenceCount ?? 0;
  const evidenceText =
    evidenceCount > 0
      ? `${evidenceCount} ${evidenceCount === 1 ? "item" : "items"}`
      : "None";

  const flaggedCount = report.flaggedWords?.length ?? 0;
  const statusInfo = getStatusConfig(report.status);
  const StatusIcon = statusInfo.Icon;

  return (
    <article
      className={cn(
        "flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-brand-500 bg-card shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      {/* Top Banner Header */}
      <div className="flex items-center justify-between bg-brand-500 px-5 py-3.5 text-white">
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar
            seed={report.reporterName || report.id}
            className="size-9.5 shrink-0 rounded-full border-2 border-white/70 bg-white/10 shadow-2xs"
          />
          <div className="min-w-0 flex flex-col">
            <span className="text-[11px] font-medium uppercase tracking-wider text-white/80">
              {getReportEyebrow(report)}
            </span>
            <h3 className="truncate text-base font-bold leading-tight text-white">{report.title}</h3>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[16px] font-medium text-white backdrop-blur-xs">
          <div className="inline-flex items-center justify-center bg-white/5 rounded-full p-2 backdrop-blur-xs">
            <StatusIcon size={24} strokeWidth={2} aria-hidden />
          </div>
          <span>{statusInfo.label}</span>
        </div>
      </div>

      {/* Metadata 3-Column Body */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-2 px-5 py-4 text-left border-t border-border/40 bg-card">
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold text-muted uppercase tracking-wider">Reporter</span>
          <span className="truncate text-sm font-medium text-ink mt-0.5" title={report.reporterName}>
            {report.reporterName}
          </span>
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold text-muted uppercase tracking-wider">Assigned Reviewer</span>
          <span
            className={cn(
              "truncate text-sm font-medium mt-0.5",
              reviewerName === "Unassigned" ? "text-muted" : "text-ink",
            )}
            title={reviewerName}
          >
            {reviewerName}
          </span>
        </div>

        <div className="flex flex-col min-w-0 items-start">
          <span className="text-xs font-bold text-muted uppercase tracking-wider">Evidence</span>
          <span className="truncate text-sm font-medium text-ink mt-0.5">
            {evidenceText}
          </span>
          {flaggedCount > 0 && (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-escalated-bg px-2 py-0.5 text-[11px] font-semibold text-escalated-fg">
              <AlertTriangle size={11} strokeWidth={2.25} aria-hidden="true" />
              <span>{flaggedCount} flagged</span>
            </span>
          )}
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="flex items-center gap-3 px-5 pb-5 pt-1">
        <button
          type="button"
          onClick={() => onViewDetails(report)}
          className="flex-1 sm:flex-initial inline-flex h-9 items-center justify-center rounded-full border border-brand-600/30 px-4 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-brand-600 cursor-pointer"
        >
          View Details
        </button>

        <Link
          href={`/review/${report.id}`}
          className="flex-1 sm:flex-initial inline-flex h-9 items-center justify-center rounded-full bg-brand-600 px-5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-brand-600"
        >
          Review Report
        </Link>
      </div>
    </article>
  );
}
