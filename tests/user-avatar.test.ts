import { describe, expect, it } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { UserAvatar, detectGender } from "@/components/ui/user-avatar";

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

  it("correctly detects gender from seed names", () => {
    expect(detectGender("Nico Angelo Agustin")).toBe("male");
    expect(detectGender("nico.agustin@acg.pnp.gov.ph")).toBe("male");
    expect(detectGender("Rafael Perez")).toBe("male");
    expect(detectGender("rafael.perez@nbi.gov.ph")).toBe("male");
    expect(detectGender("Maya Santos")).toBe("female");
    expect(detectGender("Unknown Person")).toBe("neutral");
  });

  it("renders male avatar profile for Nico and Rafael", () => {
    const nicoHtml = renderToString(
      React.createElement(UserAvatar, { seed: "Nico Angelo Agustin" }),
    );
    const rafaelHtml = renderToString(
      React.createElement(UserAvatar, { seed: "Rafael Perez" }),
    );

    expect(nicoHtml).toContain("<svg");
    expect(rafaelHtml).toContain("<svg");

    // Neither male avatar should render long feminine eyelash paths
    expect(nicoHtml).not.toContain("l-8,-6 M153,219");
    expect(rafaelHtml).not.toContain("l-8,-6 M153,219");
  });

  it("honors explicit gender prop overrides", () => {
    const maleHtml = renderToString(
      React.createElement(UserAvatar, { seed: "Neutral User", gender: "male" }),
    );
    const femaleHtml = renderToString(
      React.createElement(UserAvatar, { seed: "Neutral User", gender: "female" }),
    );

    expect(maleHtml).toContain("<svg");
    expect(femaleHtml).toContain("<svg");
    expect(maleHtml).not.toBe(femaleHtml);
  });
});
