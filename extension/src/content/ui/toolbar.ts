import type { Kind } from "../../shared/types";
import { button, h } from "./dom";

export type ToolbarCallbacks = {
    onSetKind: (k: Kind) => void;
    onToggleDock: () => void;
    onResize: (wider: boolean) => void;
    onSelectAll: (rows: Element[]) => void;
    onDiagnose: () => void;
    onCancel: () => void;
    onCapture: () => void;
    getLoadedMessages: () => Element[];
};

export function createToolbar(
    kind: Kind,
    itemsCount: number,
    lastItem: { el: Element; leaf: Element } | undefined,
    dock: "top" | "bottom",
    callbacks: ToolbarCallbacks,
): HTMLElement {
    const messages = kind === "facebook_message";
    const n = itemsCount;

    const post = button("A post", "", () =>
        callbacks.onSetKind("facebook_post"),
    );
    const chat = button("Messages", "", () =>
        callbacks.onSetKind("facebook_message"),
    );
    post.setAttribute("aria-pressed", String(!messages));
    chat.setAttribute("aria-pressed", String(messages));

    const text = h(
        "p",
        {},
        messages
            ? "Click each message you want to keep. Shift-click selects everything in between."
            : "Click the post you want to keep. If only part of it is outlined, choose Wider.",
        h(
            "small",
            {},
            messages
                ? "Only messages loaded on screen can be captured, so scroll up to load more first. For conversations you took part in."
                : "Only posts loaded on screen can be captured, so scroll up to load more first. For posts you took part in.",
        ),
    );

    const move = button(
        dock === "top" ? "Move to bottom" : "Move to top",
        "ghost",
        callbacks.onToggleDock,
    );
    move.title =
        "Move this bar out of the way. Anything it covers can't be selected.";

    const adjust = h(
        "div",
        { class: "group" },
        button("Wider", "secondary", () => callbacks.onResize(true), !lastItem),
        button(
            "Narrower",
            "secondary",
            () => callbacks.onResize(false),
            !lastItem || lastItem.el === lastItem.leaf,
        ),
    );

    const slim = n > 0;
    const bar = h("div", {
        class: `bar ${dock}${slim ? " slim" : ""}`,
        role: "dialog",
        "aria-label": "Escapture capture",
    });

    if (slim) {
        const count = h(
            "p",
            { class: "count", "aria-live": "polite" },
            messages ? `${n} selected` : "Post selected",
        );
        count.title = messages
            ? "Click a message to add it, or a selected one to remove it. Shift-click selects everything in between."
            : "Click the post again to remove the selection. Hold Alt to pick the exact element.";
        bar.append(count, adjust, move);
    } else {
        bar.append(
            text,
            h(
                "div",
                {
                    class: "seg",
                    role: "group",
                    "aria-label": "What are you capturing?",
                },
                post,
                chat,
            ),
            move,
        );
    }

    if (messages && n === 0) {
        const rows = callbacks.getLoadedMessages();
        if (rows.length > 1) {
            bar.append(
                button(
                    `Select all ${rows.length} loaded messages`,
                    "soft",
                    () => callbacks.onSelectAll(rows),
                ),
            );
        }
    }

    if (n > 0) {
        const diag = button("Save diagnostics", "ghost", callbacks.onDiagnose);
        diag.title =
            "Saves a file describing the layout and styling of your selection, without any text, names or images. Send it to Escapture support when a capture looks wrong.";
        bar.append(diag);
    }

    const label =
        n === 0
            ? "Capture"
            : messages
              ? `Capture ${n} ${n === 1 ? "message" : "messages"}`
              : "Capture this post";

    bar.append(
        h(
            "div",
            { class: "group" },
            button("Cancel", "ghost", callbacks.onCancel),
            ...(n > 0 ? [button(label, "primary", callbacks.onCapture)] : []),
        ),
    );

    return bar;
}
