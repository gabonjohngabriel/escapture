import { PillTabs } from "@/components/ui/pill-tabs";

export type LinkTab = {
  label: string;
  href: string;
  count?: number;
  active: boolean;
};

/**
 * Tabs that are links: the choice lives in the address, so it survives a reload
 * and the Back button. The count is how many items the tab holds.
 * Standardized on the capsule PillTabs aesthetic.
 */
export function LinkTabs({
  label,
  tabs,
}: {
  label: string;
  tabs: LinkTab[];
  unit?: string;
}) {
  return (
    <PillTabs
      label={label}
      variant="mint"
      tabs={tabs.map((tab) => ({
        key: tab.href,
        label: tab.label,
        count: tab.count,
        active: tab.active,
        href: tab.href,
      }))}
    />
  );
}
