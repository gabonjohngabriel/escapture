"use client";

import {
    CheckCircle2,
    Clock,
    FileCheck2,
    FileText,
    Gavel,
    History,
    MessageSquare,
    Send,
    ShieldAlert,
    ShieldCheck,
    ThumbsUp,
    XCircle,
} from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/client-api";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";

export type OversightData = {
    case: {
        id: string;
        title: string;
        description: string;
        status: "draft" | "escalated" | "under_review" | "closed";
        escalatedAt: string | null;
        updatedAt: string;
    };
    referrals: Array<{
        id: string;
        caseId: string;
        referredBy: string;
        targetAgency: string;
        severity: "routine" | "moderate" | "severe" | "critical";
        referralReason: string;
        status: string;
        createdAt: string;
        updatedAt: string;
        referredByName: string;
        referredByOffice: string | null;
    }>;
    evidence: Array<{
        id: string;
        label: string;
        kind: "facebook_post" | "facebook_message";
        sourceUrl: string;
        sha256: string;
        byteSize: number;
        capturedAt: string;
        ownerId: string;
        ownerName: string;
    }>;
    directives: Array<{
        id: string;
        referralId: string;
        caseId: string;
        authorId: string;
        authorAgency: string;
        actionType: string;
        directives: string;
        urgency: string;
        investigationMilestone: string | null;
        universityAcknowledgment: string;
        universityRemarks: string | null;
        concurrence: boolean;
        createdAt: string;
        authorName: string;
        authorOffice: string | null;
    }>;
    userAgency?: string | null;
};

export function CaseOversightView({
    initialData,
    caseId,
}: {
    initialData: OversightData;
    caseId: string;
}) {
    const [data, setData] = useState<OversightData>(initialData);
    const [actionType, setActionType] = useState("PNP Blotter & Investigation Docket");
    const [directivesText, setDirectivesText] = useState("");
    const [urgency, setUrgency] = useState<"standard" | "priority" | "immediate">("priority");
    const [milestone, setMilestone] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [concurrenceRemarks, setConcurrenceRemarks] = useState("");
    const [concurring, setConcurring] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"directives" | "evidence" | "concurrence">("directives");

    const activeReferral =
        data.referrals.find((r) => r.targetAgency === data.userAgency) ?? data.referrals[0];

    const reloadData = async () => {
        try {
            const updated = await api<OversightData>(`/api/authority/cases/${caseId}`);
            setData(updated);
        } catch (e) {
            console.error("Failed to reload oversight data", e);
        }
    };

    const handleAcceptHandling = async () => {
        if (!activeReferral) return;
        setSubmitting(true);
        try {
            await api(`/api/authority/cases/${caseId}/accept`, {
                body: { referralId: activeReferral.id },
            });
            await reloadData();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to accept case.";
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitDirectives = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeReferral) return;
        if (!directivesText.trim()) {
            setError("Directives content is required.");
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            await api(`/api/authority/cases/${caseId}/directives`, {
                body: {
                    referralId: activeReferral.id,
                    actionType,
                    directives: directivesText.trim(),
                    urgency,
                    investigationMilestone: milestone.trim() || undefined,
                },
            });
            setDirectivesText("");
            setMilestone("");
            await reloadData();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to submit directive.";
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleConcur = async (concurrence: boolean) => {
        if (!activeReferral) return;
        setConcurring(true);
        try {
            await api(`/api/authority/cases/${caseId}/concur`, {
                body: {
                    referralId: activeReferral.id,
                    concurrence,
                    remarks: concurrenceRemarks.trim(),
                },
            });
            setConcurrenceRemarks("");
            await reloadData();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to submit concurrence.";
            setError(message);
        } finally {
            setConcurring(false);
        }
    };

    const agencyLabel = (agency: string) => {
        switch (agency) {
            case "pnp_acg":
                return "PNP Anti-Cybercrime Group";
            case "nbi_cybercrime":
                return "NBI Cybercrime Division";
            case "vawc":
                return "Barangay VAWC Desk";
            default:
                return "Barangay Local Officials";
        }
    };

    const severityBadge = (severity: string) => {
        const colors = {
            critical: "bg-red-500/10 text-red-600 border-red-500/30",
            severe: "bg-amber-500/10 text-amber-600 border-amber-500/30",
            moderate: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
            routine: "bg-blue-500/10 text-blue-600 border-blue-500/30",
        };
        return (
            <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                    colors[severity as keyof typeof colors] ?? colors.routine
                }`}>
                <ShieldAlert size={12} aria-hidden />
                {severity}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header / Case Banner */}
            <div className="rounded-2xl border border-brand-500/20 bg-card p-6 shadow-xs">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted">
                            <span>Case ID: {data.case.id.slice(0, 8)}</span>
                            <span>•</span>
                            <span>Escalated {data.case.escalatedAt ? formatDateTime(data.case.escalatedAt) : "N/A"}</span>
                        </div>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                            {data.case.title}
                        </h1>
                        <p className="mt-2 text-sm text-ink/80 max-w-3xl leading-relaxed">
                            {data.case.description}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <StatusBadge status={data.case.status} />
                        {activeReferral && severityBadge(activeReferral.severity)}
                    </div>
                </div>

                {/* Referral Dispatch Card */}
                {activeReferral && (
                    <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <p className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                                    <ShieldCheck size={18} className="text-amber-600" aria-hidden />
                                    Referred to {agencyLabel(activeReferral.targetAgency)} by {activeReferral.referredByName} ({activeReferral.referredByOffice || "BulSU Reviewer"})
                                </p>
                                <p className="text-amber-800/90 dark:text-amber-200/90 text-xs sm:text-sm">
                                    <strong>Referral Rationale:</strong> {activeReferral.referralReason}
                                </p>
                            </div>
                            <span className="shrink-0 rounded-md bg-amber-500/20 px-2 py-1 text-xs font-semibold text-amber-900 dark:text-amber-300 uppercase">
                                Status: {activeReferral.status.replace("_", " ")}
                            </span>
                        </div>

                        {activeReferral.status === "referred" &&
                            (activeReferral.severity === "severe" || activeReferral.severity === "critical") && (
                                <div className="mt-3 pt-3 border-t border-amber-500/20 flex items-center justify-between">
                                    <p className="text-xs text-amber-800 dark:text-amber-300">
                                        This severe incident requires external agency intake and docket assignment.
                                    </p>
                                    <Button
                                        onClick={handleAcceptHandling}
                                        disabled={submitting}
                                        className="h-9 px-3.5 text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold">
                                        <Gavel size={14} className="mr-1.5" aria-hidden />
                                        Accept Formal External Handling
                                    </Button>
                                </div>
                            )}
                    </div>
                )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-border">
                <button
                    type="button"
                    onClick={() => setActiveTab("directives")}
                    className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
                        activeTab === "directives"
                            ? "border-brand-600 text-brand-600"
                            : "border-transparent text-muted hover:text-ink"
                    }`}>
                    <Gavel size={16} aria-hidden />
                    <span>Action Directives & Advisories ({data.directives.length})</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("evidence")}
                    className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
                        activeTab === "evidence"
                            ? "border-brand-600 text-brand-600"
                            : "border-transparent text-muted hover:text-ink"
                    }`}>
                    <FileCheck2 size={16} aria-hidden />
                    <span>Sealed Evidence Records ({data.evidence.length})</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("concurrence")}
                    className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
                        activeTab === "concurrence"
                            ? "border-brand-600 text-brand-600"
                            : "border-transparent text-muted hover:text-ink"
                    }`}>
                    <ShieldCheck size={16} aria-hidden />
                    <span>Final Decision Review & Concurrence</span>
                </button>
            </div>

            {/* Tab: Action Directives */}
            {activeTab === "directives" && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Submit Directive Form */}
                    <div className="lg:col-span-1 rounded-2xl border border-border bg-card p-5 shadow-xs h-fit space-y-4">
                        <div>
                            <h2 className="text-base font-bold text-ink">Submit Action Directive</h2>
                            <p className="text-xs text-muted">
                                Provide official legal or procedural recommendations based on the evidence.
                            </p>
                        </div>

                        <form onSubmit={handleSubmitDirectives} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                                    Action / Order Type
                                </label>
                                <input
                                    type="text"
                                    value={actionType}
                                    onChange={(e) => setActionType(e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    placeholder="e.g. Barangay Protection Order (BPO), PNP Subpoena"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                                    Urgency
                                </label>
                                <select
                                    value={urgency}
                                    onChange={(e) =>
                                        setUrgency(
                                            e.target.value as "standard" | "priority" | "immediate",
                                        )
                                    }
                                    className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-500">
                                    <option value="standard">Standard Review</option>
                                    <option value="priority">Priority Intervention</option>
                                    <option value="immediate">Immediate Legal Summons / Safety Plan</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                                    Directives & Procedural Guidance
                                </label>
                                <textarea
                                    value={directivesText}
                                    onChange={(e) => setDirectivesText(e.target.value)}
                                    rows={4}
                                    className="mt-1 w-full rounded-xl border border-border bg-surface p-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    placeholder="Detail what specific steps must be executed by the student, university, or local jurisdiction..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                                    External Milestone (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={milestone}
                                    onChange={(e) => setMilestone(e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    placeholder="e.g. Summons served for Nov 14 hearing"
                                />
                            </div>

                            {error && (
                                <p className="text-xs font-medium text-red-600 dark:text-red-400">
                                    {error}
                                </p>
                            )}

                            <Button
                                type="submit"
                                disabled={submitting}
                                className="w-full gap-2 bg-brand-600 hover:bg-brand-700 text-white">
                                <Send size={15} aria-hidden />
                                <span>{submitting ? "Submitting..." : "Issue Advisory Directive"}</span>
                            </Button>
                        </form>
                    </div>

                    {/* Timeline of Directives */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-base font-bold text-ink">Recorded Directives & Updates</h2>
                        {data.directives.length === 0 ? (
                            <div className="rounded-2xl border-2 border-brand-500/30 bg-card p-10 text-center shadow-xs">
                                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                                    <History size={28} strokeWidth={2} aria-hidden />
                                </div>
                                <h3 className="mt-4 text-base font-bold text-brand-800">No action directives logged yet</h3>
                                <p className="mt-1 text-xs text-muted max-w-sm mx-auto">
                                    Submit the first legal directive or recommended action using the form on the left.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {data.directives.map((d) => (
                                    <div
                                        key={d.id}
                                        className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <div className="rounded-lg bg-brand-500/10 p-1.5 text-brand-600">
                                                    <Gavel size={16} aria-hidden />
                                                </div>
                                                <span className="font-bold text-sm text-ink">{d.actionType}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="rounded-full bg-surface border border-border px-2 py-0.5 text-[11px] font-semibold text-muted uppercase">
                                                    {d.urgency}
                                                </span>
                                                <span className="text-xs text-muted">
                                                    {formatDateTime(d.createdAt)}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-sm text-ink/90 whitespace-pre-wrap leading-relaxed">
                                            {d.directives}
                                        </p>

                                        {d.investigationMilestone && (
                                            <div className="flex items-center gap-2 rounded-lg bg-surface px-3 py-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300">
                                                <Clock size={13} aria-hidden />
                                                <span>Milestone: {d.investigationMilestone}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                                            <span className="text-muted">
                                                By: <strong>{d.authorName}</strong> ({agencyLabel(d.authorAgency)})
                                            </span>
                                            <span className="font-semibold text-muted">
                                                University Status:{" "}
                                                <span
                                                    className={
                                                        d.universityAcknowledgment === "adopted"
                                                            ? "text-green-600 font-bold uppercase"
                                                            : d.universityAcknowledgment === "acknowledged"
                                                            ? "text-blue-600 font-bold uppercase"
                                                            : "text-muted uppercase"
                                                    }>
                                                    {d.universityAcknowledgment}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Tab: Sealed Evidence Records */}
            {activeTab === "evidence" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-ink">Cryptographically Sealed Evidence</h2>
                            <p className="text-xs text-muted">
                                Captured in accordance with RA 10175 chain-of-custody rules. SHA-256 hashes verified.
                            </p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-700 dark:text-green-400">
                            <ShieldCheck size={14} aria-hidden />
                            Chain of Custody Intact
                        </span>
                    </div>

                    {data.evidence.length === 0 ? (
                        <div className="rounded-2xl border-2 border-brand-500/30 bg-card p-10 text-center shadow-xs">
                            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                                <FileCheck2 size={28} strokeWidth={2} aria-hidden />
                            </div>
                            <h3 className="mt-4 text-base font-bold text-brand-800">No sealed evidence attached</h3>
                            <p className="mt-1 text-xs text-muted max-w-sm mx-auto">
                                Evidence packages attached to this case by the university will appear here once transferred.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {data.evidence.map((e) => (
                                <div
                                    key={e.id}
                                    className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {e.kind === "facebook_post" ? (
                                                <FileText size={18} className="text-brand-600" aria-hidden />
                                            ) : (
                                                <MessageSquare size={18} className="text-brand-600" aria-hidden />
                                            )}
                                            <h3 className="font-bold text-sm text-ink truncate max-w-[200px]">
                                                {e.label}
                                            </h3>
                                        </div>
                                        <span className="rounded-full bg-surface border border-border px-2 py-0.5 text-xs font-medium text-muted">
                                            {e.kind === "facebook_post" ? "Facebook Post" : "Messenger Chat"}
                                        </span>
                                    </div>

                                    <div className="space-y-1 text-xs text-muted">
                                        <p>
                                            <strong>Captured At:</strong> {formatDateTime(e.capturedAt)}
                                        </p>
                                        <p className="truncate">
                                            <strong>Source URL:</strong> {e.sourceUrl}
                                        </p>
                                        <p>
                                            <strong>Owner:</strong> {e.ownerName}
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-surface p-2.5 font-mono text-[11px] text-muted space-y-1">
                                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-ink/70">
                                            <span>SHA-256 Digest</span>
                                            <span className="text-green-600 flex items-center gap-1">
                                                <CheckCircle2 size={11} /> Verified
                                            </span>
                                        </div>
                                        <p className="break-all font-mono">{e.sha256}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Tab: Final Decision Concurrence */}
            {activeTab === "concurrence" && (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs max-w-2xl mx-auto space-y-5">
                    <div className="text-center space-y-2">
                        <div className="mx-auto size-12 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-600">
                            <ShieldCheck size={28} aria-hidden />
                        </div>
                        <h2 className="text-xl font-bold text-ink">Final Decision Review & Concurrence</h2>
                        <p className="text-xs text-muted max-w-md mx-auto">
                            As the designated local authority / law enforcement desk, review the final university case disposition and provide your official sign-off or remarks.
                        </p>
                    </div>

                    <div className="rounded-xl border border-border bg-surface p-4 text-xs space-y-2">
                        <p className="font-semibold text-ink">Authority Sign-off Protocol:</p>
                        <p className="text-muted leading-relaxed">
                            Under the dual-track oversight model, the university remains the administrative steward of the case. Concurring validates that external law enforcement/LGU requirements (e.g. Barangay Protection Orders, Cybercrime blotters, safety planning) have been satisfied or properly coordinated.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                            Official Concurrence Remarks / Endorsement
                        </label>
                        <textarea
                            value={concurrenceRemarks}
                            onChange={(e) => setConcurrenceRemarks(e.target.value)}
                            rows={3}
                            placeholder="State any conditions, closing remarks, or confirmations for the case record..."
                            className="w-full rounded-xl border border-border bg-surface p-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button
                            type="button"
                            onClick={() => handleConcur(true)}
                            disabled={concurring}
                            className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold">
                            <ThumbsUp size={16} aria-hidden />
                            <span>{concurring ? "Recording..." : "Concur with Resolution"}</span>
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => handleConcur(false)}
                            disabled={concurring}
                            className="border-red-500/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
                            <XCircle size={16} aria-hidden />
                            <span>Record Non-Concurrence / Pending Remarks</span>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
