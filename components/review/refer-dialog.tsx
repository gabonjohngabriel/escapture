"use client";

import { AlertTriangle, Send, ShieldAlert, X } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/client-api";
import { Button } from "@/components/ui/button";

export function ReferCaseDialog({
    caseId,
    caseTitle,
    onReferred,
}: {
    caseId: string;
    caseTitle: string;
    onReferred?: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [agency, setAgency] = useState<"vawc" | "pnp_acg" | "nbi_cybercrime" | "barangay">("pnp_acg");
    const [severity, setSeverity] = useState<"routine" | "moderate" | "severe" | "critical">("severe");
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) {
            setError("Please provide a reason for referring this case.");
            return;
        }
        setLoading(true);
        setError(null);

        try {
            await api(`/api/review/cases/${caseId}/refer`, {
                body: {
                    targetAgency: agency,
                    severity,
                    referralReason: reason.trim(),
                },
            });
            setOpen(false);
            setReason("");
            onReferred?.();
        } catch (err: any) {
            setError(err.message || "Failed to refer case to external authority.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                variant="secondary"
                onClick={() => setOpen(true)}
                className="h-9 px-3.5 text-xs gap-2 border-amber-600/30 text-amber-900 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950/30">
                <ShieldAlert size={16} aria-hidden />
                <span>Refer to External Authority</span>
            </Button>

            {open && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="refer-dialog-title"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-modal animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-border pb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="rounded-xl bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
                                    <ShieldAlert size={22} aria-hidden />
                                </div>
                                <div>
                                    <h2 id="refer-dialog-title" className="text-lg font-bold text-ink">
                                        Refer Case to External Authority
                                    </h2>
                                    <p className="text-xs text-muted">
                                        Grant oversight access to law enforcement or LGU desks
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="rounded-full p-1.5 text-muted hover:bg-surface hover:text-ink">
                                <X size={18} aria-hidden />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                                    Target Agency / External Body
                                </label>
                                <select
                                    value={agency}
                                    onChange={(e) => setAgency(e.target.value as any)}
                                    className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-500">
                                    <option value="pnp_acg">PNP Anti-Cybercrime Group (Bulacan PFU)</option>
                                    <option value="nbi_cybercrime">NBI Cybercrime Division Group</option>
                                    <option value="vawc">Barangay VAWC Desk (Violence Against Women & Children)</option>
                                    <option value="barangay">Barangay Officials / Local Lupon</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                                    Severity Level
                                </label>
                                <select
                                    value={severity}
                                    onChange={(e) => setSeverity(e.target.value as any)}
                                    className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-500">
                                    <option value="routine">Routine — Information & Guidance</option>
                                    <option value="moderate">Moderate — Advisory Intervention Required</option>
                                    <option value="severe">Severe — External Investigation & Legal Handling</option>
                                    <option value="critical">Critical — Immediate Threat / Physical Harm Risk</option>
                                </select>
                                {severity === "severe" || severity === "critical" ? (
                                    <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                                        <AlertTriangle size={14} aria-hidden />
                                        Severe cases allow the authority to accept formal handling and track external progress.
                                    </p>
                                ) : null}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                                    Referral Reason & Evidence Summary
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={4}
                                    placeholder="Explain why this case is being referred to this agency and what external assistance is requested..."
                                    className="mt-1.5 w-full rounded-xl border border-border bg-surface p-3 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>

                            {error && (
                                <p className="rounded-lg bg-red-500/10 p-2.5 text-xs font-medium text-red-600 dark:text-red-400">
                                    {error}
                                </p>
                            )}

                            <div className="flex justify-end gap-3 pt-3 border-t border-border">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setOpen(false)}
                                    disabled={loading}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="gap-2 bg-brand-600 hover:bg-brand-700 text-white">
                                    <Send size={16} aria-hidden />
                                    <span>{loading ? "Dispatching..." : "Dispatch Referral"}</span>
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
