"use client";

import { CircleAlert, Eye, EyeOff } from "lucide-react";
import { useId, useState, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const control =
  "w-full rounded-2xl border border-[#DCE5DF] bg-card px-4 text-[15px] text-ink placeholder:text-muted transition-colors focus:border-[#52946B] focus:outline-none focus:ring-2 focus:ring-[#52946B]/20 disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled-fg";

type Common = { label: string; hint?: string; error?: string | null };

function Wrap({
  id,
  label,
  hint,
  error,
  labelEnd,
  children,
}: Common & { id: string; labelEnd?: React.ReactNode; children: React.ReactNode }) {
  const labelEl = (
    <label htmlFor={id} className="text-[14px] leading-5 font-bold text-[#52946B]">
      {label}
    </label>
  );
  return (
    <div className="flex flex-col gap-1.5">
      {labelEnd ? (
        <div className="flex items-baseline justify-between gap-3">
          {labelEl}
          {labelEnd}
        </div>
      ) : (
        labelEl
      )}
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-[13px] leading-[18px] text-[#5F856E]">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="flex items-start gap-1 text-[13px] leading-[18px] text-danger-fg">
          <CircleAlert size={16} strokeWidth={1.75} aria-hidden className="mt-px shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

const describedBy = (id: string, hint?: string, error?: string | null) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;

export function Input({
  label,
  hint,
  error,
  className,
  ...rest
}: Common & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <Wrap id={id} label={label} hint={hint} error={error}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(control, "h-12", error ? "border-danger-fg" : "border-[#DCE5DF]", className)}
        {...rest}
      />
    </Wrap>
  );
}

/**
 * A password field with a show/hide button inside it. `labelEnd` sits at the right of the label row;
 * `invalid` marks the field when the message is shown somewhere else.
 */
export function PasswordInput({
  label,
  hint,
  error,
  labelEnd,
  invalid,
  className,
  ...rest
}: Common & { labelEnd?: React.ReactNode; invalid?: boolean } & Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const id = useId();
  const [shown, setShown] = useState(false);
  const Icon = shown ? EyeOff : Eye;
  return (
    <Wrap id={id} label={label} hint={hint} error={error} labelEnd={labelEnd}>
      <div className="relative">
        <input
          id={id}
          type={shown ? "text" : "password"}
          aria-invalid={error || invalid ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={cn(
            control,
            "h-12 pr-[52px]",
            error || invalid ? "border-danger-fg" : "border-[#DCE5DF]",
            className,
          )}
          {...rest}
        />
        <button
          type="button"
          aria-label={shown ? "Hide password" : "Show password"}
          aria-pressed={shown}
          onClick={() => setShown((v) => !v)}
          className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted transition-colors duration-150 ease-out hover:bg-brand-100 hover:text-[#52946B]"
        >
          <Icon size={18} strokeWidth={1.75} aria-hidden />
        </button>
      </div>
    </Wrap>
  );
}

export function Textarea({
  label,
  hint,
  error,
  className,
  rows = 4,
  ...rest
}: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <Wrap id={id} label={label} hint={hint} error={error}>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(control, "py-3", error ? "border-danger-fg" : "border-[#DCE5DF]", className)}
        {...rest}
      />
    </Wrap>
  );
}

export function Select({
  label,
  hint,
  error,
  className,
  children,
  ...rest
}: Common & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <Wrap id={id} label={label} hint={hint} error={error}>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(control, "h-12", error ? "border-danger-fg" : "border-[#DCE5DF]", className)}
        {...rest}
      >
        {children}
      </select>
    </Wrap>
  );
}
