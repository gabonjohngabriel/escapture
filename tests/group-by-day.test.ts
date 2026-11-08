import { describe, expect, it } from "vitest";
import { groupByDay } from "@/lib/format";

describe("groupByDay", () => {
  // 2026-11-08 17:00 in Manila (+08:00) is 2026-11-08T09:00:00Z
  const now = new Date("2026-11-08T09:00:00Z");

  it("returns an empty array for an empty input list", () => {
    expect(groupByDay([], now)).toEqual([]);
  });

  it("buckets items into Today, Yesterday, and Earlier based on Manila calendar day", () => {
    const items = [
      // Manila: 2026-11-08 00:05 (Today)
      { id: "t1", createdAt: "2026-11-07T16:05:00Z" },
      // Manila: 2026-11-07 23:55 (Yesterday — only 10 mins earlier than t1, across midnight)
      { id: "y1", createdAt: "2026-11-07T15:55:00Z" },
      // Manila: 2026-11-01 12:00 (Earlier)
      { id: "e1", createdAt: "2026-11-01T04:00:00Z" },
    ];

    const groups = groupByDay(items, now);
    expect(groups.map((g) => g.key)).toEqual(["Today", "Yesterday", "Earlier"]);
    expect(groups[0].label).toBe("Today · November 8, 2026");
    expect(groups[0].items.map((i) => i.id)).toEqual(["t1"]);
    expect(groups[1].label).toBe("Yesterday · November 7, 2026");
    expect(groups[1].items.map((i) => i.id)).toEqual(["y1"]);
    expect(groups[2].label).toBe("Earlier");
    expect(groups[2].items.map((i) => i.id)).toEqual(["e1"]);
  });

  it("omits empty buckets", () => {
    const items = [{ id: "e1", createdAt: "2026-10-15T00:00:00Z" }];
    const groups = groupByDay(items, now);
    expect(groups.map((g) => g.key)).toEqual(["Earlier"]);
  });
});
