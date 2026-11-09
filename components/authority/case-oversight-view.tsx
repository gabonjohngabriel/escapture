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
    ShieldCheck,
    ThumbsUp,
    XCircle,
} from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/client-api";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge, ReferralStatusBadge, SeverityBadge, StatusBadge, UrgencyBadge } from "@/components/ui/badge";
import { Input, Select, Textarea } from "@/components/ui/field";

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

    const acknowledgmentLabel = (ack: string) => {
        switch (ack) {
            case "adopted":
                return { label: "Adopted", tone: "review" as const };
            case "acknowledged":
                return { label: "Acknowledged", tone: "authority" as const };
            default:
                return { label: ack || "Pending", tone: "neutral" as const };
        }
    };

    return (
        <div className="space-y-6">
            {/* Header / Case Banner */}
            <div className="rounded-2xl border border-(--brand-500) bg-card p-6 shadow-xs">
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

                    <div className="flex items-center gap-2.5">
                        <StatusBadge status={data.case.status} />
                        {activeReferral && <SeverityBadge severity={activeReferral.severity} />}
                    </div>
                </div>

                {/* Referral Dispatch Card (Authority Navy) */}
                {activeReferral && (
                    <div className="mt-6 rounded-xl border border-[#C5D3E2] bg-[#EEF2F6] p-4 text-sm text-[#1E3A5F]">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="space-y-1">
                                <p className="font-bold text-[#1E3A5F] flex items-center gap-2 text-[14px]">
                                    <ShieldCheck size={18} className="text-[#243B53]" aria-hidden />
                                    Referred to {agencyLabel(activeReferral.targetAgency)} by {activeReferral.referredByName} ({activeReferral.referredByOffice || "BulSU Reviewer"})
                                </p>
                                <p className="text-[#244B6B] text-xs sm:text-[13px] leading-relaxed">
                                    <strong className="font-semibold text-[#1E3A5F]">Referral rationale:</strong> {activeReferral.referralReason}
                                </p>
                            </div>
                            <div className="shrink-0 flex items-center gap-2">
                                <span className="text-xs text-[#244B6B] font-medium">Status:</span>
                                <ReferralStatusBadge status={activeReferral.status} />
                            </div>
                        </div>

                        {activeReferral.status === "referred" &&
                            (activeReferral.severity === "severe" || activeReferral.severity === "critical") && (
                                <div className="mt-3 pt-3 border-t border-[#C5D3E2]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <p className="text-xs text-[#244B6B]">
                                        This severe incident requires external agency intake and formal docket assignment.
                                    </p>
                                    <Button
                                        variant="authority"
                                        onClick={handleAcceptHandling}
                                        disabled={submitting}
                                        className="h-9 px-4 text-xs font-semibold">
                                        <Gavel size={14} className="mr-1.5" aria-hidden />
                                        Accept formal external handling
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
                    <span>Action directives & advisories ({data.directives.length})</span>
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
                    <span>Sealed evidence records ({data.evidence.length})</span>
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
                    <span>Final decision review & concurrence</span>
                </button>
            </div>

            {/* Tab: Action Directives */}
            {activeTab === "directives" && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Submit Directive Form */}
                    <div className="lg:col-span-1 rounded-2xl border border-(--brand-500) bg-card p-5 shadow-xs h-fit space-y-4">
                        <div>
                            <h2 className="text-base font-bold text-ink">Submit action directive</h2>
                            <p className="text-xs text-muted">
                                Provide official legal or procedural recommendations based on the evidence.
                            </p>
                        </div>

                        <form onSubmit={handleSubmitDirectives} className="space-y-4">
                            <Input
                                label="Action or order type"
                                value={actionType}
                                onChange={(e) => setActionType(e.target.value)}
                                placeholder="e.g. Barangay Protection Order (BPO), PNP Subpoena"
                                required
                            />

                            <Select
                                label="Urgency level"
                                value={urgency}
                                onChange={(e) =>
                                    setUrgency(
                                        e.target.value as "standard" | "priority" | "immediate",
                                    )
                                }>
                                <option value="standard">Standard review</option>
                                <option value="priority">Priority intervention</option>
                                <option value="immediate">Immediate legal summons / safety plan</option>
                            </Select>

                            <Textarea
                                label="Directives and procedural guidance"
                                value={directivesText}
                                onChange={(e) => setDirectivesText(e.target.value)}
                                rows={4}
                                placeholder="Detail what specific steps must be executed by the student, university, or local jurisdiction..."
                                required
                            />

                            <Input
                                label="External milestone (optional)"
                                value={milestone}
                                onChange={(e) => setMilestone(e.target.value)}
                                placeholder="e.g. Summons served for Nov 14 hearing"
                            />

                            {error && (
                                <p className="text-xs font-medium text-red-600">
                                    {error}
                                </p>
                            )}

                            <Button
                                type="submit"
                                disabled={submitting}
                                className="w-full gap-2 bg-brand-600 hover:bg-brand-700 text-white">
                                <Send size={15} aria-hidden />
                                <span>{submitting ? "Submitting..." : "Issue advisory directive"}</span>
                            </Button>
                        </form>
                    </div>

                    {/* Timeline of Directives */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-base font-bold text-ink">Recorded directives & updates</h2>
                        {data.directives.length === 0 ? (
                            <div className="rounded-2xl border-2 border-brand-500 bg-card p-10 text-center shadow-xs">
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
                                        className="rounded-2xl border border-(--brand-500) bg-card p-5 shadow-xs space-y-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <div className="rounded-lg bg-brand-50 p-1.5 text-brand-600">
                                                    <Gavel size={16} aria-hidden />
                                                </div>
                                                <span className="font-bold text-sm text-ink">{d.actionType}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <UrgencyBadge urgency={d.urgency} />
                                                <span className="text-xs text-muted">
                                                    {formatDateTime(d.createdAt)}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-sm text-ink/90 whitespace-pre-wrap leading-relaxed">
                                            {d.directives}
                                        </p>

                                        {d.investigationMilestone && (
                                            <div className="flex items-center gap-2 rounded-lg bg-subtle px-3 py-1.5 text-xs font-semibold text-[#8A5A12]">
                                                <Clock size={13} className="shrink-0 text-[#E9B350]" aria-hidden />
                                                <span>Milestone: {d.investigationMilestone}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                                            <span className="text-muted">
                                                By: <strong>{d.authorName}</strong> ({agencyLabel(d.authorAgency)})
                                            </span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-muted">University status:</span>
                                                <Badge tone={acknowledgmentLabel(d.universityAcknowledgment).tone}>
                                                    {acknowledgmentLabel(d.universityAcknowledgment).label}
                                                </Badge>
                                            </div>
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
                            <h2 className="text-base font-bold text-ink">Cryptographically sealed evidence</h2>
                            <p className="text-xs text-muted">
                                Captured in accordance with RA 10175 chain-of-custody rules. SHA-256 hashes verified.
                            </p>
                        </div>
                        <Badge tone="tamper" icon={<ShieldCheck size={14} aria-hidden />}>
                            Chain of custody intact
                        </Badge>
                    </div>

                    {data.evidence.length === 0 ? (
                        <div className="rounded-2xl border-2 border-brand-500 bg-card p-10 text-center shadow-xs">
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
                                    className="rounded-2xl border border-(--brand-500) bg-card p-5 shadow-xs space-y-3">
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
                                        <span className="rounded-full bg-subtle border border-border px-2.5 py-0.5 text-xs font-medium text-muted">
                                            {e.kind === "facebook_post" ? "Facebook post" : "Messenger chat"}
                                        </span>
                                    </div>

                                    <div className="space-y-1 text-xs text-muted">
                                        <p>
                                            <strong className="text-ink">Captured at:</strong> {formatDateTime(e.capturedAt)}
                                        </p>
                                        <p className="truncate">
                                            <strong className="text-ink">Source URL:</strong> {e.sourceUrl}
                                        </p>
                                        <p>
                                            <strong className="text-ink">Owner:</strong> {e.ownerName}
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-subtle p-2.5 font-mono text-[11px] text-muted space-y-1">
                                        <div className="flex items-center justify-between text-[11px] font-bold text-ink/80">
                                            <span>SHA-256 Digest</span>
                                            <span className="text-brand-700 flex items-center gap-1">
                                                <CheckCircle2 size={12} /> Verified
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
                <div className="rounded-2xl border border-(--brand-500) bg-card p-6 shadow-xs max-w-2xl mx-auto space-y-5">
                    <div className="text-center space-y-2">
                        <div className="mx-auto size-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-700">
                            <ShieldCheck size={28} aria-hidden />
                        </div>
                        <h2 className="text-xl font-bold text-ink">Final decision review & concurrence</h2>
                        <p className="text-xs text-muted max-w-md mx-auto">
                            As the designated local authority / law enforcement desk, review the final university case disposition and provide your official sign-off or remarks.
                        </p>
                    </div>

                    <div className="rounded-xl border border-border bg-subtle p-4 text-xs space-y-2">
                        <p className="font-semibold text-ink">Authority sign-off protocol:</p>
                        <p className="text-muted leading-relaxed">
                            Under the dual-track oversight model, the university remains the administrative steward of the case. Concurring validates that external law enforcement/LGU requirements (e.g. Barangay Protection Orders, Cybercrime blotters, safety planning) have been satisfied or properly coordinated.
                        </p>
                    </div>

                    <Textarea
                        label="Official concurrence remarks or endorsement"
                        value={concurrenceRemarks}
                        onChange={(e) => setConcurrenceRemarks(e.target.value)}
                        rows={3}
                        placeholder="State any conditions, closing remarks, or confirmations for the case record..."
                    />

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button
                            type="button"
                            onClick={() => handleConcur(true)}
                            disabled={concurring}
                            className="flex-1 gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold">
                            <ThumbsUp size={16} aria-hidden />
                            <span>{concurring ? "Recording..." : "Concur with resolution"}</span>
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => handleConcur(false)}
                            disabled={concurring}
                            className="border-red-300 text-red-700 hover:bg-red-50">
                            <XCircle size={16} aria-hidden />
                            <span>Record non-concurrence or pending remarks</span>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
