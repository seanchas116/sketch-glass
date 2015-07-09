
export
function applyStyles(elem: HTMLElement, ...styles: Object[]) {
  for (const style of styles) {
    Object.assign(elem.style, style);
  }
}
