import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant =
    | "primary"
    | "secondary"
    | "soft"
    | "ghost"
    | "weighty"
    | "danger"
    | "danger-solid"
    | "on-dark"
    | "ghost-on-dark";

const base =
    "inline-flex h-[var(--control-h)] items-center justify-center gap-2 rounded-full px-6 text-[15px] leading-5 font-bold whitespace-nowrap shadow-xs transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 disabled:cursor-not-allowed disabled:border-transparent disabled:bg-disabled-bg disabled:text-disabled-fg";

const variants: Record<ButtonVariant, string> = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800",
    secondary:
        "border border-border bg-card text-brand-800 hover:bg-brand-50 active:bg-brand-100",
    soft: "bg-brand-50 text-brand-800 hover:bg-brand-100 active:bg-brand-200",
    ghost: "text-brand-700 hover:bg-brand-50 hover:text-brand-800",
    weighty: "bg-brand-900 text-white hover:bg-brand-950",
    danger: "border border-danger-solid bg-card text-danger-solid hover:bg-danger-bg",
    "danger-solid": "bg-danger-solid text-white hover:bg-danger-fg",
    // For brand-900 bands only.
    "on-dark": "bg-on-dark text-brand-900 hover:bg-brand-100",
    "ghost-on-dark":
        "border border-on-dark-muted text-on-dark hover:bg-brand-800",
};

/** The larger size used for the landing page's main actions. */
export const buttonLg = "h-[52px] px-8 text-base rounded-full";

export const buttonClass = (
    variant: ButtonVariant = "primary",
    className?: string,
) => cn(base, variants[variant], className);

export function Button({
    variant = "primary",
    loading = false,
    className,
    children,
    disabled,
    type = "button",
    ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    loading?: boolean;
}) {
    return (
        <button
            type={type}
            className={buttonClass(variant, className)}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            {...rest}>
            {loading && (
                <LoaderCircle
                    size={16}
                    strokeWidth={2.25}
                    aria-hidden
                    className="animate-spin"
                />
            )}
            {children}
        </button>
    );
}
