import {
    FileCheck2,
    Gavel,
    Shield,
} from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/format";
import { requireUser } from "@/server/auth";
import { listReferredCases } from "@/server/services/authority";
import { ReferralStatusBadge, SeverityBadge, StatusBadge } from "@/components/ui/badge";
import { AuthorityEmptyState } from "@/components/authority/authority-empty-state";

export default async function AuthorityCasesPage() {
    const user = await requireUser({ roles: ["authority", "reviewer", "admin"] });
    const cases = await listReferredCases(user);

    const agencyTitle =
        user.role === "authority"
            ? user.office || "External Authority Oversight Portal"
            : "External Referrals Oversight (Staff View)";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="rounded-2xl border border-(--brand-500) bg-card p-6 shadow-xs">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted">
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
                            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-(--brand-500) bg-card p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="space-y-1.5">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <SeverityBadge severity={c.severity} />
                                        <StatusBadge status={c.caseStatus} />
                                        <span className="text-xs text-muted">
                                            Referred {formatDateTime(c.referredAt)} by {c.referredByName}
                                        </span>
                                    </div>
                                    <h2 className="text-lg font-bold text-ink group-hover:text-brand-600 transition-colors">
                                        {c.title}
                                    </h2>
                                    <p className="text-xs text-ink/80 line-clamp-2 max-w-3xl leading-relaxed">
                                        <strong className="text-ink font-semibold">Referral reason:</strong> {c.referralReason}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 text-xs font-semibold text-muted shrink-0">
                                    <span className="flex items-center gap-1.5 rounded-lg bg-subtle px-2.5 py-1 text-[13px]">
                                        <FileCheck2 size={14} className="text-brand-600" aria-hidden />
                                        {c.evidenceCount} {c.evidenceCount === 1 ? "capture" : "captures"}
                                    </span>
                                    <span className="flex items-center gap-1.5 rounded-lg bg-subtle px-2.5 py-1 text-[13px]">
                                        <Gavel size={14} className="text-brand-600" aria-hidden />
                                        {c.directiveCount} {c.directiveCount === 1 ? "directive" : "directives"}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted">
                                <div className="flex items-center gap-2">
                                    <span className="text-muted font-medium text-[13px]">Referral status:</span>
                                    <ReferralStatusBadge status={c.referralStatus} />
                                </div>
                                <span className="group-hover:translate-x-0.5 transition-transform font-bold text-brand-600 text-[13px]">
                                    Open oversight record →
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
