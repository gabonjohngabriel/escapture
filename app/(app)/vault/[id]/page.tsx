import { PageCrumbs } from "@/components/layout/app-shell";
import { ArrowLeft, Lock, StickyNote, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CasesCard, IntegrityCard } from "@/components/vault/evidence-cards";
import { EvidenceFrame } from "@/components/vault/evidence-frame";
import { EvidenceTitle } from "@/components/vault/evidence-title";
import { AccessList, LinkList } from "@/components/cases/sharing-lists";
import { VaultRowMenu } from "@/components/vault/vault-row-menu";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { formatDateTime, kindLabel } from "@/lib/format";
import { isUuid, orNotFound, pageUser } from "@/server/page-auth";
import { casesForEvidence, caseVersion } from "@/server/services/cases";
import { getEvidence } from "@/server/services/evidence";
import { isSensitive } from "@/server/services/sensitivity";
import { casesWithEvidence, listBoard } from "@/server/services/review";
import { listEvidenceLinks } from "@/server/services/links";
import { listEvidenceShares } from "@/server/services/shares";

// Per-user page: allowed to wait for the server on navigation.
export const instant = false;

export default async function EvidencePage({ params, searchParams }: PageProps<"/vault/[id]">) {
  const { id } = await params;
  const from = (await searchParams).from;
  const user = await pageUser(["student", "reviewer", "admin"]);
  if (!isUuid(id)) notFound();
  const ev = await orNotFound(getEvidence(user, id));
  const [shares, links] = ev.isOwner
    ? await Promise.all([listEvidenceShares(user, id), listEvidenceLinks(user, id)])
    : [[], []];
  // An administrator sees evidence exactly as a reviewer does.
  const reviewer = user.role !== "student";
  const fromId = typeof from === "string" && isUuid(from) ? from : null;
  // Opened from a case: lead back to it, but only if it is a case this person can open.
  const fromCase = !reviewer && fromId && (await caseVersion(user, fromId).catch(() => null)) ? fromId : null;
  const sensitive = !reviewer ? await isSensitive(user, ev) : false;

  // Which cases the viewer may know about differs by role: a student sees their own
  // cases, a reviewer sees every case that is no longer a draft.
  let cases: React.ComponentProps<typeof CasesCard>;
  let backToReview: string | null = null;
  if (reviewer) {
    const attached = await casesWithEvidence(user, id);
    // A reviewer may attach evidence that is theirs to use: shared with them, or their own.
    const canAttach = ev.sharedWithMe || ev.isOwner;
    const available = canAttach
      ? (await listBoard(user))
          .filter((c) => !attached.some((a) => a.id === c.id))
          .map((c) => ({ id: c.id, title: c.title, reporterName: c.reporterName }))
      : [];
    cases = { evidenceId: id, reviewer, attached, available, canAttach };
    // Opened from a case under review: that case must really hold this evidence.
    if (fromId && attached.some((a) => a.id === fromId)) backToReview = fromId;
  } else {
    cases = { evidenceId: id, reviewer, ...(await casesForEvidence(user, ev)), canAttach: ev.isOwner };
  }
  // Someone it was only shared with has nothing to see or do here unless it is in one of their cases.
  const showCases = reviewer || ev.isOwner || cases.attached.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <PageCrumbs title={ev.label} />
      <div>
        <Link
          href={
            fromCase
              ? `/cases/${fromCase}`
              : backToReview
                ? `/review/${backToReview}`
                : reviewer
                  ? ev.sharedWithMe
                    ? "/review/shared"
                    : "/review/board"
                  : "/vault"
          }
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-800 transition-colors hover:bg-brand-100 hover:text-brand-900"
        >
          <ArrowLeft size={14} strokeWidth={2} aria-hidden />
          <span>
            {fromCase
              ? "Back to your report"
              : backToReview
                ? "Back to the case"
                : reviewer
                  ? ev.sharedWithMe
                    ? "Back to Shared with me"
                    : "Back to the Review Board"
                  : "Back to your vault"}
          </span>
        </Link>
      </div>

      {/* Structured Summary Header Banner */}
      <div className="flex flex-col gap-2 rounded-2xl border border-brand-500/40 bg-card p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-800">
              <StickyNote size={13} strokeWidth={2} aria-hidden />
              {kindLabel(ev.kind)}
            </span>
            {ev.isOwner && shares.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-subtle px-2.5 py-0.5 text-xs font-semibold text-muted">
                <Users size={13} strokeWidth={2} aria-hidden />
                Shared with {shares.length} {shares.length === 1 ? "person" : "people"}
              </span>
            )}
          </div>
          <span className="text-xs font-medium text-muted">
            Captured <span className="tnum font-semibold text-ink">{formatDateTime(ev.capturedAt)}</span>
          </span>
        </div>
        <header className="min-w-0 pt-1">
          {ev.isOwner && !ev.locked ? (
            <>
              {/* The name is a field for its owner; the page still needs a heading. */}
              <h1 className="sr-only">{ev.label}</h1>
              <EvidenceTitle key={ev.label} evidenceId={ev.id} value={ev.label} />
            </>
          ) : (
            <h1 className="break-words text-2xl font-bold tracking-tight text-ink sm:text-3xl">{ev.label}</h1>
          )}
          {!ev.isOwner && (
            <p className="mt-1 text-xs text-muted">
              Captured by {ev.owner?.name ?? "another student"}
            </p>
          )}
        </header>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Browser Chrome Container */}
        <div className="overflow-hidden rounded-2xl border border-brand-500/40 bg-card shadow-soft">
          {/* Chrome Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-brand-50/70 px-4 py-2.5">
            {/* Window dots */}
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="size-2.5 rounded-full bg-[#ff5f56]/80" />
              <span className="size-2.5 rounded-full bg-[#ffbd2e]/80" />
              <span className="size-2.5 rounded-full bg-[#27c93f]/80" />
            </div>

            {/* URL address pill */}
            <div className="flex max-w-[calc(100%-180px)] flex-1 items-center gap-2 rounded-full border border-border/80 bg-card px-3.5 py-1 text-xs text-muted shadow-2xs">
              <Lock size={12} strokeWidth={2} className="shrink-0 text-brand-600" aria-hidden />
              <span className="truncate font-mono" title={ev.sourceUrl}>
                {ev.sourceUrl}
              </span>
            </div>

            {/* Hash copy */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="hidden text-xs font-mono text-muted lg:inline" title={ev.sha256}>
                {ev.sha256.slice(0, 10)}…
              </span>
              <CopyButton value={ev.sha256} label="Copy hash" />
            </div>
          </div>

          {/* Sandboxed Frame Body */}
          <div className="min-w-0 bg-subtle/50 p-4">
            <EvidenceFrame
              src={`/api/evidence/${ev.id}/file`}
              title={`Captured content: ${ev.label}`}
              size={ev.tamperReport.size}
              sensitive={sensitive}
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          {showCases && <CasesCard {...cases} />}

          <IntegrityCard
            evidenceId={ev.id}
            reviewer={reviewer}
            capturedAt={ev.capturedAt}
            sourceUrl={ev.sourceUrl}
            sha256={ev.sha256}
            checks={ev.tamperReport.checks}
          />

          {ev.isOwner && (
            <Card className="flex flex-col gap-4">
              <h3>Sharing</h3>
              {shares.length === 0 ? (
                <p className="text-sm leading-[22px] text-muted">Only you have access.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  <h4>Who has access</h4>
                  <AccessList evidenceId={ev.id} people={shares} />
                </div>
              )}
              {links.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h4>Password links</h4>
                  <LinkList endpoint={`/api/evidence/${ev.id}/links`} links={links} />
                </div>
              )}
              <VaultRowMenu id={ev.id} label={ev.label} locked={ev.locked} onPage />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
