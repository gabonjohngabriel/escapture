import { describe, expect, it } from "vitest";
import { findFlaggedWords, normalizeWord } from "@/lib/flags";

describe("findFlaggedWords", () => {
  it("finds whole words, ignoring case", () => {
    expect(findFlaggedWords("He talked about SUICIDE again.", ["suicide", "blackmail"])).toEqual(["suicide"]);
  });

  it("never matches inside another word", () => {
    expect(findFlaggedWords("A skill share and a killjoy", ["kill"])).toEqual([]);
    expect(findFlaggedWords("Enjoying a cocktail party", ["fuck"])).toEqual([]);
  });

  it("accepts common English endings on a single word", () => {
    expect(findFlaggedWords("they kept threatening and stalking her", ["threaten", "stalk"])).toEqual(["threaten", "stalk"]);
    expect(findFlaggedWords("He was killed", ["kill"])).toEqual(["kill"]);
  });

  it("matches phrases across any spacing or punctuation, but not partly", () => {
    expect(findFlaggedWords("said he would kill\nmyself tonight", ["kill myself"])).toEqual(["kill myself"]);
    expect(findFlaggedWords("I want to kill time", ["kill myself"])).toEqual([]);
  });

  it("ignores accents, and works for Filipino entries", () => {
    expect(findFlaggedWords("Sabi niya, magpakamatáy ka na lang", ["magpakamatay"])).toEqual(["magpakamatay"]);
    expect(findFlaggedWords("papatayin kita bukas", ["papatayin kita"])).toEqual(["papatayin kita"]);
  });

  it("keeps the bank's order and lists each word once", () => {
    expect(findFlaggedWords("blackmail, then suicide, then blackmail", ["suicide", "blackmail"])).toEqual(["suicide", "blackmail"]);
  });

  it("treats special characters in a word literally", () => {
    expect(findFlaggedWords("self-harm", ["self-harm"])).toEqual(["self-harm"]);
    expect(findFlaggedWords("self harm", ["self.harm"])).toEqual([]);
  });

  it("normalizes words for storage", () => {
    expect(normalizeWord("  Self   Harm ")).toBe("self harm");
    expect(normalizeWord("Pinatáy")).toBe("pinatay");
  });

  describe("leetspeak and de-obfuscation", () => {
    const bank = [
      "fuck",
      "shit",
      "kill",
      "tangina",
      "jabol",
      "putang ina mo",
      "kantutin kita",
    ];

    it("detects digit substitutions (0->o, 1->i, 4->a, etc.)", () => {
      expect(findFlaggedWords("F0ck this person", bank)).toEqual(["fuck"]);
      expect(findFlaggedWords("that is total sh1t", bank)).toEqual(["shit"]);
      expect(findFlaggedWords("i will k1lL you", bank)).toEqual(["kill"]);
      expect(findFlaggedWords("siya ay nag jab0l kanina", bank)).toEqual(["jabol"]);
      expect(findFlaggedWords("tang1na naman oh", bank)).toEqual(["tangina"]);
    });

    it("detects masked characters and symbols (f_ck, f*ck)", () => {
      expect(findFlaggedWords("what the f_ck is this", bank)).toEqual(["fuck"]);
      expect(findFlaggedWords("what the f*ck", bank)).toEqual(["fuck"]);
      expect(findFlaggedWords("f.ck you", bank)).toEqual(["fuck"]);
    });

    it("detects Filipino contractions and leetspeak combined", () => {
      expect(findFlaggedWords("k4nt0t1n kta mamaya", bank)).toEqual(["kantutin kita"]);
      expect(findFlaggedWords("p0t4ng n4 mo gago", bank)).toEqual(["putang ina mo"]);
    });

    it("handles character elongation / runs", () => {
      expect(findFlaggedWords("fuuuuck off", bank)).toEqual(["fuck"]);
      expect(findFlaggedWords("shiiiiiit", bank)).toEqual(["shit"]);
      expect(findFlaggedWords("tanginaaaaa", bank)).toEqual(["tangina"]);
    });

    it("avoids false positives with standard dates or numbers", () => {
      expect(findFlaggedWords("Room 404 on 2026-11-09, call 0917-123-4567", bank)).toEqual([]);
    });
  });
});
