"use client";

import { Loader2, Search } from "lucide-react";
import React from "react";
import { useEffect, useRef, useState } from "react";
import { useSearchFocus } from "@/components/ui/search-focus";
import { cn } from "@/lib/cn";

export interface PageToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
}

/**
 * Responsive page toolbar wrapper that positions navigation pills, search, and action slots.
 */
export function PageToolbar({
    children,
    className,
    ...props
}: PageToolbarProps) {
    return (
        <div
            className={cn(
                "flex flex-wrap items-center justify-between gap-4",
                className,
            )}
            {...props}>
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
    const { isPending, navigate } = useSearchFocus();
    const [query, setQuery] = useState(value ?? defaultValue ?? "");
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    function buildHref(nextQuery: string) {
        if (!action) return "";
        const [path, rawQuery = ""] = action.split("?", 2);
        const params = new URLSearchParams(rawQuery);

        for (const [key, val] of Object.entries(hiddenFields ?? {})) {
            if (val !== undefined) params.set(key, String(val));
        }

        const trimmed = nextQuery.trim();
        if (trimmed) params.set(name, trimmed);
        else params.delete(name);

        const queryString = params.toString();
        return queryString ? `${path}?${queryString}` : path;
    }

    function submitSearch() {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        const href = buildHref(value ?? query);
        if (href) navigate(href);
    }

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
                value={value ?? query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    onChange?.(e);
                    if (debounceRef.current)
                        clearTimeout(debounceRef.current);
                    debounceRef.current = setTimeout(() => {
                        navigate(buildHref(e.target.value), { replace: true });
                    }, 250);
                }}
                placeholder={placeholder}
                aria-label={placeholder}
                maxLength={120}
                className={cn("h-11 w-full rounded-full border border-border bg-brand-50 pr-9 pl-11 text-sm text-ink placeholder:text-muted transition-colors focus:border-brand-600 focus:bg-card focus:outline-none focus:ring-2 focus:ring-brand-600/20", className)}
            />
            {isPending && (
                <Loader2
                    size={16}
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 animate-spin text-brand-600"
                />
            )}
        </div>
    );

    if (action || onSubmit) {
        return (
            <form
                role="search"
                action={action}
                method={method}
                onSubmit={(e) => {
                    onSubmit?.(e);
                    if (e.defaultPrevented) return;
                    e.preventDefault();
                    submitSearch();
                }}
                className={cn(
                    "flex flex-wrap items-center gap-3",
                    formClassName,
                )}>
                {hiddenFields &&
                    Object.entries(hiddenFields).map(([key, val]) =>
                        val !== undefined ? (
                            <input
                                key={key}
                                type="hidden"
                                name={key}
                                value={val}
                            />
                        ) : null,
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
