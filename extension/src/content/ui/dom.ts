export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Record<string, string> = {},
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") el.className = v;
    else el.setAttribute(k, v);
  }
  el.append(...children);
  return el;
}

export function button(label: string, cls: string, onClick: () => void, disabled = false): HTMLButtonElement {
  const b = h("button", { type: "button", class: cls }, label);
  b.disabled = disabled;
  b.addEventListener("click", onClick);
  return b;
}
