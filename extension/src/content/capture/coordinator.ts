import {
  gzip,
  MAX_BYTES,
  MAX_UPLOAD_BYTES,
  type Kind,
  type LastCapture,
  type Reply,
  type TamperReport,
} from "../../shared/types";
import { queryGuard, runChecksAll } from "../guard/checks";
import { orderKey, type Frozen, type Item } from "../selection/picker";
import { saveDiagnostics } from "./diagnostics";
import {
  buildSnapshot,
  loadStyles,
  mergeSnapshots,
  readUnreadSheets,
  serialize,
  sizeBreakdown,
  type Snapshot,
} from "./snapshot";

export const DEFAULT_LEVEL = { maxWidth: 1280, quality: 0.8 };
export const SHRINK_LEVELS = [
  { maxWidth: 800, quality: 0.65 },
  { maxWidth: 560, quality: 0.5 },
  { maxWidth: 360, quality: 0.4 },
];

export const send = <T>(msg: unknown) =>
  chrome.runtime.sendMessage(msg) as Promise<Reply<T>>;

export const fetchSheet = (url: string) =>
  send<{ text: string }>({ type: "sheet:fetch", url }).then(
    (r) => (r.ok ? r.text : null),
    () => null,
  );

export function mergeReports(reports: TamperReport[]): TamperReport {
  const checks = reports[0].checks.map(
    (first, i) => reports.map((r) => r.checks[i]).find((c) => c && !c.passed) ?? first,
  );
  return { checks, allPassed: checks.every((c) => c.passed) };
}

/**
 * Tamper checks, then the clone, for elements that are on the page now.
 * The page guard is told which elements are meant by a throw-away attribute
 * (elements can't be passed between the two script worlds).
 */
export async function checkedSnapshot(
  targets: Element[],
): Promise<{ report: TamperReport; snap: Snapshot | null }> {
  const mark = `data-st-${crypto.randomUUID().replace(/-/g, "")}`;
  for (const t of targets) t.setAttribute(mark, "");
  try {
    const guard = await queryGuard(mark);
    // --- Same task from here to the end of buildSnapshot: check, then clone. ---
    let report = runChecksAll(targets, guard);
    let snap = report.allPassed ? buildSnapshot(targets) : null;
    // --------------------------------------------------------------------------
    if (snap) {
      // Ask again: a change made between the first answer and the clone is
      // reported to the guard a moment later and would otherwise be missed.
      const after = runChecksAll(targets, await queryGuard(mark));
      if (!after.allPassed) {
        report = after;
        snap = null;
      }
    }
    return { report, snap };
  } finally {
    for (const t of targets) t.removeAttribute(mark);
  }
}

export function freezePending(items: Item[], isPicking: () => boolean) {
  const pending = items.filter((i) => !i.frozen && i.el.isConnected);
  if (!pending.length || !isPicking()) return;
  const frozen: Frozen = { snap: null, report: { checks: [], allPassed: false }, ready: Promise.resolve() };
  for (const item of pending) {
    item.frozen = frozen;
    item.frozenEl = item.el;
    item.order = orderKey(item.el);
    item.key = (item.el.matches("[data-message-id]") ? item.el : item.el.querySelector("[data-message-id]"))?.getAttribute("data-message-id") ?? undefined;
  }
  // One pass over the page's style sheets for the whole batch.
  frozen.ready = checkedSnapshot(pending.map((i) => i.el))
    .then(async ({ report, snap }) => {
      frozen.report = report;
      frozen.snap = snap;
      if (snap) await readUnreadSheets(snap, fetchSheet);
    })
    .catch(() => {});
}

export async function runDiagnostics(targets: Element[], kind: Kind) {
  const connected = targets.filter((el) => el.isConnected);
  if (!connected.length) return;
  await saveDiagnostics(connected, kind, (url) =>
    send<{ text: string }>({ type: "sheet:fetch", url }).then(
      (r) => (r.ok ? r.text : null),
      () => null,
    ),
  );
}
