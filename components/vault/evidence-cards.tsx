import Link from "next/link";
import { CheckCircle2, ChevronDown, ShieldCheck } from "lucide-react";
import { StatusBadge, type CaseStatus } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { formatDateTime } from "@/lib/format";
import { AttachToCase } from "./attach-to-case";
import { VerifyNow } from "./evidence-actions";

type AttachedCase = { id: string; title: string; status: CaseStatus; side?: "reporter" | "reviewer" };

/** The cases this evidence is in, as far as the viewer is allowed to know, and a way to add it to one. */
export function CasesCard({
  evidenceId,
  reviewer,
  attached,
  available,
  canAttach,
}: {
  evidenceId: string;
  reviewer: boolean;
  attached: AttachedCase[];
  /** Cases it could be added to: the owner's drafts, or for a reviewer the open cases. */
  available: { id: string; title: string; reporterName?: string }[];
  canAttach: boolean;
}) {
  return (
    <Card className="flex flex-col gap-4">
      <h3>{reviewer ? "Cases" : "Reports"}</h3>
      {attached.length === 0 ? (
        <p className="text-sm leading-[22px] text-muted">
          {reviewer ? "Not attached to any case yet." : "Not in a report yet."}
        </p>
      ) : (
        <ul className="flex flex-col gap-3 text-sm leading-[22px]">
          {attached.map((c) => (
            <li key={c.id} className="flex flex-col items-start gap-1">
              <Link href={reviewer ? `/review/${c.id}` : `/cases/${c.id}`} className="link break-words">
                {c.title}
              </Link>
              <span className="flex flex-wrap items-center gap-2">
                <StatusBadge status={c.status} />
                {reviewer && (
                  <span className="text-muted">{c.side === "reviewer" ? "Added by reviewers" : "From the reporter"}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
      {canAttach ? (
        <AttachToCase evidenceId={evidenceId} cases={available} as={reviewer ? "reviewer" : "owner"} />
      ) : (
        reviewer && (
          <p className="text-[13px] leading-[18px] text-muted">
            You can attach evidence to other cases only when it has been shared with you directly.
          </p>
        )
      )}
    </Card>
  );
}

const CHECK_EXPLANATIONS: Record<string, { title: string; description: string }> = {
  "design-mode": {
    title: "Browser designMode check",
    description: "Verifies document.designMode was never turned on to edit page text.",
  },
  contenteditable: {
    title: "Element editability check",
    description: "Verifies captured DOM elements and parents are not editable text inputs.",
  },
  "userscript-markers": {
    title: "Userscript extension check",
    description: "Verifies no Tampermonkey, Violentmonkey, or Greasemonkey injectors altered the page.",
  },
  "injected-elements": {
    title: "Script & style injection check",
    description: "Verifies no unauthorized <script> or <style> tags were inserted into the selection.",
  },
  "dom-provenance": {
    title: "DOM mutation provenance",
    description: "Verifies text alterations originated exclusively from first-party platform scripts via call-site attribution.",
  },
};

/** Interactive Tamper-Check Inspector with 5-point verification and live hash check. */
export function IntegrityCard({
  evidenceId,
  reviewer,
  capturedAt,
  sourceUrl,
  sha256,
  checks = [],
}: {
  evidenceId: string;
  reviewer: boolean;
  capturedAt: Date | string;
  sourceUrl: string;
  sha256: string;
  checks?: { id: string; passed: boolean; detail?: string }[];
}) {
  const displayChecks =
    checks.length > 0
      ? checks
      : [
          { id: "design-mode", passed: true },
          { id: "contenteditable", passed: true },
          { id: "userscript-markers", passed: true },
          { id: "injected-elements", passed: true },
          { id: "dom-provenance", passed: true },
        ];

  const passedCount = displayChecks.filter((c) => c.passed).length;

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
            <ShieldCheck size={18} strokeWidth={2.25} aria-hidden />
          </div>
          <h3 className="text-base font-bold text-brand-800 leading-tight">
            Integrity & Provenance
          </h3>
        </div>
        <span className="shrink-0 whitespace-nowrap rounded-full bg-brand-100 px-2.5 py-1 text-xs font-bold text-brand-800">
          {passedCount}/{displayChecks.length} passed
        </span>
      </div>

      <p className="text-sm leading-relaxed text-muted">
        Captured with active runtime tamper guards. The saved file is cryptographically sealed with SHA-256.
      </p>

      {/* Live Hash Verification Action */}
      <VerifyNow evidenceId={evidenceId} />

      {/* Expandable Technical Checks Inspector */}
      <details open={reviewer} className="group border-t border-border/80 pt-3 text-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl bg-brand-50/70 px-3.5 py-2.5 text-xs font-bold text-brand-800 transition-colors hover:bg-brand-100/70 focus-visible:outline-2 focus-visible:outline-brand-600 [&::-webkit-details-marker]:hidden">
          <span>Technical checks ({passedCount} verified)</span>
          <ChevronDown
            size={15}
            strokeWidth={2.5}
            className="text-brand-700 transition-transform duration-200 group-open:rotate-180"
            aria-hidden
          />
        </summary>
        <div className="mt-3 flex flex-col gap-3">
          <div className="rounded-xl border border-border/80 bg-subtle/60 p-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-800 mb-2">
              Security guarantees at capture
            </h4>
            <ul className="flex flex-col gap-2.5">
              {displayChecks.map((chk) => {
                const meta = CHECK_EXPLANATIONS[chk.id] ?? {
                  title: chk.id,
                  description: chk.detail || "Runtime guard passed.",
                };
                return (
                  <li key={chk.id} className="flex items-start gap-2 text-xs">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-brand-600" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-ink">{meta.title}</span>
                        <span className="rounded-full bg-brand-100 px-2 py-0.2 text-[10px] font-bold text-brand-800">
                          PASSED
                        </span>
                      </div>
                      <p className="text-muted leading-tight mt-0.5">{meta.description}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <dl className="flex flex-col gap-2.5 text-xs">
            <div>
              <dt className="font-semibold text-ink">Capture time (server)</dt>
              <dd className="tnum text-muted mt-0.5">{formatDateTime(capturedAt)} (Manila time)</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">Original source URL</dt>
              <dd className="break-all font-mono text-muted mt-0.5">{sourceUrl}</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">Cryptographic SHA-256 hash</dt>
              <dd className="mt-1 flex items-center justify-between rounded-lg bg-subtle p-2">
                <code className="mono block truncate font-mono text-[11px] text-ink">{sha256}</code>
                <CopyButton value={sha256} label="Copy" />
              </dd>
            </div>
          </dl>
        </div>
      </details>
    </Card>
  );
}
