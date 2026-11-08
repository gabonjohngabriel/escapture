import { SearchX } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { FocusLink } from "@/components/ui/search-focus";

export function SearchEmptyState({
    title,
    children,
    clearHref,
    clearLabel = "Clear search",
}: {
    title: string;
    children: React.ReactNode;
    clearHref: string;
    clearLabel?: string;
}) {
    return (
        <EmptyState
            icon={<SearchX size={24} strokeWidth={1.75} />}
            title={title}
            action={
                <FocusLink
                    href={clearHref}
                    className={buttonClass("secondary")}>
                    {clearLabel}
                </FocusLink>
            }>
            {children}
        </EmptyState>
    );
}
