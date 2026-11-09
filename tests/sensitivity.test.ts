import { describe, expect, it } from "vitest";
import { containsFlaggedWords, stripHtml } from "@/server/services/sensitivity";

describe("stripHtml", () => {
  it("removes HTML tags and normalizes spaces", () => {
    expect(stripHtml("<p>Hello <strong>world</strong>!</p>")).toBe("Hello world !");
  });

  it("strips script and style tag contents entirely", () => {
    const html = `
      <div>Safe message</div>
      <script>var secret = "threatening";</script>
      <style>.bad { color: red; }</style>
    `;
    expect(stripHtml(html)).toBe("Safe message");
  });

  it("decodes basic HTML entities", () => {
    expect(stripHtml("You &amp; I &lt;3")).toBe("You I 3");
  });
});

describe("containsFlaggedWords", () => {
  const bank = ["threaten", "kill", "blackmail", "fuck", "putang ina mo", "kantutin kita"];

  it("returns false when bank is empty", () => {
    expect(containsFlaggedWords("A post label", "<p>Some text</p>", [])).toBe(false);
  });

  it("flags match in label", () => {
    expect(containsFlaggedWords("Someone is threatening me", "<p>Safe content</p>", bank)).toBe(true);
  });

  it("flags match in body content", () => {
    expect(containsFlaggedWords("Safe post title", "<p>I will kill you</p>", bank)).toBe(true);
  });

  it("flags leetspeak and obfuscated matches in label and HTML body", () => {
    expect(containsFlaggedWords("Safe label", "<p>Hoy p0t4ng n4 mo gago</p>", bank)).toBe(true);
    expect(containsFlaggedWords("Safe label", "<div>F0ck you and your project</div>", bank)).toBe(true);
    expect(containsFlaggedWords("k4nt0t1n kta", "<p>Clean content</p>", bank)).toBe(true);
    expect(containsFlaggedWords("Safe label", "<p>f_ck this</p>", bank)).toBe(true);
  });

  it("does not flag inside another word", () => {
    expect(containsFlaggedWords("Skill acquisition", "<p>killjoy game</p>", bank)).toBe(false);
  });

  it("ignores words only present inside <script> or <style>", () => {
    const html = `
      <p>Clean text</p>
      <script>console.log("kill");</script>
      <style>/* threaten */</style>
    `;
    expect(containsFlaggedWords("Safe title", html, bank)).toBe(false);
  });
});
