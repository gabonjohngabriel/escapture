export function SearchResultsSummary({
    shown,
    total,
    query,
    clearHref,
}: {
    shown: number;
    total: number;
    query?: string;
    clearHref?: string;
}) {
    return (
        <p aria-live="polite" className="text-sm font-medium text-muted">
            Showing <span className="tnum font-bold text-ink">{shown}</span> of{" "}
            <span className="tnum font-bold text-ink">{total}</span>
            {query && <> for “{query}”</>}
            {clearHref && null}
        </p>
    );
}
