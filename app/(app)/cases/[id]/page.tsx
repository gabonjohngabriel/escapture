import { PageCrumbs } from "@/components/layout/app-shell";
import { ArrowLeft, Check, Lock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseMenu, EscalateButton, RemovePersonButton } from "@/components/cases/case-actions";
import { CaseEvidenceTable } from "@/components/cases/case-evidence-table";
import { EvidenceRecord } from "@/components/vault/evidence-record";
import { LinkList } from "@/components/cases/sharing-lists";
import { CollabField, CollabProvider, LiveTitle, PresenceAvatars } from "@/components/cases/case-collab";
import { CaseLive } from "@/components/cases/case-fields";
import { EvidencePicker } from "@/components/vault/evidence-picker";
import { EmailShareButton, LinkShareButton } from "@/components/cases/share-dialogs";
import { Timeline } from "@/components/cases/timeline";
import { StatusBadge, type CaseStatus } from "@/components/ui/badge";
import { Card, Section } from "@/components/ui/card";
import { Banner } from "@/components/ui/feedback";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";
import { isUuid, orNotFound, pageUser } from "@/server/page-auth";
import { getCase } from "@/server/services/cases";
import { listEvidence } from "@/server/services/evidence";
import { listCaseLinks } from "@/server/services/links";
import { isSensitive } from "@/server/services/sensitivity";
import { listWordsPlain } from "@/server/services/flags";

// Per-user page: allowed to wait for the server on navigation.
export const instant = false;

const STEPS: { status: CaseStatus; label: string }[] = [
  { status: "draft", label: "Draft, private" },
  { status: "escalated", label: "Escalated" },
  { status: "under_review", label: "Under review" },
  { status: "closed", label: "Closed" },
];

const statusOrder: Record<string, number> = {
  draft: 0,
  escalated: 1,
  under_review: 2,
  closed: 3,
};

function CaseStepTracker({ currentStatus }: { currentStatus: string }) {
  const currentIdx = statusOrder[currentStatus] ?? 0;

  return (
    <div className="mt-4 border-t border-border/70 pt-4">
      <div className="flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isUpcoming = idx > currentIdx;

          return (
            <div key={step.status} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
                    isDone && "bg-brand-600 text-white shadow-xs",
                    isCurrent && "bg-brand-500 text-white ring-4 ring-brand-100 shadow-xs",
                    isUpcoming && "border border-border bg-subtle text-muted",
                  )}
                >
                  {isDone ? (
                    <Check size={14} strokeWidth={3} aria-hidden />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-[11px] font-semibold whitespace-nowrap",
                    isCurrent ? "text-brand-800" : isDone ? "text-ink" : "text-muted",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-0.5 flex-1 -translate-y-2.5 rounded-full",
                    idx < currentIdx ? "bg-brand-500" : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default async function CasePage({ params }: PageProps<"/cases/[id]">) {
  const { id } = await params;
  const user = await pageUser(["student"]);
  if (!isUuid(id)) notFound();
  const c = await orNotFound(getCase(user, id));
  const draft = c.status === "draft";
  const owner = c.role === "owner";
  const attached = new Set(c.evidence.map((e) => e.id));
  const vault = draft ? await listEvidence(user, "mine") : [];
  const links = owner ? await listCaseLinks(user, c.id) : [];
  const bank = await listWordsPlain();
  const evidenceSensitivity = new Map<string, boolean>();
  await Promise.all(
    c.evidence.map(async (e) => {
      const sensitive = await isSensitive(user, e, bank);
      evidenceSensitivity.set(e.id, sensitive);
    }),
  );

  const description = (
    // On a draft the card is the text box: no padding of its own, and it carries the focus ring.
    <Card
      className={
        draft
          ? "p-0! has-[textarea:focus-visible]:border-border-strong has-[textarea:focus-visible]:outline-2 has-[textarea:focus-visible]:outline-offset-2 has-[textarea:focus-visible]:outline-brand-700"
          : undefined
      }
    >
      {draft ? (
        <CollabField
          field="description"
          label="What happened"
          maxLength={10000}
          placeholder="What happened? Describe it in your own words. You can keep editing until you escalate."
          // Fills its card edge to edge, so the card itself is the text box; the card shows the focus ring.
          className="block min-h-32 w-full resize-none rounded-xl border-0 bg-transparent px-[var(--card-pad)] pt-[var(--card-pad)] pb-2 text-base leading-[26px] text-ink [field-sizing:content] placeholder:text-muted focus-visible:outline-none!"
        />
      ) : (
        <p className="max-w-prose whitespace-pre-wrap wrap-anywhere">{c.description || "No description was added."}</p>
      )}
    </Card>
  );

  const evidence = (
    <Section
      title="Evidence"
      action={
        draft ? (
          <EvidencePicker
            caseId={c.id}
            vaultEmpty={vault.length === 0}
            available={vault
              .filter((e) => !attached.has(e.id))
              .map((e) => ({ id: e.id, label: e.label, kind: e.kind, capturedAt: e.capturedAt }))}
          />
        ) : undefined
      }
    >
      {c.record ? (
        c.record.length === 0 ? (
          <Card>
            <p className="text-sm leading-[22px] text-muted">No evidence was attached.</p>
          </Card>
        ) : (
          // The record of what was attached. An item its owner has since deleted has no page to open.
          <EvidenceRecord
            caption="Evidence in this case, as recorded when it closed"
            items={c.record}
            hrefFor={(e) => `/vault/${e.evidenceId}?from=${c.id}`}
          />
        )
      ) : c.evidence.length === 0 ? (
        <Card>
          <p className="text-sm leading-[22px] text-muted">No evidence has been added yet.</p>
        </Card>
      ) : (
        <CaseEvidenceTable
          caseId={c.id}
          items={c.evidence.map((e) => ({
            id: e.id,
            label: e.label,
            kind: e.kind,
            capturedAt: e.capturedAt,
            sourceUrl: (e as unknown as { sourceUrl?: string }).sourceUrl,
            sha256: e.sha256,
            addedBy: e.ownerId === user.id ? "you" : e.ownerName,
            canRemove: draft && (owner || e.attachedBy === user.id),
            sensitive: evidenceSensitivity.get(e.id) ?? false,
          }))}
        />
      )}
    </Section>
  );

  const people = (
    <Section title="People on this report">
      <Card className="flex flex-col gap-4">
        <ul className="flex flex-col gap-2 text-sm leading-[22px]">
          <li>
            <span className="font-semibold">{c.owner.name}</span>{" "}
            <span className="text-muted">{c.owner.email} · Started this report</span>
          </li>
          {c.collaborators.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-x-3">
              <span className="min-w-0 break-words">
                <span className="font-semibold">{p.name}</span>{" "}
                <span className="text-muted">
                  {p.email} · Added {p.via === "link" ? "with a link" : "by email"}
                </span>
              </span>
              {draft && owner && <RemovePersonButton caseId={c.id} userId={p.id} name={p.name} />}
            </li>
          ))}
        </ul>
        {draft && owner && (
          <div className="flex flex-wrap gap-3 border-t border-border pt-4">
            <EmailShareButton
              endpoint={`/api/cases/${c.id}/collaborators`}
              buttonLabel="Add someone by email"
              title="Add someone to this report"
              risk="You are choosing to share this report. The person you add will see the report and its evidence, can edit the details and can add their own evidence. Reviewers will see their name and email. You can remove them while the report is a draft."
              confirmLabel="I understand, add them"
              successText="They have been added to the report."
            />
            <LinkShareButton
              endpoint={`/api/cases/${c.id}/links`}
              title="Create a password link to this report"
              risk="Any student who has this link, its password and an Escapture account can join this report, see its evidence and add their own. Reviewers will see their name and email."
            />
          </div>
        )}
        {links.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <h3 className="text-sm leading-5 font-semibold">Password links</h3>
            <LinkList endpoint={`/api/cases/${c.id}/links`} links={links} />
          </div>
        )}
      </Card>
    </Section>
  );

  return (
    // Everyone on the case sees who else has it open, and on a draft each other's edits and carets, live.
    <CollabProvider caseId={c.id} initial={{ title: c.title, description: c.description }} editable={draft}>
      <div className="flex flex-col gap-6">
        <PageCrumbs title={c.title} />
        {draft && <CaseLive caseId={c.id} updatedAt={c.updatedAt.toISOString()} />}
        <div>
          <Link
            href="/cases"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-800 transition-colors hover:bg-brand-100 hover:text-brand-900"
          >
            <ArrowLeft size={14} strokeWidth={2} aria-hidden />
            <span>Back to reports</span>
          </Link>
        </div>

        {/* Structured Header Summary Card with Progress Tracker */}
        <div className="flex flex-col rounded-2xl border border-brand-500/40 bg-card p-5 shadow-soft">
          <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
            <div className="flex min-w-0 flex-1 basis-[320px] flex-col gap-1">
              {draft ? (
                <>
                  {/* The title is a field on a draft; the page still needs a heading. */}
                  <h1 className="sr-only">
                    <LiveTitle />
                  </h1>
                  <CollabField
                    field="title"
                    label="Title"
                    maxLength={160}
                    placeholder="Title"
                    className="-mx-2 w-[calc(100%+16px)] rounded-md border border-transparent bg-transparent px-2 font-heading text-[32px] leading-10 font-semibold text-ink hover:border-border focus:border-border-strong focus:bg-card"
                  />
                </>
              ) : (
                <h1 className="wrap-anywhere text-2xl font-bold tracking-tight text-ink sm:text-3xl">{c.title}</h1>
              )}
              <p className="flex flex-wrap items-center gap-2 text-muted">
                <StatusBadge status={c.status} />
                {!owner && `Report by ${c.owner.name}`}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <PresenceAvatars />
              {draft && (
                <>
                  {owner && <EscalateButton caseId={c.id} hasEvidence={c.evidence.length > 0} />}
                  <CaseMenu caseId={c.id} title={c.title} ownerName={c.owner.name} role={owner ? "owner" : "collaborator"} />
                </>
              )}
            </div>
          </header>

          <CaseStepTracker currentStatus={c.status} />
        </div>

        {!draft && c.escalatedAt && (
          <Banner tone="info">
            <span className="inline-flex items-center gap-1 font-semibold">
              <Lock size={16} strokeWidth={1.75} aria-hidden />
              Locked since <span className="tnum">{formatDateTime(c.escalatedAt)}</span>.
            </span>{" "}
            Reviewers and administrators can see this report as a university case. It can&apos;t be edited or withdrawn, and its evidence can&apos;t be deleted.
          </Banner>
        )}
        {draft && !owner && (
          <Banner tone="info">
            {c.owner.name} added you to this report. You can edit the details and add your own evidence. Only{" "}
            {c.owner.name} can escalate it.
          </Banner>
        )}

        {draft ? (
          <>
            {description}
            {evidence}
            {people}
          </>
        ) : (
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="flex min-w-0 flex-col gap-[var(--section-gap)] [&>*]:min-w-0">
              {c.status === "closed" && (
                <Card className="flex flex-col gap-2">
                  <h2 className="text-[20px] leading-7">Closing note from the reviewer</h2>
                  <p className="max-w-prose whitespace-pre-wrap wrap-anywhere">{c.closingNote || "No note was recorded."}</p>
                  {c.closedAt && (
                    <p className="tnum text-[13px] leading-[18px] text-muted">Closed {formatDateTime(c.closedAt)}</p>
                  )}
                </Card>
              )}
              <Section title="What you escalated">{description}</Section>
              {evidence}
              {people}
            </div>
            <Section title="Status">
              <Card>
                {/* The note has its own card above when the case is closed. */}
                <Timeline events={c.events.map((e) => ({ ...e, note: null }))} />
              </Card>
            </Section>
          </div>
        )}
      </div>
    </CollabProvider>
  );
}
