import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  CircleCheck,
  Eye,
  FileCheck2,
  FolderX,
  Share2,
  UserMinus,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatDateTime, timeAgo } from "@/lib/format";

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  caseId: string | null;
  evidenceId: string | null;
  readAt: Date | string | null;
  createdAt: Date | string;
};

type Tone = "attention" | "done" | "saved" | "plain";

const tones: Record<Tone, string> = {
  attention: "bg-escalated-bg text-escalated-fg",
  done: "bg-closed-bg text-closed-fg",
  saved: "bg-tamper-bg text-tamper-fg",
  plain: "bg-brand-100 text-brand-800",
};

const kinds: Record<string, { Icon: LucideIcon; tone: Tone }> = {
  case_escalated: { Icon: ArrowUpRight, tone: "attention" },
  case_closed: { Icon: CircleCheck, tone: "done" },
  case_status_changed: { Icon: Eye, tone: "plain" },
  case_shared: { Icon: UserPlus, tone: "plain" },
  case_assigned: { Icon: UserPlus, tone: "attention" },
  case_unassigned: { Icon: UserMinus, tone: "plain" },
  evidence_shared: { Icon: Share2, tone: "plain" },
  collaborator_joined: { Icon: UserPlus, tone: "plain" },
  collaborator_left: { Icon: UserMinus, tone: "plain" },
  collaborator_removed: { Icon: UserMinus, tone: "plain" },
  case_deleted: { Icon: FolderX, tone: "done" },
  capture_saved: { Icon: FileCheck2, tone: "saved" },
};

export function notificationHref(
  n: Pick<NotificationItem, "caseId" | "evidenceId">,
  role: string
): string | null {
  if (n.caseId) return role === "student" ? `/cases/${n.caseId}` : `/review/${n.caseId}`;
  return n.evidenceId ? `/vault/${n.evidenceId}` : null;
}

/**
 * Popover row version
 */
export function NotificationRow({
  n,
  role,
  compact = false,
  onNavigate,
}: {
  n: NotificationItem;
  role: string;
  compact?: boolean;
  onNavigate?: () => void;
}) {
  const { Icon, tone } = kinds[n.type] ?? { Icon: Bell, tone: "plain" as const };
  const unread = !n.readAt;
  const href = notificationHref(n, role);
  const className = cn(
    "grid grid-cols-[32px_minmax(0,1fr)_8px] gap-3",
    compact ? "px-4 py-3" : "px-[var(--card-pad)] py-4",
    unread && "bg-brand-50",
    href && "hover:bg-brand-50"
  );
  const content = (
    <>
      <span aria-hidden className={cn("grid size-8 place-items-center rounded-full", tones[tone])}>
        <Icon size={16} strokeWidth={1.75} />
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            "block text-ink",
            compact ? "text-sm leading-5" : "leading-6",
            unread && !compact && "font-semibold"
          )}
        >
          {n.title}
        </span>
        {!compact && n.body && <span className="block text-sm leading-[22px] text-muted">{n.body}</span>}
        <time
          dateTime={new Date(n.createdAt).toISOString()}
          title={formatDateTime(n.createdAt)}
          className="block text-[13px] leading-[18px] text-muted"
        >
          {timeAgo(n.createdAt)}
        </time>
      </span>
      {unread && <span className="mt-2 size-2 rounded-full bg-brand-700" aria-label="Unread" />}
    </>
  );

  if (href) {
    return (
      <Link href={href} onClick={onNavigate} className={className}>
        {content}
      </Link>
    );
  }
  return <div className={className}>{content}</div>;
}

/**
 * Green Card version matching Figma node 44:1820
 */
export function NotificationCard({
  n,
  role,
}: {
  n: NotificationItem;
  role: string;
}) {
  const { Icon } = kinds[n.type] ?? { Icon: Bell };
  const unread = !n.readAt;
  const href = notificationHref(n, role) ?? "/vault";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border-2 border-brand-500 bg-card p-5 shadow-xs transition-all sm:flex-row sm:items-center sm:justify-between sm:gap-4 hover:shadow-md">
      <div className="flex items-start gap-4 sm:items-center">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <Icon size={22} strokeWidth={2} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-ink">{n.title}</h3>
            {unread && (
              <span className="inline-flex items-center gap-1 rounded-full bg-escalated-bg px-2.5 py-0.5 text-xs font-semibold text-escalated-fg">
                <span className="size-1.5 rounded-full bg-escalated-solid" />
                Unread
              </span>
            )}
          </div>
          {n.body && <p className="text-sm leading-relaxed text-muted">{n.body}</p>}
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-4 border-t border-border pt-2 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
        <span className="tnum text-xs font-medium text-muted">
          {timeAgo(n.createdAt)}
        </span>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800 hover:underline"
        >
          <span>{n.caseId ? (role === "student" ? "View report" : "View case") : "View evidence"}</span>
          <ArrowRight size={14} strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}
