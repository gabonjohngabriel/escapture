import { ArrowLeft, Clock, EyeOff, Lock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { bodyRow, headRow, rowLink, TableBox, td, th } from "@/components/dashboard/data-table";
import { PageCrumbs } from "@/components/layout/app-shell";
import { AssignReviewers } from "@/components/review/assign-reviewers";
import { EvidenceRecord } from "@/components/vault/evidence-record";
import { FlaggedWords } from "@/components/review/flagged-words";
import { CloseCaseButton, StartReviewButton } from "@/components/review/review-actions";
import { ReferCaseDialog } from "@/components/review/refer-dialog";
import { UserAvatar } from "@/components/ui/user-avatar";
import { TamperCheck } from "@/components/vault/tamper-check";
import { Timeline } from "@/components/cases/timeline";
import { ReferralStatusBadge, SeverityBadge, StatusBadge, UrgencyBadge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDateTime, kindLabel } from "@/lib/format";
import { isUuid, orNotFound, pageUser } from "@/server/page-auth";
import { getReviewCase, listAssignableReviewers } from "@/server/services/review";

// Per-user page: allowed to wait for the server on navigation.
export const instant = false;

const panelTitle = "text-[17px] leading-6";

function agencyDisplayName(agency: string) {
  switch (agency) {
    case "pnp_acg":
      return "PNP Anti-Cybercrime Group";
    case "nbi_cybercrime":
      return "NBI Cybercrime Division";
    case "vawc":
      return "Barangay VAWC Desk";
    default:
      return agency.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());
  }
}

export default async function ReviewCasePage({ params }: PageProps<"/review/[id]">) {
  const { id } = await params;
  const user = await pageUser(["reviewer", "admin"]);
  if (!isUuid(id)) notFound();
  const c = await orNotFound(getReviewCase(user, id));
  const closed = c.status === "closed";
  // After closure the review team keeps the record of what was attached, not the evidence itself.
  const reporterCount = c.reporterRecord?.length ?? c.reporterEvidence.length;
  // Only an administrator assigns, and only while the case is open.
  const canAssign = user.role === "admin" && !closed;
  const assigned = new Set(c.assignees.map((a) => a.id));
  const assignable = canAssign ? (await listAssignableReviewers(user)).filter((r) => !assigned.has(r.id)) : [];
  const people = [
    { ...c.owner, role: "Reporter" },
    ...c.collaborators.map((p) => ({ ...p, role: "Collaborator" })),
  ];

  return (
    <>
      <PageCrumbs title={c.title} section={closed ? "/review/archives" : undefined} />
      <div>
        <Link href={closed ? "/review/archives" : "/review/board"} className="link inline-flex items-center gap-1 text-sm">
          <ArrowLeft size={16} strokeWidth={1.75} aria-hidden />
          {closed ? "Back to the Case Archives" : "Back to the Review Board"}
        </Link>
      </div>
      <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h1 className="wrap-anywhere">{c.title}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm leading-[22px] text-muted">
            <StatusBadge status={c.status} />
            {c.escalatedAt && <span className="tnum">Escalated {formatDateTime(c.escalatedAt)}</span>}
            <span className="inline-flex items-center gap-1">
              <Lock size={16} strokeWidth={1.75} aria-hidden />
              Locked by the student
            </span>
          </p>
          {c.flaggedWords.length > 0 && (
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm leading-[22px] text-muted">
              Flagged words
              <FlaggedWords words={c.flaggedWords} max={20} />
            </p>
          )}
        </div>
        {/* One step at a time: start the review, then the same spot offers closing it. */}
        <div className="flex flex-wrap items-center gap-2">
          {!closed && <ReferCaseDialog caseId={c.id} caseTitle={c.title} />}
          {c.status === "escalated" && <StartReviewButton caseId={c.id} />}
          {c.status === "under_review" && <CloseCaseButton caseId={c.id} />}
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-[var(--section-gap)] [&>*]:min-w-0">
          <Card className="flex flex-col gap-2">
            <h2 className={panelTitle}>Description from the student</h2>
            <p className="max-w-[72ch] whitespace-pre-wrap wrap-anywhere">{c.description || "No description was added."}</p>
          </Card>

          <section className="flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h2 className="text-[20px] leading-7">Reporter&apos;s evidence</h2>
              <span className="tnum text-[13px] leading-[18px] text-muted">
                {reporterCount} {reporterCount === 1 ? "item" : "items"} · attached by the
                student and collaborators
              </span>
            </div>
            {c.reporterRecord ? (
              <EvidenceRecord caption="Evidence the student and collaborators attached, as recorded at closure" items={c.reporterRecord} />
            ) : (
            <TableBox caption="Evidence attached by the student and collaborators" minWidth={640}>
              <thead>
                <tr className={headRow}>
                  <th scope="col" className={th}>
                    Evidence
                  </th>
                  <th scope="col" className={th}>
                    Added by
                  </th>
                  <th scope="col" className={th}>
                    Captured
                  </th>
                  <th scope="col" className={th}>
                    Tamper checks
                  </th>
                </tr>
              </thead>
              <tbody>
                {c.reporterEvidence.map((e) => (
                  <tr key={e.id} className={bodyRow}>
                    <td className={`${td} max-w-[280px]`}>
                      <Link href={`/vault/${e.id}?from=${c.id}`} className={`${rowLink} block truncate`} title={e.label}>
                        {e.label}
                      </Link>
                      <span className="block text-[13px] leading-[18px] text-muted">{kindLabel(e.kind)}</span>
                    </td>
                    <td className={`${td} whitespace-nowrap`}>{e.ownerName}</td>
                    <td className={`${td} mono tnum whitespace-nowrap text-muted`}>{formatDateTime(e.capturedAt)}</td>
                    <td className={`${td} whitespace-nowrap`}>
                      <TamperCheck reviewer />
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableBox>
            )}
          </section>

          {/* Kept apart from the reporter's evidence, and never shown to them (I5). */}
          <section className="flex flex-col gap-4 rounded-xl border border-dashed border-border-strong bg-brand-50 p-[var(--card-pad)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-[20px] leading-7">Added by reviewers</h2>
                <p className="mt-0.5 flex items-start gap-1.5 text-sm leading-[22px] text-muted">
                  <EyeOff size={16} strokeWidth={1.75} aria-hidden className="mt-[3px] shrink-0" />
                  Only reviewers and administrators can see this section. The student who reported and collaborators
                  can&apos;t.
                </p>
              </div>
              {!closed && (
                <Link href="/review/shared" className={buttonClass("soft")}>
                  Attach shared evidence
                </Link>
              )}
            </div>
            {c.reviewerRecord ? (
              c.reviewerRecord.length === 0 ? (
                <p className="text-sm leading-[22px] text-muted">No reviewer attachments.</p>
              ) : (
                <EvidenceRecord caption="Evidence reviewers attached, as recorded at closure" items={c.reviewerRecord} />
              )
            ) : c.reviewerEvidence.length === 0 ? (
              <p className="text-sm leading-[22px] text-muted">No reviewer attachments yet.</p>
            ) : (
              <ul className="rounded-xl border border-border bg-card">
                {c.reviewerEvidence.map((e) => (
                  <li
                    key={e.id}
                    className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border px-4 py-3 last:border-b-0 focus-within:bg-brand-50 hover:bg-brand-50"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/vault/${e.id}?from=${c.id}`}
                        className={`${rowLink} block truncate text-sm`}
                        title={e.label}
                      >
                        {e.label}
                      </Link>
                      <span className="block text-[13px] leading-[18px] text-muted">
                        {kindLabel(e.kind)} · Shared by {e.ownerName} ({e.ownerEmail})
                      </span>
                    </div>
                    <TamperCheck reviewer />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <Card className="flex flex-col gap-3">
            <h2 className={panelTitle}>People</h2>
            <ul className="flex flex-col gap-3">
              {people.map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="grid size-8 shrink-0 place-items-center rounded-full overflow-hidden shadow-xs"
                  >
                    <UserAvatar seed={p.id} size={32} title={p.name} className="size-full rounded-full" />
                  </span>
                  <span className="min-w-0 text-sm leading-5">
                    <span className="block font-semibold">{p.name}</span>
                    <span className="block text-[13px] leading-[18px] break-all text-muted">
                      {p.role} · {p.email}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="flex flex-col gap-3">
            <h2 className={panelTitle}>Assigned reviewers</h2>
            <AssignReviewers caseId={c.id} assignees={c.assignees} reviewers={assignable} canEdit={canAssign} />
          </Card>

          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className={panelTitle}>External authority oversight</h2>
              <span className="text-[13px] font-semibold text-muted">
                {c.referrals.length} {c.referrals.length === 1 ? "referral" : "referrals"}
              </span>
            </div>
            {c.referrals.length === 0 ? (
              <p className="text-[13px] leading-[20px] text-muted">
                Not currently referred to external law enforcement or LGU.
              </p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {c.referrals.map((r) => (
                  <div key={r.id} className="rounded-xl border border-border bg-subtle p-3.5 text-xs space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-ink text-[13px]">{agencyDisplayName(r.targetAgency)}</span>
                      <SeverityBadge severity={r.severity} />
                    </div>
                    <p className="text-muted text-[13px] leading-relaxed line-clamp-3">
                      <strong className="text-ink font-semibold">Reason:</strong> {r.referralReason}
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[12px]">
                      <span className="text-muted">Referral status:</span>
                      <ReferralStatusBadge status={r.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {c.directives.length > 0 && (
              <div className="mt-2 pt-3 border-t border-border flex flex-col gap-2.5">
                <span className="text-[13px] font-bold text-ink">Directives & advisories received:</span>
                {c.directives.map((d) => (
                  <div key={d.id} className="rounded-xl bg-subtle p-3 text-xs border border-border space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-ink text-[13px]">{d.actionType}</strong>
                      <UrgencyBadge urgency={d.urgency} />
                    </div>
                    <p className="text-[13px] text-ink/90 leading-relaxed">{d.directives}</p>
                    {d.investigationMilestone && (
                      <p className="text-[12px] text-[#8A5A12] font-semibold flex items-center gap-1.5 pt-1">
                        <Clock size={13} className="shrink-0 text-[#E9B350]" aria-hidden />
                        <span>Milestone: {d.investigationMilestone}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="flex flex-col gap-3">
            <h2 className={panelTitle}>Status history</h2>
            <Timeline events={c.events} />
          </Card>

          {closed && (
            <Card className="flex flex-col gap-2">
              <h2 className={panelTitle}>Closing note</h2>
              <p className="whitespace-pre-wrap wrap-anywhere">{c.closingNote || "No note was recorded."}</p>
              {c.closedAt && (
                <p className="tnum text-[13px] leading-[18px] text-muted">Closed {formatDateTime(c.closedAt)}</p>
              )}
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
