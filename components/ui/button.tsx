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
    "inline-flex h-[var(--control-h)] items-center justify-center gap-2 rounded-full px-6 text-[15px] leading-5 font-bold whitespace-nowrap shadow-xs transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:border-transparent disabled:bg-disabled-bg disabled:text-disabled-fg";

const variants: Record<ButtonVariant, string> = {
    primary: "bg-[#52946B] text-white hover:bg-[#437C58]",
    secondary:
        "border border-[#DCE5DF] bg-white text-[#3F7855] hover:bg-[#F2F7F4]",
    soft: "bg-[#F2F7F4] text-[#52946B] hover:bg-[#E3EFE7]",
    ghost: "text-[#52946B] hover:bg-[#F2F7F4]",
    weighty: "bg-[#203E2C] text-white hover:bg-[#122419]",
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
