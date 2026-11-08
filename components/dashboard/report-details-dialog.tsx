"use client";

import { Eye, FileText, ShieldAlert, User, Users } from "lucide-react";
import Link from "next/link";
import { StatusBadge, type CaseStatus } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { formatDate } from "@/lib/format";

export type ReportDetailData = {
  id: string;
  title: string;
  description?: string | null;
  status: "escalated" | "under_review" | "closed" | string;
  escalatedAt?: Date | string | null;
  closedAt?: Date | string | null;
  reporterName: string;
  assignees?: { id: string; name: string }[];
  evidenceCount?: number;
  collaboratorCount?: number;
  flaggedWords?: string[];
  kindLabel?: string;
};

/**
 * Fast modal dialog showing comprehensive case metadata without losing
 * the reviewer's position on the dashboard.
 */
export function ReportDetailsDialog({
  report,
  open,
  onClose,
}: {
  report: ReportDetailData | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!report) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={report.title}
      description={
        <span className="flex items-center gap-2 pt-1 text-xs text-muted">
          <span>Escalated {report.escalatedAt ? formatDate(new Date(report.escalatedAt)) : "Recently"}</span>
          <span>·</span>
          <StatusBadge status={report.status as CaseStatus} />
        </span>
      }
      wide
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className={buttonClass("secondary", "h-9 rounded-full px-4 text-sm font-medium")}
          >
            Close
          </button>
          <Link
            href={`/review/${report.id}`}
            className={buttonClass("primary", "h-9 rounded-full bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700")}
          >
            Open in Review Desk
          </Link>
        </div>
      }
    >
      <div className="flex flex-col gap-5 py-2">
        {report.description && (
          <div className="rounded-xl border border-border/80 bg-subtle/50 p-4">
            <h4 className="text-xs font-semibold text-brand-700 uppercase tracking-wider mb-1">Incident Summary</h4>
            <p className="text-sm leading-relaxed text-ink/90 whitespace-pre-wrap">{report.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2.5 rounded-lg border border-border/70 p-3 bg-card">
            <User size={18} className="text-brand-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted font-medium">Reporter</p>
              <p className="font-semibold text-ink truncate">{report.reporterName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-lg border border-border/70 p-3 bg-card">
            <Eye size={18} className="text-brand-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted font-medium">Assigned Reviewer</p>
              <p className="font-semibold text-ink truncate">
                {report.assignees && report.assignees.length > 0
                  ? report.assignees.map((a) => a.name).join(", ")
                  : "Unassigned"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-lg border border-border/70 p-3 bg-card">
            <FileText size={18} className="text-brand-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted font-medium">Attached Evidence</p>
              <p className="font-semibold text-ink">
                {report.evidenceCount ?? 0} {report.evidenceCount === 1 ? "item" : "items"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-lg border border-border/70 p-3 bg-card">
            <Users size={18} className="text-brand-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted font-medium">Collaborators</p>
              <p className="font-semibold text-ink">
                {report.collaboratorCount ?? 0} {report.collaboratorCount === 1 ? "person" : "people"}
              </p>
            </div>
          </div>
        </div>

        {report.flaggedWords && report.flaggedWords.length > 0 && (
          <div className="flex flex-col gap-1.5 rounded-xl border border-amber-200/80 bg-amber-50/50 p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
              <ShieldAlert size={14} />
              <span>Flagged Keywords Detected ({report.flaggedWords.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {report.flaggedWords.map((word) => (
                <span
                  key={word}
                  className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 border border-amber-200"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
