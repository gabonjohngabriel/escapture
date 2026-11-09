import {
    FileCheck2,
    Gavel,
    Shield,
    ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/format";
import { requireUser } from "@/server/auth";
import { listReferredCases } from "@/server/services/authority";
import { StatusBadge } from "@/components/ui/badge";
import { AuthorityEmptyState } from "@/components/authority/authority-empty-state";

export default async function AuthorityCasesPage() {
    const user = await requireUser({ roles: ["authority", "reviewer", "admin"] });
    const cases = await listReferredCases(user);

    const agencyTitle =
        user.role === "authority"
            ? user.office || "External Authority Oversight Portal"
            : "External Referrals Oversight (Staff View)";

    const severityStyle = (s: string) => {
        switch (s) {
            case "critical":
                return "bg-red-500/10 text-red-600 border-red-500/30";
            case "severe":
                return "bg-amber-500/10 text-amber-600 border-amber-500/30";
            case "moderate":
                return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
            default:
                return "bg-blue-500/10 text-blue-600 border-blue-500/30";
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="rounded-2xl border border-brand-500/20 bg-card p-6 shadow-xs">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                            <Shield className="text-brand-600" size={15} aria-hidden />
                            <span>Republic Act No. 10175 & 9262 Desk</span>
                        </div>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                            {agencyTitle}
                        </h1>
                        <p className="mt-1 text-sm text-muted">
                            Oversight portal for referred student cases, legal action directives, and dual-track investigation progress.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="rounded-full bg-brand-50 border border-brand-200 px-3.5 py-1 text-xs font-bold text-brand-800">
                            {cases.length} {cases.length === 1 ? "Referred Case" : "Referred Cases"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Cases Grid / Table */}
            {cases.length === 0 ? (
                <AuthorityEmptyState />
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {cases.map((c) => (
                        <Link
                            key={c.referralId}
                            href={`/authority/cases/${c.caseId}`}
                            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-brand-500/50">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span
                                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${severityStyle(
                                                c.severity,
                                            )}`}>
                                            <ShieldAlert size={12} aria-hidden />
                                            {c.severity}
                                        </span>
                                        <StatusBadge status={c.caseStatus} />
                                        <span className="text-xs text-muted">
                                            Referred {formatDateTime(c.referredAt)} by {c.referredByName}
                                        </span>
                                    </div>
                                    <h2 className="text-lg font-bold text-ink group-hover:text-brand-600 transition-colors">
                                        {c.title}
                                    </h2>
                                    <p className="text-xs text-ink/80 line-clamp-2 max-w-3xl">
                                        <strong>Referral Reason:</strong> {c.referralReason}
                                    </p>
                                </div>

                                <div className="flex items-center gap-4 text-xs font-semibold text-muted shrink-0">
                                    <span className="flex items-center gap-1.5 rounded-lg bg-surface px-2.5 py-1">
                                        <FileCheck2 size={14} className="text-brand-600" aria-hidden />
                                        {c.evidenceCount} {c.evidenceCount === 1 ? "capture" : "captures"}
                                    </span>
                                    <span className="flex items-center gap-1.5 rounded-lg bg-surface px-2.5 py-1">
                                        <Gavel size={14} className="text-brand-600" aria-hidden />
                                        {c.directiveCount} {c.directiveCount === 1 ? "directive" : "directives"}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted">
                                <span className="font-semibold uppercase tracking-wider text-brand-700">
                                    Referral Status: {c.referralStatus.replace("_", " ")}
                                </span>
                                <span className="group-hover:translate-x-0.5 transition-transform font-bold text-brand-600">
                                    Open Oversight Record →
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
