import { button, h } from "./dom";

export type PanelResult = {
  element: HTMLElement;
  body: HTMLElement;
  closeBtn: HTMLButtonElement;
};

export function createPanel(
  title: string,
  onClose: () => void,
  ...children: (Node | string)[]
): PanelResult {
  const closeBtn = button("Close", "ghost", onClose);
  const logoImg = h("img", {
    class: "logo",
    src: chrome.runtime.getURL("icons/logo-white.png"),
    width: "28",
    height: "34",
    alt: "",
  });
  const brand = h("span", { class: "brand" }, "Escapture");
  const header = h("div", { class: "panel-header" }, logoImg, brand);
  const body = h("div", { class: "panel-body" }, h("h2", {}, title), ...children);
  const element = h("div", { class: "panel", role: "status", "aria-live": "polite" }, header, body);

  return { element, body, closeBtn };
}
