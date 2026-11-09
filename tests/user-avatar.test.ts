import { describe, expect, it } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { UserAvatar } from "@/components/ui/user-avatar";

describe("UserAvatar", () => {
  it("renders deterministic SVG output for the same seed", () => {
    const html1 = renderToString(React.createElement(UserAvatar, { seed: "Maya Santos" }));
    const html2 = renderToString(React.createElement(UserAvatar, { seed: "Maya Santos" }));
    expect(html1).toBe(html2);
    expect(html1).toContain("<svg");
  });

  it("produces distinct attributes for different seeds", () => {
    const htmlA = renderToString(React.createElement(UserAvatar, { seed: "Maya Santos" }));
    const htmlB = renderToString(React.createElement(UserAvatar, { seed: "Alex Rivera" }));
    expect(htmlA).not.toBe(htmlB);
  });

  it("handles empty or fallback seed gracefully", () => {
    const html = renderToString(React.createElement(UserAvatar, { seed: "" }));
    expect(html).toContain("<svg");
  });
});
