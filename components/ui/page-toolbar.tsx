import { Search } from "lucide-react";
import React from "react";
import { cn } from "@/lib/cn";

export interface PageToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

/**
 * Responsive page toolbar wrapper that positions navigation pills, search, and action slots.
 */
export function PageToolbar({ children, className, ...props }: PageToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface PageToolbarSearchProps {
  /** Form submission target URL */
  action?: string;
  /** Form method, defaults to "get" */
  method?: string;
  /** Input name, defaults to "q" */
  name?: string;
  /** Uncontrolled default search query */
  defaultValue?: string;
  /** Controlled search query */
  value?: string;
  /** Controlled change handler */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Key-value pairs rendered as hidden inputs inside the form */
  hiddenFields?: Record<string, string | number | undefined>;
  /** Input class overrides */
  className?: string;
  /** Outer form class overrides */
  formClassName?: string;
  /** Additional controls to nest within the search form (e.g. sort dropdowns) */
  children?: React.ReactNode;
  /** Optional form submit handler */
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
}

/**
 * Standardized capsule search input matching the Escapture design system.
 * Wraps in a `<form role="search">` when action or onSubmit is supplied.
 */
export function PageToolbarSearch({
  action,
  method = "get",
  name = "q",
  defaultValue,
  value,
  onChange,
  placeholder = "Search...",
  hiddenFields,
  className,
  formClassName,
  children,
  onSubmit,
}: PageToolbarSearchProps) {
  const inputElement = (
    <div className="relative min-w-[240px] md:w-[320px]">
      <Search
        size={18}
        strokeWidth={2}
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted"
      />
      <input
        type="search"
        name={name}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={placeholder}
        className={cn(
          "h-11 w-full rounded-full border border-border bg-brand-50 pr-4 pl-11 text-sm text-ink placeholder:text-muted transition-colors focus:border-brand-600 focus:bg-card focus:outline-none focus:ring-2 focus:ring-brand-600/20",
          className
        )}
      />
    </div>
  );

  if (action || onSubmit) {
    return (
      <form
        role="search"
        action={action}
        method={method}
        onSubmit={onSubmit}
        className={cn("flex flex-wrap items-center gap-3", formClassName)}
      >
        {hiddenFields &&
          Object.entries(hiddenFields).map(([key, val]) =>
            val !== undefined ? (
              <input key={key} type="hidden" name={key} value={val} />
            ) : null
          )}
        {inputElement}
        {children}
      </form>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-3", formClassName)}>
      {inputElement}
      {children}
    </div>
  );
}

/**
 * Layout slot for supplementary action buttons or controls in a toolbar.
 */
export function PageToolbarActions({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {children}
    </div>
  );
}
