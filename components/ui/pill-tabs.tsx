import Link from "next/link";
import { cn } from "@/lib/cn";

export interface PillTabItem {
  key: string;
  label: string;
  count?: number;
  active: boolean;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export interface PillTabsProps {
  /** Accessible label for the navigation or tab list */
  label: string;
  /** Tab items to display in the capsule track */
  tabs: PillTabItem[];
  /** Visual variant: 'mint' for soft green track, 'white' for pure white track */
  variant?: "mint" | "white";
  /** Optional additional CSS classes for the container */
  className?: string;
}

/**
 * Modular capsule pill navigation component matching Escapture's design system.
 * Supports dual-mode: Next.js Link (URL routing) or button (client-state callbacks).
 */
export function PillTabs({
  label,
  tabs,
  variant = "mint",
  className,
}: PillTabsProps) {
  return (
    <nav
      aria-label={label}
      className={cn(
        "inline-flex items-center rounded-full p-1.5 transition-colors",
        variant === "white" ? "bg-white shadow-soft" : "bg-brand-50 shadow-xs",
        className
      )}
    >
      {tabs.map((tab) => {
        const content = (
          <>
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "flex size-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold transition-colors",
                  tab.active
                    ? "bg-white text-brand-700 shadow-xs"
                    : "bg-brand-100 text-brand-800"
                )}
              >
                {tab.count}
              </span>
            )}
          </>
        );

        const tabStyles = cn(
          "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 select-none",
          tab.active
            ? "bg-brand-600 text-white shadow-xs"
            : "text-muted hover:text-brand-700",
          tab.disabled && "pointer-events-none opacity-50"
        );

        if (tab.href && !tab.disabled) {
          return (
            <Link
              key={tab.key}
              href={tab.href}
              aria-current={tab.active ? "page" : undefined}
              className={tabStyles}
            >
              {content}
            </Link>
          );
        }

        return (
          <button
            key={tab.key}
            type="button"
            onClick={tab.onClick}
            disabled={tab.disabled}
            role="tab"
            aria-selected={tab.active}
            className={cn(tabStyles, "cursor-pointer")}
          >
            {content}
          </button>
        );
      })}
    </nav>
  );
}
