import {
  CircleCheck,
  CircleDot,
  Clock,
  FileCheck2,
  Lock,
  Pencil,
  Shield,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/cn";

export type Tone =
  | "escalated"
  | "review"
  | "closed"
  | "tamper"
  | "neutral"
  | "routine"
  | "moderate"
  | "severe"
  | "critical"
  | "authority";

const tones: Record<Tone, string> = {
  escalated: "bg-escalated-bg text-escalated-fg border border-[#E9B350]/30",
  review: "bg-review-bg text-review-fg border border-brand-500/30",
  closed: "bg-closed-bg text-closed-fg border border-border",
  tamper: "bg-tamper-bg text-tamper-fg border border-tamper-solid/30",
  neutral: "bg-subtle text-muted border border-border",
  routine: "bg-[#EEF4F8] text-[#244B6B] border border-[#C5D9E8]",
  moderate: "bg-[#FDF3E1] text-[#8A5A12] border border-[#F0D096]",
  severe: "bg-[#FDECE7] text-[#9E3F22] border border-[#F5BFB0]",
  critical: "bg-[#FCEDED] text-[#9A3B3B] border border-[#F2B8B8]",
  authority: "bg-[#EEF2F6] text-[#1E3A5F] border border-[#C5D3E2]",
};

export function Badge({
  tone = "neutral",
  icon,
  children,
  className,
}: {
  tone?: Tone;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] leading-5 font-semibold whitespace-nowrap shadow-2xs",
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export type CaseStatus = "draft" | "escalated" | "under_review" | "closed";

const statusMeta: Record<CaseStatus, { tone: Tone; label: string; Icon: typeof Lock }> = {
  draft: { tone: "neutral", label: "Draft, private", Icon: Pencil },
  escalated: { tone: "escalated", label: "Escalated", Icon: CircleDot },
  under_review: { tone: "review", label: "Under review", Icon: CircleDot },
  closed: { tone: "closed", label: "Closed", Icon: CircleCheck },
};

export const statusLabel = (s: CaseStatus) => statusMeta[s].label;

/** The one place case statuses are styled. Color, icon and text together. */
export function StatusBadge({ status }: { status: CaseStatus }) {
  const meta = statusMeta[status] ?? statusMeta.draft;
  const { tone, label, Icon } = meta;
  return (
    <Badge tone={tone} icon={<Icon size={14} strokeWidth={1.75} aria-hidden />}>
      {label}
    </Badge>
  );
}

/** Wording is fixed: never "verified", "authentic" or "tamper-proof". */
export function TamperBadge({ reviewer = false }: { reviewer?: boolean }) {
  return (
    <Badge tone="tamper" icon={<FileCheck2 size={14} strokeWidth={1.75} aria-hidden />}>
      {reviewer ? "Passed tamper checks" : "Captured with tamper checks"}
    </Badge>
  );
}

export type SeverityLevel = "routine" | "moderate" | "severe" | "critical";

const severityLabels: Record<SeverityLevel, { label: string; tone: Tone }> = {
  routine: { label: "Routine", tone: "routine" },
  moderate: { label: "Moderate", tone: "moderate" },
  severe: { label: "Severe", tone: "severe" },
  critical: { label: "Critical", tone: "critical" },
};

export function SeverityBadge({
  severity,
  className,
}: {
  severity: string;
  className?: string;
}) {
  const norm = (severity || "").toLowerCase() as SeverityLevel;
  const meta = severityLabels[norm] ?? { label: severity, tone: "moderate" };

  return (
    <Badge
      tone={meta.tone}
      icon={<ShieldAlert size={13} strokeWidth={2} aria-hidden />}
      className={className}
    >
      {meta.label}
    </Badge>
  );
}

export type UrgencyLevel = "standard" | "priority" | "immediate";

const urgencyLabels: Record<UrgencyLevel, { label: string; tone: Tone }> = {
  standard: { label: "Standard", tone: "routine" },
  priority: { label: "Priority", tone: "moderate" },
  immediate: { label: "Immediate", tone: "severe" },
};

export function UrgencyBadge({
  urgency,
  className,
}: {
  urgency: string;
  className?: string;
}) {
  const norm = (urgency || "").toLowerCase() as UrgencyLevel;
  const meta = urgencyLabels[norm] ?? { label: urgency, tone: "neutral" };

  return (
    <Badge
      tone={meta.tone}
      icon={<Clock size={12} strokeWidth={2} aria-hidden />}
      className={className}
    >
      {meta.label}
    </Badge>
  );
}

export function ReferralStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const clean = (status || "").replace(/_/g, " ").trim();
  const sentence = clean ? clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase() : "";

  let tone: Tone = "authority";
  if (clean.includes("active") || clean.includes("investigation")) {
    tone = "review";
  } else if (clean.includes("closed") || clean.includes("adopted") || clean.includes("concur")) {
    tone = "closed";
  } else if (clean.includes("referred")) {
    tone = "authority";
  }

  return (
    <Badge
      tone={tone}
      icon={<Shield size={12} strokeWidth={2} aria-hidden />}
      className={className}
    >
      {sentence}
    </Badge>
  );
}
