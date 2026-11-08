import type { Kind, TamperReport } from "../../shared/types";
import type { Snapshot } from "../capture/snapshot";

export const POST_ACTIONS =
  '[data-ad-rendering-role="like_button"], [data-ad-rendering-role="comment_button"], [data-ad-rendering-role="share_button"]';
export const POST_HEADER = '[data-ad-rendering-role="profile_name"], h2, h3, h4';
export const MESSAGE_ROW = '[data-pagelet="MWMessageRow"], [role="row"]';

export type Frozen = {
  snap: Snapshot | null;
  report: TamperReport;
  ready: Promise<void>;
};

export type Item = {
  leaf: Element;
  el: Element;
  key?: string;
  frozen?: Frozen;
  frozenEl?: Element;
  order?: number;
};

export const messageKey = (el: Element): string | undefined =>
  (el.matches("[data-message-id]") ? el : el.querySelector("[data-message-id]"))?.getAttribute(
    "data-message-id",
  ) ?? undefined;

export function scrollerOf(el: Element): Element | null {
  for (let p = el.parentElement; p && p !== document.documentElement; p = p.parentElement) {
    const overflow = getComputedStyle(p).overflowY;
    if ((overflow === "auto" || overflow === "scroll") && p.scrollHeight > p.clientHeight + 1)
      return p;
  }
  return null;
}

/**
 * How far above the END of its conversation an element sits, in pixels.
 * Larger means earlier. Measured from the end because that end stays put
 * while older messages load in above; an offset from the top would not.
 */
export function orderKey(el: Element): number {
  const rect = el.getBoundingClientRect();
  const sc = scrollerOf(el);
  if (!sc) return document.documentElement.scrollHeight - (rect.top + window.scrollY);
  // A list laid out bottom-up (column-reverse) scrolls from 0 downwards into negative numbers.
  const reversed = getComputedStyle(sc).flexDirection === "column-reverse";
  const below = reversed ? -sc.scrollTop : sc.scrollHeight - sc.clientHeight - sc.scrollTop;
  return sc.getBoundingClientRect().bottom - rect.top + below;
}

/**
 * Grows a clicked element to the thing the student means. It relies on
 * markers Facebook keeps for its own purposes (rendering roles, pagelet
 * names, ARIA roles), not on its generated class names, which change often.
 * The Wider and Narrower buttons correct it when the guess is off.
 *
 * Observed on real pages (October 2026):
 * - A post is NOT role="article"; only its comments are. A post is the
 *   smallest element holding both its author heading and its action bar
 *   (Like / Comment / Share). That holds in the feed, in the pop-up view and
 *   on a post's own page, and it includes the comments when they are open.
 * - On a photo's own page the post text sits in a side panel
 *   (role="complementary") beside the photo (role="main").
 * - A message is data-pagelet="MWMessageRow": picture, name and bubble.
 */
export function snap(el: Element, kind: Kind, exact: boolean): Element {
  if (exact) return el;
  if (kind === "facebook_post") {
    for (let a: Element | null = el; a && a !== document.body; a = a.parentElement) {
      if (!a.querySelector(POST_ACTIONS) || !a.querySelector(POST_HEADER)) continue;
      // Take the photo together with its side panel.
      const panel = a.closest('[role="complementary"]');
      const frame = panel?.parentElement;
      if (
        frame &&
        frame !== document.body &&
        frame.querySelector(':scope > [role="main"]')
      )
        return frame;
      return a;
    }
    // No markers (the layout changed, or this is not a post): fall back to
    // a feed unit, then to the outermost article.
    const unit = el.closest("[aria-posinset]");
    if (unit) return unit;
    let article: Element | null = null;
    for (
      let x = el.closest('[role="article"]');
      x;
      x = x.parentElement?.closest('[role="article"]') ?? null
    )
      article = x;
    return article ?? el;
  }
  // One message is a whole row: picture, name and bubble together.
  const row = el.closest(MESSAGE_ROW) ?? el.closest('[role="article"]');
  if (row) return row;
  // Otherwise, the nearest ancestor that is one of many siblings in a list.
  for (let a: Element | null = el; a?.parentElement && a.parentElement !== document.body; a = a.parentElement) {
    if (a.parentElement.children.length >= 5 && a.getBoundingClientRect().width >= 200) return a;
  }
  return el;
}

/**
 * Everything between two selected messages. Rows are often wrapped one by
 * one, so this walks the children of their common container.
 */
export function between(from: Element, to: Element): Element[] {
  let top: Element | null = from;
  while (top && !top.contains(to)) top = top.parentElement;
  if (!top || top === from) return [];
  const branch = (el: Element) => [...top.children].find((c) => c.contains(el));
  const kids = [...top.children];
  const [i, j] = [kids.indexOf(branch(from)!), kids.indexOf(branch(to)!)].sort((x, y) => x - y);
  return kids.slice(i + 1, j).flatMap((kid) => {
    if (kid.matches(MESSAGE_ROW)) return [kid];
    const rows = [...kid.querySelectorAll(MESSAGE_ROW)];
    if (rows.length) return rows;
    // Not a message row (a date divider, or an unloaded placeholder).
    return kid.getBoundingClientRect().height > 0 && kid.textContent?.trim() ? [kid] : [];
  });
}

export function pickAt(e: MouseEvent, host: Element, kind: Kind): { leaf: Element; el: Element } | null {
  const leaf = document.elementFromPoint(e.clientX, e.clientY);
  if (!leaf || leaf === host || leaf === document.documentElement || leaf === document.body) return null;
  return { leaf, el: snap(leaf, kind, e.altKey) };
}

/** A selected message the page unloaded and has since loaded again is a new element: find it. */
export function reassociate(items: Item[]): void {
  for (const item of items) {
    if (item.el.isConnected || !item.key) continue;
    const again = document.querySelector(`[data-message-id="${window.CSS.escape(item.key)}"]`);
    const row = again?.closest(MESSAGE_ROW) ?? again;
    if (row && !items.some((i) => i.el === row)) item.el = row;
  }
}

/** Message rows of the conversation with the most loaded messages (there can be several chats open). */
export function loadedMessages(): Element[] {
  let rows = [...document.querySelectorAll('[data-pagelet="MWMessageRow"]')];
  if (!rows.length) rows = [...document.querySelectorAll('[role="main"] [role="row"]')];
  const groups = new Map<Element, Element[]>();
  for (const row of rows) {
    if (row.getBoundingClientRect().height === 0) continue;
    const list = row.closest('[data-pagelet$="MessageList"], [role="grid"], [role="main"]') ?? document.body;
    groups.set(list, [...(groups.get(list) ?? []), row]);
  }
  return [...groups.values()].sort((a, b) => b.length - a.length)[0] ?? [];
}

export const inDocumentOrder = (a: Element, b: Element) =>
  a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
