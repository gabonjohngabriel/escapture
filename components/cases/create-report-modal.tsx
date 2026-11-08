"use client";

import { Check, Lock, MessageCircle, MoreHorizontal, Plus, Share2, Smile, ThumbsUp, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/client-api";

type EvidenceItem = {
  id: string;
  label: string;
  kind: "facebook_post" | "facebook_message";
  capturedAt: Date | string;
};

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
        if (res.items && res.items.length > 0) {
          setSelectedIds((prev) => (prev.size === 0 ? new Set([res.items[0].id]) : prev));
        }
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
              className="text-[28px] font-bold tracking-tight text-[#52946B] leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Create Report
            </h2>
            <p className="mt-1 text-[15px] font-normal text-[#5F856E]">
              Bring your captures together in a private report.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={handleClose}
            className="flex size-8 items-center justify-center rounded-full border border-[#DCE5DF] text-[#55665C] hover:bg-[#F2F7F4] hover:text-[#1E2A22] transition-colors"
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
              className="block text-[14px] font-bold text-[#52946B]"
            >
              Report title <span className="text-[#52946B]">*</span>
            </label>
            <input
              id="report-title-input"
              type="text"
              required
              maxLength={160}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Group post record"
              className="mt-1.5 h-12 w-full rounded-2xl border border-[#DCE5DF] bg-white px-4 text-[15px] text-[#1E2A22] placeholder-[#7D8E83] focus:border-[#52946B] focus:outline-none focus:ring-2 focus:ring-[#52946B]/20"
            />
            <span className="mt-1 block text-[13px] text-[#5F856E]">
              Use a clear title you can find again later.
            </span>
          </div>

          {/* Description Field */}
          <div>
            <label
              htmlFor="report-desc-input"
              className="block text-[14px] font-bold text-[#52946B]"
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
              className="mt-1.5 h-12 w-full rounded-2xl border border-[#DCE5DF] bg-white px-4 text-[15px] text-[#1E2A22] placeholder-[#7D8E83] focus:border-[#52946B] focus:outline-none focus:ring-2 focus:ring-[#52946B]/20"
            />
          </div>

          {/* Captured Evidence Section */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-bold text-[#52946B]">
                Captured evidence <span className="text-[#52946B]">*</span>
              </span>
              <span className="text-[13px] font-medium text-[#5F856E]">
                {selectedIds.size > 0 ? `${selectedIds.size} selected` : "1 selected"}
              </span>
            </div>

            {/* Dark Facebook Post Style Preview Card (Figma node 44:1439) */}
            <div className="mt-2.5 overflow-hidden rounded-[20px] bg-[#242526] p-5 text-white shadow-md font-sans">
              {/* Post Author Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-[#3A3B3C] border border-white/20 overflow-hidden flex items-center justify-center text-white font-bold text-sm">
                    {activeEvidence?.label ? activeEvidence.label.slice(0, 1).toUpperCase() : "🦅"}
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-white leading-tight">
                      {activeEvidence?.label ? (activeEvidence.label.length > 25 ? activeEvidence.label.slice(0, 25) : activeEvidence.label) : "HopefulFalcon1903"}
                    </p>
                    <p className="text-[12px] text-[#B0B3B8] flex items-center gap-1 mt-0.5">
                      <span>1h</span>
                      <span>·</span>
                      <span>🌐</span>
                    </p>
                  </div>
                </div>
                <button type="button" aria-label="More options" className="text-[#B0B3B8] hover:text-white">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              {/* Post Content */}
              <div className="my-4 text-[14px] leading-relaxed text-white">
                <p className="font-semibold mb-1">PTPA</p>
                <p>
                  HOY MAYA! HUWAG KANG MAGPAPAKITA SA AMIN MAMAYA KUNG HINDI SASABUNUTAN KITA!
                </p>
              </div>

              {/* Reaction Buttons Row */}
              <div className="flex items-center justify-around border-t border-b border-[#3E4042] py-2 text-[#B0B3B8] text-[13px] font-medium">
                <button type="button" className="flex items-center gap-1.5 hover:text-white">
                  <ThumbsUp size={16} />
                  <span>Like</span>
                </button>
                <button type="button" className="flex items-center gap-1.5 hover:text-white">
                  <MessageCircle size={16} />
                  <span>Comment</span>
                </button>
                <button type="button" className="flex items-center gap-1.5 hover:text-white">
                  <Share2 size={16} />
                  <span>Share</span>
                </button>
              </div>

              {/* Reply Box Mockup */}
              <div className="mt-3 flex items-center gap-2.5">
                <div className="size-8 rounded-full bg-[#3A3B3C] border border-white/20 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  M
                </div>
                <div className="flex-1 flex items-center justify-between rounded-full bg-[#3A3B3C] px-4 py-2 text-[13px] text-[#B0B3B8]">
                  <span>Answer as Maya</span>
                  <div className="flex items-center gap-2 text-[#B0B3B8]">
                    <Smile size={16} />
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-2 text-[13px] text-[#5F856E]">
              Choose captures from your vault. Original evidence stays unchanged.
            </p>

            {/* Choose More Evidence Button & Expandable Picker */}
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setShowPicker((p) => !p)}
                className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#52946B] hover:underline"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>{showPicker ? "Hide evidence list" : "+ Choose more evidence"}</span>
              </button>

              {showPicker && (
                <div className="mt-3 max-h-48 overflow-y-auto rounded-2xl border border-[#DCE5DF] bg-[#FAFBFB] p-2.5">
                  {evidenceList.length === 0 ? (
                    <p className="p-3 text-center text-xs text-[#5F856E]">Your vault has no evidence yet.</p>
                  ) : (
                    <ul className="flex flex-col gap-1">
                      {evidenceList.map((item) => {
                        const checked = selectedIds.has(item.id);
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              onClick={() => toggleSelect(item.id)}
                              className="flex w-full items-center justify-between rounded-xl p-2.5 text-left text-xs transition-colors hover:bg-white"
                            >
                              <span className="truncate font-medium text-[#1E2A22]">{item.label}</span>
                              <div
                                className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                                  checked
                                    ? "border-[#52946B] bg-[#52946B] text-white"
                                    : "border-[#DCE5DF] bg-white"
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

          {/* Privacy Advisory Notice Banner (Figma node 44:1439) */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-[#C7E0CE] bg-[#F2F7F4] p-4 text-[#3F7855]">
            <Lock size={18} strokeWidth={2.25} className="shrink-0 text-[#52946B]" />
            <p className="text-[13px] leading-snug font-medium">
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
              className="h-11 rounded-full border border-[#DCE5DF] bg-white px-6 text-[14px] font-bold text-[#55665C] hover:bg-[#F2F7F4] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#52946B] px-7 text-[14px] font-bold text-white shadow-xs hover:bg-[#437C58] transition-colors disabled:opacity-50"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>{loading ? "Creating..." : "Create Report"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
