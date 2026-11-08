import { findFlaggedWords } from "@/lib/flags";
import type { Actor } from "../auth";

/** Strips scripts, styles, HTML tags and basic entities into plain text. */
export function stripHtml(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:nbsp|amp|lt|gt|quot|#39);/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Pure check whether an evidence label or HTML content contains any word-bank words.
 */
export function containsFlaggedWords(label: string, htmlContent: string, words: string[]): boolean {
  if (!words || words.length === 0) return false;
  if (findFlaggedWords(label, words).length > 0) return true;
  const text = stripHtml(htmlContent);
  return findFlaggedWords(text, words).length > 0;
}

/**
 * Checks whether an evidence item contains any word-bank words in its label
 * or in its saved capture contents.
 *
 * For privacy and security, only a boolean is returned — students are never sent
 * the matched words or the word bank list.
 */
export async function isSensitive(
  actor: Actor,
  ev: { id: string; label: string },
  bank?: string[],
): Promise<boolean> {
  const { listWordsPlain } = await import("./flags");
  const words = bank ?? (await listWordsPlain());
  if (!words || words.length === 0) return false;

  // 1. Check evidence label
  if (findFlaggedWords(ev.label, words).length > 0) {
    return true;
  }

  // 2. Check captured file HTML text content
  try {
    const { getEvidenceFile } = await import("./evidence");
    const bytes = await getEvidenceFile(actor, ev.id);
    const html = new TextDecoder().decode(bytes);
    const text = stripHtml(html);
    return findFlaggedWords(text, words).length > 0;
  } catch {
    return false;
  }
}
