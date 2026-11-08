import { h } from "./dom";

export class Highlighter {
  readonly hoverBox: HTMLElement = h("div", { class: "box" });
  readonly selBoxes: HTMLElement = h("div");

  place(box: HTMLElement, el: Element | null) {
    if (!el?.isConnected) {
      box.style.display = "none";
      return;
    }
    const r = el.getBoundingClientRect();
    Object.assign(box.style, {
      display: "block",
      left: `${r.left}px`,
      top: `${r.top}px`,
      width: `${r.width}px`,
      height: `${r.height}px`,
    });
  }

  update(targets: Element[], hover: Element | null) {
    if (this.selBoxes.children.length !== targets.length) {
      this.selBoxes.replaceChildren(...targets.map(() => h("div", { class: "sel" })));
    }
    targets.forEach((target, i) => {
      this.place(this.selBoxes.children[i] as HTMLElement, target);
    });
    this.place(this.hoverBox, hover);
  }

  clear() {
    this.hoverBox.style.display = "none";
    this.selBoxes.replaceChildren();
  }
}
