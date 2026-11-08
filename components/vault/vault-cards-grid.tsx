import type { VaultItem } from "./vault-table";
import { VaultCard } from "./vault-card";

/**
 * 2-column Evidence Cards Grid matching Figma nodes 11:159 & 21:142
 */
export function VaultCardsGrid({
    items,
    shared,
    sensitiveMap = {},
}: {
    items: VaultItem[];
    shared: boolean;
    sensitiveMap?: Record<string, boolean>;
}) {
    return (
        <div
            role="feed"
            aria-busy={false}
            className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {items.map((item) => (
                <VaultCard
                    key={item.id}
                    item={item}
                    shared={shared}
                    sensitive={Boolean(sensitiveMap[item.id])}
                />
            ))}
        </div>
    );
}
