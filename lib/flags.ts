// Finding the word bank's words in a case's title and description.
//
// Matching ignores case and accents, needs whole words (so "kill" never flags
// "skill"), lets a phrase's words be separated by any spacing, and accepts the
// common English endings on a single word ("kill", "kills", "killed",
// "killing"). Also normalizes leetspeak numbers (0->o, 1->i, 4->a, etc.),
// repeated letters, symbol masking (f_ck, f*ck), and Filipino chat shorthand.

/** Lowercase, without accents, with runs of whitespace as one space. */
export function normalizeWord(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const ENDINGS = "(?:s|es|ed|d|ing)?";

const LEET_MAP: Record<string, string> = {
  a: "[a4@]",
  b: "[b8]",
  e: "[e3]",
  i: "[i1!|l]",
  l: "[l1!|]",
  o: "[o0u]",
  u: "[u0o_*.\\-]",
  s: "[s5$]",
  t: "[t7+]",
  g: "[g9]",
};

function expandPart(part: string): string {
  if (part === "kita") return "k+(?:[i1!|l]+)?t+[a4@]+";
  if (part === "ina") return "(?:[i1!|l]+)?n+[a4@]+";
  let out = "";
  let prev = "";
  for (const ch of part) {
    if (ch === prev) continue;
    prev = ch;
    if (LEET_MAP[ch]) {
      out += `${LEET_MAP[ch]}+`;
    } else if (/[a-z]/i.test(ch)) {
      out += `${ch}+`;
    } else {
      out += escape(ch);
    }
  }
  return out;
}

const patternCache = new Map<string, RegExp>();

function pattern(word: string): RegExp {
  const normalized = normalizeWord(word);
  const cached = patternCache.get(normalized);
  if (cached) return cached;

  const parts = normalized.split(" ").map(expandPart);
  const body = parts.join("[\\s\\p{P}]+") + (parts.length === 1 ? ENDINGS : "");
  const rx = new RegExp(`(?<![\\p{L}\\p{N}])${body}(?![\\p{L}\\p{N}])`, "ui");
  patternCache.set(normalized, rx);
  return rx;
}

/** The bank's words that appear in `text`, in the bank's order. */
export function findFlaggedWords(text: string, words: string[]): string[] {
  const hay = normalizeWord(text);
  if (!hay) return [];
  return words.filter((w) => normalizeWord(w) && pattern(w).test(hay));
}
