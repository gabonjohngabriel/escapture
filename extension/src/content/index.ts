// Isolated-world content script, injected on demand when the student chooses
// "Capture this page": element picker, tamper checks, snapshot building.
import {
  captureHost,
  gzip,
  MAX_BYTES,
  MAX_UPLOAD_BYTES,
  type Kind,
  type LastCapture,
  type Reply,
  type TamperReport,
} from "../shared/types";
import {
  checkedSnapshot,
  DEFAULT_LEVEL,
  fetchSheet,
  freezePending,
  mergeReports,
  runDiagnostics,
  send,
  SHRINK_LEVELS,
} from "./capture/coordinator";
import {
  loadStyles,
  mergeSnapshots,
  readUnreadSheets,
  serialize,
  sizeBreakdown,
  type Snapshot,
} from "./capture/snapshot";
import {
  between,
  inDocumentOrder,
  loadedMessages,
  orderKey,
  pickAt,
  reassociate,
  type Item,
} from "./selection/picker";
import contentCss from "./ui/content.css";
import { button, h } from "./ui/dom";
import { Highlighter } from "./ui/highlighter";
import { createPanel } from "./ui/panel";
import { createToolbar } from "./ui/toolbar";

declare global {
  interface Window {
    __safetrailCapture?: boolean;
  }
}

const HOST_TAG = "safetrail-capture";

const getFontCss = () => `
@font-face { font-family: "DM Sans"; font-weight: 400; font-display: swap; src: url("${chrome.runtime.getURL("fonts/dm-sans-latin-400-normal.woff2")}") format("woff2"); }
@font-face { font-family: "DM Sans"; font-weight: 500; font-display: swap; src: url("${chrome.runtime.getURL("fonts/dm-sans-latin-500-normal.woff2")}") format("woff2"); }
@font-face { font-family: "DM Sans"; font-weight: 600; font-display: swap; src: url("${chrome.runtime.getURL("fonts/dm-sans-latin-600-normal.woff2")}") format("woff2"); }
@font-face { font-family: "DM Sans"; font-weight: 700; font-display: swap; src: url("${chrome.runtime.getURL("fonts/dm-sans-latin-700-normal.woff2")}") format("woff2"); }
`;

function detectKind(): Kind {
  const fixture = document.querySelector<HTMLMetaElement>('meta[name="safetrail:fixture-kind"]')?.content;
  if (
    captureHost(location.href) === "fixture" &&
    (fixture === "facebook_post" || fixture === "facebook_message")
  )
    return fixture;
  if (
    location.hostname.endsWith("messenger.com") ||
    location.pathname.startsWith("/messages")
  )
    return "facebook_message";
  return "facebook_post";
}

type Dock = "top" | "bottom";
const DEFAULT_DOCK: Record<Kind, Dock> = {
  facebook_message: "top",
  facebook_post: "bottom",
};
const DOCK_KEY = "toolbarDock";

class Session {
  private host = document.createElement(HOST_TAG);
  private shadow = this.host.attachShadow({ mode: "open" });
  private highlighter = new Highlighter();
  private ui = h("div");
  private hover: Element | null = null;
  private items: Item[] = [];
  private kind: Kind = detectKind();
  private picking = false;
  private docks: Partial<Record<Kind, Dock>> = {};
  private freezeTimer = 0;
  private lastReassociate = 0;
  private frame = 0;

  constructor() {
    this.shadow.append(
      h("style", {}, getFontCss() + contentCss),
      this.highlighter.selBoxes,
      this.highlighter.hoverBox,
      this.ui,
    );
  }

  start() {
    if (this.picking) return;
    document.documentElement.appendChild(this.host);
    this.picking = true;
    void chrome.storage.local.get(DOCK_KEY).then((stored) => {
      const saved = stored[DOCK_KEY] as Partial<Record<Kind, Dock>> | undefined;
      if (saved && typeof saved === "object") {
        this.docks = saved;
        if (this.picking) this.renderBar();
      }
    });
    this.renderBar();
    document.addEventListener("mousemove", this.onMove, true);
    document.addEventListener("click", this.onClick, true);
    document.addEventListener("mousedown", this.swallow, true);
    document.addEventListener("mouseup", this.swallow, true);
    document.addEventListener("keydown", this.onKey, true);
    const tick = () => {
      this.reposition();
      this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }

  private stopPicking() {
    this.picking = false;
    cancelAnimationFrame(this.frame);
    this.highlighter.clear();
    document.removeEventListener("mousemove", this.onMove, true);
    document.removeEventListener("click", this.onClick, true);
    document.removeEventListener("mousedown", this.swallow, true);
    document.removeEventListener("mouseup", this.swallow, true);
    document.removeEventListener("keydown", this.onKey, true);
  }

  private close = () => {
    this.stopPicking();
    this.host.remove();
  };

  private isOurs = (e: Event) => e.composedPath().includes(this.host);

  private select(pick: Item, range: boolean) {
    const existing = this.items.findIndex(
      (i) => i.el === pick.el || i.el.contains(pick.el),
    );
    if (existing >= 0) {
      this.items.splice(existing, 1);
    } else if (this.kind === "facebook_post") {
      this.items = [pick];
    } else {
      const last = this.items[this.items.length - 1];
      this.items = this.items.filter((i) => !pick.el.contains(i.el));
      if (range && last && last.el.isConnected) {
        for (const el of between(last.el, pick.el)) {
          if (!this.items.some((i) => i.el === el || i.el.contains(el)))
            this.items.push({ leaf: el, el });
        }
      }
      this.items.push(pick);
    }
    this.scheduleFreeze();
    this.renderBar();
  }

  private scheduleFreeze() {
    if (this.kind !== "facebook_message") return;
    clearTimeout(this.freezeTimer);
    this.freezeTimer = window.setTimeout(
      () => freezePending(this.items, () => this.picking),
      60,
    );
  }

  private resize(wider: boolean) {
    const item = this.items[this.items.length - 1];
    if (!item) return;
    if (wider) {
      const parent = item.el.parentElement;
      if (!parent || parent === document.body || parent === document.documentElement)
        return;
      item.el = parent;
      item.frozen = undefined;
      this.items = this.items.filter((i) => i === item || !parent.contains(i.el));
    } else {
      if (item.el === item.leaf) return;
      const child = [...item.el.children].find((c) => c.contains(item.leaf));
      if (child) {
        item.el = child;
        item.frozen = undefined;
      }
    }
    this.scheduleFreeze();
    this.renderBar();
  }

  private renderBar() {
    const dock = this.docks[this.kind] ?? DEFAULT_DOCK[this.kind];
    const lastItem = this.items[this.items.length - 1];

    const bar = createToolbar(
      this.kind,
      this.items.length,
      lastItem,
      dock,
      {
        onSetKind: (k) => {
          this.kind = k;
          this.items = [];
          this.renderBar();
        },
        onToggleDock: () => {
          this.docks = {
            ...this.docks,
            [this.kind]: dock === "top" ? "bottom" : "top",
          };
          void chrome.storage.local.set({ [DOCK_KEY]: this.docks });
          this.renderBar();
        },
        onResize: (wider) => this.resize(wider),
        onSelectAll: (rows) => {
          const first = rows[0];
          const last = rows[rows.length - 1];
          const all = [first, ...between(first, last), last];
          this.items = all
            .filter((el, i) => all.indexOf(el) === i)
            .map((el) => ({ leaf: el, el }));
          this.scheduleFreeze();
          this.renderBar();
        },
        onDiagnose: async () => {
          this.host.remove();
          try {
            await runDiagnostics(
              this.items.map((i) => i.el),
              this.kind,
            );
          } finally {
            document.documentElement.appendChild(this.host);
          }
        },
        onCancel: this.close,
        onCapture: () => void this.capture(this.items),
        getLoadedMessages: loadedMessages,
      },
    );

    this.ui.replaceChildren(bar);
    this.reposition();
  }

  private reposition = () => {
    if (!this.picking) return;
    if (performance.now() - this.lastReassociate > 400) {
      this.lastReassociate = performance.now();
      reassociate(this.items);
    }
    const hovered =
      this.hover && !this.items.some((i) => i.el === this.hover)
        ? this.hover
        : null;
    this.highlighter.update(
      this.items.map((i) => i.el),
      hovered,
    );
  };

  private onMove = (e: MouseEvent) => {
    this.hover = this.isOurs(e) ? null : pickAt(e, this.host, this.kind)?.el ?? null;
  };

  private swallow = (e: Event) => {
    if (this.isOurs(e)) return;
    e.preventDefault();
    e.stopPropagation();
  };

  private onClick = (e: MouseEvent) => {
    if (this.isOurs(e)) return;
    e.preventDefault();
    e.stopPropagation();
    const pick = pickAt(e, this.host, this.kind);
    if (pick) this.select(pick, e.shiftKey);
  };

  private onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") this.close();
    else if (e.key === "Enter" && this.items.length && !this.isOurs(e))
      void this.capture(this.items);
    else return;
    e.preventDefault();
    e.stopPropagation();
  };

  private async report(result: LastCapture) {
    await send({ type: "capture:result", result }).catch(() => {});
  }

  private async capture(chosen: Item[]) {
    const live = chosen.filter((i) => i.el.isConnected);
    const gone = chosen.filter((i) => !i.el.isConnected && i.frozen);
    const liveEls = live.map((i) => i.el);
    const targets = liveEls
      .filter(
        (el, i) =>
          liveEls.indexOf(el) === i &&
          !liveEls.some((o) => o !== el && o.contains(el)),
      )
      .sort(inDocumentOrder);

    if (targets.length + gone.length === 0) return;
    const kind = this.kind;
    this.stopPicking();
    clearTimeout(this.freezeTimer);
    this.host.remove();
    const clientCapturedAt = new Date().toISOString();

    let report: TamperReport;
    let snap: Snapshot | null;
    if (gone.length === 0) {
      ({ report, snap } = await checkedSnapshot(targets));
    } else {
      await Promise.all(gone.map((i) => i.frozen!.ready));
      const batches = [...new Set(gone.map((i) => i.frozen!))];
      const fresh = targets.length ? await checkedSnapshot(targets) : null;
      report = mergeReports([
        ...(fresh ? [fresh.report] : []),
        ...batches.map((b) => b.report).filter((r) => r.checks.length),
      ]);
      snap = null;
      if (
        report.allPassed &&
        (!fresh || fresh.snap) &&
        batches.every((b) => b.snap)
      ) {
        if (fresh?.snap) await readUnreadSheets(fresh.snap, fetchSheet);
        snap = mergeSnapshots([
          ...(fresh?.snap
            ? [
                {
                  snap: fresh.snap,
                  units: targets.map((el) => ({
                    el,
                    order: orderKey(el),
                  })),
                },
              ]
            : []),
          ...batches.map((b) => ({
            snap: b.snap!,
            units: gone
              .filter((i) => i.frozen === b)
              .map((i) => ({ el: i.frozenEl!, order: i.order! })),
          })),
        ]);
      }
    }
    document.documentElement.appendChild(this.host);

    if (!snap) {
      const reasons = report.checks
        .filter((c) => !c.passed)
        .map((c) => c.detail ?? c.id);
      const message =
        "We couldn't capture this page because it looks like it was changed in the browser. Reload the page and try again.";
      const { element, body, closeBtn } = createPanel(
        "Not captured",
        this.close,
        h("p", { class: "note attention" }, message),
        h("ul", {}, ...reasons.map((r) => h("li", {}, r))),
      );
      body.append(h("div", { class: "row" }, closeBtn));
      this.ui.replaceChildren(element);
      await this.report({
        ok: false,
        refused: true,
        message: `${message} ${reasons.join(" ")}`,
        at: clientCapturedAt,
      });
      return;
    }

    const { element: capturingEl } = createPanel(
      "Capturing",
      this.close,
      h("p", {}, "Saving a copy to your vault. This takes a moment."),
    );
    this.ui.replaceChildren(capturingEl);

    await loadStyles(snap, (url) =>
      send<{ text: string }>({ type: "sheet:fetch", url }).then(
        (r) => (r.ok ? r.text : null),
        () => null,
      ),
    );
    const tamperReport: TamperReport = {
      ...report,
      size: {
        width: Math.max(1, Math.round(snap.width)),
        height: Math.max(1, Math.round(snap.height)),
      },
    };

    const meta = { sourceUrl: location.href, clientCapturedAt, kind };
    const cache = new Map<string, Promise<string | null>>();
    const fetchOne = (
      url: string,
      maxWidth: number | undefined,
      quality: number,
    ) => {
      let abs = url;
      try {
        abs = new URL(url, location.href).href;
      } catch {}
      const key = `${abs}|${maxWidth ?? "raw"}|${quality}`;
      if (!cache.has(key)) {
        cache.set(
          key,
          send<{ dataUrl: string }>({
            type: "image:fetch",
            url: abs,
            maxWidth,
            quality,
          }).then(
            (r) => (r.ok ? r.dataUrl : null),
            () => null,
          ),
        );
      }
      return cache.get(key)!;
    };
    const embed = async (level: { maxWidth: number; quality: number }) => {
      const queue = [...snap.images];
      await Promise.all(
        Array.from({ length: 6 }, async () => {
          for (let job = queue.shift(); job; job = queue.shift()) {
            const maxWidth =
              job.displayWidth === undefined
                ? undefined
                : Math.min(
                    level.maxWidth,
                    Math.max(48, Math.ceil(job.displayWidth * 2)),
                  );
            job.apply(await fetchOne(job.url, maxWidth, level.quality));
          }
        }),
      );
      return serialize(snap, meta);
    };

    const measure = async (text: string) => {
      const raw = new TextEncoder().encode(text);
      return {
        raw: raw.byteLength,
        packed: (await gzip(raw)).byteLength,
      };
    };
    const fits = (m: { raw: number; packed: number }) =>
      m.raw <= MAX_BYTES && m.packed <= MAX_UPLOAD_BYTES;
    let html = await embed(DEFAULT_LEVEL);
    let measured = await measure(html);
    for (const level of SHRINK_LEVELS) {
      if (fits(measured) || snap.images.length === 0) break;
      html = await embed(level);
      measured = await measure(html);
    }
    if (!fits(measured)) {
      const mb = (n: number) => (n / 1024 / 1024).toFixed(1);
      const parts = sizeBreakdown(html);
      const message =
        `This capture is too large to upload (${mb(measured.packed)} MB compressed, and the limit is ${mb(MAX_UPLOAD_BYTES)} MB). ` +
        `Images take ${mb(parts.images)} MB, text and layout ${mb(parts.markup + parts.styles)} MB before compression. ` +
        (targets.length > 1
          ? "Select fewer items and capture the rest separately."
          : "Select a smaller area.");
      const { element, body, closeBtn } = createPanel(
        "Not captured",
        this.close,
        h("p", { class: "note attention" }, message),
      );
      body.append(h("div", { class: "row" }, closeBtn));
      this.ui.replaceChildren(element);
      await this.report({
        ok: false,
        refused: true,
        message,
        at: clientCapturedAt,
      });
      return;
    }

    const heights = await send<{ fit: { w: number; h: number }[] }>({
      type: "capture:measure",
      html,
    }).catch(() => null);
    if (heights?.ok && tamperReport.size)
      tamperReport.size.fit = heights.fit;

    const reply = await send<{ result: LastCapture }>({
      type: "capture:upload",
      html,
      kind,
      sourceUrl: location.href,
      clientCapturedAt,
      tamperReport,
    }).catch(
      (): Reply<{ result: LastCapture }> => ({
        ok: false,
        error: "The extension stopped responding. Reload the page and try again.",
      }),
    );

    const result: LastCapture = reply.ok
      ? reply.result
      : {
          ok: false,
          refused: false,
          message: reply.error,
          at: clientCapturedAt,
        };
    if (result.ok) {
      const open = h(
        "a",
        {
          class: "btn primary",
          href: result.url,
          target: "_blank",
          rel: "noopener",
        },
        "Open in vault",
      );
      const { element, body, closeBtn } = createPanel(
        "Saved to your vault",
        this.close,
        h("span", { class: "chip" }, "Tamper checked"),
        h("p", {}, result.label),
      );
      body.append(h("div", { class: "row" }, closeBtn, open));
      this.ui.replaceChildren(element);
    } else {
      const retry = button("Try again", "primary", () => {
        this.close();
        new Session().start();
      });
      const { element, body, closeBtn } = createPanel(
        "Not saved",
        this.close,
        h("p", { class: "note attention" }, result.message),
      );
      body.append(h("div", { class: "row" }, closeBtn, retry));
      this.ui.replaceChildren(element);
    }
  }
}

if (!window.__safetrailCapture) {
  window.__safetrailCapture = true;
  let session: Session | null = null;
  chrome.runtime.onMessage.addListener(
    (msg: { type?: string }, sender, sendResponse) => {
      if (sender.id !== chrome.runtime.id || msg?.type !== "picker:start")
        return false;
      document.querySelector(HOST_TAG)?.remove();
      session = new Session();
      session.start();
      sendResponse({ ok: true });
      return false;
    },
  );
}
