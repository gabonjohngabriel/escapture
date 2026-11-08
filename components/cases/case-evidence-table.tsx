"use client";

import { Eye, ExternalLink, FileText, Globe, Hash, MessagesSquare } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { EvidenceFrame } from "@/components/vault/evidence-frame";
import { formatDateTime, kindLabel } from "@/lib/format";
import { DetachButton } from "./case-actions";

export type CaseEvidenceItem = {
  id: string;
  label: string;
  kind: "facebook_post" | "facebook_message";
  capturedAt: Date | string;
  sourceUrl?: string;
  sha256?: string;
  /** "you", or the name of the person whose evidence it is. */
  addedBy: string;
  canRemove: boolean;
  sensitive?: boolean;
};

function safeHost(url?: string): string | null {
  if (!url) return null;
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

/**
 * Modern evidence card list with in-page quick-preview drawer/dialog
 * matching Escapture's Figma green card aesthetic.
 */
export function CaseEvidenceTable({
  caseId,
  items,
}: {
  caseId: string;
  items: CaseEvidenceItem[];
}) {
  const [previewItem, setPreviewItem] = useState<CaseEvidenceItem | null>(null);

  return (
    <>
      <div className="flex flex-col gap-3">
        {items.map((item) => {
          const KindIcon =
            item.kind === "facebook_post" ? FileText : MessagesSquare;
          const captured = formatDateTime(item.capturedAt);
          const host = safeHost(item.sourceUrl);

          return (
            <article
              key={item.id}
              data-privacy-sensitive="true"
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-brand-500/40 bg-card p-4 shadow-soft transition-all duration-150 hover:border-brand-500 hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div
                    aria-hidden="true"
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-800"
                  >
                    <KindIcon size={18} strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-semibold text-brand-800">
                        {kindLabel(item.kind)}
                      </span>
                      <span className="text-xs text-muted">
                        Added by <span className="font-medium text-ink">{item.addedBy}</span>
                      </span>
                    </div>
                    <h3 className="mt-1 truncate text-base font-bold text-ink">
                      <Link
                        href={`/vault/${item.id}?from=${caseId}`}
                        title={item.label}
                        className="hover:text-brand-800 hover:underline"
                      >
                        {item.label}
                      </Link>
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPreviewItem(item)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-brand-600/30 bg-card px-3 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50 hover:text-brand-800 cursor-pointer"
                  >
                    <Eye size={14} strokeWidth={2} aria-hidden="true" />
                    <span>Preview</span>
                  </button>

                  {item.canRemove && (
                    <DetachButton
                      caseId={caseId}
                      evidenceId={item.id}
                      label={item.label}
                    />
                  )}
                </div>
              </div>

              {/* Metadata footer row */}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/60 pt-2.5 text-xs text-muted">
                <span className="tnum font-medium text-ink">
                  Captured {captured}
                </span>
                {host && (
                  <span className="inline-flex items-center gap-1 truncate max-w-xs" title={item.sourceUrl}>
                    <Globe size={13} className="text-brand-700 shrink-0" aria-hidden="true" />
                    <span className="truncate">{host}</span>
                  </span>
                )}
                {item.sha256 && (
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted">
                    <Hash size={12} className="text-brand-700 shrink-0" aria-hidden="true" />
                    <span>{item.sha256.slice(0, 10)}…</span>
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Quick Preview Dialog */}
      {previewItem && (
        <Dialog
          open={Boolean(previewItem)}
          onClose={() => setPreviewItem(null)}
          title={previewItem.label}
          description={
            <span className="flex items-center gap-2 pt-1 text-xs text-muted">
              <span>{kindLabel(previewItem.kind)}</span>
              <span>·</span>
              <span>Captured {formatDateTime(previewItem.capturedAt)}</span>
            </span>
          }
          wide
          footer={
            <div className="flex w-full items-center justify-between gap-3">
              <Link
                href={`/vault/${previewItem.id}?from=${caseId}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:underline"
              >
                <ExternalLink size={14} />
                <span>Open full evidence detail</span>
              </Link>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="h-9 rounded-full border border-border bg-card px-5 text-sm font-semibold text-ink hover:bg-brand-50"
              >
                Close preview
              </button>
            </div>
          }
        >
          <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-subtle p-3">
            <EvidenceFrame
              src={`/api/evidence/${previewItem.id}/file`}
              title={`Preview: ${previewItem.label}`}
              sensitive={previewItem.sensitive}
            />
          </div>
        </Dialog>
      )}
    </>
  );
}
