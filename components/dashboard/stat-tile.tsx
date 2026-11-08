import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export type StatTileVariant = "amber" | "coral" | "green" | "default";

const VARIANTS: Record<
  StatTileVariant,
  {
    label: string;
    note: string;
    value: string;
    iconBg: string;
    iconColor: string;
    iconRing: string;
  }
> = {
  amber: {
    label: "text-escalated-fg",
    note: "text-escalated-fg/85",
    value: "text-escalated-fg",
    iconBg: "bg-escalated-bg",
    iconColor: "text-escalated-solid",
    iconRing: "ring-amber-200",
  },
  coral: {
    label: "text-brand-800",
    note: "text-brand-700/85",
    value: "text-brand-800",
    iconBg: "bg-brand-100",
    iconColor: "text-brand-700",
    iconRing: "ring-brand-200",
  },
  green: {
    label: "text-brand-700",
    note: "text-brand-600/85",
    value: "text-brand-700",
    iconBg: "bg-brand-50",
    iconColor: "text-brand-600",
    iconRing: "ring-brand-200",
  },
  default: {
    label: "text-muted",
    note: "text-muted",
    value: "text-ink",
    iconBg: "bg-subtle",
    iconColor: "text-muted",
    iconRing: "ring-border",
  },
};

/**
 * Metric card for the reviewer dashboard matching the Figma design:
 * Clean card with colored icon pill, status label, secondary context note,
 * and high-contrast large numeric metric (or dash when unavailable).
 */
export function StatTile({
  label,
  Icon,
  value,
  note,
  variant = "default",
  unavailable = false,
  className,
}: {
  label: string;
  Icon: LucideIcon | React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  value: number | string;
  note: string;
  variant?: StatTileVariant;
  unavailable?: boolean;
  className?: string;
}) {
  const v = VARIANTS[variant] ?? VARIANTS.default;

  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-2xl border border-brand-500/30 bg-card p-6 shadow-soft transition-all duration-150 hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <dt className={cn("text-[15px] leading-snug font-semibold", unavailable ? "text-muted" : v.label)}>
            {label}
          </dt>
          <dd className={cn("text-xs leading-5 font-normal mt-0.5", unavailable ? "text-muted/70" : v.note)}>
            {unavailable ? "Unavailable" : note}
          </dd>
        </div>
        <div
          aria-hidden="true"
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-full ring-1 shadow-xs",
            unavailable ? "bg-subtle text-muted ring-border" : `${v.iconBg} ${v.iconColor} ${v.iconRing}`,
          )}
        >
          <Icon size={22} strokeWidth={2} />
        </div>
      </div>

      <div className="mt-5">
        <span
          className={cn(
            "tnum font-heading text-4xl leading-none font-bold tracking-tight",
            unavailable ? "text-muted/50 font-normal" : v.value,
          )}
        >
          {unavailable ? "—" : value}
        </span>
      </div>
    </div>
  );
}
