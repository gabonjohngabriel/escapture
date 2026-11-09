"use client";

import { AlertCircle, Gavel, Send, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Select, Textarea } from "@/components/ui/field";

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
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to refer case to external authority.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                variant="authority"
                onClick={() => setOpen(true)}
                className="h-9 px-4 text-xs font-semibold gap-2 shadow-xs">
                <Gavel size={15} aria-hidden />
                <span>Refer to external authority</span>
            </Button>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                title="Refer case to external authority"
                description={`Grant oversight access to law enforcement or LGU desks for: ${caseTitle}`}
                footer={
                    <>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setOpen(false)}
                            disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            disabled={loading}
                            onClick={handleSubmit}
                            className="gap-2 bg-brand-600 hover:bg-brand-700 text-white">
                            <Send size={15} aria-hidden />
                            <span>{loading ? "Dispatching..." : "Dispatch referral"}</span>
                        </Button>
                    </>
                }>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Select
                        label="Target agency or external body"
                        value={agency}
                        onChange={(e) =>
                            setAgency(
                                e.target.value as "vawc" | "pnp_acg" | "nbi_cybercrime" | "barangay",
                            )
                        }>
                        <option value="pnp_acg">PNP Anti-Cybercrime Group (Bulacan PFU)</option>
                        <option value="nbi_cybercrime">NBI Cybercrime Division Group</option>
                        <option value="vawc">Barangay VAWC Desk (Violence Against Women & Children)</option>
                        <option value="barangay">Barangay Officials / Local Lupon</option>
                    </Select>

                    <div>
                        <Select
                            label="Severity level"
                            value={severity}
                            onChange={(e) =>
                                setSeverity(
                                    e.target.value as "routine" | "moderate" | "severe" | "critical",
                                )
                            }>
                            <option value="routine">Routine — Information & guidance</option>
                            <option value="moderate">Moderate — Advisory intervention required</option>
                            <option value="severe">Severe — External investigation & legal handling</option>
                            <option value="critical">Critical — Immediate threat / safety escalation</option>
                        </Select>
                        {(severity === "severe" || severity === "critical") && (
                            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#9E3F22]">
                                <ShieldAlert size={14} className="shrink-0" aria-hidden />
                                Severe incidents allow the external agency to accept formal handling and docket the case.
                            </p>
                        )}
                    </div>

                    <Textarea
                        label="Referral reason and evidence summary"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={4}
                        placeholder="Explain why this case is being referred to this agency and what external assistance is requested..."
                    />

                    {error && (
                        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                            <AlertCircle size={15} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                </form>
            </Dialog>
        </>
    );
}
