"use client";

import { Check, Clock, FileCheck2, Globe, Hash, Lock, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/client-api";
import { formatDateTime, kindLabel } from "@/lib/format";

type EvidenceItem = {
  id: string;
  label: string;
  kind: "facebook_post" | "facebook_message";
  capturedAt: Date | string;
  sourceUrl?: string;
  sha256: string;
};

function safeHost(url: string | undefined): string {
  if (!url) return "";
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

/**
 * Create Report Modal matching Figma node 44:1439
 */
export function CreateReportModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setError(null);
    setLoading(false);
    setShowPicker(false);
    setSelectedIds(new Set());
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    let active = true;
    api<{ items: EvidenceItem[] }>("/api/evidence?scope=mine")
      .then((res) => {
        if (!active) return;
        setEvidenceList(res.items || []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [open]);

  if (!open) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectedEvidence = evidenceList.filter((e) => selectedIds.has(e.id));
  const activeEvidence = selectedEvidence[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a report title.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newCase = await api<{ id: string }>("/api/cases", {
        body: { title: title.trim(), description: description.trim() },
      });

      // Attach selected captures
      if (selectedIds.size > 0) {
        await Promise.all(
          Array.from(selectedIds).map((evidenceId) =>
            api(`/api/cases/${newCase.id}/evidence`, { body: { evidenceId } }).catch(
              () => {}
            )
          )
        );
      }

      handleClose();
      router.push(`/cases/${newCase.id}`);
      router.refresh();
    } catch (err) {
      setLoading(false);
      setError(errorMessage(err));
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-report-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="relative flex max-h-[92vh] w-full max-w-[760px] flex-col overflow-y-auto rounded-[28px] bg-white p-8 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2
              id="create-report-title"
              className="text-2xl font-bold tracking-tight text-brand-700 leading-tight"
            >
              Create report
            </h2>
            <p className="mt-1 text-sm text-muted">
              Bring your captures together in a private report.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={handleClose}
            className="flex size-8 items-center justify-center rounded-full border border-border text-muted hover:bg-brand-50 hover:text-ink transition-colors"
          >
            <X size={16} strokeWidth={2.25} />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-danger-bg p-3.5 text-xs font-semibold text-danger-fg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {/* Title Field */}
          <div>
            <label
              htmlFor="report-title-input"
              className="block text-sm font-bold text-brand-800"
            >
              Report title <span className="text-brand-700">*</span>
            </label>
            <input
              id="report-title-input"
              type="text"
              required
              maxLength={160}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Group post record"
              className="mt-1.5 h-12 w-full rounded-2xl border border-border bg-card px-4 text-[15px] text-ink placeholder:text-muted focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
            />
            <span className="mt-1 block text-xs text-muted">
              Use a clear title you can find again later.
            </span>
          </div>

          {/* Description Field */}
          <div>
            <label
              htmlFor="report-desc-input"
              className="block text-sm font-bold text-brand-800"
            >
              Description (optional)
            </label>
            <input
              id="report-desc-input"
              type="text"
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Posts from BulSU Freshies 2026 saved for my personal record."
              className="mt-1.5 h-12 w-full rounded-2xl border border-border bg-card px-4 text-[15px] text-ink placeholder:text-muted focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
            />
          </div>

          {/* Captured Evidence Section */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-brand-800">
                Captured evidence <span className="text-brand-700">*</span>
              </span>
              <span className="text-xs font-medium text-muted">
                {`${selectedIds.size} selected`}
              </span>
            </div>

            {evidenceList.length === 0 ? (
              <div className="mt-2.5 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-subtle/40 p-6 text-center">
                <FileCheck2 size={24} className="text-muted" aria-hidden />
                <p className="text-sm font-semibold text-ink">
                  Your vault has no captures yet.
                </p>
                <p className="text-xs text-muted max-w-xs">
                  Use the Escapture extension to capture a post or message before attaching it to a report.
                </p>
              </div>
            ) : !activeEvidence ? (
              <button
                type="button"
                onClick={() => setShowPicker((p) => !p)}
                className="mt-2.5 flex w-full items-center justify-between rounded-2xl border-2 border-dashed border-brand-500/40 bg-brand-50/50 p-4 text-left transition-colors hover:border-brand-600 hover:bg-brand-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                    <Plus size={18} strokeWidth={2.5} aria-hidden />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand-800">No evidence selected yet</p>
                    <p className="text-xs text-muted">Click to browse captures from your vault</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-brand-700 underline">
                  {showPicker ? "Hide list" : "Browse vault"}
                </span>
              </button>
            ) : (
              <div className="mt-2.5 overflow-hidden rounded-2xl border border-brand-500/40 bg-card p-4 shadow-soft">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-0.5 text-[11px] font-semibold text-brand-800">
                        {kindLabel(activeEvidence.kind)}
                      </span>
                      {selectedEvidence.length > 1 && (
                        <span className="inline-flex items-center rounded-full bg-subtle px-2 py-0.5 text-[11px] font-semibold text-muted">
                          +{selectedEvidence.length - 1} more
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 truncate text-sm font-bold text-ink" title={activeEvidence.label}>
                      {activeEvidence.label}
                    </p>
                  </div>
                </div>

                <dl className="mt-3 grid grid-cols-1 gap-1.5 border-t border-border/60 pt-2.5 text-xs text-muted sm:grid-cols-3">
                  <div className="flex items-center gap-1.5 truncate">
                    <Clock size={13} className="shrink-0 text-brand-700" aria-hidden />
                    <dd className="truncate">{formatDateTime(activeEvidence.capturedAt)}</dd>
                  </div>
                  {activeEvidence.sourceUrl ? (
                    <div className="flex items-center gap-1.5 truncate">
                      <Globe size={13} className="shrink-0 text-brand-700" aria-hidden />
                      <dd className="truncate">{safeHost(activeEvidence.sourceUrl)}</dd>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 truncate">
                      <FileCheck2 size={13} className="shrink-0 text-brand-700" aria-hidden />
                      <dd className="truncate">Saved capture</dd>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 truncate">
                    <Hash size={13} className="shrink-0 text-brand-700" aria-hidden />
                    <dd className="truncate font-mono">{activeEvidence.sha256.slice(0, 12)}…</dd>
                  </div>
                </dl>
              </div>
            )}

            <p className="mt-2 text-xs text-muted">
              Choose captures from your vault. Original evidence stays unchanged.
            </p>

            {/* Choose More Evidence Button & Expandable Picker */}
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setShowPicker((p) => !p)}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:underline"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>
                  {showPicker
                    ? "Hide evidence list"
                    : selectedIds.size === 0
                      ? "Choose evidence"
                      : "Choose more evidence"}
                </span>
              </button>

              {showPicker && (
                <div className="mt-3 max-h-48 overflow-y-auto rounded-2xl border border-border bg-canvas p-2.5">
                  {evidenceList.length === 0 ? (
                    <p className="p-3 text-center text-xs text-muted">Your vault has no evidence yet.</p>
                  ) : (
                    <ul className="flex flex-col gap-1">
                      {evidenceList.map((item) => {
                        const checked = selectedIds.has(item.id);
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              onClick={() => toggleSelect(item.id)}
                              className="flex w-full items-center justify-between rounded-xl p-2.5 text-left text-xs transition-colors hover:bg-card"
                            >
                              <span className="truncate font-medium text-ink">{item.label}</span>
                              <div
                                className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                                  checked
                                    ? "border-brand-600 bg-brand-600 text-white"
                                    : "border-border bg-card"
                                }`}
                              >
                                {checked && <Check size={12} strokeWidth={3} />}
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Privacy Advisory Notice Banner */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-brand-800">
            <Lock size={18} strokeWidth={2.25} className="shrink-0 text-brand-700" />
            <p className="text-xs leading-snug font-medium">
              Only you can access this report. Creating it does not share evidence
              or submit anything to university staff.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="mt-2 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="h-11 rounded-full border border-border bg-card px-6 text-sm font-bold text-muted hover:bg-brand-50 hover:text-ink transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-600 px-7 text-sm font-bold text-white shadow-xs hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>{loading ? "Creating..." : "Create report"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
